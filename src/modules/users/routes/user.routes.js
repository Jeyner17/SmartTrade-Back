const express = require('express');
const router = express.Router();

// Controller
const userController = require('../controllers/user.controller');

// Validators
const {
  validate,
  validateGetUsers,
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateChangeStatus,
  validateCheckAvailability
} = require('../validators/user.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const {
  requirePermission,
  requireSuperAdmin
} = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Usuarios
 * Sprint 3 - Gestión de Usuarios
 *
 * Prefix: /api/v1/users
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas del módulo
router.use(authMiddleware);

// ============================================
// RUTAS ESPECIALES (antes de /:id para evitar conflictos)
// ============================================

/**
 * POST /api/v1/users/check-availability
 * Verificar si username o email están disponibles
 * Body: { username?, email?, excludeId? }
 */
router.post(
  '/check-availability',
  requirePermission(MODULES.USERS, ACTIONS.VIEW),
  validateCheckAvailability,
  validate,
  asyncHandler(userController.checkAvailability)
);

// ============================================
// CRUD DE USUARIOS
// ============================================

/**
 * GET /api/v1/users
 * Listar todos los usuarios con paginación y filtros
 * Query: page, limit, search, roleId, isActive
 * Permiso: users:view
 */
router.get(
  '/',
  requirePermission(MODULES.USERS, ACTIONS.VIEW),
  validateGetUsers,
  validate,
  asyncHandler(userController.getUsers)
);

/**
 * POST /api/v1/users
 * Crear nuevo usuario
 * Body: { username, email, firstName, lastName, roleId, password?, isActive?, mustChangePassword? }
 * Permiso: users:create
 */
router.post(
  '/',
  requirePermission(MODULES.USERS, ACTIONS.CREATE),
  validateCreateUser,
  validate,
  auditLog('CREATE_USER'),
  asyncHandler(userController.createUser)
);

/**
 * GET /api/v1/users/:id
 * Obtener detalle de un usuario
 * Permiso: users:view
 */
router.get(
  '/:id',
  requirePermission(MODULES.USERS, ACTIONS.VIEW),
  asyncHandler(userController.getUserById)
);

/**
 * PUT /api/v1/users/:id
 * Actualizar datos de un usuario
 * Body: { username?, email?, firstName?, lastName?, roleId?, isActive? }
 * Permiso: users:edit
 */
router.put(
  '/:id',
  requirePermission(MODULES.USERS, ACTIONS.EDIT),
  validateUpdateUser,
  validate,
  auditLog('UPDATE_USER'),
  asyncHandler(userController.updateUser)
);

/**
 * DELETE /api/v1/users/:id
 * Eliminar usuario (soft delete)
 * Permiso: users:delete
 */
router.delete(
  '/:id',
  requirePermission(MODULES.USERS, ACTIONS.DELETE),
  auditLog('DELETE_USER'),
  asyncHandler(userController.deleteUser)
);

// ============================================
// ACCIONES ESPECÍFICAS (solo administradores)
// ============================================

/**
 * POST /api/v1/users/:id/reset-password
 * Resetear contraseña de un usuario (genera contraseña temporal)
 * Body: { newPassword? }
 * Permiso: solo administradores (requireSuperAdmin)
 */
router.post(
  '/:id/reset-password',
  requireSuperAdmin,
  validateResetPassword,
  validate,
  auditLog('RESET_USER_PASSWORD'),
  asyncHandler(userController.resetPassword)
);

/**
 * PATCH /api/v1/users/:id/status
 * Cambiar estado del usuario
 * Body: { status: 'active' | 'inactive' | 'unlock' | 'lock' }
 * Permiso: users:edit
 */
router.patch(
  '/:id/status',
  requirePermission(MODULES.USERS, ACTIONS.EDIT),
  validateChangeStatus,
  validate,
  auditLog('CHANGE_USER_STATUS'),
  asyncHandler(userController.changeStatus)
);

/**
 * GET /api/v1/users/:id/sessions
 * Ver sesiones activas de un usuario
 * Permiso: solo administradores (requireSuperAdmin)
 */
router.get(
  '/:id/sessions',
  requireSuperAdmin,
  asyncHandler(userController.getUserSessions)
);

/**
 * POST /api/v1/users/:id/logout-all
 * Cerrar todas las sesiones activas de un usuario
 * Permiso: solo administradores (requireSuperAdmin)
 */
router.post(
  '/:id/logout-all',
  requireSuperAdmin,
  auditLog('FORCE_LOGOUT_USER'),
  asyncHandler(userController.logoutAllSessions)
);

module.exports = router;
