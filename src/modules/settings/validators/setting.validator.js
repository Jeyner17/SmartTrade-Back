const { body, param, validationResult } = require('express-validator');
const {
  CONFIG_TYPES,
  COUNTRIES,
  CURRENCIES,
  TAX_REGIMES,
  BACKUP_FREQUENCIES,
  DATE_FORMATS,
  TIME_FORMATS,
  VALIDATION_LIMITS,
  ERROR_MESSAGES
} = require('../../../shared/constants/settings.constants');
const ApiResponse = require('../../../utils/response');

/**
 * Validadores para el módulo de Configuración
 * Sprint 1 - Configuración del Sistema
 */

/**
 * Validar tipo de configuración en parámetro de ruta
 */
const validateConfigType = [
  param('configType')
    .trim()
    .notEmpty().withMessage('El tipo de configuración es requerido')
    .isIn(Object.values(CONFIG_TYPES))
    .withMessage(ERROR_MESSAGES.INVALID_CONFIG_TYPE)
];

/**
 * Validaciones para Configuración de Empresa
 */
const validateCompanyConfig = [
  body('company.name')
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_LIMITS.COMPANY_NAME_MIN,
      max: VALIDATION_LIMITS.COMPANY_NAME_MAX
    })
    .withMessage(
      `El nombre de la empresa debe tener entre ${VALIDATION_LIMITS.COMPANY_NAME_MIN} y ${VALIDATION_LIMITS.COMPANY_NAME_MAX} caracteres`
    ),

  body('company.ruc')
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_LIMITS.RUC_MIN,
      max: VALIDATION_LIMITS.RUC_MAX
    })
    .withMessage(
      `El RUC debe tener entre ${VALIDATION_LIMITS.RUC_MIN} y ${VALIDATION_LIMITS.RUC_MAX} dígitos`
    )
    .matches(/^[0-9]+$/)
    .withMessage('El RUC solo puede contener números'),

  body('company.address')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.ADDRESS_MAX })
    .withMessage(
      `La dirección no puede exceder ${VALIDATION_LIMITS.ADDRESS_MAX} caracteres`
    ),

  body('company.phone')
    .optional()
    .trim()
    .isLength({
      min: VALIDATION_LIMITS.PHONE_MIN,
      max: VALIDATION_LIMITS.PHONE_MAX
    })
    .withMessage(
      `El teléfono debe tener entre ${VALIDATION_LIMITS.PHONE_MIN} y ${VALIDATION_LIMITS.PHONE_MAX} dígitos`
    )
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Formato de teléfono no válido'),

  body('company.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El correo electrónico no es válido')
    .normalizeEmail()
];

/**
 * Validaciones para Configuración Fiscal
 */
const validateFiscalConfig = [
  body('fiscal.country')
    .optional()
    .trim()
    .isIn(Object.keys(COUNTRIES))
    .withMessage(ERROR_MESSAGES.INVALID_COUNTRY),

  body('fiscal.currency')
    .optional()
    .trim()
    .isIn(Object.keys(CURRENCIES))
    .withMessage(ERROR_MESSAGES.INVALID_CURRENCY),

  body('fiscal.taxRegime')
    .optional()
    .trim()
    .isIn(Object.values(TAX_REGIMES))
    .withMessage(ERROR_MESSAGES.INVALID_TAX_REGIME),

  body('fiscal.ivaPercentage')
    .optional()
    .isFloat({
      min: VALIDATION_LIMITS.IVA_MIN,
      max: VALIDATION_LIMITS.IVA_MAX
    })
    .withMessage(
      `El IVA debe estar entre ${VALIDATION_LIMITS.IVA_MIN}% y ${VALIDATION_LIMITS.IVA_MAX}%`
    )
    .toFloat()
];

/**
 * Validaciones para Parámetros de Negocio
 */
const validateBusinessConfig = [
  body('business.minStock')
    .optional()
    .isInt({
      min: VALIDATION_LIMITS.MIN_STOCK_MIN,
      max: VALIDATION_LIMITS.MIN_STOCK_MAX
    })
    .withMessage(
      `El stock mínimo debe estar entre ${VALIDATION_LIMITS.MIN_STOCK_MIN} y ${VALIDATION_LIMITS.MIN_STOCK_MAX}`
    )
    .toInt(),

  body('business.defaultCreditDays')
    .optional()
    .isInt({
      min: VALIDATION_LIMITS.CREDIT_DAYS_MIN,
      max: VALIDATION_LIMITS.CREDIT_DAYS_MAX
    })
    .withMessage(
      `Los días de crédito deben estar entre ${VALIDATION_LIMITS.CREDIT_DAYS_MIN} y ${VALIDATION_LIMITS.CREDIT_DAYS_MAX}`
    )
    .toInt(),

  body('business.maxDiscountPercentage')
    .optional()
    .isFloat({
      min: VALIDATION_LIMITS.MAX_DISCOUNT_MIN,
      max: VALIDATION_LIMITS.MAX_DISCOUNT_MAX
    })
    .withMessage(
      `El descuento máximo debe estar entre ${VALIDATION_LIMITS.MAX_DISCOUNT_MIN}% y ${VALIDATION_LIMITS.MAX_DISCOUNT_MAX}%`
    )
    .toFloat()
];

/**
 * Validaciones para Configuración Técnica
 */
const validateTechnicalConfig = [
  body('technical.sessionTimeoutMinutes')
    .optional()
    .isInt({
      min: VALIDATION_LIMITS.SESSION_TIMEOUT_MIN,
      max: VALIDATION_LIMITS.SESSION_TIMEOUT_MAX
    })
    .withMessage(
      `El tiempo de sesión debe estar entre ${VALIDATION_LIMITS.SESSION_TIMEOUT_MIN} y ${VALIDATION_LIMITS.SESSION_TIMEOUT_MAX} minutos`
    )
    .toInt(),

  body('technical.logRetentionDays')
    .optional()
    .isInt({
      min: VALIDATION_LIMITS.LOG_RETENTION_MIN,
      max: VALIDATION_LIMITS.LOG_RETENTION_MAX
    })
    .withMessage(
      `La retención de logs debe estar entre ${VALIDATION_LIMITS.LOG_RETENTION_MIN} y ${VALIDATION_LIMITS.LOG_RETENTION_MAX} días`
    )
    .toInt(),

  body('technical.dateFormat')
    .optional()
    .trim()
    .isIn(Object.keys(DATE_FORMATS))
    .withMessage(ERROR_MESSAGES.INVALID_DATE_FORMAT),

  body('technical.timeFormat')
    .optional()
    .trim()
    .isIn(Object.values(TIME_FORMATS))
    .withMessage(ERROR_MESSAGES.INVALID_TIME_FORMAT)
];

/**
 * Validaciones para Configuración de Backups
 */
const validateBackupConfig = [
  body('enabled')
    .notEmpty().withMessage('El campo "enabled" es requerido')
    .isBoolean()
    .withMessage('El campo "enabled" debe ser true o false')
    .toBoolean(),

  body('frequency')
    .if(body('enabled').equals('true'))
    .notEmpty().withMessage('La frecuencia es requerida cuando los backups están habilitados')
    .isIn(Object.values(BACKUP_FREQUENCIES))
    .withMessage(ERROR_MESSAGES.INVALID_BACKUP_FREQUENCY),

  body('time')
    .if(body('enabled').equals('true'))
    .notEmpty().withMessage('La hora es requerida cuando los backups están habilitados')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Formato de hora inválido. Use HH:mm (ejemplo: 02:00)')
];

/**
 * Validación completa para actualización de configuración
 */
const validateUpdateConfiguration = [
  // Validaciones opcionales para cada sección
  ...validateCompanyConfig,
  ...validateFiscalConfig,
  ...validateBusinessConfig,
  ...validateTechnicalConfig,

  // Al menos una sección debe estar presente
  body()
    .custom((value) => {
      const hasCompany = value.company && Object.keys(value.company).length > 0;
      const hasFiscal = value.fiscal && Object.keys(value.fiscal).length > 0;
      const hasBusiness = value.business && Object.keys(value.business).length > 0;
      const hasTechnical = value.technical && Object.keys(value.technical).length > 0;
      const hasBackup = value.backup && Object.keys(value.backup).length > 0;

      if (!hasCompany && !hasFiscal && !hasBusiness && !hasTechnical && !hasBackup) {
        throw new Error('Debe proporcionar al menos una sección de configuración para actualizar');
      }

      return true;
    })
];

/**
 * Validación para subida de logo
 * (Se usa junto con multer)
 */
const validateLogoUpload = (req, res, next) => {
  // Multer ya validó el tipo de archivo y tamaño
  // Aquí solo verificamos que el archivo esté presente
  if (!req.file) {
    return ApiResponse.validationError(
      res,
      [{ msg: 'No se proporcionó ningún archivo' }],
      'Archivo de logo requerido'
    );
  }

  // Verificar extensión adicional por seguridad
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];
  const fileExtension = req.file.originalname.toLowerCase().match(/\.[^.]+$/);
  
  if (!fileExtension || !allowedExtensions.includes(fileExtension[0])) {
    return ApiResponse.validationError(
      res,
      [{ msg: ERROR_MESSAGES.INVALID_LOGO_FORMAT }],
      'Formato de archivo no válido'
    );
  }

  next();
};

/**
 * Middleware para validar resultados de express-validator
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Siguiente middleware
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formatear errores para respuesta consistente
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return ApiResponse.validationError(
      res,
      formattedErrors,
      'Error de validación en los datos proporcionados'
    );
  }

  next();
};

/**
 * Validador personalizado para verificar que el objeto no esté vacío
 */
const notEmptyObject = (value) => {
  return value && typeof value === 'object' && Object.keys(value).length > 0;
};

/**
 * Validador personalizado para RUC ecuatoriano (13 dígitos)
 * Solo si el país es Ecuador
 */
const validateEcuadorianRuc = body('company.ruc')
  .if(body('fiscal.country').equals('EC'))
  .custom((value) => {
    if (value && value.length !== 13) {
      throw new Error('El RUC ecuatoriano debe tener exactamente 13 dígitos');
    }
    return true;
  });

module.exports = {
  // Validadores individuales
  validateConfigType,
  validateCompanyConfig,
  validateFiscalConfig,
  validateBusinessConfig,
  validateTechnicalConfig,
  validateBackupConfig,
  
  // Validadores combinados
  validateUpdateConfiguration,
  validateLogoUpload,
  
  // Middleware de validación
  validate,
  
  // Validadores personalizados
  validateEcuadorianRuc,
  notEmptyObject
};