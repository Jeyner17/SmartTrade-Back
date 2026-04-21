const saleService = require('../services/sale.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERROR = saleService.ERROR;

class SaleController {
	async createSale(req, res) {
		try {
			const result = await saleService.createSale(req.body, req.user.id);
			return ApiResponse.created(res, result, 'Venta creada exitosamente');
		} catch (error) {
			logger.error('Error en createSale:', error);
			if ([ERROR.PRODUCT_NOT_FOUND, ERROR.CUSTOMER_NOT_FOUND, ERROR.SALE_NOT_FOUND].includes(error.message)) {
				return ApiResponse.notFound(res, error.message);
			}
			if ([ERROR.INSUFFICIENT_STOCK, ERROR.INVALID_PAYMENT, ERROR.INVALID_DISCOUNT].includes(error.message)) {
				return ApiResponse.error(res, error.message, 400);
			}
			return ApiResponse.error(res, 'Error al crear venta');
		}
	}

	async addProductToCart(req, res) {
		try {
			const result = await saleService.addProductToCart(req.body, req.user.id);
			return ApiResponse.success(res, result, 'Producto agregado al carrito');
		} catch (error) {
			logger.error('Error en addProductToCart:', error);
			if ([ERROR.SESSION_NOT_FOUND, ERROR.PRODUCT_NOT_FOUND, ERROR.CUSTOMER_NOT_FOUND].includes(error.message)) {
				return ApiResponse.notFound(res, error.message);
			}
			if ([ERROR.SESSION_CLOSED, ERROR.INSUFFICIENT_STOCK].includes(error.message)) {
				return ApiResponse.conflict(res, error.message);
			}
			return ApiResponse.error(res, 'Error al agregar producto al carrito');
		}
	}

	async removeProductFromCart(req, res) {
		try {
			const result = await saleService.removeProductFromCart(
				parseInt(req.params.sessionId, 10),
				parseInt(req.params.productId, 10)
			);
			return ApiResponse.success(res, result, 'Producto removido del carrito');
		} catch (error) {
			logger.error('Error en removeProductFromCart:', error);
			if (error.message === ERROR.SESSION_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			if (error.message === ERROR.SESSION_CLOSED) return ApiResponse.conflict(res, error.message);
			return ApiResponse.error(res, 'Error al remover producto del carrito');
		}
	}

	async updateCartQuantity(req, res) {
		try {
			const result = await saleService.updateCartQuantity(
				parseInt(req.params.sessionId, 10),
				parseInt(req.params.productId, 10),
				parseInt(req.body.quantity, 10)
			);
			return ApiResponse.success(res, result, 'Cantidad actualizada');
		} catch (error) {
			logger.error('Error en updateCartQuantity:', error);
			if ([ERROR.SESSION_NOT_FOUND, ERROR.PRODUCT_NOT_FOUND].includes(error.message)) return ApiResponse.notFound(res, error.message);
			if ([ERROR.SESSION_CLOSED, ERROR.INSUFFICIENT_STOCK].includes(error.message)) return ApiResponse.conflict(res, error.message);
			return ApiResponse.error(res, 'Error al actualizar cantidad');
		}
	}

	async applyDiscount(req, res) {
		try {
			const result = await saleService.applyDiscount(
				parseInt(req.params.sessionId, 10),
				{
					discountType: req.body.discountType,
					value: req.body.value,
					reason: req.body.reason
				}
			);
			return ApiResponse.success(res, result, 'Descuento aplicado');
		} catch (error) {
			logger.error('Error en applyDiscount:', error);
			if (error.message === ERROR.SESSION_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			if ([ERROR.SESSION_CLOSED, ERROR.INVALID_DISCOUNT].includes(error.message)) return ApiResponse.error(res, error.message, 400);
			return ApiResponse.error(res, 'Error al aplicar descuento');
		}
	}

	async calculateTotal(req, res) {
		try {
			const result = await saleService.calculateTotal(parseInt(req.params.sessionId, 10));
			return ApiResponse.success(res, result, 'Total calculado exitosamente');
		} catch (error) {
			logger.error('Error en calculateTotal:', error);
			if (error.message === ERROR.SESSION_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al calcular total');
		}
	}

	async processPayment(req, res) {
		try {
			const result = await saleService.processPayment(parseInt(req.params.sessionId, 10), req.body, req.user.id);
			return ApiResponse.success(res, result, 'Pago procesado y venta finalizada');
		} catch (error) {
			logger.error('Error en processPayment:', error);
			if ([ERROR.SESSION_NOT_FOUND, ERROR.CUSTOMER_NOT_FOUND].includes(error.message)) return ApiResponse.notFound(res, error.message);
			if ([ERROR.SESSION_CLOSED, ERROR.EMPTY_CART, ERROR.INSUFFICIENT_STOCK].includes(error.message)) return ApiResponse.conflict(res, error.message);
			if ([ERROR.INVALID_PAYMENT, ERROR.INVALID_DISCOUNT].includes(error.message)) return ApiResponse.error(res, error.message, 400);
			return ApiResponse.error(res, 'Error al procesar pago');
		}
	}

	async searchCustomer(req, res) {
		try {
			const result = await saleService.searchCustomer(req.query.term);
			return ApiResponse.success(res, result, 'Clientes encontrados');
		} catch (error) {
			logger.error('Error en searchCustomer:', error);
			return ApiResponse.error(res, 'Error al buscar cliente');
		}
	}

	async quickCreateCustomer(req, res) {
		try {
			const result = await saleService.quickCreateCustomer(req.body);
			return ApiResponse.created(res, result, 'Cliente creado exitosamente');
		} catch (error) {
			logger.error('Error en quickCreateCustomer:', error);
			if (error.message === ERROR.DOCUMENT_IN_USE) return ApiResponse.conflict(res, error.message);
			return ApiResponse.error(res, 'Error al crear cliente');
		}
	}

	async listTodaySales(req, res) {
		try {
			const result = await saleService.listTodaySales(req.query);
			return ApiResponse.success(res, result, 'Ventas del dia obtenidas');
		} catch (error) {
			logger.error('Error en listTodaySales:', error);
			return ApiResponse.error(res, 'Error al listar ventas del dia');
		}
	}

	async getSaleById(req, res) {
		try {
			const result = await saleService.getSaleById(parseInt(req.params.id, 10));
			return ApiResponse.success(res, result, 'Detalle de venta obtenido');
		} catch (error) {
			logger.error('Error en getSaleById:', error);
			if (error.message === ERROR.SALE_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al obtener detalle de venta');
		}
	}

	async voidSale(req, res) {
		try {
			const result = await saleService.voidSale(
				parseInt(req.params.id, 10),
				req.body.reason,
				req.user.id
			);
			return ApiResponse.success(res, result, 'Venta anulada exitosamente');
		} catch (error) {
			logger.error('Error en voidSale:', error);
			if ([ERROR.SALE_NOT_FOUND, ERROR.PRODUCT_NOT_FOUND].includes(error.message)) return ApiResponse.notFound(res, error.message);
			if (error.message === ERROR.SALE_ALREADY_VOIDED) return ApiResponse.conflict(res, error.message);
			return ApiResponse.error(res, 'Error al anular venta');
		}
	}

	async getPopularProducts(req, res) {
		try {
			const result = await saleService.getPopularProducts(req.query);
			return ApiResponse.success(res, result, 'Productos populares obtenidos');
		} catch (error) {
			logger.error('Error en getPopularProducts:', error);
			return ApiResponse.error(res, 'Error al obtener productos populares');
		}
	}
}

module.exports = new SaleController();
