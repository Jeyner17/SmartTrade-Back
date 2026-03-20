const express = require('express');
const router = express.Router();

// Controller
const purchaseOrderController = require('../controllers/purchaseOrder.controller');

// Validators
const {
	validate,
	validateGetPurchaseOrders,
	validateCreatePurchaseOrder,
	validateGetPurchaseOrderById,
	validateUpdatePurchaseOrder,
	validateChangePurchaseOrderStatus,
	validateReceivePurchaseOrder,
	validateCancelPurchaseOrder,
	validateGetPurchasesBySupplier,
	validateGetPurchasesReport
} = require('../validators/purchaseOrder.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Compras
 * Sprint 9 - Compras
 *
 * Prefix: /api/v1/purchases
 * Todos los endpoints requieren autenticación JWT
 */

router.use(authMiddleware);

/**
 * GET /api/v1/purchases/report
 * Generar reporte de compras
 */
router.get(
	'/report',
	requirePermission(MODULES.PURCHASES, ACTIONS.VIEW),
	validateGetPurchasesReport,
	validate,
	asyncHandler(purchaseOrderController.getPurchasesReport)
);

/**
 * GET /api/v1/purchases/supplier/:supplierId
 * Obtener compras por proveedor
 */
router.get(
	'/supplier/:supplierId',
	requirePermission(MODULES.PURCHASES, ACTIONS.VIEW),
	validateGetPurchasesBySupplier,
	validate,
	asyncHandler(purchaseOrderController.getPurchasesBySupplier)
);

/**
 * GET /api/v1/purchases
 * Listar órdenes de compra
 */
router.get(
	'/',
	requirePermission(MODULES.PURCHASES, ACTIONS.VIEW),
	validateGetPurchaseOrders,
	validate,
	asyncHandler(purchaseOrderController.getPurchaseOrders)
);

/**
 * POST /api/v1/purchases
 * Crear orden de compra
 */
router.post(
	'/',
	requirePermission(MODULES.PURCHASES, ACTIONS.CREATE),
	validateCreatePurchaseOrder,
	validate,
	auditLog('CREATE_PURCHASE_ORDER'),
	asyncHandler(purchaseOrderController.createPurchaseOrder)
);

/**
 * GET /api/v1/purchases/:id
 * Obtener orden de compra por ID
 */
router.get(
	'/:id',
	requirePermission(MODULES.PURCHASES, ACTIONS.VIEW),
	validateGetPurchaseOrderById,
	validate,
	asyncHandler(purchaseOrderController.getPurchaseOrderById)
);

/**
 * PUT /api/v1/purchases/:id
 * Actualizar orden de compra (solo pendiente)
 */
router.put(
	'/:id',
	requirePermission(MODULES.PURCHASES, ACTIONS.EDIT),
	validateUpdatePurchaseOrder,
	validate,
	auditLog('UPDATE_PURCHASE_ORDER'),
	asyncHandler(purchaseOrderController.updatePurchaseOrder)
);

/**
 * PATCH /api/v1/purchases/:id/status
 * Cambiar estado de la orden
 */
router.patch(
	'/:id/status',
	requirePermission(MODULES.PURCHASES, ACTIONS.EDIT),
	validateChangePurchaseOrderStatus,
	validate,
	auditLog('CHANGE_PURCHASE_ORDER_STATUS'),
	asyncHandler(purchaseOrderController.changePurchaseOrderStatus)
);

/**
 * POST /api/v1/purchases/:id/receive
 * Marcar orden como recibida y actualizar inventario
 */
router.post(
	'/:id/receive',
	requirePermission(MODULES.PURCHASES, ACTIONS.EDIT),
	validateReceivePurchaseOrder,
	validate,
	auditLog('RECEIVE_PURCHASE_ORDER'),
	asyncHandler(purchaseOrderController.receivePurchaseOrder)
);

/**
 * POST /api/v1/purchases/:id/cancel
 * Cancelar orden de compra
 */
router.post(
	'/:id/cancel',
	requirePermission(MODULES.PURCHASES, ACTIONS.EDIT),
	validateCancelPurchaseOrder,
	validate,
	auditLog('CANCEL_PURCHASE_ORDER'),
	asyncHandler(purchaseOrderController.cancelPurchaseOrder)
);

module.exports = router;

