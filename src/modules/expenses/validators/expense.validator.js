const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validacion',
      errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
  }
  next();
};

const validateCreateCategory = [
  body('name').isString().trim().notEmpty().withMessage('Nombre es requerido'),
  body('description').optional().isString(),
  body('type').optional().isIn(['FIXED', 'VARIABLE'])
];

const validateListCategories = [query('type').optional().isIn(['FIXED', 'VARIABLE'])];

const validateCreateExpense = [
  body('amount').isDecimal().withMessage('Monto invalido'),
  body('categoryId').isInt({ min: 1 }).withMessage('Categoria invalida'),
  body('concept').isString().notEmpty().withMessage('Concepto requerido'),
  body('date').isISO8601().withMessage('Fecha invalida'),
  body('paymentMethod').optional().isIn(['CASH', 'CARD', 'TRANSFER', 'BANK'])
];

const validateListExpenses = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('categoryId').optional().isInt({ min: 1 }),
  query('supplierId').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 200 })
];

const validateExpenseId = [param('id').isInt({ min: 1 }).withMessage('ID invalido')];

const validateDeleteExpense = [param('id').isInt({ min: 1 }).withMessage('ID invalido'), body('reason').optional().isString().trim().notEmpty()];

const validateUploadReceipt = [param('id').isInt({ min: 1 }).withMessage('ID invalido')];

const validateCreateRecurring = [
  body('amount').isDecimal(),
  body('categoryId').isInt({ min: 1 }),
  body('concept').isString().notEmpty(),
  body('frequency').isIn(['MONTHLY', 'BIWEEKLY', 'WEEKLY']),
  body('startDate').isISO8601()
];

const validateListRecurring = [query('active').optional().isIn(['true', 'false'])];

module.exports = {
  validate,
  validateCreateCategory,
  validateListCategories,
  validateCreateExpense,
  validateListExpenses,
  validateExpenseId,
  validateDeleteExpense,
  validateUploadReceipt,
  validateCreateRecurring,
  validateListRecurring
};
