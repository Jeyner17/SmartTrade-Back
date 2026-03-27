const express = require('express');
const router = express.Router();

// Controller
const receptionController = require('../controllers/reception.controller');

// Validators
const {
	validate,
	validateListReceptions,
	validateCreateReception,
	validateGetReception,
	validateVerifyBarcode,
	validateRegisterScan,
	validateConfirmReception,
	validateReportDiscrepancy,
	validateListDiscrepancies,
	validateResolveDiscrepancy
} = require('../validators/reception.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Recepciones de Mercancía
 * Sprint 10 - Recepción de Mercancía
 *
 * Prefix: /api/v1/receptions
 * Todos los endpoints requieren autenticación JWT
 */

router.use(authMiddleware);

/**
 * GET /api/v1/receptions
 * Listar recepciones
 */
router.get(
	'/',
	requirePermission(MODULES.RECEPTION, ACTIONS.VIEW),
	validateListReceptions,
	validate,
	asyncHandler(receptionController.listReceptions)
);
router.get(
	'/confirmed-orders',
	requirePermission(MODULES.RECEPTION, ACTIONS.VIEW),
	asyncHandler(receptionController.listConfirmedPurchaseOrders)
);

/**
 * POST /api/v1/receptions
 * Crear recepción
 */
router.post(
	'/',
	requirePermission(MODULES.RECEPTION, ACTIONS.CREATE),
	validateCreateReception,
	validate,
	auditLog('CREATE_RECEPTION'),
	asyncHandler(receptionController.createReception)
);

/**
 * POST /api/v1/receptions/verify-barcode
 * Verificar producto por escaneo
 */
router.post(
	'/verify-barcode',
	requirePermission(MODULES.RECEPTION, ACTIONS.VIEW),
	validateVerifyBarcode,
	validate,
	asyncHandler(receptionController.verifyProductByBarcode)
);

/**
 * POST /api/v1/receptions/:id/scan
 * Registrar escaneo de producto
 */
router.post(
	'/:id/scan',
	requirePermission(MODULES.RECEPTION, ACTIONS.EDIT),
	validateRegisterScan,
	validate,
	auditLog('SCAN_PRODUCT_RECEPTION'),
	asyncHandler(receptionController.registerScannedProduct)
);

/**
 * POST /api/v1/receptions/:id/confirm
 * Confirmar recepción completa
 */
router.post(
	'/:id/confirm',
	requirePermission(MODULES.RECEPTION, ACTIONS.EDIT),
	validateConfirmReception,
	validate,
	auditLog('CONFIRM_RECEPTION'),
	asyncHandler(receptionController.confirmReception)
);

/**
 * POST /api/v1/receptions/:id/discrepancies
 * Reportar discrepancia
 */
router.post(
	'/:id/discrepancies',
	requirePermission(MODULES.RECEPTION, ACTIONS.EDIT),
	validateReportDiscrepancy,
	validate,
	auditLog('REPORT_DISCREPANCY'),
	asyncHandler(receptionController.reportDiscrepancy)
);

/**
 * GET /api/v1/receptions/discrepancies
 * Listar discrepancias
 */
router.get(
	'/discrepancies',
	requirePermission(MODULES.RECEPTION, ACTIONS.VIEW),
	validateListDiscrepancies,
	validate,
	asyncHandler(receptionController.listDiscrepancies)
);

/**
 * POST /api/v1/receptions/discrepancies/:id/resolve
 * Resolver discrepancia
 */
router.post(
	'/discrepancies/:id/resolve',
	requirePermission(MODULES.RECEPTION, ACTIONS.EDIT),
	validateResolveDiscrepancy,
	validate,
	auditLog('RESOLVE_DISCREPANCY'),
	asyncHandler(receptionController.resolveDiscrepancy)
);

/**
 * GET /api/v1/receptions/:id
 * Obtener recepción por ID
 */
router.get(
	'/:id',
	requirePermission(MODULES.RECEPTION, ACTIONS.VIEW),
	validateGetReception,
	validate,
	asyncHandler(receptionController.getReception)
);

module.exports = router;
