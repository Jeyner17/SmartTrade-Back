const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

const DOCUMENT_TYPES = ['cedula', 'pasaporte', 'ruc'];
const AREAS          = ['administracion', 'caja', 'bodega', 'atencion', 'ventas'];
const SHIFTS         = ['morning', 'afternoon', 'night'];

/**
 * Middleware que procesa los errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({
      field:   e.path,
      message: e.msg
    }));
    return ApiResponse.validationError(res, formatted, 'Error de validación');
  }
  next();
};

// ============================================
// LISTAR EMPLEADOS
// ============================================
const validateGetEmployees = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  query('search').optional().isString().trim(),
  query('area').optional().isIn(AREAS).withMessage(`area debe ser uno de: ${AREAS.join(', ')}`),
  query('shift').optional().isIn(SHIFTS).withMessage(`shift debe ser uno de: ${SHIFTS.join(', ')}`),
  query('isActive').optional().isBoolean().withMessage('isActive debe ser true o false')
];

// ============================================
// CREAR EMPLEADO
// ============================================
const validateCreateEmployee = [
  body('firstName')
    .notEmpty().withMessage('firstName es requerido')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('firstName no puede superar 100 caracteres'),

  body('lastName')
    .notEmpty().withMessage('lastName es requerido')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('lastName no puede superar 100 caracteres'),

  body('documentType')
    .notEmpty().withMessage('documentType es requerido')
    .isIn(DOCUMENT_TYPES).withMessage(`documentType debe ser uno de: ${DOCUMENT_TYPES.join(', ')}`),

  body('documentNumber')
    .notEmpty().withMessage('documentNumber es requerido')
    .isString().trim()
    .isLength({ max: 20 }).withMessage('documentNumber no puede superar 20 caracteres'),

  body('birthDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('birthDate debe ser una fecha válida (YYYY-MM-DD)'),

  body('address')
    .optional({ nullable: true })
    .isString().trim(),

  body('phone')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 20 }).withMessage('phone no puede superar 20 caracteres'),

  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('email debe ser un correo válido'),

  body('area')
    .notEmpty().withMessage('area es requerida')
    .isIn(AREAS).withMessage(`area debe ser una de: ${AREAS.join(', ')}`),

  body('shift')
    .notEmpty().withMessage('shift es requerido')
    .isIn(SHIFTS).withMessage(`shift debe ser uno de: ${SHIFTS.join(', ')}`),

  body('salary')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('salary debe ser un número >= 0'),

  body('hireDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('hireDate debe ser una fecha válida (YYYY-MM-DD)'),

  body('userId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('userId debe ser un entero positivo'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser true o false')
];

// ============================================
// ACTUALIZAR EMPLEADO (todos los campos opcionales)
// ============================================
const validateUpdateEmployee = [
  body('firstName')
    .optional()
    .isString().trim()
    .isLength({ max: 100 }).withMessage('firstName no puede superar 100 caracteres'),

  body('lastName')
    .optional()
    .isString().trim()
    .isLength({ max: 100 }).withMessage('lastName no puede superar 100 caracteres'),

  body('documentType')
    .optional()
    .isIn(DOCUMENT_TYPES).withMessage(`documentType debe ser uno de: ${DOCUMENT_TYPES.join(', ')}`),

  body('documentNumber')
    .optional()
    .isString().trim()
    .isLength({ max: 20 }).withMessage('documentNumber no puede superar 20 caracteres'),

  body('birthDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('birthDate debe ser una fecha válida (YYYY-MM-DD)'),

  body('address')
    .optional({ nullable: true })
    .isString().trim(),

  body('phone')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 20 }).withMessage('phone no puede superar 20 caracteres'),

  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('email debe ser un correo válido'),

  body('area')
    .optional()
    .isIn(AREAS).withMessage(`area debe ser una de: ${AREAS.join(', ')}`),

  body('shift')
    .optional()
    .isIn(SHIFTS).withMessage(`shift debe ser uno de: ${SHIFTS.join(', ')}`),

  body('salary')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('salary debe ser un número >= 0'),

  body('hireDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('hireDate debe ser una fecha válida (YYYY-MM-DD)'),

  body('userId')
    .optional({ nullable: true })
    .custom(v => v === null || Number.isInteger(v) && v > 0)
    .withMessage('userId debe ser un entero positivo o null'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser true o false')
];

// ============================================
// VINCULAR USUARIO
// ============================================
const validateLinkUser = [
  body('userId')
    .custom(v => v === null || (Number.isInteger(v) && v > 0))
    .withMessage('userId debe ser un entero positivo o null para desvincular')
];

// ============================================
// REGISTRAR ASISTENCIA
// ============================================
const validateRegisterAttendance = [
  body('type')
    .notEmpty().withMessage('type es requerido')
    .isIn(['entry', 'exit']).withMessage('type debe ser "entry" o "exit"'),

  body('notes')
    .optional({ nullable: true })
    .isString().trim()
];

// ============================================
// HISTORIAL DE ASISTENCIA
// ============================================
const validateGetAttendance = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate debe ser una fecha válida (YYYY-MM-DD)'),

  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate debe ser una fecha válida (YYYY-MM-DD)'),

  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100')
];

module.exports = {
  validate,
  validateGetEmployees,
  validateCreateEmployee,
  validateUpdateEmployee,
  validateLinkUser,
  validateRegisterAttendance,
  validateGetAttendance
};
