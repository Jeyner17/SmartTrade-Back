const { Op } = require('sequelize');
const { sequelize } = require('../../../database');
const logger = require('../../../utils/logger');

const STATUS = {
	PENDING: 'pendiente',
	CONFIRMED: 'confirmada',
	RECEIVED: 'recibida',
	CANCELED: 'cancelada'
};

const ERROR = {
	ORDER_NOT_FOUND: 'Orden de compra no encontrada',
	SUPPLIER_NOT_FOUND: 'Proveedor no encontrado',
	PRODUCT_NOT_FOUND: 'Uno o más productos no existen',
	INVALID_STATUS: 'Estado de orden inválido',
	INVALID_TRANSITION: 'Cambio de estado no permitido',
	ORDER_NOT_EDITABLE: 'Solo se puede actualizar una orden en estado pendiente',
	ORDER_ALREADY_RECEIVED: 'La orden ya fue recibida',
	ORDER_ALREADY_CANCELED: 'La orden ya fue cancelada',
	EMPTY_PRODUCTS: 'La lista de productos es obligatoria',
	RECEIVE_USE_ENDPOINT: 'Para marcar recibida use el endpoint de recepción',
	CANCEL_REASON_REQUIRED: 'El motivo de cancelación es obligatorio'
};

class PurchaseOrderService {

	async generateOrderNumber(transaction) {
		const now = new Date();
		const y = now.getFullYear();
		const m = String(now.getMonth() + 1).padStart(2, '0');
		const d = String(now.getDate()).padStart(2, '0');
		const datePart = `${y}${m}${d}`;
		const prefix = `PO-${datePart}-`;

		const { PurchaseOrder } = require('../../../database');

		const count = await PurchaseOrder.count({
			where: {
				orderNumber: { [Op.like]: `${prefix}%` }
			},
			transaction
		});

		const sequence = String(count + 1).padStart(4, '0');
		return `${prefix}${sequence}`;
	}

	async ensureSupplierExists(supplierId, transaction) {
		const { Supplier } = require('../../../database');
		const supplier = await Supplier.findByPk(supplierId, {
			attributes: ['id', 'tradeName', 'status'],
			transaction
		});

		if (!supplier) throw new Error(ERROR.SUPPLIER_NOT_FOUND);
		return supplier;
	}

	async ensureProductsExist(productIds, transaction) {
		const { Product } = require('../../../database');
		const products = await Product.findAll({
			where: { id: { [Op.in]: productIds } },
			attributes: ['id', 'name', 'stock'],
			transaction
		});

		if (products.length !== productIds.length) {
			throw new Error(ERROR.PRODUCT_NOT_FOUND);
		}

		return products;
	}

	buildOrderTotals(products = []) {
		const normalized = products.map(item => {
			const quantity = parseInt(item.quantity, 10);
			const unitCost = parseFloat(item.unitCost);
			const lineTotal = parseFloat((quantity * unitCost).toFixed(2));
			return {
				productId: parseInt(item.productId, 10),
				quantity,
				unitCost,
				lineTotal
			};
		});

		const subtotal = normalized.reduce((sum, line) => sum + line.lineTotal, 0);
		return {
			lines: normalized,
			subtotal: parseFloat(subtotal.toFixed(2)),
			totalAmount: parseFloat(subtotal.toFixed(2))
		};
	}

	async listPurchaseOrders({
		page = 1,
		limit = 10,
		supplierId,
		status,
		startDate,
		endDate
	} = {}) {
		const { PurchaseOrder, PurchaseDetail, Supplier } = require('../../../database');

		const offset = (page - 1) * limit;
		const where = {};

		if (supplierId !== undefined) where.supplierId = supplierId;
		if (status) where.status = status;

		if (startDate || endDate) {
			where.orderDate = {};
			if (startDate) where.orderDate[Op.gte] = startDate;
			if (endDate) where.orderDate[Op.lte] = endDate;
		}

		const { count, rows } = await PurchaseOrder.findAndCountAll({
			where,
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
				supplier: order.supplier,
				totalAmount: parseFloat(order.totalAmount),
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

	async createPurchaseOrder({ supplierId, products, expectedDeliveryDate, observations }, userId) {
		if (!Array.isArray(products) || products.length === 0) {
			throw new Error(ERROR.EMPTY_PRODUCTS);
		}

		const transaction = await sequelize.transaction();
		try {
			const { PurchaseOrder, PurchaseDetail, PurchaseStatusHistory } = require('../../../database');

			await this.ensureSupplierExists(supplierId, transaction);

			const totals = this.buildOrderTotals(products);
			await this.ensureProductsExist(
				totals.lines.map(line => line.productId),
				transaction
			);

			const orderNumber = await this.generateOrderNumber(transaction);

			const order = await PurchaseOrder.create({
				orderNumber,
				supplierId,
				expectedDeliveryDate: expectedDeliveryDate || null,
				status: STATUS.PENDING,
				subtotal: totals.subtotal,
				totalAmount: totals.totalAmount,
				notes: observations || null,
				createdBy: userId,
				updatedBy: userId
			}, { transaction });

			await PurchaseDetail.bulkCreate(
				totals.lines.map(line => ({
					purchaseOrderId: order.id,
					productId: line.productId,
					quantityOrdered: line.quantity,
					quantityReceived: 0,
					unitCost: line.unitCost,
					lineTotal: line.lineTotal
				})),
				{ transaction }
			);

			await PurchaseStatusHistory.create({
				purchaseOrderId: order.id,
				previousStatus: null,
				newStatus: STATUS.PENDING,
				notes: 'Orden creada',
				changedBy: userId,
				changedAt: new Date()
			}, { transaction });

			await transaction.commit();

			logger.info('Orden de compra creada', { orderId: order.id, orderNumber, userId });
			return this.getPurchaseOrderById(order.id);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async getPurchaseOrderById(orderId) {
		const { PurchaseOrder, PurchaseDetail, PurchaseStatusHistory, Supplier, Product, User } = require('../../../database');

		const order = await PurchaseOrder.findByPk(orderId, {
			include: [
				{
					model: Supplier,
					as: 'supplier',
					attributes: ['id', 'tradeName', 'ruc', 'email', 'phone']
				},
				{
					model: PurchaseDetail,
					as: 'details',
					include: [{
						model: Product,
						as: 'product',
						attributes: ['id', 'name', 'sku', 'barcode']
					}]
				},
				{
					model: PurchaseStatusHistory,
					as: 'statusHistory',
					include: [{
						model: User,
						as: 'changedByUser',
						attributes: ['id', 'username', 'firstName', 'lastName']
					}],
					separate: true,
					order: [['changedAt', 'DESC']]
				}
			]
		});

		if (!order) throw new Error(ERROR.ORDER_NOT_FOUND);
		return order;
	}

	async updatePurchaseOrder(orderId, payload, userId) {
		const transaction = await sequelize.transaction();
		try {
			const { PurchaseOrder, PurchaseDetail } = require('../../../database');

			const order = await PurchaseOrder.findByPk(orderId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!order) throw new Error(ERROR.ORDER_NOT_FOUND);
			if (order.status !== STATUS.PENDING) throw new Error(ERROR.ORDER_NOT_EDITABLE);

			const updates = { updatedBy: userId };

			if (payload.supplierId !== undefined) {
				await this.ensureSupplierExists(payload.supplierId, transaction);
				updates.supplierId = payload.supplierId;
			}

			if (payload.expectedDeliveryDate !== undefined) {
				updates.expectedDeliveryDate = payload.expectedDeliveryDate || null;
			}

			if (payload.observations !== undefined) {
				updates.notes = payload.observations || null;
			}

			if (payload.products !== undefined) {
				if (!Array.isArray(payload.products) || payload.products.length === 0) {
					throw new Error(ERROR.EMPTY_PRODUCTS);
				}

				const totals = this.buildOrderTotals(payload.products);
				await this.ensureProductsExist(
					totals.lines.map(line => line.productId),
					transaction
				);

				await PurchaseDetail.destroy({
					where: { purchaseOrderId: order.id },
					transaction
				});

				await PurchaseDetail.bulkCreate(
					totals.lines.map(line => ({
						purchaseOrderId: order.id,
						productId: line.productId,
						quantityOrdered: line.quantity,
						quantityReceived: 0,
						unitCost: line.unitCost,
						lineTotal: line.lineTotal
					})),
					{ transaction }
				);

				updates.subtotal = totals.subtotal;
				updates.totalAmount = totals.totalAmount;
			}

			await order.update(updates, { transaction });
			await transaction.commit();

			logger.info('Orden de compra actualizada', { orderId, userId });
			return this.getPurchaseOrderById(order.id);
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async changeOrderStatus(orderId, newStatus, observations, userId) {
		if (!Object.values(STATUS).includes(newStatus)) {
			throw new Error(ERROR.INVALID_STATUS);
		}

		if (newStatus === STATUS.RECEIVED) {
			throw new Error(ERROR.RECEIVE_USE_ENDPOINT);
		}

		const transitions = {
			[STATUS.PENDING]: [STATUS.CONFIRMED, STATUS.CANCELED],
			[STATUS.CONFIRMED]: [STATUS.CANCELED],
			[STATUS.RECEIVED]: [],
			[STATUS.CANCELED]: []
		};

		const transaction = await sequelize.transaction();
		try {
			const { PurchaseOrder, PurchaseStatusHistory } = require('../../../database');

			const order = await PurchaseOrder.findByPk(orderId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!order) throw new Error(ERROR.ORDER_NOT_FOUND);
			if (!transitions[order.status].includes(newStatus)) throw new Error(ERROR.INVALID_TRANSITION);

			const updates = {
				status: newStatus,
				statusObservations: observations || null,
				updatedBy: userId
			};

			if (newStatus === STATUS.CANCELED) {
				updates.cancelledAt = new Date();
			}

			await order.update(updates, { transaction });

			await PurchaseStatusHistory.create({
				purchaseOrderId: order.id,
				previousStatus: order.status,
				newStatus,
				notes: observations || null,
				changedBy: userId,
				changedAt: new Date()
			}, { transaction });

			await transaction.commit();

			return {
				orderId: order.id,
				orderNumber: order.orderNumber,
				previousStatus: order.status,
				newStatus,
				message: `Estado actualizado a ${newStatus}`
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async receivePurchaseOrder(orderId, receivedProducts, observations, userId) {
		const transaction = await sequelize.transaction();
		try {
			const {
				PurchaseOrder,
				PurchaseDetail,
				PurchaseStatusHistory,
				Product,
				StockMovement
			} = require('../../../database');

			const order = await PurchaseOrder.findByPk(orderId, {
				transaction,
				lock: transaction.LOCK.UPDATE
			});

			if (!order) throw new Error(ERROR.ORDER_NOT_FOUND);

			const details = await PurchaseDetail.findAll({
				where: { purchaseOrderId: orderId },
				transaction,
				lock: transaction.LOCK.UPDATE
			});
			if (order.status === STATUS.RECEIVED) throw new Error(ERROR.ORDER_ALREADY_RECEIVED);
			if (order.status === STATUS.CANCELED) throw new Error(ERROR.ORDER_ALREADY_CANCELED);

			const receivedMap = new Map(
				(receivedProducts || []).map(item => [
					parseInt(item.productId, 10),
					parseInt(item.quantityReceived, 10)
				])
			);

			const processed = [];

			for (const detail of details) {
				const quantityReceived = receivedMap.has(detail.productId)
					? receivedMap.get(detail.productId)
					: detail.quantityOrdered;

				const safeReceived = Number.isInteger(quantityReceived) && quantityReceived >= 0
					? quantityReceived
					: 0;

				await detail.update({ quantityReceived: safeReceived }, { transaction });

				if (safeReceived > 0) {
					const product = await Product.findByPk(detail.productId, {
						transaction,
						lock: transaction.LOCK.UPDATE
					});

					if (!product) throw new Error(ERROR.PRODUCT_NOT_FOUND);

					// const stockBefore = product.stock;
					const stockBefore = product.stock || 0;
					const stockAfter = stockBefore + safeReceived;

					await product.update({ stock: stockAfter }, { transaction });

					await StockMovement.create({
						productId: product.id,
						movementType: 'entrada',
						quantity: safeReceived,
						stockBefore,
						stockAfter,
						reason: 'Recepción de orden de compra',
						notes: observations || `Recepción de ${order.orderNumber}`,
						referenceType: 'purchase_order',
						referenceId: order.id,
						performedBy: userId
					}, { transaction });
				}

				processed.push({
					productId: detail.productId,
					quantityOrdered: detail.quantityOrdered,
					quantityReceived: safeReceived
				});
			}

			const previousStatus = order.status;

			await order.update({
				status: STATUS.RECEIVED,
				receivedAt: new Date(),
				statusObservations: observations || null,
				updatedBy: userId
			}, { transaction });

			await PurchaseStatusHistory.create({
				purchaseOrderId: order.id,
				previousStatus,
				newStatus: STATUS.RECEIVED,
				notes: observations || 'Orden recibida',
				changedBy: userId,
				changedAt: new Date()
			}, { transaction });

			await transaction.commit();

			return {
				orderId: order.id,
				orderNumber: order.orderNumber,
				previousStatus,
				newStatus: STATUS.RECEIVED,
				receivedProducts: processed,
				totalReceivedItems: processed.reduce((sum, row) => sum + row.quantityReceived, 0),
				message: 'Orden recibida y stock actualizado exitosamente'
			};
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async cancelPurchaseOrder(orderId, reason, userId) {
		if (!reason || !reason.trim()) throw new Error(ERROR.CANCEL_REASON_REQUIRED);
		return this.changeOrderStatus(orderId, STATUS.CANCELED, reason, userId);
	}

	async getPurchasesBySupplier(supplierId, { startDate, endDate, page = 1, limit = 10 } = {}) {
		const { PurchaseOrder, PurchaseDetail, Supplier } = require('../../../database');

		const supplier = await this.ensureSupplierExists(supplierId);

		const where = { supplierId };
		if (startDate || endDate) {
			where.orderDate = {};
			if (startDate) where.orderDate[Op.gte] = startDate;
			if (endDate) where.orderDate[Op.lte] = endDate;
		}

		const offset = (page - 1) * limit;
		const { count, rows } = await PurchaseOrder.findAndCountAll({
			where,
			include: [{ model: PurchaseDetail, as: 'details', attributes: ['quantityOrdered'] }],
			order: [['orderDate', 'DESC'], ['id', 'DESC']],
			limit,
			offset
		});

		const list = rows.map(order => ({
			id: order.id,
			orderNumber: order.orderNumber,
			orderDate: order.orderDate,
			status: order.status,
			totalAmount: parseFloat(order.totalAmount),
			productsQuantity: order.details.reduce((sum, detail) => sum + detail.quantityOrdered, 0)
		}));

		const stats = {
			totalOrders: count,
			totalAmount: parseFloat(rows.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0).toFixed(2)),
			pending: rows.filter(item => item.status === STATUS.PENDING).length,
			confirmed: rows.filter(item => item.status === STATUS.CONFIRMED).length,
			received: rows.filter(item => item.status === STATUS.RECEIVED).length,
			canceled: rows.filter(item => item.status === STATUS.CANCELED).length
		};

		return {
			supplier: {
				id: supplier.id,
				tradeName: supplier.tradeName,
				status: supplier.status
			},
			orders: list,
			stats,
			filters: { startDate: startDate || null, endDate: endDate || null },
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

	async generatePurchasesReport({ startDate, endDate, supplierId, status } = {}) {
		const { PurchaseOrder, PurchaseDetail, Supplier, Product } = require('../../../database');

		const where = {};
		if (supplierId !== undefined) where.supplierId = supplierId;
		if (status) where.status = status;
		if (startDate || endDate) {
			where.orderDate = {};
			if (startDate) where.orderDate[Op.gte] = startDate;
			if (endDate) where.orderDate[Op.lte] = endDate;
		}

		const orders = await PurchaseOrder.findAll({
			where,
			include: [
				{ model: Supplier, as: 'supplier', attributes: ['id', 'tradeName'] },
				{
					model: PurchaseDetail,
					as: 'details',
					include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }]
				}
			],
			order: [['orderDate', 'DESC']]
		});

		const totalSpent = parseFloat(orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0).toFixed(2));
		const totalOrders = orders.length;

		const supplierStats = new Map();
		const productStats = new Map();
		const statusStats = {
			pendiente: 0,
			confirmada: 0,
			recibida: 0,
			cancelada: 0
		};

		for (const order of orders) {
			statusStats[order.status] += 1;

			const supplierKey = order.supplier ? order.supplier.id : 0;
			const supplierName = order.supplier ? order.supplier.tradeName : 'Sin proveedor';
			const supplierCurrent = supplierStats.get(supplierKey) || {
				supplierId: supplierKey,
				supplierName,
				orders: 0,
				totalAmount: 0
			};
			supplierCurrent.orders += 1;
			supplierCurrent.totalAmount += parseFloat(order.totalAmount);
			supplierStats.set(supplierKey, supplierCurrent);

			for (const detail of order.details) {
				const productKey = detail.productId;
				const productName = detail.product ? detail.product.name : `Producto ${productKey}`;
				const productCurrent = productStats.get(productKey) || {
					productId: productKey,
					productName,
					sku: detail.product?.sku || null,
					totalQuantity: 0,
					totalAmount: 0
				};
				productCurrent.totalQuantity += detail.quantityOrdered;
				productCurrent.totalAmount += parseFloat(detail.lineTotal);
				productStats.set(productKey, productCurrent);
			}
		}

		const suppliersRanking = Array.from(supplierStats.values())
			.map(item => ({
				...item,
				totalAmount: parseFloat(item.totalAmount.toFixed(2))
			}))
			.sort((a, b) => b.totalAmount - a.totalAmount);

		const productsRanking = Array.from(productStats.values())
			.map(item => ({
				...item,
				totalAmount: parseFloat(item.totalAmount.toFixed(2))
			}))
			.sort((a, b) => b.totalQuantity - a.totalQuantity);

		return {
			summary: {
				totalSpent,
				totalOrders,
				topSupplier: suppliersRanking[0] || null,
				statusBreakdown: statusStats
			},
			topSuppliers: suppliersRanking.slice(0, 10),
			topProducts: productsRanking.slice(0, 10),
			filters: {
				startDate: startDate || null,
				endDate: endDate || null,
				supplierId: supplierId || null,
				status: status || null
			}
		};
	}
}

const service = new PurchaseOrderService();
service.STATUS = STATUS;
service.ERROR = ERROR;

module.exports = service;

