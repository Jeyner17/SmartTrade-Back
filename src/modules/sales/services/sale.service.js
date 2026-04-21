const { Op, fn, col, literal } = require('sequelize');
const db = require('../../../database');
const logger = require('../../../utils/logger');

const { sequelize } = db;

const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'transferencia'];
const DISCOUNT_TYPES = ['none', 'percentage', 'fixed'];

const ERROR = {
	PRODUCT_NOT_FOUND: 'Producto no encontrado',
	CUSTOMER_NOT_FOUND: 'Cliente no encontrado',
	SALE_NOT_FOUND: 'Venta no encontrada',
	SESSION_NOT_FOUND: 'Sesion de venta no encontrada',
	SESSION_CLOSED: 'La sesion de venta ya no esta abierta',
	EMPTY_CART: 'El carrito no tiene productos',
	INSUFFICIENT_STOCK: 'Stock insuficiente para uno o mas productos',
	INVALID_PAYMENT: 'Monto recibido insuficiente para completar el pago',
	SALE_ALREADY_VOIDED: 'La venta ya fue anulada',
	INVALID_DISCOUNT: 'Descuento invalido',
	DOCUMENT_IN_USE: 'Ya existe un cliente con ese documento'
};

class SaleService {
	static get ERROR() {
		return ERROR;
	}

	round2(value) {
		return Number(Number(value || 0).toFixed(2));
	}

	getDiscountAmount(subtotal, discountType = 'none', discountValue = 0) {
		const normalizedType = DISCOUNT_TYPES.includes(discountType) ? discountType : 'none';
		const value = Number(discountValue || 0);

		if (normalizedType === 'percentage') {
			if (value < 0 || value > 100) throw new Error(ERROR.INVALID_DISCOUNT);
			return this.round2(subtotal * (value / 100));
		}

		if (normalizedType === 'fixed') {
			if (value < 0) throw new Error(ERROR.INVALID_DISCOUNT);
			return this.round2(Math.min(value, subtotal));
		}

		return 0;
	}

	buildTotals(items, discountType = 'none', discountValue = 0) {
		const subtotal = this.round2(
			items.reduce((acc, item) => acc + Number(item.quantity) * Number(item.unitPrice), 0)
		);

		const iva = this.round2(
			items.reduce((acc, item) => {
				const lineSubtotal = Number(item.quantity) * Number(item.unitPrice);
				return acc + (lineSubtotal * Number(item.taxPercent || 0)) / 100;
			}, 0)
		);

		const discountAmount = this.getDiscountAmount(subtotal, discountType, discountValue);
		const total = this.round2(Math.max(0, subtotal + iva - discountAmount));

		return {
			subtotal,
			iva,
			discountType,
			discountValue: this.round2(discountValue || 0),
			discountAmount,
			total
		};
	}

	async ensureCustomer(customerId, transaction) {
		if (!customerId) return null;
		const customer = await db.Customer.findByPk(customerId, { transaction });
		if (!customer) throw new Error(ERROR.CUSTOMER_NOT_FOUND);
		return customer;
	}

	async ensureProduct(productId, transaction) {
		const product = await db.Product.findByPk(productId, { transaction, lock: transaction.LOCK.UPDATE });
		if (!product || product.isActive === false) throw new Error(ERROR.PRODUCT_NOT_FOUND);
		return product;
	}

	async getOrCreateOpenSession({ sessionId, cashierId, customerId }, transaction) {
		if (sessionId) {
			const existing = await db.SaleSession.findByPk(sessionId, { transaction, lock: transaction.LOCK.UPDATE });
			if (!existing) throw new Error(ERROR.SESSION_NOT_FOUND);
			if (existing.status !== 'open') throw new Error(ERROR.SESSION_CLOSED);
			if (customerId !== undefined) {
				await existing.update({ customerId: customerId || null }, { transaction });
			}
			return existing;
		}

		return db.SaleSession.create({
			cashierId,
			customerId: customerId || null,
			status: 'open'
		}, { transaction });
	}

	async getSessionWithItems(sessionId, transaction) {
		const queryOptions = {
			transaction,
			include: [
				{
					model: db.SaleSessionItem,
					as: 'items',
					include: [{ model: db.Product, as: 'product', attributes: ['id', 'name', 'sku', 'barcode', 'stock'] }]
				},
				{ model: db.Customer, as: 'customer', attributes: ['id', 'fullName', 'documentNumber', 'phone'] }
			]
		};

		if (transaction) {
			queryOptions.lock = { level: transaction.LOCK.UPDATE, of: db.SaleSession };
		}

		const session = await db.SaleSession.findByPk(sessionId, queryOptions);

		if (!session) throw new Error(ERROR.SESSION_NOT_FOUND);
		return session;
	}

	mapCart(session) {
		const items = (session.items || []).map((item) => ({
			id: item.id,
			productId: item.productId,
			product: item.product,
			quantity: item.quantity,
			unitPrice: Number(item.unitPrice),
			taxPercent: Number(item.taxPercent),
			lineSubtotal: this.round2(Number(item.quantity) * Number(item.unitPrice))
		}));

		const totals = this.buildTotals(items, session.discountType, Number(session.discountValue));

		return {
			sessionId: session.id,
			status: session.status,
			cashierId: session.cashierId,
			customer: session.customer || null,
			discount: {
				type: session.discountType,
				value: Number(session.discountValue),
				reason: session.discountReason || null
			},
			items,
			totals
		};
	}

	async addProductToCart({ sessionId, productId, quantity = 1, customerId }, userId) {
		const transaction = await sequelize.transaction();
		try {
			if (customerId) await this.ensureCustomer(customerId, transaction);

			const session = await this.getOrCreateOpenSession({
				sessionId,
				cashierId: userId,
				customerId
			}, transaction);

			const product = await this.ensureProduct(productId, transaction);

			const existingItem = await db.SaleSessionItem.findOne({
				where: { sessionId: session.id, productId },
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			const nextQty = Number(quantity) + Number(existingItem?.quantity || 0);
			if (nextQty > Number(product.stock)) throw new Error(ERROR.INSUFFICIENT_STOCK);

			if (existingItem) {
				await existingItem.update({ quantity: nextQty }, { transaction });
			} else {
				await db.SaleSessionItem.create({
					sessionId: session.id,
					productId,
					quantity: Number(quantity),
					unitPrice: Number(product.price),
					taxPercent: Number(product.taxPercent || 0)
				}, { transaction });
			}

			const fullSession = await this.getSessionWithItems(session.id, transaction);
			await transaction.commit();
			return this.mapCart(fullSession);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async removeProductFromCart(sessionId, productId) {
		const transaction = await sequelize.transaction();
		try {
			const session = await this.getSessionWithItems(sessionId, transaction);
			if (session.status !== 'open') throw new Error(ERROR.SESSION_CLOSED);

			await db.SaleSessionItem.destroy({ where: { sessionId, productId }, transaction });

			const fullSession = await this.getSessionWithItems(sessionId, transaction);
			await transaction.commit();
			return this.mapCart(fullSession);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async updateCartQuantity(sessionId, productId, quantity) {
		const transaction = await sequelize.transaction();
		try {
			const session = await this.getSessionWithItems(sessionId, transaction);
			if (session.status !== 'open') throw new Error(ERROR.SESSION_CLOSED);

			if (Number(quantity) === 0) {
				await db.SaleSessionItem.destroy({ where: { sessionId, productId }, transaction });
			} else {
				const product = await this.ensureProduct(productId, transaction);
				if (Number(quantity) > Number(product.stock)) throw new Error(ERROR.INSUFFICIENT_STOCK);

				const item = await db.SaleSessionItem.findOne({ where: { sessionId, productId }, transaction });
				if (!item) throw new Error(ERROR.PRODUCT_NOT_FOUND);
				await item.update({ quantity: Number(quantity) }, { transaction });
			}

			const fullSession = await this.getSessionWithItems(sessionId, transaction);
			await transaction.commit();
			return this.mapCart(fullSession);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async applyDiscount(sessionId, { discountType, value, reason }) {
		const transaction = await sequelize.transaction();
		try {
			if (!DISCOUNT_TYPES.includes(discountType)) throw new Error(ERROR.INVALID_DISCOUNT);

			const session = await db.SaleSession.findByPk(sessionId, { transaction, lock: transaction.LOCK.UPDATE });
			if (!session) throw new Error(ERROR.SESSION_NOT_FOUND);
			if (session.status !== 'open') throw new Error(ERROR.SESSION_CLOSED);

			await session.update({
				discountType,
				discountValue: Number(value || 0),
				discountReason: reason || null
			}, { transaction });

			const fullSession = await this.getSessionWithItems(sessionId, transaction);
			await transaction.commit();
			return this.mapCart(fullSession);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async calculateTotal(sessionId) {
		const session = await this.getSessionWithItems(sessionId, null);
		return this.mapCart(session);
	}

	async buildTicketNumber(saleId, transaction) {
		const now = new Date();
		const yyyy = String(now.getFullYear());
		const mm = String(now.getMonth() + 1).padStart(2, '0');
		const dd = String(now.getDate()).padStart(2, '0');
		const suffix = String(saleId).padStart(4, '0');
		return `TKT-${yyyy}${mm}${dd}-${suffix}`;
	}

	async finalizeSale({ products, discountType, discountValue, customerId, paymentMethod, amountReceived, notes, sessionId }, userId) {
		const transaction = await sequelize.transaction();
		try {
			if (!PAYMENT_METHODS.includes(paymentMethod)) throw new Error('Metodo de pago invalido');
			if (customerId) await this.ensureCustomer(customerId, transaction);

			const preparedItems = [];

			for (const line of products) {
				const product = await this.ensureProduct(line.productId, transaction);
				if (Number(line.quantity) > Number(product.stock)) throw new Error(ERROR.INSUFFICIENT_STOCK);

				preparedItems.push({
					product,
					productId: product.id,
					quantity: Number(line.quantity),
					unitPrice: Number(line.unitPrice),
					taxPercent: Number(product.taxPercent || 0)
				});
			}

			const totals = this.buildTotals(preparedItems, discountType || 'none', Number(discountValue || 0));

			const received = amountReceived !== undefined && amountReceived !== null
				? Number(amountReceived)
				: totals.total;

			if (received < totals.total) throw new Error(ERROR.INVALID_PAYMENT);

			const sale = await db.Sale.create({
				ticketNumber: `TMP-${Date.now()}`,
				sessionId: sessionId || null,
				customerId: customerId || null,
				cashierId: userId,
				paymentMethod,
				status: 'completed',
				subtotal: totals.subtotal,
				ivaAmount: totals.iva,
				discountType: totals.discountType,
				discountValue: totals.discountValue,
				discountAmount: totals.discountAmount,
				totalAmount: totals.total,
				amountReceived: received,
				changeAmount: this.round2(received - totals.total),
				notes: notes || null
			}, { transaction });

			const ticketNumber = await this.buildTicketNumber(sale.id, transaction);
			await sale.update({ ticketNumber }, { transaction });

			for (const item of preparedItems) {
				const lineSubtotal = this.round2(item.quantity * item.unitPrice);
				const lineTax = this.round2((lineSubtotal * item.taxPercent) / 100);
				const lineTotal = this.round2(lineSubtotal + lineTax);

				await db.SaleDetail.create({
					saleId: sale.id,
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					taxPercent: item.taxPercent,
					lineSubtotal,
					lineTax,
					lineTotal
				}, { transaction });

				const stockBefore = Number(item.product.stock);
				const stockAfter = stockBefore - item.quantity;
				await item.product.update({ stock: stockAfter }, { transaction });

				await db.StockMovement.create({
					productId: item.productId,
					movementType: 'salida',
					quantity: item.quantity,
					stockBefore,
					stockAfter,
					reason: 'Venta POS',
					notes: `Venta ${ticketNumber}`,
					referenceType: 'sale',
					referenceId: sale.id,
					performedBy: userId
				}, { transaction });
			}

			if (sessionId) {
				await db.SaleSession.update({ status: 'closed', closedAt: new Date() }, {
					where: { id: sessionId },
					transaction
				});
			}

			await transaction.commit();
			return this.getSaleById(sale.id);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async createSale(payload, userId) {
		return this.finalizeSale(payload, userId);
	}

	async processPayment(sessionId, payload, userId) {
		const session = await this.getSessionWithItems(sessionId, null);
		if (session.status !== 'open') throw new Error(ERROR.SESSION_CLOSED);
		if (!session.items || session.items.length === 0) throw new Error(ERROR.EMPTY_CART);

		return this.finalizeSale({
			sessionId,
			products: session.items.map((item) => ({
				productId: item.productId,
				quantity: item.quantity,
				unitPrice: item.unitPrice
			})),
			discountType: session.discountType,
			discountValue: session.discountValue,
			customerId: payload.customerId || session.customerId,
			paymentMethod: payload.paymentMethod,
			amountReceived: payload.amountReceived,
			notes: payload.notes || session.notes
		}, userId);
	}

	async searchCustomer(term) {
		const where = {
			[Op.or]: [
				{ fullName: { [Op.iLike]: `%${term}%` } },
				{ documentNumber: { [Op.iLike]: `%${term}%` } },
				{ phone: { [Op.iLike]: `%${term}%` } }
			]
		};

		return db.Customer.findAll({
			where,
			order: [['fullName', 'ASC']],
			limit: 20
		});
	}

	async quickCreateCustomer({ fullName, documentNumber, phone }) {
		if (documentNumber) {
			const existing = await db.Customer.findOne({ where: { documentNumber } });
			if (existing) throw new Error(ERROR.DOCUMENT_IN_USE);
		}

		return db.Customer.create({
			fullName,
			documentNumber: documentNumber || null,
			phone: phone || null
		});
	}

	buildDayRange(startHour, endHour) {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		if (startHour) {
			const [h, m] = startHour.split(':').map(Number);
			start.setHours(h, m, 0, 0);
		}

		if (endHour) {
			const [h, m] = endHour.split(':').map(Number);
			end.setHours(h, m, 59, 999);
		}

		return { start, end };
	}

	async listTodaySales({ cashierId, startHour, endHour }) {
		const range = this.buildDayRange(startHour, endHour);
		const where = {
			createdAt: { [Op.between]: [range.start, range.end] }
		};
		if (cashierId) where.cashierId = Number(cashierId);

		const sales = await db.Sale.findAll({
			where,
			include: [
				{ model: db.Customer, as: 'customer', attributes: ['id', 'fullName', 'documentNumber', 'phone'] },
				{ model: db.User, as: 'cashier', attributes: ['id', 'username', 'firstName', 'lastName'] },
				{ model: db.SaleDetail, as: 'details', attributes: ['id', 'quantity'] }
			],
			order: [['createdAt', 'DESC']]
		});

		return sales.map((sale) => ({
			id: sale.id,
			ticketNumber: sale.ticketNumber,
			status: sale.status,
			paymentMethod: sale.paymentMethod,
			subtotal: Number(sale.subtotal),
			ivaAmount: Number(sale.ivaAmount),
			discountAmount: Number(sale.discountAmount),
			totalAmount: Number(sale.totalAmount),
			createdAt: sale.createdAt,
			customer: sale.customer,
			cashier: sale.cashier,
			itemsCount: (sale.details || []).reduce((acc, d) => acc + Number(d.quantity), 0)
		}));
	}

	async getSaleById(id) {
		const sale = await db.Sale.findByPk(id, {
			include: [
				{ model: db.Customer, as: 'customer', attributes: ['id', 'fullName', 'documentNumber', 'phone'] },
				{ model: db.User, as: 'cashier', attributes: ['id', 'username', 'firstName', 'lastName'] },
				{
					model: db.SaleDetail,
					as: 'details',
					include: [{ model: db.Product, as: 'product', attributes: ['id', 'name', 'sku', 'barcode'] }]
				}
			]
		});

		if (!sale) throw new Error(ERROR.SALE_NOT_FOUND);
		return sale;
	}

	async voidSale(id, reason, userId) {
		const transaction = await sequelize.transaction();
		try {
			const sale = await db.Sale.findByPk(id, {
				transaction,
				lock: { level: transaction.LOCK.UPDATE, of: db.Sale },
				include: [{ model: db.SaleDetail, as: 'details' }]
			});

			if (!sale) throw new Error(ERROR.SALE_NOT_FOUND);
			if (sale.status === 'voided') throw new Error(ERROR.SALE_ALREADY_VOIDED);

			for (const detail of sale.details || []) {
				const product = await db.Product.findByPk(detail.productId, { transaction, lock: transaction.LOCK.UPDATE });
				if (!product) throw new Error(ERROR.PRODUCT_NOT_FOUND);

				const stockBefore = Number(product.stock);
				const stockAfter = stockBefore + Number(detail.quantity);

				await product.update({ stock: stockAfter }, { transaction });

				await db.StockMovement.create({
					productId: product.id,
					movementType: 'entrada',
					quantity: Number(detail.quantity),
					stockBefore,
					stockAfter,
					reason: 'Anulacion de venta POS',
					notes: `Anulacion ticket ${sale.ticketNumber}`,
					referenceType: 'sale_void',
					referenceId: sale.id,
					performedBy: userId
				}, { transaction });
			}

			await sale.update({
				status: 'voided',
				voidReason: reason,
				voidedAt: new Date()
			}, { transaction });

			await transaction.commit();
			return {
				id: sale.id,
				ticketNumber: sale.ticketNumber,
				status: 'voided',
				voidReason: reason,
				voidedAt: sale.voidedAt
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	getPeriodRange(period, startDate, endDate) {
		const end = new Date();
		const start = new Date();

		if (period === 'week') {
			start.setDate(end.getDate() - 6);
			start.setHours(0, 0, 0, 0);
			return { [Op.between]: [start, end] };
		}

		if (period === 'month') {
			start.setMonth(end.getMonth() - 1);
			start.setHours(0, 0, 0, 0);
			return { [Op.between]: [start, end] };
		}

		if (period === 'range' && startDate && endDate) {
			return { [Op.between]: [new Date(startDate), new Date(endDate)] };
		}

		const dayStart = new Date();
		dayStart.setHours(0, 0, 0, 0);
		return { [Op.between]: [dayStart, end] };
	}

	async getPopularProducts({ limit = 10, period = 'day', startDate, endDate }) {
		const dateRange = this.getPeriodRange(period, startDate, endDate);

		return db.SaleDetail.findAll({
			attributes: [
				'productId',
				[fn('SUM', col('SaleDetail.quantity')), 'soldQuantity'],
				[fn('SUM', col('SaleDetail.line_total')), 'totalRevenue']
			],
			include: [
				{
					model: db.Sale,
					as: 'sale',
					attributes: [],
					required: true,
					where: {
						status: 'completed',
						createdAt: dateRange
					}
				},
				{
					model: db.Product,
					as: 'product',
					attributes: ['id', 'name', 'sku', 'barcode']
				}
			],
			group: ['SaleDetail.product_id', 'product.id', 'product.name', 'product.sku', 'product.barcode'],
			order: [[literal('SUM("SaleDetail"."quantity")'), 'DESC']],
			limit: Number(limit)
		});
	}
}

const saleService = new SaleService();
saleService.ERROR = ERROR;

module.exports = saleService;
