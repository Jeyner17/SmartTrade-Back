const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

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
// LISTAR CATEGORÍAS
// ============================================
const validateGetCategories = [
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'all'])
    .withMessage('status debe ser: active, inactive o all')
];

// ============================================
// CREAR CATEGORÍA
// ============================================
const validateCreateCategory = [
  body('name')
    .notEmpty().withMessage('name es requerido')
    .isString().trim()
    .isLength({ max: 200 }).withMessage('name no puede superar 200 caracteres'),

  body('description')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 1000 }).withMessage('description no puede superar 1000 caracteres'),

  body('parentId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('parentId debe ser un entero positivo'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser true o false')
];

// ============================================
// ACTUALIZAR CATEGORÍA
// ============================================
const validateUpdateCategory = [
  body('name')
    .optional()
    .isString().trim()
    .notEmpty().withMessage('name no puede estar vacío')
    .isLength({ max: 200 }).withMessage('name no puede superar 200 caracteres'),

  body('description')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 1000 }).withMessage('description no puede superar 1000 caracteres'),

  body('parentId')
    .optional({ nullable: true })
    .custom(value => {
      if (value !== null && (!Number.isInteger(value) || value < 1)) {
        throw new Error('parentId debe ser un entero positivo o null');
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser true o false')
];

module.exports = {
  validate,
  validateGetCategories,
  validateCreateCategory,
  validateUpdateCategory
};
