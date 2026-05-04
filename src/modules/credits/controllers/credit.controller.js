const creditService = require('../services/credit.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERROR = creditService.ERROR;

class CreditController {
	async createCustomer(req, res) {
		try {
			const result = await creditService.createCustomer(req.body);
			return ApiResponse.created(res, result, 'Cliente de credito creado exitosamente');
		} catch (error) {
			logger.error('Error en createCustomer:', error);
			return ApiResponse.error(res, 'Error al crear cliente de credito');
		}
	}

	async createCredit(req, res) {
		try {
			const result = await creditService.createCredit(req.body);
			return ApiResponse.created(res, result, 'Credito creado exitosamente');
		} catch (error) {
			logger.error('Error en createCredit:', error);
			if ([ERROR.SALE_NOT_FOUND, ERROR.CUSTOMER_NOT_FOUND].includes(error.message)) {
				return ApiResponse.notFound(res, error.message);
			}
			if ([ERROR.CREDIT_ALREADY_FOR_SALE, ERROR.CREDIT_LIMIT_EXCEEDED].includes(error.message)) {
				return ApiResponse.conflict(res, error.message);
			}
			return ApiResponse.error(res, 'Error al crear credito');
		}
	}

	async listCredits(req, res) {
		try {
			const result = await creditService.listCredits(req.query);
			return ApiResponse.success(res, result, 'Creditos obtenidos correctamente');
		} catch (error) {
			logger.error('Error en listCredits:', error);
			return ApiResponse.error(res, 'Error al listar creditos');
		}
	}

	async getCreditById(req, res) {
		try {
			const result = await creditService.getCreditById(parseInt(req.params.id, 10));
			return ApiResponse.success(res, result, 'Detalle de credito obtenido');
		} catch (error) {
			logger.error('Error en getCreditById:', error);
			if (error.message === ERROR.CREDIT_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al obtener detalle de credito');
		}
	}

	async registerPayment(req, res) {
		try {
			const result = await creditService.registerPayment(
				parseInt(req.params.id, 10),
				req.body,
				req.user?.id
			);

			return ApiResponse.success(res, result, 'Pago registrado exitosamente');
		} catch (error) {
			logger.error('Error en registerPayment:', error);
			if (error.message === ERROR.CREDIT_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			if ([ERROR.INVALID_CREDIT_STATUS, ERROR.INVALID_PAYMENT_AMOUNT].includes(error.message)) {
				return ApiResponse.error(res, error.message, 400);
			}
			return ApiResponse.error(res, 'Error al registrar pago');
		}
	}

	async getCustomerStatement(req, res) {
		try {
			const result = await creditService.getCustomerStatement(parseInt(req.params.customerId, 10));
			return ApiResponse.success(res, result, 'Estado de cuenta obtenido');
		} catch (error) {
			logger.error('Error en getCustomerStatement:', error);
			if (error.message === ERROR.CUSTOMER_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al obtener estado de cuenta');
		}
	}

	async calculateLateInterest(req, res) {
		try {
			const result = await creditService.calculateLateInterest(parseInt(req.params.id, 10));
			return ApiResponse.success(res, result, 'Interes por mora calculado');
		} catch (error) {
			logger.error('Error en calculateLateInterest:', error);
			if (error.message === ERROR.CREDIT_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al calcular intereses');
		}
	}

	async createReminder(req, res) {
		try {
			const result = await creditService.createReminder(parseInt(req.params.id, 10), req.body);
			return ApiResponse.created(res, result, 'Recordatorio programado correctamente');
		} catch (error) {
			logger.error('Error en createReminder:', error);
			if (error.message === ERROR.CREDIT_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al crear recordatorio');
		}
	}

	async listDelinquentCustomers(req, res) {
		try {
			const minLateDays = parseInt(req.query.minLateDays || 1, 10);
			const result = await creditService.listDelinquentCustomers(minLateDays);
			return ApiResponse.success(res, result, 'Clientes morosos obtenidos');
		} catch (error) {
			logger.error('Error en listDelinquentCustomers:', error);
			return ApiResponse.error(res, 'Error al listar morosos');
		}
	}

	async forgiveDebt(req, res) {
		try {
			const result = await creditService.forgiveDebt(parseInt(req.params.id, 10), req.body);
			return ApiResponse.success(res, result, 'Condonacion aplicada correctamente');
		} catch (error) {
			logger.error('Error en forgiveDebt:', error);
			if (error.message === ERROR.CREDIT_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			if ([ERROR.INVALID_CREDIT_STATUS, ERROR.INVALID_FORGIVENESS_AMOUNT].includes(error.message)) {
				return ApiResponse.error(res, error.message, 400);
			}
			return ApiResponse.error(res, 'Error al condonar deuda');
		}
	}

	async refinanceCredit(req, res) {
		try {
			const result = await creditService.refinanceCredit(parseInt(req.params.id, 10), req.body);
			return ApiResponse.created(res, result, 'Credito refinanciado exitosamente');
		} catch (error) {
			logger.error('Error en refinanceCredit:', error);
			if (error.message === ERROR.CREDIT_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			if (error.message === ERROR.INVALID_CREDIT_STATUS) return ApiResponse.error(res, error.message, 400);
			return ApiResponse.error(res, 'Error al refinanciar credito');
		}
	}

	async getCustomerCreditHistory(req, res) {
		try {
			const result = await creditService.getCustomerCreditHistory(
				parseInt(req.params.customerId, 10),
				req.query.includePaid === 'true'
			);
			return ApiResponse.success(res, result, 'Historial de creditos obtenido');
		} catch (error) {
			logger.error('Error en getCustomerCreditHistory:', error);
			if (error.message === ERROR.CUSTOMER_NOT_FOUND) return ApiResponse.notFound(res, error.message);
			return ApiResponse.error(res, 'Error al obtener historial de creditos');
		}
	}
}

module.exports = new CreditController();
