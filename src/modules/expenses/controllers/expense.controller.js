const ExpenseService = require('../services/expense.service');
const ApiResponse = require('../../../utils/response');
const { getReceiptUrl } = require('../../../utils/file.util');

const createCategory = async (req, res) => {
  const cat = await ExpenseService.createCategory(req.body);
  return ApiResponse.created(res, cat);
};

const listCategories = async (req, res) => {
  const cats = await ExpenseService.listCategories(req.query);
  return ApiResponse.success(res, cats);
};

const createExpense = async (req, res) => {
  const exp = await ExpenseService.createExpense(req.body);
  return ApiResponse.created(res, exp);
};

const listExpenses = async (req, res) => {
  const result = await ExpenseService.listExpenses(req.query);
  return ApiResponse.success(res, result);
};

const getExpenseById = async (req, res) => {
  const exp = await ExpenseService.getExpenseById(req.params.id);
  if (!exp) return ApiResponse.notFound(res);
  return ApiResponse.success(res, exp);
};

const updateExpense = async (req, res) => {
  try {
    const exp = await ExpenseService.updateExpense(req.params.id, req.body);
    if (!exp) return ApiResponse.notFound(res, 'Gasto no encontrado');
    return ApiResponse.success(res, exp);
  } catch (error) {
    console.error('Error en updateExpense:', error.message, error.stack);
    return ApiResponse.error(res, `Error al actualizar gasto: ${error.message}`, 500);
  }
};

const deleteExpense = async (req, res) => {
  try {
    const result = await ExpenseService.deleteExpense(req.params.id, req.body.reason);
    if (!result) return ApiResponse.notFound(res);
    return ApiResponse.success(res, result);
  } catch (error) {
    console.error('Error en deleteExpense:', error);
    return ApiResponse.error(res, 'Error al eliminar gasto');
  }
};

const uploadReceipt = async (req, res) => {
  try {
    // Expect middleware to provide file metadata at req.file
    const file = req.file || req.body.file;
    if (!file) return ApiResponse.error(res, 'Archivo no recibido', 400);

    const fileUrl = req.file ? getReceiptUrl(req.file.filename) : (file.path || file.url);
    const fileName = req.file ? req.file.originalname : (file.originalname || file.name);
    const mimeType = req.file ? req.file.mimetype : (file.mimetype || file.type);

    const rec = await ExpenseService.uploadReceipt(req.params.id, { fileUrl, fileName, mimeType });
    return ApiResponse.created(res, rec);
  } catch (error) {
    console.error('Error en uploadReceipt:', error);
    return ApiResponse.error(res, 'Error al subir comprobante');
  }
};

const expensesByCategory = async (req, res) => {
  const rows = await ExpenseService.expensesByCategory(req.query.startDate, req.query.endDate);
  return ApiResponse.success(res, rows);
};

const totalByPeriod = async (req, res) => {
  const totals = await ExpenseService.totalByPeriod(req.query.startDate, req.query.endDate);
  return ApiResponse.success(res, totals);
};

const createRecurring = async (req, res) => {
  const r = await ExpenseService.createRecurring(req.body);
  return ApiResponse.created(res, r);
};

const listRecurring = async (req, res) => {
  const rows = await ExpenseService.listRecurring(req.query);
  return ApiResponse.success(res, rows);
};

module.exports = {
  createCategory,
  listCategories,
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  uploadReceipt,
  expensesByCategory,
  totalByPeriod,
  createRecurring,
  listRecurring
};
