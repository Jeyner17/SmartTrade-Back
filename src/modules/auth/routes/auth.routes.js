const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controllers/auth.controller');

// Validators
const {
  validateLogin,
  validateRefreshToken,
  validatePermissionCheck,
  validateChangePassword,
  validate
} = require('../validators/auth.validator');

// Middlewares
const { authMiddleware, extractClientInfo } = require('../../../middlewares/auth.middleware');
const { 
  loginLimiter, 
  refreshTokenLimiter, 
  passwordChangeLimiter 
} = require('../../../middlewares/rate-limit.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');

/**
 * Rutas de Autenticación
 * Sprint 2 - Autenticación y Autorización
 * 
 * Prefix: /api/v1/auth
 */

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * POST /api/v1/auth/login
 * Iniciar sesión
 * Body: { username, password }
 */
router.post(
  '/login',
  extractClientInfo,
  loginLimiter,
  validateLogin,
  validate,
  auditLog('LOGIN'),
  asyncHandler(authController.login)
);

/**
 * POST /api/v1/auth/refresh
 * Refrescar token de acceso
 * Body: { refreshToken }
 */
router.post(
  '/refresh',
  extractClientInfo,
  refreshTokenLimiter,
  validateRefreshToken,
  validate,
  asyncHandler(authController.refreshToken)
);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * POST /api/v1/auth/logout
 * Cerrar sesión
 * Body: { refreshToken }
 */
router.post(
  '/logout',
  authMiddleware,
  validateRefreshToken,
  validate,
  auditLog('LOGOUT'),
  asyncHandler(authController.logout)
);

/**
 * POST /api/v1/auth/logout-all
 * Cerrar todas las sesiones del usuario
 */
router.post(
  '/logout-all',
  authMiddleware,
  auditLog('LOGOUT_ALL'),
  asyncHandler(authController.logoutAll)
);

/**
 * GET /api/v1/auth/profile
 * Obtener perfil completo del usuario autenticado
 */
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(authController.getProfile)
);

/**
 * GET /api/v1/auth/me
 * Obtener información básica del usuario autenticado
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(authController.getCurrentUser)
);

/**
 * GET /api/v1/auth/check
 * Verificar si el token es válido
 */
router.get(
  '/check',
  authMiddleware,
  asyncHandler(authController.checkAuth)
);

/**
 * POST /api/v1/auth/verify-permission
 * Verificar permiso específico
 * Body: { module, action }
 */
router.post(
  '/verify-permission',
  authMiddleware,
  validatePermissionCheck,
  validate,
  asyncHandler(authController.verifyPermission)
);

/**
 * POST /api/v1/auth/change-password
 * Cambiar contraseña del usuario
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.post(
  '/change-password',
  authMiddleware,
  passwordChangeLimiter,
  validateChangePassword,
  validate,
  auditLog('CHANGE_PASSWORD'),
  asyncHandler(authController.changePassword)
);

module.exports = router;