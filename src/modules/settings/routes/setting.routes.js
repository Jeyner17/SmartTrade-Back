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

// Utilidad de archivos (multer)
const { uploadLogo } = require('../../../utils/file.util');

// Middleware de async handler
const { asyncHandler } = require('../../../middlewares/error.middleware');

/**
 * Rutas del Módulo de Configuración del Sistema
 * Sprint 1 - Configuración del Sistema
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

// TODO: Descomentar cuando tengamos el middleware de autenticación
// const { authMiddleware, requireRole } = require('../../../middlewares/auth.middleware');
// router.use(authMiddleware); // Todas las rutas debajo requieren autenticación

/**
 * GET /api/v1/settings
 * Obtener toda la configuración del sistema
 */
router.get(
  '/',
  asyncHandler(settingController.getAllConfiguration)
);

/**
 * PUT /api/v1/settings
 * Actualizar configuración completa
 * Body: { company: {...}, fiscal: {...}, business: {...}, technical: {...} }
 */
router.put(
  '/',
  sanitizeInput,
  validateNotEmptyBody,
  validateUpdateConfiguration,
  validate,
  asyncHandler(settingController.updateConfiguration)
);

/**
 * GET /api/v1/settings/technical/parameters
 * Obtener parámetros técnicos del sistema
 */
router.get(
  '/technical/parameters',
  asyncHandler(settingController.getTechnicalParameters)
);

/**
 * POST /api/v1/settings/logo
 * Subir logo de la empresa
 * Form-data: logo (file)
 */
router.post(
  '/logo',
  uploadLogo.single('logo'), // Multer middleware
  validateLogoUpload,
  asyncHandler(settingController.uploadLogo)
);

/**
 * POST /api/v1/settings/backup/configure
 * Configurar backups automáticos
 * Body: { enabled: boolean, frequency: string, time: string }
 */
router.post(
  '/backup/configure',
  sanitizeInput,
  validateNotEmptyBody,
  validateBackupConfig,
  validate,
  asyncHandler(settingController.configureBackups)
);

/**
 * GET /api/v1/settings/:configType
 * Obtener configuración por tipo específico
 * Params: configType (company, fiscal, business, technical, backup)
 */
router.get(
  '/:configType',
  validateConfigType,
  validate,
  asyncHandler(settingController.getConfigurationByType)
);

/**
 * PUT /api/v1/settings/:configType
 * Actualizar configuración por tipo específico
 * Params: configType
 * Body: datos específicos del tipo de configuración
 */
router.put(
  '/:configType',
  sanitizeInput,
  validateNotEmptyBody,
  validateConfigType,
  validate,
  asyncHandler(settingController.updateConfigurationByType)
);

/**
 * POST /api/v1/settings/:configType/reset
 * Resetear configuración a valores por defecto
 * Params: configType
 */
router.post(
  '/:configType/reset',
  validateConfigType,
  validate,
  asyncHandler(settingController.resetConfiguration)
);

module.exports = router;