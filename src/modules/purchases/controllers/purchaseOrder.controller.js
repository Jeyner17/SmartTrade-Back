const purchaseOrderService = require('../services/purchaseOrder.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERROR = purchaseOrderService.ERROR;

/**
 * Controller de Órdenes de Compra
 * Sprint 9 - Compras
 */
class PurchaseOrderController {

	/**
	 * GET /api/v1/purchases
	 */
	async getPurchaseOrders(req, res) {
		try {
			const { page, limit, supplierId, status, startDate, endDate } = req.query;

			const result = await purchaseOrderService.listPurchaseOrders({
				page: parseInt(page, 10) || 1,
				limit: parseInt(limit, 10) || 10,
				supplierId: supplierId ? parseInt(supplierId, 10) : undefined,
				status: status || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined
			});

			return ApiResponse.success(res, result, 'Órdenes de compra obtenidas exitosamente');
		} catch (error) {
			logger.error('Error en getPurchaseOrders:', error);
			return ApiResponse.error(res, 'Error al obtener órdenes de compra');
		}
	}

	/**
	 * POST /api/v1/purchases
	 */
	async createPurchaseOrder(req, res) {
		try {
			const result = await purchaseOrderService.createPurchaseOrder(req.body, req.user.id);
			return ApiResponse.created(res, result, 'Orden de compra creada exitosamente');
		} catch (error) {
			logger.error('Error en createPurchaseOrder:', error);

			if (error.message === ERROR.SUPPLIER_NOT_FOUND || error.message === ERROR.PRODUCT_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.EMPTY_PRODUCTS) {
				return ApiResponse.error(res, error.message, 400);
			}

			return ApiResponse.error(res, 'Error al crear orden de compra');
		}
	}

	/**
	 * GET /api/v1/purchases/:id
	 */
	async getPurchaseOrderById(req, res) {
		try {
			const result = await purchaseOrderService.getPurchaseOrderById(parseInt(req.params.id, 10));
			return ApiResponse.success(res, result, 'Orden de compra obtenida exitosamente');
		} catch (error) {
			logger.error('Error en getPurchaseOrderById:', error);

			if (error.message === ERROR.ORDER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			return ApiResponse.error(res, 'Error al obtener orden de compra');
		}
	}

	/**
	 * PUT /api/v1/purchases/:id
	 */
	async updatePurchaseOrder(req, res) {
		try {
			const result = await purchaseOrderService.updatePurchaseOrder(
				parseInt(req.params.id, 10),
				req.body,
				req.user.id
			);

			return ApiResponse.success(res, result, 'Orden de compra actualizada exitosamente');
		} catch (error) {
			logger.error('Error en updatePurchaseOrder:', error);

			if (error.message === ERROR.ORDER_NOT_FOUND || error.message === ERROR.SUPPLIER_NOT_FOUND || error.message === ERROR.PRODUCT_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.ORDER_NOT_EDITABLE) {
				return ApiResponse.conflict(res, error.message);
			}

			if (error.message === ERROR.EMPTY_PRODUCTS) {
				return ApiResponse.error(res, error.message, 400);
			}

			return ApiResponse.error(res, 'Error al actualizar orden de compra');
		}
	}

	/**
	 * PATCH /api/v1/purchases/:id/status
	 */
	async changePurchaseOrderStatus(req, res) {
		try {
			const { newStatus, observations } = req.body;

			const result = await purchaseOrderService.changeOrderStatus(
				parseInt(req.params.id, 10),
				newStatus,
				observations || null,
				req.user.id
			);

			return ApiResponse.success(res, result, result.message);
		} catch (error) {
			logger.error('Error en changePurchaseOrderStatus:', error);

			if (error.message === ERROR.ORDER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (
				error.message === ERROR.INVALID_TRANSITION ||
				error.message === ERROR.RECEIVE_USE_ENDPOINT ||
				error.message === ERROR.ORDER_ALREADY_RECEIVED ||
				error.message === ERROR.ORDER_ALREADY_CANCELED
			) {
				return ApiResponse.conflict(res, error.message);
			}

			if (error.message === ERROR.INVALID_STATUS) {
				return ApiResponse.error(res, error.message, 400);
			}

			return ApiResponse.error(res, 'Error al cambiar estado de la orden');
		}
	}

	/**
	 * POST /api/v1/purchases/:id/receive
	 */
	async receivePurchaseOrder(req, res) {
		try {
			const { products, observations } = req.body;

			const result = await purchaseOrderService.receivePurchaseOrder(
				parseInt(req.params.id, 10),
				products,
				observations || null,
				req.user.id
			);

			return ApiResponse.success(res, result, result.message);
		} catch (error) {
			logger.error('Error en receivePurchaseOrder:', error);

			if (error.message === ERROR.ORDER_NOT_FOUND || error.message === ERROR.PRODUCT_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (
				error.message === ERROR.ORDER_ALREADY_RECEIVED ||
				error.message === ERROR.ORDER_ALREADY_CANCELED
			) {
				return ApiResponse.conflict(res, error.message);
			}

			return ApiResponse.error(res, 'Error al recibir orden de compra');
		}
	}

	/**
	 * POST /api/v1/purchases/:id/cancel
	 */
	async cancelPurchaseOrder(req, res) {
		try {
			const { reason } = req.body;

			const result = await purchaseOrderService.cancelPurchaseOrder(
				parseInt(req.params.id, 10),
				reason,
				req.user.id
			);

			return ApiResponse.success(res, result, 'Orden cancelada exitosamente');
		} catch (error) {
			logger.error('Error en cancelPurchaseOrder:', error);

			if (error.message === ERROR.ORDER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.CANCEL_REASON_REQUIRED || error.message === ERROR.INVALID_STATUS) {
				return ApiResponse.error(res, error.message, 400);
			}

			if (
				error.message === ERROR.INVALID_TRANSITION ||
				error.message === ERROR.ORDER_ALREADY_RECEIVED ||
				error.message === ERROR.ORDER_ALREADY_CANCELED
			) {
				return ApiResponse.conflict(res, error.message);
			}

			return ApiResponse.error(res, 'Error al cancelar orden de compra');
		}
	}

	/**
	 * GET /api/v1/purchases/supplier/:supplierId
	 */
	async getPurchasesBySupplier(req, res) {
		try {
			const { startDate, endDate, page, limit } = req.query;

			const result = await purchaseOrderService.getPurchasesBySupplier(
				parseInt(req.params.supplierId, 10),
				{
					startDate: startDate || undefined,
					endDate: endDate || undefined,
					page: parseInt(page, 10) || 1,
					limit: parseInt(limit, 10) || 10
				}
			);

			return ApiResponse.success(res, result, 'Compras del proveedor obtenidas exitosamente');
		} catch (error) {
			logger.error('Error en getPurchasesBySupplier:', error);

			if (error.message === ERROR.SUPPLIER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			return ApiResponse.error(res, 'Error al obtener compras del proveedor');
		}
	}

	/**
	 * GET /api/v1/purchases/report
	 */
	async getPurchasesReport(req, res) {
		try {
			const { startDate, endDate, supplierId, status } = req.query;

			const result = await purchaseOrderService.generatePurchasesReport({
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				supplierId: supplierId ? parseInt(supplierId, 10) : undefined,
				status: status || undefined
			});

			return ApiResponse.success(res, result, 'Reporte de compras generado exitosamente');
		} catch (error) {
			logger.error('Error en getPurchasesReport:', error);
			return ApiResponse.error(res, 'Error al generar reporte de compras');
		}
	}
}

module.exports = new PurchaseOrderController();

