const express = require('express');
const router = express.Router();

const creditController = require('../controllers/credit.controller');
const {
	validate,
	validateCreateCustomer,
	validateCreateCredit,
	validateListCredits,
	validateCreditId,
	validateRegisterPayment,
	validateCustomerId,
	validateCreateReminder,
	validateListDelinquent,
	validateForgiveDebt,
	validateRefinanceCredit,
	validateCreditHistory
} = require('../validators/credit.validator');

const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

router.use(authMiddleware);

// 1. Crear cliente para credito
router.post(
	'/customers',
	requirePermission(MODULES.CREDITS, ACTIONS.CREATE),
	validateCreateCustomer,
	validate,
	auditLog('CREDITS_CREATE_CUSTOMER'),
	asyncHandler(creditController.createCustomer)
);

// 2. Crear venta a credito
router.post(
	'/credits',
	requirePermission(MODULES.CREDITS, ACTIONS.CREATE),
	validateCreateCredit,
	validate,
	auditLog('CREDITS_CREATE_CREDIT'),
	asyncHandler(creditController.createCredit)
);

// 3. Listar creditos activos
router.get(
	'/credits',
	requirePermission(MODULES.CREDITS, ACTIONS.VIEW),
	validateListCredits,
	validate,
	asyncHandler(creditController.listCredits)
);

// 4. Obtener detalle de credito
router.get(
	'/credits/:id',
	requirePermission(MODULES.CREDITS, ACTIONS.VIEW),
	validateCreditId,
	validate,
	asyncHandler(creditController.getCreditById)
);

// 5. Registrar pago de credito
router.post(
	'/credits/:id/payments',
	requirePermission(MODULES.CREDITS, ACTIONS.EDIT),
	validateRegisterPayment,
	validate,
	auditLog('CREDITS_REGISTER_PAYMENT'),
	asyncHandler(creditController.registerPayment)
);

// 6. Obtener estado de cuenta de cliente
router.get(
	'/customers/:customerId/statement',
	requirePermission(MODULES.CREDITS, ACTIONS.VIEW),
	validateCustomerId,
	validate,
	asyncHandler(creditController.getCustomerStatement)
);

// 7. Calcular intereses por mora
router.get(
	'/credits/:id/late-interest',
	requirePermission(MODULES.CREDITS, ACTIONS.VIEW),
	validateCreditId,
	validate,
	asyncHandler(creditController.calculateLateInterest)
);

// 8. Generar recordatorio de pago
router.post(
	'/credits/:id/reminders',
	requirePermission(MODULES.CREDITS, ACTIONS.CREATE),
	validateCreateReminder,
	validate,
	asyncHandler(creditController.createReminder)
);

// 9. Listar clientes morosos
router.get(
	'/customers/delinquent',
	requirePermission(MODULES.CREDITS, ACTIONS.VIEW),
	validateListDelinquent,
	validate,
	asyncHandler(creditController.listDelinquentCustomers)
);

// 10. Condonar deuda
router.post(
	'/credits/:id/forgive',
	requirePermission(MODULES.CREDITS, ACTIONS.EDIT),
	validateForgiveDebt,
	validate,
	auditLog('CREDITS_FORGIVE_DEBT'),
	asyncHandler(creditController.forgiveDebt)
);

// 11. Refinanciar credito
router.post(
	'/credits/:id/refinance',
	requirePermission(MODULES.CREDITS, ACTIONS.EDIT),
	validateRefinanceCredit,
	validate,
	auditLog('CREDITS_REFINANCE'),
	asyncHandler(creditController.refinanceCredit)
);

// 12. Historial de creditos de cliente
router.get(
	'/customers/:customerId/credits/history',
	requirePermission(MODULES.CREDITS, ACTIONS.VIEW),
	validateCreditHistory,
	validate,
	asyncHandler(creditController.getCustomerCreditHistory)
);

module.exports = router;
