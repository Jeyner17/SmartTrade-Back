const express = require('express');
const router = express.Router();

// Controller
const supplierController = require('../controllers/supplier.controller');

// Validators
const {
    validate,
    validateGetSuppliers,
    validateCreateSupplier,
    validateUpdateSupplier,
    validateGetPurchaseHistory,
    validateEvaluateSupplier,
    validateChangeStatus
} = require('../validators/supplier.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Proveedores
 * Sprint 8 - Gestión de Proveedores
 *
 * Prefix: /api/v1/suppliers
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// ============================================
// 1. LISTAR PROVEEDORES
// GET /api/v1/suppliers
// Query: page, limit, search, status, minRating
// ============================================
router.get(
    '/',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.VIEW),
    validateGetSuppliers,
    validate,
    asyncHandler(supplierController.getSuppliers)
);

// ============================================
// 2. CREAR PROVEEDOR
// POST /api/v1/suppliers
// Body: tradeName, legalName, ruc, address, phone, email, website,
//       paymentTerms, bankName, bankAccount, bankAccountType, notes, contacts[]
// ============================================
router.post(
    '/',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.CREATE),
    validateCreateSupplier,
    validate,
    auditLog('CREATE_SUPPLIER'),
    asyncHandler(supplierController.createSupplier)
);

// ============================================
// 3. OBTENER PROVEEDOR POR ID
// GET /api/v1/suppliers/:id
// Retorna: datos completos, contactos, estadísticas de compras, últimas evaluaciones
// ============================================
router.get(
    '/:id',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.VIEW),
    asyncHandler(supplierController.getSupplierById)
);

// ============================================
// 4. ACTUALIZAR PROVEEDOR
// PUT /api/v1/suppliers/:id
// Body: campos a actualizar (todos opcionales)
// ============================================
router.put(
    '/:id',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.EDIT),
    validateUpdateSupplier,
    validate,
    auditLog('UPDATE_SUPPLIER'),
    asyncHandler(supplierController.updateSupplier)
);

// ============================================
// 5. HISTORIAL DE COMPRAS
// GET /api/v1/suppliers/:id/purchases
// Query: startDate, endDate, page, limit
// ============================================
router.get(
    '/:id/purchases',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.VIEW),
    validateGetPurchaseHistory,
    validate,
    asyncHandler(supplierController.getPurchaseHistory)
);

// ============================================
// 6. EVALUAR PROVEEDOR
// POST /api/v1/suppliers/:id/evaluate
// Body: qualityRating, punctualityRating, observations, purchaseReference?
// ============================================
router.post(
    '/:id/evaluate',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.EDIT),
    validateEvaluateSupplier,
    validate,
    auditLog('EVALUATE_SUPPLIER'),
    asyncHandler(supplierController.evaluateSupplier)
);

// ============================================
// 7. ACTIVAR / DESACTIVAR PROVEEDOR
// PATCH /api/v1/suppliers/:id/status
// Body: status (active | inactive | suspended), reason?
// ============================================
router.patch(
    '/:id/status',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.EDIT),
    validateChangeStatus,
    validate,
    auditLog('CHANGE_SUPPLIER_STATUS'),
    asyncHandler(supplierController.changeStatus)
);

// ============================================
// 8. ELIMINAR PROVEEDOR
// DELETE /api/v1/suppliers/:id
// Solo si no tiene compras asociadas (soft delete)
// ============================================
router.delete(
    '/:id',
    requirePermission(MODULES.SUPPLIERS, ACTIONS.DELETE),
    auditLog('DELETE_SUPPLIER'),
    asyncHandler(supplierController.deleteSupplier)
);

module.exports = router;
