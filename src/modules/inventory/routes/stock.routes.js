const express = require('express');
const router = express.Router();

// Controller
const inventoryController = require('../controllers/stock.controller');

// Validators
const {
  validate,
  validateGetInventory,
  validateGetProductStock,
  validateRegisterMovement,
  validateGetMovementHistory,
  validateUpdateStockLimits,
  validateAdjustInventory,
  validateGetInventoryValue
} = require('../validators/stock.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Inventario
 * Sprint 7 - Gestión de Inventario
 *
 * Prefix: /api/v1/inventory
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

/**
 * GET /api/v1/inventory/alerts
 * 6. Obtener productos con stock bajo
 * IMPORTANTE: Definir ANTES de /inventory/:id para evitar conflicto
 */
router.get(
  '/alerts',
  requirePermission(MODULES.INVENTORY, ACTIONS.VIEW),
  asyncHandler(inventoryController.getLowStockAlerts)
);

/**
 * GET /api/v1/inventory/value
 * 8. Obtener valor total del inventario
 */
router.get(
  '/value',
  requirePermission(MODULES.INVENTORY, ACTIONS.VIEW),
  validateGetInventoryValue,
  validate,
  asyncHandler(inventoryController.getInventoryValue)
);

/**
 * GET /api/v1/inventory
 * 1. Obtener stock de todos los productos con filtros
 */
router.get(
  '/',
  requirePermission(MODULES.INVENTORY, ACTIONS.VIEW),
  validateGetInventory,
  validate,
  asyncHandler(inventoryController.getInventory)
);

/**
 * POST /api/v1/inventory/movement
 * 3. Registrar movimiento de inventario (entrada/salida manual)
 */
router.post(
  '/movement',
  requirePermission(MODULES.INVENTORY, ACTIONS.CREATE),
  validateRegisterMovement,
  validate,
  auditLog('INVENTORY_MOVEMENT'),
  asyncHandler(inventoryController.registerMovement)
);

/**
 * POST /api/v1/inventory/adjust
 * 7. Ajustar inventario por conteo físico
 */
router.post(
  '/adjust',
  requirePermission(MODULES.INVENTORY, ACTIONS.EDIT),
  validateAdjustInventory,
  validate,
  auditLog('INVENTORY_ADJUSTMENT'),
  asyncHandler(inventoryController.adjustInventory)
);

/**
 * GET /api/v1/inventory/:id
 * 2. Obtener stock de un producto específico
 */
router.get(
  '/:id',
  requirePermission(MODULES.INVENTORY, ACTIONS.VIEW),
  validateGetProductStock,
  validate,
  asyncHandler(inventoryController.getProductStock)
);

/**
 * GET /api/v1/inventory/:id/movements
 * 4. Obtener historial de movimientos de un producto
 */
router.get(
  '/:id/movements',
  requirePermission(MODULES.INVENTORY, ACTIONS.VIEW),
  validateGetMovementHistory,
  validate,
  asyncHandler(inventoryController.getMovementHistory)
);

/**
 * PUT /api/v1/inventory/:id/limits
 * 5. Actualizar límites de stock (mínimo/máximo) y ubicación
 */
router.put(
  '/:id/limits',
  requirePermission(MODULES.INVENTORY, ACTIONS.EDIT),
  validateUpdateStockLimits,
  validate,
  auditLog('UPDATE_STOCK_LIMITS'),
  asyncHandler(inventoryController.updateStockLimits)
);

module.exports = router;
