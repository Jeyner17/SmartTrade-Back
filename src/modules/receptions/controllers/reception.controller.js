const receptionService = require('../services/reception.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERROR = receptionService.ERROR;
const STATUS = receptionService.STATUS;

/**
 * Controller de Recepciones de Mercancía
 * Sprint 10 - Recepción de Mercancía
 */
class ReceptionController {

	/**
	 * GET /api/v1/receptions
	 * Listar recepciones
	 */
	async listReceptions(req, res) {
		try {
			const { page, limit, supplierId, status, startDate, endDate } = req.query;

			const result = await receptionService.listReceptions({
				page: parseInt(page, 10) || 1,
				limit: parseInt(limit, 10) || 10,
				supplierId: supplierId ? parseInt(supplierId, 10) : undefined,
				status: status || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined
			});

			return ApiResponse.success(res, result, 'Recepciones obtenidas exitosamente');
		} catch (error) {
			logger.error('Error en listReceptions:', error);
			return ApiResponse.error(res, 'Error al obtener recepciones');
		}
	}

	/**
	 * POST /api/v1/receptions
	 * Crear recepción
	 */
	async createReception(req, res) {
		try {
			const { purchaseOrderId, receptionDate, observations } = req.body;

			const result = await receptionService.createReception(
				purchaseOrderId,
				receptionDate || null,
				observations || null,
				req.user.id
			);

			return ApiResponse.created(res, result, 'Recepción creada exitosamente');
		} catch (error) {
			logger.error('Error en createReception:', error);

			if (error.message === ERROR.PURCHASE_ORDER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message.includes('La orden de compra no tiene productos')) {
				return ApiResponse.error(res, error.message, 400);
			}

			if (error.message.includes('cancelada') || error.message.includes('recibida completamente')) {
				return ApiResponse.conflict(res, error.message);
			}

			return ApiResponse.error(res, 'Error al crear recepción');
		}
	}

	/**
	 * GET /api/v1/receptions/:id
	 * Obtener recepción por ID
	 */
	async getReception(req, res) {
		try {
			const { id } = req.params;

			const result = await receptionService.getReceptionDetails(parseInt(id, 10));

			if (!result) {
				return ApiResponse.notFound(res, ERROR.RECEPTION_NOT_FOUND);
			}

			return ApiResponse.success(res, result, 'Recepción obtenida exitosamente');
		} catch (error) {
			logger.error('Error en getReception:', error);
			return ApiResponse.error(res, 'Error al obtener recepción');
		}
	}

	/**
	 * POST /api/v1/receptions/verify-barcode
	 * Verificar producto por escaneo
	 */
	async verifyProductByBarcode(req, res) {
		try {
			const { purchaseOrderId, barcode } = req.body;

			const result = await receptionService.verifyProductByBarcode(purchaseOrderId, barcode);

			return ApiResponse.success(res, result, 'Producto verificado exitosamente');
		} catch (error) {
			logger.error('Error en verifyProductByBarcode:', error);

			if (error.message === ERROR.PURCHASE_ORDER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.BARCODE_NOT_FOUND) {
				return ApiResponse.notFound(res, 'El código de barras no está en esta orden');
			}

			return ApiResponse.error(res, 'Error al verificar producto');
		}
	}

	/**
	 * POST /api/v1/receptions/:id/scan
	 * Registrar escaneo de producto
	 */
	async registerScannedProduct(req, res) {
		try {
			const { id } = req.params;
			const { productId, quantityScanned } = req.body;

			const result = await receptionService.registerScannedProduct(
				parseInt(id, 10),
				productId,
				quantityScanned || 1,
				req.user.id
			);

			return ApiResponse.success(res, result, 'Producto escaneado registrado exitosamente');
		} catch (error) {
			logger.error('Error en registerScannedProduct:', error);

			if (error.message === ERROR.RECEPTION_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.RECEPTION_CANCELED || error.message === ERROR.RECEPTION_ALREADY_CONFIRMED) {
				return ApiResponse.conflict(res, error.message);
			}

			if (error.message === ERROR.DETAIL_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.INVALID_QUANTITY_ADJUSTMENT || error.message === ERROR.QUANTITY_CANNOT_BE_NEGATIVE) {
				return ApiResponse.error(res, error.message, 400);
			}

			return ApiResponse.error(res, 'Error al registrar escaneo');
		}
	}

	/**
	 * POST /api/v1/receptions/:id/confirm
	 * Confirmar recepción completa
	 */
	async confirmReception(req, res) {
		try {
			const { id } = req.params;
			const { observations } = req.body;

			const result = await receptionService.confirmReception(
				parseInt(id, 10),
				observations || null,
				req.user.id
			);

			return ApiResponse.success(res, result, 'Recepción confirmada y stock actualizado exitosamente');
		} catch (error) {
			logger.error('Error en confirmReception:', error);

			if (error.message === ERROR.RECEPTION_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.PURCHASE_ORDER_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			if (error.message === ERROR.RECEPTION_ALREADY_CONFIRMED || error.message === ERROR.RECEPTION_CANCELED) {
				return ApiResponse.conflict(res, error.message);
			}

			if (error.message === ERROR.PRODUCT_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			return ApiResponse.error(res, 'Error al confirmar recepción');
		}
	}

	/**
	 * POST /api/v1/receptions/:id/discrepancies
	 * Reportar discrepancia
	 */
	async reportDiscrepancy(req, res) {
		try {
			const { id } = req.params;
			const { productId, quantityExpected, quantityReceived, type, notes, observations } = req.body;

			const result = await receptionService.reportDiscrepancy(
				parseInt(id, 10),
				productId,
				quantityExpected,
				quantityReceived,
				type,
				notes || observations || null,
				req.user.id
			);

			return ApiResponse.created(res, result, 'Discrepancia reportada exitosamente');
		} catch (error) {
			logger.error('Error en reportDiscrepancy:', error);

			if (error.message === ERROR.RECEPTION_NOT_FOUND || error.message === ERROR.PRODUCT_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			return ApiResponse.error(res, 'Error al reportar discrepancia');
		}
	}

	/**
	 * GET /api/v1/receptions/discrepancies
	 * Listar discrepancias
	 */
	async listDiscrepancies(req, res) {
		try {
			const { page, limit, receptionId, supplierId, type, startDate, endDate, resolved } = req.query;

			const result = await receptionService.listDiscrepancies({
				page: parseInt(page, 10) || 1,
				limit: parseInt(limit, 10) || 10,
				receptionId: receptionId ? parseInt(receptionId, 10) : undefined,
				supplierId: supplierId ? parseInt(supplierId, 10) : undefined,
				type: type || undefined,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				resolved: resolved !== undefined ? resolved === 'true' : undefined
			});

			return ApiResponse.success(res, result, 'Discrepancias obtenidas exitosamente');
		} catch (error) {
			logger.error('Error en listDiscrepancies:', error);
			return ApiResponse.error(res, 'Error al obtener discrepancias');
		}
	}

	/**
	 * GET /api/v1/receptions/confirmed-orders
	 * Listar órdenes de compra confirmadas disponibles para recepción
	 */
	async listConfirmedPurchaseOrders(req, res) {
		try {
			const { page, limit } = req.query;

			const result = await receptionService.listConfirmedPurchaseOrders({
				page: parseInt(page, 10) || 1,
				limit: parseInt(limit, 10) || 100
			});

			return ApiResponse.success(res, result, 'Órdenes de compra confirmadas obtenidas exitosamente');
		} catch (error) {
			logger.error('Error en listConfirmedPurchaseOrders:', error);
			return ApiResponse.error(res, 'Error al obtener órdenes de compra confirmadas');
		}
	}

	/**
	 * POST /api/v1/receptions/discrepancies/:id/resolve
	 * Resolver discrepancia
	 */
	async resolveDiscrepancy(req, res) {
		try {
			const { id } = req.params;
			const { resolutionNotes } = req.body;

			const result = await receptionService.resolveDiscrepancy(
				parseInt(id, 10),
				resolutionNotes || null,
				req.user.id
			);

			return ApiResponse.success(res, result, 'Discrepancia resuelta exitosamente');
		} catch (error) {
			logger.error('Error en resolveDiscrepancy:', error);

			if (error.message === ERROR.DISCREPANCY_NOT_FOUND) {
				return ApiResponse.notFound(res, error.message);
			}

			return ApiResponse.error(res, 'Error al resolver discrepancia');
		}
	}
}

module.exports = new ReceptionController();
