const { Op } = require('sequelize');
const { sequelize } = require('../../../database');
const logger = require('../../../utils/logger');

const STATUS = {
	IN_PROCESS: 'en_proceso',
	PARTIAL: 'parcial',
	COMPLETE: 'completa',
	CANCELED: 'cancelada'
};

const DETAIL_STATUS = {
	PENDING: 'pendiente',
	PARTIAL: 'parcial',
	COMPLETE: 'completa',
	EXCESS: 'exceso'
};

const DISCREPANCY_TYPES = {
	MISSING: 'faltante',
	EXCESS: 'sobrante',
	DAMAGED: 'dañado',
	OTHER: 'otro'
};

const ERROR = {
	RECEPTION_NOT_FOUND: 'Recepción no encontrada',
	PURCHASE_ORDER_NOT_FOUND: 'Orden de compra no encontrada',
	PRODUCT_NOT_FOUND: 'Producto no encontrado',
	RECEPTION_ALREADY_CONFIRMED: 'La recepción ya fue confirmada',
	RECEPTION_CANCELED: 'La recepción fue cancelada',
	INVALID_STATUS: 'Estado de recepción inválido',
	INVALID_QUANTITY_ADJUSTMENT: 'El ajuste de cantidad es inválido',
	QUANTITY_CANNOT_BE_NEGATIVE: 'La cantidad recibida no puede quedar en negativo',
	DETAIL_NOT_FOUND: 'Detalle de recepción no encontrado',
	DISCREPANCY_NOT_FOUND: 'Discrepancia no encontrada',
	BARCODE_NOT_FOUND: 'Código de barras no encontrado en la orden'
};

class ReceptionService {

	async generateReceptionNumber(transaction) {
		const now = new Date();
		const y = now.getFullYear();
		const m = String(now.getMonth() + 1).padStart(2, '0');
		const d = String(now.getDate()).padStart(2, '0');
		const datePart = `${y}${m}${d}`;
		const prefix = `REC-${datePart}-`;

		const { Reception } = require('../../../database');

		const count = await Reception.count({
			where: {
				receptionNumber: { [Op.like]: `${prefix}%` }
			},
			transaction
		});

		const sequence = String(count + 1).padStart(4, '0');
		return `${prefix}${sequence}`;
	}

	async ensurePurchaseOrderExists(orderId, transaction) {
		const { PurchaseOrder } = require('../../../database');
		const order = await PurchaseOrder.findByPk(orderId, {
			attributes: ['id', 'orderNumber', 'status', 'supplierId'],
			transaction
		});

		if (!order) throw new Error(ERROR.PURCHASE_ORDER_NOT_FOUND);
		if (order.status === 'cancelada') throw new Error('La orden de compra fue cancelada');
		return order;
	}

	async getReceptionDetails(receptionId, transaction = null) {
		const { Reception, ReceptionDetail, Product, PurchaseOrder, Supplier } = require('../../../database');

		const reception = await Reception.findByPk(receptionId, {
			include: [
				{
					model: ReceptionDetail,
					as: 'details',
					include: [{
						model: Product,
						as: 'product',
						attributes: ['id', 'name', 'sku', 'barcode']
					}]
				},
				{
					model: PurchaseOrder,
					as: 'purchaseOrder',
					attributes: ['id', 'orderNumber', 'status'],
					include: [{
						model: Supplier,
						as: 'supplier',
						attributes: ['id', 'tradeName']
					}]
				}
			],
			transaction
		});

		return reception;
	}

	async listReceptions({
		page = 1,
		limit = 10,
		supplierId,
		status,
		startDate,
		endDate
	} = {}) {
		const { Reception, PurchaseOrder, Supplier, ReceptionDetail } = require('../../../database');

		const offset = (page - 1) * limit;
		const whereReception = {};
		const whereOrder = {};

		if (supplierId !== undefined) whereOrder.supplierId = supplierId;
		if (status) whereReception.status = status;
		if (startDate || endDate) {
			whereReception.receptionDate = {};
			if (startDate) whereReception.receptionDate[Op.gte] = startDate;
			if (endDate) whereReception.receptionDate[Op.lte] = endDate;
		}

		const { count, rows } = await Reception.findAndCountAll({
			where: whereReception,
			include: [
				{
					model: PurchaseOrder,
					as: 'purchaseOrder',
					attributes: ['id', 'orderNumber'],
					where: whereOrder,
					required: true,
					include: [{
						model: Supplier,
						as: 'supplier',
						attributes: ['id', 'tradeName']
					}]
				},
				{
					model: ReceptionDetail,
					as: 'details',
					attributes: ['id'],
					required: false
				}
			],
			order: [['receptionDate', 'DESC'], ['id', 'DESC']],
			limit,
			offset,
			subQuery: false
		});

		const receptions = rows.map(rec => ({
			id: rec.id,
			receptionNumber: rec.receptionNumber,
			receptionDate: rec.receptionDate,
			purchaseOrder: rec.purchaseOrder,
			status: rec.status,
			totalItemsExpected: rec.totalItemsExpected,
			totalItemsReceived: rec.totalItemsReceived,
			itemsExpected: rec.totalItemsExpected,
			itemsReceived: rec.totalItemsReceived,
			hasDiscrepancies: rec.hasDiscrepancies,
			productsCount: rec.details.length
		}));

		return {
			receptions,
			pagination: {
				total: count,
				page,
				limit,
				pages: Math.ceil(count / limit),
				hasNext: page < Math.ceil(count / limit),
				hasPrev: page > 1
			}
		};
	}

	async createReception(orderId, receptionDate, observations, userId) {
		const transaction = await sequelize.transaction();
		try {
			const { Reception, ReceptionDetail, PurchaseOrder, PurchaseDetail } = require('../../../database');

			const order = await this.ensurePurchaseOrderExists(orderId, transaction);

			// Validar que la orden no esté cancelada
			if (order.status === 'cancelada') {
				throw new Error('No se puede crear recepción para una orden cancelada');
			}

			// Validar que la orden no haya sido ya recibida completamente
			if (order.status === 'recibida') {
				throw new Error('Esta orden de compra ya fue recibida completamente. No se pueden crear nuevas recepciones');
			}

			// Verificar si ya existe una recepción abierta (no confirmada) para esta orden
			const existingOpenReception = await Reception.findOne({
				where: {
					purchaseOrderId: orderId,
					status: [STATUS.IN_PROCESS, STATUS.PARTIAL]
				},
				transaction
			});

			if (existingOpenReception && !existingOpenReception.confirmedAt) {
				logger.info('Recepción abierta ya existe para esta orden', { 
					orderId, 
					receptionId: existingOpenReception.id,
					userId 
				});
				return this.getReceptionDetails(existingOpenReception.id);
			}

			const purchaseDetails = await PurchaseDetail.findAll({
				where: { purchaseOrderId: orderId },
				transaction
			});

			if (purchaseDetails.length === 0) {
				throw new Error('La orden de compra no tiene productos');
			}

			const receptionNumber = await this.generateReceptionNumber(transaction);

			const reception = await Reception.create({
				purchaseOrderId: orderId,
				receptionNumber,
				receptionDate: receptionDate || new Date(),
				status: STATUS.IN_PROCESS,
				totalItemsExpected: purchaseDetails.reduce((sum, d) => sum + d.quantityOrdered, 0),
				notes: observations || null,
				createdBy: userId,
				updatedBy: userId
			}, { transaction });

			await ReceptionDetail.bulkCreate(
				purchaseDetails.map(pd => ({
					receptionId: reception.id,
					productId: pd.productId,
					quantityExpected: pd.quantityOrdered,
					quantityReceived: 0,
					status: DETAIL_STATUS.PENDING
				})),
				{ transaction }
			);

			await transaction.commit();

			logger.info('Recepción creada', { receptionId: reception.id, receptionNumber, orderId, userId });
			return this.getReceptionDetails(reception.id);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async verifyProductByBarcode(orderId, barcode) {
		const { PurchaseOrder, PurchaseDetail, Product } = require('../../../database');

		const order = await PurchaseOrder.findByPk(orderId, {
			attributes: ['id', 'orderNumber'],
			transaction: null
		});

		if (!order) throw new Error(ERROR.PURCHASE_ORDER_NOT_FOUND);

		const purchaseDetail = await PurchaseDetail.findOne({
			where: { purchaseOrderId: orderId },
			include: [{
				model: Product,
				as: 'product',
				where: {
					[Op.or]: [
						{ barcode: barcode },
						{ sku: barcode }
					]
				},
				required: true,
				attributes: ['id', 'name', 'sku', 'barcode', 'stock']
			}],
			attributes: ['id', 'quantityOrdered', 'quantityReceived']
		});

		if (!purchaseDetail) throw new Error(ERROR.BARCODE_NOT_FOUND);

		return {
			productId: purchaseDetail.product.id,
			productName: purchaseDetail.product.name,
			barcode: purchaseDetail.product.barcode,
			sku: purchaseDetail.product.sku,
			currentStock: purchaseDetail.product.stock,
			quantityExpected: purchaseDetail.quantityOrdered,
			quantityAlreadyReceived: purchaseDetail.quantityReceived
		};
	}

	async registerScannedProduct(receptionId, productId, quantityScanned, userId) {
		const transaction = await sequelize.transaction();
		try {
			const { Reception, ReceptionDetail, Product } = require('../../../database');

			if (!Number.isInteger(quantityScanned) || quantityScanned === 0) {
				throw new Error(ERROR.INVALID_QUANTITY_ADJUSTMENT);
			}

			const reception = await Reception.findByPk(receptionId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!reception) throw new Error(ERROR.RECEPTION_NOT_FOUND);
			if (reception.status === STATUS.CANCELED) throw new Error(ERROR.RECEPTION_CANCELED);
			if (reception.confirmedAt) throw new Error(ERROR.RECEPTION_ALREADY_CONFIRMED);

			const detail = await ReceptionDetail.findOne({
				where: {
					receptionId,
					productId
				},
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!detail) throw new Error(ERROR.DETAIL_NOT_FOUND);

			const newQuantity = detail.quantityReceived + quantityScanned;
			if (newQuantity < 0) throw new Error(ERROR.QUANTITY_CANNOT_BE_NEGATIVE);

			let newDetailStatus = DETAIL_STATUS.PENDING;
			if (newQuantity > detail.quantityExpected) {
				newDetailStatus = DETAIL_STATUS.EXCESS;
			} else if (newQuantity === detail.quantityExpected) {
				newDetailStatus = DETAIL_STATUS.COMPLETE;
			} else if (newQuantity > 0) {
				newDetailStatus = DETAIL_STATUS.PARTIAL;
			}

			await detail.update({
				quantityReceived: newQuantity,
				status: newDetailStatus
			}, { transaction });

			// Recálcular totales de recepción
			const allDetails = await ReceptionDetail.findAll({
				where: { receptionId },
				transaction
			});

			const totalReceived = allDetails.reduce((sum, d) => {
				return sum + (d.productId === productId ? newQuantity : d.quantityReceived);
			}, 0);

			let receptionStatus = STATUS.IN_PROCESS;
			const allComplete = allDetails.every(d => 
				(d.productId === productId ? newDetailStatus : d.status) === DETAIL_STATUS.COMPLETE
			);
			const someReceived = totalReceived > 0;

			if (allComplete) {
				receptionStatus = STATUS.COMPLETE;
			} else if (someReceived) {
				receptionStatus = STATUS.PARTIAL;
			}

			await reception.update({
				totalItemsReceived: totalReceived,
				status: receptionStatus,
				updatedBy: userId
			}, { transaction });

			await transaction.commit();

			return {
				productId,
				quantityReceived: newQuantity,
				detailStatus: newDetailStatus,
				receptionStatus,
				totalItemsReceived: totalReceived
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async confirmReception(receptionId, observations, userId) {
		const transaction = await sequelize.transaction();
		try {
			const { Reception, ReceptionDetail, PurchaseOrder, StockMovement, Product } = require('../../../database');

			const reception = await Reception.findByPk(receptionId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!reception) throw new Error(ERROR.RECEPTION_NOT_FOUND);
			if (reception.confirmedAt) throw new Error(ERROR.RECEPTION_ALREADY_CONFIRMED);
			if (reception.status === STATUS.CANCELED) throw new Error(ERROR.RECEPTION_CANCELED);

			const details = await ReceptionDetail.findAll({
				where: { receptionId },
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			const purchaseOrder = await PurchaseOrder.findByPk(reception.purchaseOrderId, {
				attributes: ['id', 'orderNumber', 'status'],
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!purchaseOrder) throw new Error(ERROR.PURCHASE_ORDER_NOT_FOUND);

			// Actualizar stock para cada detalle
			for (const detail of details) {
				if (detail.quantityReceived > 0) {
					const product = await Product.findByPk(detail.productId, {
						transaction,
						lock: transaction.LOCK.UPDATE
					});

					if (!product) throw new Error(ERROR.PRODUCT_NOT_FOUND);

					const stockBefore = product.stock || 0;
					const stockAfter = stockBefore + detail.quantityReceived;

					await product.update({ stock: stockAfter }, { transaction });

					await StockMovement.create({
						productId: product.id,
						movementType: 'entrada',
						quantity: detail.quantityReceived,
						stockBefore,
						stockAfter,
						reason: 'Recepción de mercancía',
						notes: observations || `Recepción ${reception.receptionNumber}`,
						referenceType: 'reception',
						referenceId: reception.id,
						performedBy: userId
					}, { transaction });
				}
			}

			// Actualizar estado de recepción a completa
			await reception.update({
				status: STATUS.COMPLETE,
				confirmedAt: new Date(),
				notes: observations || reception.notes,
				updatedBy: userId
			}, { transaction });

			// Cambiar estado de orden a recibida si todas las recepciones son completas
			if (purchaseOrder.status === 'confirmada') {
				await PurchaseOrder.update({
					status: 'recibida',
					receivedAt: new Date(),
					updatedBy: userId
				}, {
					where: { id: reception.purchaseOrderId },
					transaction
				});
			}

			await transaction.commit();

			logger.info('Recepción confirmada', { receptionId, userId });
			return this.getReceptionDetails(receptionId);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async reportDiscrepancy(receptionId, productId, quantityExpected, quantityReceived, type, notes, userId) {
		const transaction = await sequelize.transaction();
		try {
			const { Reception, Discrepancy, Product } = require('../../../database');

			const reception = await Reception.findByPk(receptionId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!reception) throw new Error(ERROR.RECEPTION_NOT_FOUND);

			const product = await Product.findByPk(productId, { transaction });
			if (!product) throw new Error(ERROR.PRODUCT_NOT_FOUND);

			const hasActionNotes = Boolean(notes && String(notes).trim());

			const discrepancy = await Discrepancy.create({
				receptionId,
				productId,
				quantityExpected,
				quantityReceived,
				discrepancyType: type,
				notes,
				resolved: hasActionNotes,
				resolutionNotes: hasActionNotes ? notes : null,
				reportedBy: userId,
				reportedAt: new Date(),
				resolvedAt: hasActionNotes ? new Date() : null
			}, { transaction });

			// Marcar recepción como con discrepancias
			await reception.update({
				hasDiscrepancies: true,
				updatedBy: userId
			}, { transaction });

			await transaction.commit();

			logger.info('Discrepancia reportada', { receptionId, productId, discrepancyType: type, userId });
			return discrepancy;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async listDiscrepancies({
		page = 1,
		limit = 10,
		receptionId,
		supplierId,
		type,
		startDate,
		endDate,
		resolved
	} = {}) {
		const { Discrepancy, Reception, Product, PurchaseOrder, Supplier } = require('../../../database');

		const offset = (page - 1) * limit;
		const where = {};

		if (receptionId !== undefined) where.receptionId = receptionId;
		if (type) where.discrepancyType = type;
		if (resolved !== undefined) where.resolved = resolved;
		if (startDate || endDate) {
			where.reportedAt = {};
			if (startDate) where.reportedAt[Op.gte] = startDate;
			if (endDate) where.reportedAt[Op.lte] = endDate;
		}

		let discrepancyWhere = where;
		if (supplierId !== undefined) {
			discrepancyWhere = {
				...where,
				'$Reception.PurchaseOrder.Supplier.id$': supplierId
			};
		}

		const { count, rows } = await Discrepancy.findAndCountAll({
			where: discrepancyWhere,
			include: [
				{
					model: Reception,
					as: 'reception',
					attributes: ['id', 'receptionNumber'],
					include: [{
						model: PurchaseOrder,
						as: 'purchaseOrder',
						attributes: ['id', 'orderNumber'],
						include: [{
							model: Supplier,
							as: 'supplier',
							attributes: ['id', 'tradeName']
						}]
					}]
				},
				{
					model: Product,
					as: 'product',
					attributes: ['id', 'name', 'sku', 'barcode']
				}
			],
			order: [['reportedAt', 'DESC'], ['id', 'DESC']],
			limit,
			offset,
			subQuery: false
		});

		const discrepancies = rows.map(item => {
			const actionNotes = item.resolutionNotes || item.notes || null;
			const resolvedFlag = Boolean(item.resolved || actionNotes);

			return ({
			id: item.id,
			receptionId: item.receptionId,
			productId: item.productId,
			quantityExpected: item.quantityExpected,
			quantityReceived: item.quantityReceived,
			type: item.discrepancyType,
			observations: item.notes,
			resolved: resolvedFlag,
			resolutionNotes: actionNotes,
			createdAt: item.createdAt || item.reportedAt,
			reportedAt: item.reportedAt,
			product: item.product,
			reception: item.reception
			});
		});

		return {
			discrepancies,
			pagination: {
				total: count,
				page,
				limit,
				pages: Math.ceil(count / limit),
				hasNext: page < Math.ceil(count / limit),
				hasPrev: page > 1
			}
		};
	}

	async listConfirmedPurchaseOrders({
		page = 1,
		limit = 100
	} = {}) {
		const { PurchaseOrder, PurchaseDetail, Supplier } = require('../../../database');

		const offset = (page - 1) * limit;

		const { count, rows } = await PurchaseOrder.findAndCountAll({
			where: { status: 'confirmada' },
			include: [
				{
					model: Supplier,
					as: 'supplier',
					attributes: ['id', 'tradeName']
				},
				{
					model: PurchaseDetail,
					as: 'details',
					attributes: ['quantityOrdered']
				}
			],
			order: [['orderDate', 'DESC'], ['id', 'DESC']],
			limit,
			offset
		});

		const orders = rows.map(order => {
			const productsCount = order.details.length;
			const totalQuantity = order.details.reduce((sum, detail) => sum + detail.quantityOrdered, 0);

			return {
				id: order.id,
				orderNumber: order.orderNumber,
				orderDate: order.orderDate,
				expectedDeliveryDate: order.expectedDeliveryDate,
				supplier: order.supplier,
				status: order.status,
				products: {
					count: productsCount,
					quantity: totalQuantity
				}
			};
		});

		return {
			orders,
			pagination: {
				total: count,
				page,
				limit,
				pages: Math.ceil(count / limit),
				hasNext: page < Math.ceil(count / limit),
				hasPrev: page > 1
			}
		};
	}

	async resolveDiscrepancy(discrepancyId, resolutionNotes, userId) {
		const transaction = await sequelize.transaction();
		try {
			const { Discrepancy } = require('../../../database');

			const discrepancy = await Discrepancy.findByPk(discrepancyId, { transaction });
			if (!discrepancy) throw new Error(ERROR.DISCREPANCY_NOT_FOUND);

			await discrepancy.update({
				resolved: true,
				resolutionNotes,
				resolvedAt: new Date()
			}, { transaction });

			await transaction.commit();

			logger.info('Discrepancia resuelta', { discrepancyId, userId });
			return discrepancy;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	// Getters de instancia (usados por controllers)
	get STATUS() { return STATUS; }
	get DETAIL_STATUS() { return DETAIL_STATUS; }
	get DISCREPANCY_TYPES() { return DISCREPANCY_TYPES; }
	get ERROR() { return ERROR; }

	// Getters estáticos de respaldo
	static get STATUS() { return STATUS; }
	static get DETAIL_STATUS() { return DETAIL_STATUS; }
	static get DISCREPANCY_TYPES() { return DISCREPANCY_TYPES; }
	static get ERROR() { return ERROR; }
}

module.exports = new ReceptionService();
