const { body, validationResult } = require('express-validator');
const { ERROR_MESSAGES } = require('../../../shared/constants/auth.constants');
const ApiResponse = require('../../../utils/response');

/**
 * Validadores para Autenticación
 * Sprint 2 - Autenticación y Autorización
 */

/**
 * Validación de login
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage(ERROR_MESSAGES.USERNAME_REQUIRED)
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres'),

  body('password')
    .notEmpty().withMessage(ERROR_MESSAGES.PASSWORD_REQUIRED)
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

/**
 * Validación de refresh token
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty().withMessage('El refresh token es requerido')
    .isString().withMessage('El refresh token debe ser una cadena de texto')
];

/**
 * Validación de verificación de permisos
 */
const validatePermissionCheck = [
  body('module')
    .notEmpty().withMessage('El módulo es requerido')
    .isString().withMessage('El módulo debe ser una cadena de texto'),

  body('action')
    .notEmpty().withMessage('La acción es requerida')
    .isString().withMessage('La acción debe ser una cadena de texto')
];

/**
 * Validación de cambio de contraseña
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('La contraseña actual es requerida'),

  body('newPassword')
    .notEmpty().withMessage('La nueva contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('La confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

/**
 * Middleware para validar resultados
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

module.exports = {
  validateLogin,
  validateRefreshToken,
  validatePermissionCheck,
  validateChangePassword,
  validate
};