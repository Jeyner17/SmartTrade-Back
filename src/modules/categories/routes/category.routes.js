const express = require('express');
const router  = express.Router();

// Controller
const categoryController = require('../controllers/category.controller');

// Validators
const {
  validate,
  validateGetCategories,
  validateCreateCategory,
  validateUpdateCategory
} = require('../validators/category.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Categorías
 * Sprint 5 - Gestión de Categorías
 *
 * Prefix: /api/v1/categories
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas del módulo
router.use(authMiddleware);

/**
 * GET /api/v1/categories
 * Árbol de categorías con filtro opcional por status
 * Query: status (active | inactive | all)
 */
router.get(
  '/',
  requirePermission(MODULES.CATEGORIES, ACTIONS.VIEW),
  validateGetCategories,
  validate,
  asyncHandler(categoryController.getCategories)
);

/**
 * POST /api/v1/categories
 * Crear nueva categoría
 */
router.post(
  '/',
  requirePermission(MODULES.CATEGORIES, ACTIONS.CREATE),
  validateCreateCategory,
  validate,
  auditLog('CREATE_CATEGORY'),
  asyncHandler(categoryController.createCategory)
);

/**
 * GET /api/v1/categories/:id/products
 * Productos de la categoría (IMPORTANTE: antes de /:id para evitar conflicto de ruta)
 */
router.get(
  '/:id/products',
  requirePermission(MODULES.CATEGORIES, ACTIONS.VIEW),
  asyncHandler(categoryController.getCategoryProducts)
);

/**
 * GET /api/v1/categories/:id
 * Obtener detalle de una categoría
 */
router.get(
  '/:id',
  requirePermission(MODULES.CATEGORIES, ACTIONS.VIEW),
  asyncHandler(categoryController.getCategoryById)
);

/**
 * PUT /api/v1/categories/:id
 * Actualizar categoría
 */
router.put(
  '/:id',
  requirePermission(MODULES.CATEGORIES, ACTIONS.EDIT),
  validateUpdateCategory,
  validate,
  auditLog('UPDATE_CATEGORY'),
  asyncHandler(categoryController.updateCategory)
);

/**
 * PATCH /api/v1/categories/:id/status
 * Activar o desactivar categoría (con cascada en desactivación)
 */
router.patch(
  '/:id/status',
  requirePermission(MODULES.CATEGORIES, ACTIONS.EDIT),
  auditLog('TOGGLE_CATEGORY_STATUS'),
  asyncHandler(categoryController.toggleStatus)
);

/**
 * DELETE /api/v1/categories/:id
 * Eliminar categoría (soft delete, falla si tiene subcategorías)
 */
router.delete(
  '/:id',
  requirePermission(MODULES.CATEGORIES, ACTIONS.DELETE),
  auditLog('DELETE_CATEGORY'),
  asyncHandler(categoryController.deleteCategory)
);

module.exports = router;
