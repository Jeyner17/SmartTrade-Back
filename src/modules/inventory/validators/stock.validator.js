const { body, query, param, validationResult } = require('express-validator');
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
// VALIDACIONES: Listar inventario con filtros
// ============================================
const validateGetInventory = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  
  query('search')
    .optional()
    .isString().trim(),
  
  query('categoryId')
    .optional()
    .isInt({ min: 1 }).withMessage('categoryId debe ser un entero positivo'),
  
  query('lowStock')
    .optional()
    .isBoolean().withMessage('lowStock debe ser true o false'),
  
  query('outOfStock')
    .optional()
    .isBoolean().withMessage('outOfStock debe ser true o false')
];

// ============================================
// VALIDACIONES: Obtener stock de un producto
// ============================================
const validateGetProductStock = [
  param('id')
    .notEmpty().withMessage('ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('ID debe ser un entero positivo')
];

// ============================================
// VALIDACIONES: Registrar movimiento de inventario
// ============================================
const validateRegisterMovement = [
  body('productId')
    .notEmpty().withMessage('productId es requerido')
    .isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),
  
  body('movementType')
    .notEmpty().withMessage('movementType es requerido')
    .isIn(['entrada', 'salida']).withMessage('movementType debe ser entrada o salida'),
  
  body('quantity')
    .notEmpty().withMessage('quantity es requerida')
    .isInt({ min: 1 }).withMessage('quantity debe ser un entero mayor a 0'),
  
  body('reason')
    .notEmpty().withMessage('reason es requerido')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('reason no puede superar 100 caracteres'),
  
  body('notes')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('notes no puede superar 500 caracteres')
];

// ============================================
// VALIDACIONES: Obtener historial de movimientos
// ============================================
const validateGetMovementHistory = [
  param('id')
    .notEmpty().withMessage('ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('startDate debe ser una fecha válida (ISO8601)'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('endDate debe ser una fecha válida (ISO8601)'),
  
  query('movementType')
    .optional()
    .isIn(['entrada', 'salida', 'ajuste', 'inicial']).withMessage('movementType inválido')
];

// ============================================
// VALIDACIONES: Actualizar límites de stock
// ============================================
const validateUpdateStockLimits = [
  param('id')
    .notEmpty().withMessage('ID del producto es requerido')
    .isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),
  
  body('minStock')
    .notEmpty().withMessage('minStock es requerido')
    .isInt({ min: 0 }).withMessage('minStock debe ser un entero >= 0'),
  
  body('maxStock')
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage('maxStock debe ser un entero >= 0')
    .custom((value, { req }) => {
      if (value !== null && value !== undefined && req.body.minStock !== undefined) {
        if (value < req.body.minStock) {
          throw new Error('maxStock debe ser mayor o igual a minStock');
        }
      }
      return true;
    }),
  
  body('location')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 100 }).withMessage('location no puede superar 100 caracteres')
];

// ============================================
// VALIDACIONES: Ajustar inventario físico
// ============================================
const validateAdjustInventory = [
  body('productId')
    .notEmpty().withMessage('productId es requerido')
    .isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),
  
  body('newStock')
    .notEmpty().withMessage('newStock es requerido')
    .isInt({ min: 0 }).withMessage('newStock debe ser un entero >= 0'),
  
  body('reason')
    .notEmpty().withMessage('reason es requerido')
    .isString().trim()
    .isLength({ max: 100 }).withMessage('reason no puede superar 100 caracteres'),
  
  body('notes')
    .optional({ nullable: true })
    .isString().trim()
    .isLength({ max: 500 }).withMessage('notes no puede superar 500 caracteres')
];

// ============================================
// VALIDACIONES: Obtener valor del inventario
// ============================================
const validateGetInventoryValue = [
  query('categoryId')
    .optional()
    .isInt({ min: 1 }).withMessage('categoryId debe ser un entero positivo')
];

module.exports = {
  validate,
  validateGetInventory,
  validateGetProductStock,
  validateRegisterMovement,
  validateGetMovementHistory,
  validateUpdateStockLimits,
  validateAdjustInventory,
  validateGetInventoryValue
};
