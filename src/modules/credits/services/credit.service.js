const dayjs = require('dayjs');
const { Op } = require('sequelize');
const db = require('../../../database');

const ERROR = {
	CUSTOMER_NOT_FOUND: 'Cliente no encontrado',
	CREDIT_NOT_FOUND: 'Credito no encontrado',
	SALE_NOT_FOUND: 'Venta no encontrada',
	CREDIT_ALREADY_FOR_SALE: 'La venta ya tiene un credito asociado',
	CREDIT_LIMIT_EXCEEDED: 'El cliente supera el limite de credito',
	INVALID_CREDIT_STATUS: 'El credito no permite esta operacion',
	INVALID_PAYMENT_AMOUNT: 'Monto de pago invalido',
	INVALID_FORGIVENESS_AMOUNT: 'Monto de condonacion invalido'
};

class CreditService {
	static get ERROR() {
		return ERROR;
	}

	round2(value) {
		return Number(Number(value || 0).toFixed(2));
	}

	normalizeDate(value) {
		return value ? dayjs(value).toDate() : new Date();
	}

	async refreshOverdueStatus() {
		await db.Credit.update(
			{ status: 'OVERDUE' },
			{
				where: {
					status: 'ACTIVE',
					dueDate: { [Op.lt]: dayjs().format('YYYY-MM-DD') },
					outstandingBalance: { [Op.gt]: 0 }
				}
			}
		);
	}

	async createCustomer(payload) {
		const customer = await db.CreditCustomer.create({
			fullName: payload.fullName,
			documentNumber: payload.documentNumber,
			address: payload.address || null,
			phone: payload.phone || null,
			email: payload.email || null,
			creditLimit: payload.creditLimit || 0,
			references: payload.references || null
		});

		return customer;
	}

	async listCustomers(filters) {
		const page = Math.max(1, Number(filters.page || 1));
		const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
		const offset = (page - 1) * limit;

		const where = {};
		if (filters.term) {
			where[Op.or] = [
				{ fullName: { [Op.iLike]: `%${filters.term}%` } },
				{ documentNumber: { [Op.iLike]: `%${filters.term}%` } },
				{ phone: { [Op.iLike]: `%${filters.term}%` } }
			];
		}

		const { rows, count } = await db.CreditCustomer.findAndCountAll({
			where,
			attributes: ['id', 'fullName', 'documentNumber', 'phone', 'email', 'creditLimit'],
			order: [['fullName', 'ASC']],
			limit,
			offset
		});

		return {
			data: rows,
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit)
			}
		};
	}

	async listSalesForCredit(filters) {
		const page = Math.max(1, Number(filters.page || 1));
		const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
		const offset = (page - 1) * limit;

		const where = {
			status: filters.status || 'completed'
		};

		if (filters.customerId) {
			where.customerId = Number(filters.customerId);
		}

		if (filters.startDate || filters.endDate) {
			const start = filters.startDate || '1900-01-01';
			const end = filters.endDate || dayjs().format('YYYY-MM-DD');
			where.createdAt = {
				[Op.between]: [
					dayjs(start).startOf('day').toDate(),
					dayjs(end).endOf('day').toDate()
				]
			};
		}

		const include = [
			{
				model: db.Customer,
				as: 'customer',
				attributes: ['id', 'fullName', 'documentNumber', 'phone'],
				required: false
			}
		];

		if (filters.term) {
			const like = `%${filters.term}%`;
			where[Op.or] = [
				{ ticketNumber: { [Op.iLike]: like } },
				{ '$customer.fullName$': { [Op.iLike]: like } },
				{ '$customer.documentNumber$': { [Op.iLike]: like } },
				{ '$customer.phone$': { [Op.iLike]: like } }
			];
		}

		const { rows, count } = await db.Sale.findAndCountAll({
			where,
			include,
			attributes: ['id', 'ticketNumber', 'status', 'totalAmount', 'paymentMethod', 'createdAt'],
			order: [['createdAt', 'DESC']],
			limit,
			offset,
			distinct: true
		});

		const saleIds = rows.map((sale) => sale.id);
		const existingCredits = saleIds.length
			? await db.Credit.findAll({
				where: {
					saleId: { [Op.in]: saleIds },
					status: { [Op.notIn]: ['REFINANCED'] }
				},
				attributes: ['saleId']
			})
			: [];

		const creditedSaleIds = new Set(existingCredits.map((row) => row.saleId));
		const filteredRows = rows.filter((sale) => !creditedSaleIds.has(sale.id));

		return {
			data: filteredRows,
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit)
			}
		};
	}

	async createCredit(payload) {
		const transaction = await db.sequelize.transaction();

		try {
			const sale = await db.Sale.findByPk(payload.saleId, { transaction });
			if (!sale) throw new Error(ERROR.SALE_NOT_FOUND);

			const customer = await db.CreditCustomer.findByPk(payload.customerId, { transaction });
			if (!customer) throw new Error(ERROR.CUSTOMER_NOT_FOUND);

			const existing = await db.Credit.findOne({
				where: {
					saleId: payload.saleId,
					status: { [Op.notIn]: ['REFINANCED'] }
				},
				transaction
			});

			if (existing) throw new Error(ERROR.CREDIT_ALREADY_FOR_SALE);

			const principalAmount = this.round2(sale.totalAmount);
			const interestRate = Number(payload.interestRate || 0);
			const financedTotal = this.round2(principalAmount + (principalAmount * interestRate) / 100);
			const dueDate = dayjs().add(Number(payload.termDays), 'day').format('YYYY-MM-DD');

			const activeDebt = await db.Credit.sum('outstandingBalance', {
				where: {
					customerId: customer.id,
					status: { [Op.in]: ['ACTIVE', 'OVERDUE'] }
				},
				transaction
			});

			const projectedDebt = this.round2((activeDebt || 0) + financedTotal);
			if (projectedDebt > Number(customer.creditLimit || 0)) {
				throw new Error(ERROR.CREDIT_LIMIT_EXCEEDED);
			}

			const credit = await db.Credit.create({
				customerId: customer.id,
				saleId: sale.id,
				principalAmount,
				interestRate,
				moraRateDaily: 0.001,
				termDays: Number(payload.termDays),
				startDate: dayjs().format('YYYY-MM-DD'),
				dueDate,
				outstandingBalance: financedTotal,
				status: 'ACTIVE',
				observations: payload.observations || null
			}, { transaction });

			await transaction.commit();
			return credit;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async listCredits(filters) {
		await this.refreshOverdueStatus();

		const page = Math.max(1, Number(filters.page || 1));
		const limit = Math.min(100, Math.max(1, Number(filters.limit || 20)));
		const offset = (page - 1) * limit;

		const where = {};

		if (filters.customerId) where.customerId = Number(filters.customerId);

		if (filters.status) {
			where.status = filters.status;
		} else {
			where.status = { [Op.in]: ['ACTIVE', 'OVERDUE'] };
		}

		if (filters.vencidos === 'true') {
			where.dueDate = { [Op.lt]: dayjs().format('YYYY-MM-DD') };
			where.status = { [Op.in]: ['ACTIVE', 'OVERDUE'] };
		}

		if (filters.porVencerDias) {
			const days = Number(filters.porVencerDias);
			where.dueDate = {
				[Op.between]: [
					dayjs().format('YYYY-MM-DD'),
					dayjs().add(days, 'day').format('YYYY-MM-DD')
				]
			};
			where.status = { [Op.in]: ['ACTIVE', 'OVERDUE'] };
		}

		const { rows, count } = await db.Credit.findAndCountAll({
			where,
			include: [
				{
					model: db.CreditCustomer,
					as: 'customer',
					attributes: ['id', 'fullName', 'documentNumber', 'phone']
				}
			],
			order: [['dueDate', 'ASC']],
			limit,
			offset
		});

		return {
			data: rows,
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit)
			}
		};
	}

	async getCreditById(creditId) {
		const credit = await db.Credit.findByPk(creditId, {
			include: [
				{ model: db.CreditCustomer, as: 'customer' },
				{ model: db.CreditPayment, as: 'payments' },
				{ model: db.CreditAdjustment, as: 'adjustments' },
				{ model: db.CreditReminder, as: 'reminders' },
				{
					model: db.Sale,
					as: 'sale',
					attributes: ['id', 'ticketNumber', 'totalAmount', 'createdAt']
				}
			],
			order: [
				[{ model: db.CreditPayment, as: 'payments' }, 'paymentDate', 'DESC']
			]
		});

		if (!credit) throw new Error(ERROR.CREDIT_NOT_FOUND);

		return credit;
	}

	async registerPayment(creditId, payload, userId) {
		const transaction = await db.sequelize.transaction();

		try {
			const credit = await db.Credit.findByPk(creditId, { transaction, lock: transaction.LOCK.UPDATE });
			if (!credit) throw new Error(ERROR.CREDIT_NOT_FOUND);
			if (!['ACTIVE', 'OVERDUE'].includes(credit.status)) throw new Error(ERROR.INVALID_CREDIT_STATUS);

			const amount = this.round2(payload.amountPaid);
			if (amount <= 0) throw new Error(ERROR.INVALID_PAYMENT_AMOUNT);

			const appliedAmount = Math.min(amount, this.round2(credit.outstandingBalance));

			const payment = await db.CreditPayment.create({
				creditId: credit.id,
				amount: appliedAmount,
				paymentMethod: payload.paymentMethod,
				paymentDate: this.normalizeDate(payload.paymentDate),
				notes: payload.notes || null,
				recordedBy: userId || null
			}, { transaction });

			const newBalance = this.round2(this.round2(credit.outstandingBalance) - appliedAmount);
			const overdue = dayjs(credit.dueDate).isBefore(dayjs(), 'day');

			await credit.update({
				outstandingBalance: newBalance,
				lastPaymentDate: payment.paymentDate,
				status: newBalance <= 0 ? 'PAID' : overdue ? 'OVERDUE' : 'ACTIVE'
			}, { transaction });

			await transaction.commit();

			return {
				payment,
				newBalance,
				status: newBalance <= 0 ? 'PAID' : overdue ? 'OVERDUE' : 'ACTIVE'
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async getCustomerStatement(customerId) {
		const customer = await db.CreditCustomer.findByPk(customerId);
		if (!customer) throw new Error(ERROR.CUSTOMER_NOT_FOUND);

		await this.refreshOverdueStatus();

		const credits = await db.Credit.findAll({
			where: { customerId: customer.id },
			include: [{ model: db.CreditPayment, as: 'payments' }],
			order: [['createdAt', 'DESC']]
		});

		const activeCredits = credits.filter(c => ['ACTIVE', 'OVERDUE'].includes(c.status));
		const totalDebt = this.round2(activeCredits.reduce((acc, c) => acc + Number(c.outstandingBalance), 0));

		const payments = await db.CreditPayment.findAll({
			include: [
				{
					model: db.Credit,
					as: 'credit',
					where: { customerId: customer.id },
					attributes: ['id']
				}
			],
			order: [['paymentDate', 'DESC']]
		});

		const lateDays = credits
			.map(c => {
				if (c.status === 'PAID' && c.lastPaymentDate) {
					const diff = dayjs(c.lastPaymentDate).diff(dayjs(c.dueDate), 'day');
					return Math.max(0, diff);
				}

				if (['ACTIVE', 'OVERDUE'].includes(c.status) && dayjs(c.dueDate).isBefore(dayjs(), 'day')) {
					return dayjs().diff(dayjs(c.dueDate), 'day');
				}

				return 0;
			})
			.filter(v => v > 0);

		const averageLateDays = lateDays.length
			? this.round2(lateDays.reduce((a, b) => a + b, 0) / lateDays.length)
			: 0;

		return {
			customer,
			totalDebt,
			activeCredits,
			payments,
			averageLateDays
		};
	}

	async calculateLateInterest(creditId) {
		const credit = await db.Credit.findByPk(creditId);
		if (!credit) throw new Error(ERROR.CREDIT_NOT_FOUND);

		const today = dayjs();
		const dueDate = dayjs(credit.dueDate);
		const lateDays = Math.max(0, today.diff(dueDate, 'day'));
		const rate = Number(credit.moraRateDaily || 0.001);
		const balance = Number(credit.outstandingBalance || 0);
		const interest = this.round2(balance * rate * lateDays);

		return {
			creditId: credit.id,
			lateDays,
			interestAmount: interest,
			newTotalToPay: this.round2(balance + interest),
			moraRateDaily: rate
		};
	}

	async createReminder(creditId, payload) {
		const credit = await db.Credit.findByPk(creditId);
		if (!credit) throw new Error(ERROR.CREDIT_NOT_FOUND);

		const daysBeforeDue = Number(payload.daysBeforeDue);
		const scheduledFor = dayjs(credit.dueDate).subtract(daysBeforeDue, 'day').toDate();

		const reminder = await db.CreditReminder.create({
			creditId: credit.id,
			daysBeforeDue,
			scheduledFor,
			channel: payload.channel || 'SYSTEM',
			metadata: {
				dueDate: credit.dueDate,
				outstandingBalance: credit.outstandingBalance
			}
		});

		return reminder;
	}

	async listDelinquentCustomers(minLateDays = 1) {
		await this.refreshOverdueStatus();

		const cutoff = dayjs().subtract(Number(minLateDays), 'day').format('YYYY-MM-DD');

		const credits = await db.Credit.findAll({
			where: {
				status: 'OVERDUE',
				dueDate: { [Op.lte]: cutoff },
				outstandingBalance: { [Op.gt]: 0 }
			},
			include: [
				{
					model: db.CreditCustomer,
					as: 'customer',
					attributes: ['id', 'fullName', 'documentNumber', 'phone']
				}
			],
			order: [['dueDate', 'ASC']]
		});

		const byCustomer = new Map();

		credits.forEach((credit) => {
			const key = credit.customer.id;
			const lateDays = dayjs().diff(dayjs(credit.dueDate), 'day');

			if (!byCustomer.has(key)) {
				byCustomer.set(key, {
					customer: credit.customer,
					totalOverdue: 0,
					maxLateDays: 0,
					credits: []
				});
			}

			const row = byCustomer.get(key);
			row.totalOverdue = this.round2(row.totalOverdue + Number(credit.outstandingBalance));
			row.maxLateDays = Math.max(row.maxLateDays, lateDays);
			row.credits.push(credit);
		});

		return Array.from(byCustomer.values());
	}

	async forgiveDebt(creditId, payload) {
		const transaction = await db.sequelize.transaction();

		try {
			const credit = await db.Credit.findByPk(creditId, { transaction, lock: transaction.LOCK.UPDATE });
			if (!credit) throw new Error(ERROR.CREDIT_NOT_FOUND);
			if (!['ACTIVE', 'OVERDUE'].includes(credit.status)) throw new Error(ERROR.INVALID_CREDIT_STATUS);

			const amount = this.round2(payload.amountForgiven);
			if (amount <= 0) throw new Error(ERROR.INVALID_FORGIVENESS_AMOUNT);

			const appliedAmount = Math.min(amount, this.round2(credit.outstandingBalance));

			await db.CreditAdjustment.create({
				creditId: credit.id,
				type: 'FORGIVENESS',
				amount: appliedAmount,
				reason: payload.reason || null,
				authorizedBy: payload.authorizedBy || null,
				metadata: { requestedAmount: amount }
			}, { transaction });

			const newBalance = this.round2(this.round2(credit.outstandingBalance) - appliedAmount);
			const overdue = dayjs(credit.dueDate).isBefore(dayjs(), 'day');

			await credit.update({
				outstandingBalance: newBalance,
				status: newBalance <= 0 ? 'FORGIVEN' : overdue ? 'OVERDUE' : 'ACTIVE'
			}, { transaction });

			await transaction.commit();
			return {
				creditId: credit.id,
				forgivenAmount: appliedAmount,
				newBalance,
				status: newBalance <= 0 ? 'FORGIVEN' : overdue ? 'OVERDUE' : 'ACTIVE'
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async refinanceCredit(creditId, payload) {
		const transaction = await db.sequelize.transaction();

		try {
			const original = await db.Credit.findByPk(creditId, { transaction, lock: transaction.LOCK.UPDATE });
			if (!original) throw new Error(ERROR.CREDIT_NOT_FOUND);
			if (!['ACTIVE', 'OVERDUE'].includes(original.status)) throw new Error(ERROR.INVALID_CREDIT_STATUS);

			const originalBalance = this.round2(original.outstandingBalance);
			const newRate = Number(payload.interestRate || 0);
			const newTerm = Number(payload.termDays);
			const newPrincipal = this.round2(originalBalance + (originalBalance * newRate) / 100);

			const newCredit = await db.Credit.create({
				customerId: original.customerId,
				saleId: original.saleId,
				parentCreditId: original.id,
				principalAmount: originalBalance,
				interestRate: newRate,
				moraRateDaily: Number(payload.moraRateDaily || original.moraRateDaily || 0.001),
				termDays: newTerm,
				startDate: dayjs().format('YYYY-MM-DD'),
				dueDate: dayjs().add(newTerm, 'day').format('YYYY-MM-DD'),
				outstandingBalance: newPrincipal,
				status: 'ACTIVE',
				observations: payload.observations || null
			}, { transaction });

			await db.CreditAdjustment.create({
				creditId: original.id,
				type: 'REFINANCE',
				amount: originalBalance,
				reason: payload.reason || 'Refinanciacion',
				authorizedBy: payload.authorizedBy || null,
				metadata: {
					newCreditId: newCredit.id,
					newTermDays: newTerm,
					newRate
				}
			}, { transaction });

			await original.update({ status: 'REFINANCED', outstandingBalance: 0 }, { transaction });

			await transaction.commit();
			return {
				originalCreditId: original.id,
				newCredit
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async getCustomerCreditHistory(customerId, includePaid) {
		const customer = await db.CreditCustomer.findByPk(customerId);
		if (!customer) throw new Error(ERROR.CUSTOMER_NOT_FOUND);

		const where = { customerId: customer.id };

		if (!includePaid) {
			where.status = { [Op.notIn]: ['PAID'] };
		}

		const credits = await db.Credit.findAll({
			where,
			include: [
				{ model: db.CreditPayment, as: 'payments' },
				{
					model: db.Sale,
					as: 'sale',
					attributes: ['id', 'ticketNumber', 'totalAmount', 'createdAt']
				}
			],
			order: [['createdAt', 'DESC']]
		});

		return {
			customer,
			credits
		};
	}
}

module.exports = Object.assign(new CreditService(), { ERROR });
