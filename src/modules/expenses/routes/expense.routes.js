const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense.controller');
const {
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
} = require('../validators/expense.validator');

const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');
const { uploadReceipt } = require('../../../utils/file.util');

router.use(authMiddleware);

// 1. Crear categoría
router.post(
  '/categories',
  requirePermission(MODULES.EXPENSES, ACTIONS.CREATE),
  validateCreateCategory,
  validate,
  auditLog('EXPENSES_CREATE_CATEGORY'),
  asyncHandler(expenseController.createCategory)
);

// 2. Listar categorías
router.get('/categories', requirePermission(MODULES.EXPENSES, ACTIONS.VIEW), validateListCategories, validate, asyncHandler(expenseController.listCategories));

// 3. Crear gasto
router.post('/expenses', requirePermission(MODULES.EXPENSES, ACTIONS.CREATE), validateCreateExpense, validate, auditLog('EXPENSES_CREATE'), asyncHandler(expenseController.createExpense));

// 4. Listar gastos
router.get('/expenses', requirePermission(MODULES.EXPENSES, ACTIONS.VIEW), validateListExpenses, validate, asyncHandler(expenseController.listExpenses));

// 5. Obtener detalle
router.get('/expenses/:id', requirePermission(MODULES.EXPENSES, ACTIONS.VIEW), validateExpenseId, validate, asyncHandler(expenseController.getExpenseById));

// 6. Actualizar gasto
router.put('/expenses/:id', requirePermission(MODULES.EXPENSES, ACTIONS.EDIT), validateExpenseId, validateCreateExpense, validate, auditLog('EXPENSES_UPDATE'), asyncHandler(expenseController.updateExpense));

// 7. Eliminar gasto
router.delete('/expenses/:id', requirePermission(MODULES.EXPENSES, ACTIONS.DELETE), validateDeleteExpense, validate, auditLog('EXPENSES_DELETE'), asyncHandler(expenseController.deleteExpense));

// 8. Subir comprobante (usa multer uploadReceipt, campo 'comprobante')
router.post('/expenses/:id/receipt', requirePermission(MODULES.EXPENSES, ACTIONS.EDIT), uploadReceipt.single('comprobante'), validateUploadReceipt, validate, auditLog('EXPENSES_UPLOAD_RECEIPT'), asyncHandler(expenseController.uploadReceipt));

// 9. Gastos por categoría
router.get('/reports/by-category', requirePermission(MODULES.EXPENSES, ACTIONS.VIEW), asyncHandler(expenseController.expensesByCategory));

// 10. Total de gastos por periodo
router.get('/reports/total', requirePermission(MODULES.EXPENSES, ACTIONS.VIEW), asyncHandler(expenseController.totalByPeriod));

// 11. Programar gasto recurrente
router.post('/recurrings', requirePermission(MODULES.EXPENSES, ACTIONS.CREATE), validateCreateRecurring, validate, asyncHandler(expenseController.createRecurring));

// 12. Obtener gastos recurrentes
router.get('/recurrings', requirePermission(MODULES.EXPENSES, ACTIONS.VIEW), validateListRecurring, validate, asyncHandler(expenseController.listRecurring));

module.exports = router;
