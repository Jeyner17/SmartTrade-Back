const express = require('express');
const router = express.Router();

// Controller
const roleController = require('../controllers/role.controller');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');

/**
 * Rutas de Roles
 * Sprint 2 - Autenticación y Autorización
 * 
 * Prefix: /api/v1/roles
 */

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/v1/roles
 * Obtener todos los roles disponibles
 */
router.get(
  '/',
  asyncHandler(roleController.getAllRoles.bind(roleController))
);

/**
 * GET /api/v1/roles/:roleId
 * Obtener un rol específico
 */
router.get(
  '/:roleId',
  asyncHandler(roleController.getRoleById.bind(roleController))
);

/**
 * GET /api/v1/roles/:roleId/permissions
 * Obtener permisos de un rol
 */
router.get(
  '/:roleId/permissions',
  asyncHandler(roleController.getRolePermissions.bind(roleController))
);

/**
 * GET /api/v1/roles/:roleId/modules
 * Obtener módulos accesibles para un rol
 */
router.get(
  '/:roleId/modules',
  asyncHandler(roleController.getAccessibleModules.bind(roleController))
);

/**
 * POST /api/v1/roles/:roleId/check-permission
 * Verificar si un rol tiene un permiso específico
 */
router.post(
  '/:roleId/check-permission',
  asyncHandler(roleController.checkRolePermission.bind(roleController))
);

/**
 * POST /api/v1/roles/:roleId/check-multiple-permissions
 * Verificar múltiples permisos
 */
router.post(
  '/:roleId/check-multiple-permissions',
  asyncHandler(roleController.checkMultiplePermissions.bind(roleController))
);

module.exports = router;