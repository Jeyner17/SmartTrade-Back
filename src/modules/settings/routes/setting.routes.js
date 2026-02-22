const express = require('express');
const router = express.Router();

// Controller
const settingController = require('../controllers/setting.controller');

// Validadores
const {
  validateConfigType,
  validateUpdateConfiguration,
  validateBackupConfig,
  validateLogoUpload,
  validate
} = require('../validators/setting.validator');

// Middleware de validación global
const { validateNotEmptyBody } = require('../../../middlewares/validation.middleware');

// Middleware de seguridad
const { sanitizeInput } = require('../../../middlewares/security.middleware');

// Middleware de autenticación y permisos
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

// Utilidad de archivos (multer)
const { uploadLogo } = require('../../../utils/file.util');

// Middleware de async handler
const { asyncHandler } = require('../../../middlewares/error.middleware');

/**
 * Rutas del Módulo de Configuración del Sistema
 * Sprint 1 - Configuración del Sistema
 * Actualizado Sprint 2 - Con autenticación y permisos
 * 
 * Prefix: /api/v1/settings
 */

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * GET /api/v1/settings/health
 * Health check del módulo
 */
router.get(
  '/health',
  asyncHandler(settingController.healthCheck)
);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

// Todas las rutas debajo requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/v1/settings
 * Obtener toda la configuración del sistema
 * Requiere: settings.view
 */
router.get(
  '/',
  requirePermission(MODULES.SETTINGS, ACTIONS.VIEW),
  asyncHandler(settingController.getAllConfiguration)
);

/**
 * PUT /api/v1/settings
 * Actualizar configuración completa
 * Requiere: settings.edit
 * Body: { company: {...}, fiscal: {...}, business: {...}, technical: {...} }
 */
router.put(
  '/',
  requirePermission(MODULES.SETTINGS, ACTIONS.EDIT),
  sanitizeInput,
  validateNotEmptyBody,
  validateUpdateConfiguration,
  validate,
  asyncHandler(settingController.updateConfiguration)
);

/**
 * GET /api/v1/settings/technical/parameters
 * Obtener parámetros técnicos del sistema
 * Requiere: settings.view
 */
router.get(
  '/technical/parameters',
  requirePermission(MODULES.SETTINGS, ACTIONS.VIEW),
  asyncHandler(settingController.getTechnicalParameters)
);

/**
 * POST /api/v1/settings/logo
 * Subir logo de la empresa
 * Requiere: settings.edit
 * Form-data: logo (file)
 */
router.post(
  '/logo',
  requirePermission(MODULES.SETTINGS, ACTIONS.EDIT),
  uploadLogo.single('logo'),
  validateLogoUpload,
  asyncHandler(settingController.uploadLogo)
);

/**
 * POST /api/v1/settings/backup/configure
 * Configurar backups automáticos
 * Requiere: settings.edit
 * Body: { enabled: boolean, frequency: string, time: string }
 */
router.post(
  '/backup/configure',
  requirePermission(MODULES.SETTINGS, ACTIONS.EDIT),
  sanitizeInput,
  validateNotEmptyBody,
  validateBackupConfig,
  validate,
  asyncHandler(settingController.configureBackups)
);

/**
 * GET /api/v1/settings/:configType
 * Obtener configuración por tipo específico
 * Requiere: settings.view
 * Params: configType (company, fiscal, business, technical, backup)
 */
router.get(
  '/:configType',
  requirePermission(MODULES.SETTINGS, ACTIONS.VIEW),
  validateConfigType,
  validate,
  asyncHandler(settingController.getConfigurationByType)
);

/**
 * PUT /api/v1/settings/:configType
 * Actualizar configuración por tipo específico
 * Requiere: settings.edit
 * Params: configType
 * Body: datos específicos del tipo de configuración
 */
router.put(
  '/:configType',
  requirePermission(MODULES.SETTINGS, ACTIONS.EDIT),
  sanitizeInput,
  validateNotEmptyBody,
  validateConfigType,
  validate,
  asyncHandler(settingController.updateConfigurationByType)
);

/**
 * POST /api/v1/settings/:configType/reset
 * Resetear configuración a valores por defecto
 * Requiere: settings.edit (solo administradores deberían poder hacer esto)
 * Params: configType
 */
router.post(
  '/:configType/reset',
  requirePermission(MODULES.SETTINGS, ACTIONS.EDIT),
  validateConfigType,
  validate,
  asyncHandler(settingController.resetConfiguration)
);

module.exports = router;