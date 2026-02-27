const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

/**
 * Middleware que procesa los errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return ApiResponse.validationError(res, formatted, 'Error de validación');
  }
  next();
};

// ============================================
// LISTAR PRODUCTOS
// ============================================
const validateGetProducts = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  query('search').optional().isString().trim(),
  query('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId debe ser un entero positivo'),
  query('isActive').optional().isBoolean().withMessage('isActive debe ser true o false'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice debe ser un número >= 0'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice debe ser un número >= 0')
];

// ============================================
// CREAR PRODUCTO
// ============================================
const validateCreateProduct = [
  body('name')
    .notEmpty().withMessage('name es requerido')
    .isString().trim()
    .isLength({ max: 200 }).withMessage('name no puede superar 200 caracteres'),

  body('description')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 5000 }).withMessage('description no puede superar 5000 caracteres'),

  body('sku')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('sku no puede superar 100 caracteres'),

  body('barcode')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('barcode no puede superar 100 caracteres'),

  body('price')
    .notEmpty().withMessage('price es requerido')
    .isFloat({ min: 0 }).withMessage('price debe ser un número >= 0'),

  body('cost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('cost debe ser un número >= 0'),

  body('taxPercent')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('taxPercent debe ser entre 0 y 100'),

  body('categoryId')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('categoryId debe ser un entero positivo'),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser true o false')
];

// ============================================
// ACTUALIZAR PRODUCTO
// ============================================
const validateUpdateProduct = [
  body('name')
    .optional()
    .isString().trim()
    .notEmpty().withMessage('name no puede estar vacío')
    .isLength({ max: 200 }).withMessage('name no puede superar 200 caracteres'),

  body('description')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 5000 }).withMessage('description no puede superar 5000 caracteres'),

  body('sku')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('sku no puede superar 100 caracteres'),

  body('barcode')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('barcode no puede superar 100 caracteres'),

  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('price debe ser un número >= 0'),

  body('cost')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('cost debe ser un número >= 0'),

  body('taxPercent')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('taxPercent debe ser entre 0 y 100'),

  body('categoryId')
    .optional({ nullable: true })
    .custom(value => {
      if (value !== null && (!Number.isInteger(value) || value < 1)) {
        throw new Error('categoryId debe ser un entero positivo o null');
      }
      return true;
    }),

  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive debe ser true o false')
];

// ============================================
// ACTUALIZAR PRECIO
// ============================================
const validateUpdatePrice = [
  body('newPrice')
    .notEmpty().withMessage('newPrice es requerido')
    .isFloat({ min: 0 }).withMessage('newPrice debe ser un número >= 0'),

  body('reason')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('reason no puede superar 500 caracteres')
];

module.exports = {
  validate,
  validateGetProducts,
  validateCreateProduct,
  validateUpdateProduct,
  validateUpdatePrice
};
