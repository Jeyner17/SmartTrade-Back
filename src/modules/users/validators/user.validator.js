const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

/**
 * Validadores para Gestión de Usuarios
 * Sprint 3 - Gestión de Usuarios
 */

/**
 * Middleware para procesar errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
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
 * Validación para listado de usuarios
 */
const validateGetUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número positivo')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser entre 1 y 100')
    .toInt(),

  query('roleId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El roleId debe ser un número positivo')
    .toInt(),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser true o false')
    .toBoolean(),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La búsqueda no puede superar los 100 caracteres')
];

/**
 * Validación para crear usuario
 */
const validateCreateUser = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guion bajo'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('El formato del email es inválido')
    .normalizeEmail(),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),

  body('roleId')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isInt({ min: 1 })
    .withMessage('El rol debe ser un ID válido')
    .toInt(),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser booleano')
    .toBoolean(),

  body('mustChangePassword')
    .optional()
    .isBoolean()
    .withMessage('mustChangePassword debe ser booleano')
    .toBoolean()
];

/**
 * Validación para actualizar usuario
 */
const validateUpdateUser = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guion bajo'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('El formato del email es inválido')
    .normalizeEmail(),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El apellido debe tener entre 2 y 100 caracteres'),

  body('roleId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El rol debe ser un ID válido')
    .toInt(),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser booleano')
    .toBoolean()
];

/**
 * Validación para reseteo de contraseña
 */
const validateResetPassword = [
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

/**
 * Validación para cambio de estado
 */
const validateChangeStatus = [
  body('status')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['active', 'inactive', 'unlock', 'lock'])
    .withMessage('Estado inválido. Valores permitidos: active, inactive, unlock, lock')
];

/**
 * Validación para verificar disponibilidad
 */
const validateCheckAvailability = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El username debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username inválido'),

  body('email')
    .optional()
    .trim()
    .isLength({ max: 254 })
    .withMessage('El email es demasiado largo'),

  body('excludeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('excludeId debe ser un número positivo')
    .toInt(),

  body()
    .custom((value, { req }) => {
      if (!req.body.username && !req.body.email) {
        throw new Error('Debe proporcionar al menos username o email para verificar');
      }
      return true;
    })
];

module.exports = {
  validate,
  validateGetUsers,
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateChangeStatus,
  validateCheckAvailability
};
