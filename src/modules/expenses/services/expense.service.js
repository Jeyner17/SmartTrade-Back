const db = require('../../../database');
const { Op } = require('sequelize');

const Expense = db.Expense;
const ExpenseCategory = db.ExpenseCategory;
const ExpenseReceipt = db.ExpenseReceipt;
const ExpenseRecurring = db.ExpenseRecurring;

const createCategory = async (data) => {
  const category = await ExpenseCategory.create(data);
  return category;
};

const listCategories = async (filter = {}) => {
  const where = {};
  if (filter.type) where.type = filter.type.toUpperCase();

  const categories = await ExpenseCategory.findAll({ where });
  return categories;
};

const createExpense = async (payload) => {
  const expense = await Expense.create(payload);
  return expense;
};

const listExpenses = async (opts) => {
  const where = {};
  if (opts.startDate && opts.endDate) where.date = { [Op.between]: [opts.startDate, opts.endDate] };
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.supplierId) where.supplierId = opts.supplierId;

  const limit = opts.limit || 20;
  const page = opts.page || 1;
  const offset = (page - 1) * limit;

  const { rows, count } = await Expense.findAndCountAll({ where, limit, offset, order: [['date', 'DESC']] });
  return { rows, count, page, limit };
};

const getExpenseById = async (id) => {
  const expense = await Expense.findByPk(id, { include: [{ model: ExpenseReceipt, as: 'receipts' }, { model: ExpenseCategory, as: 'category' }] });
  return expense;
};

const updateExpense = async (id, data) => {
  const expense = await Expense.findByPk(id);
  if (!expense) return null;
  await Expense.update(data, { where: { id } });
  return getExpenseById(id);
};

const deleteExpense = async (id, reason) => {
  // Soft delete could be implemented; for now remove
  const expense = await Expense.findByPk(id);
  if (!expense) return null;
  await expense.destroy();
  return { id, deleted: true, reason };
};

const uploadReceipt = async (expenseId, fileMeta) => {
  const rec = await ExpenseReceipt.create({ expenseId, ...fileMeta });
  return rec;
};

const expensesByCategory = async (startDate, endDate) => {
  const where = {};
  if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };

  const categories = await ExpenseCategory.findAll();
  const result = [];
  for (const c of categories) {
    const total = await Expense.sum('amount', { where: { ...where, categoryId: c.id } });
    result.push({ category: c, total: Number(total || 0) });
  }
  return result;
};

const totalByPeriod = async (startDate, endDate) => {
  const where = {};
  if (startDate && endDate) where.date = { [Op.between]: [startDate, endDate] };
  const total = await Expense.sum('amount', { where });
  // promedio diario
  const days = Math.max(1, (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  return { total: Number(total || 0), avgDaily: Number(((total || 0) / days).toFixed(2)) };
};

const createRecurring = async (payload) => {
  const item = await ExpenseRecurring.create(payload);
  return item;
};

const listRecurring = async (filter = {}) => {
  const where = {};
  if (filter.active !== undefined) where.active = filter.active === 'true' || filter.active === true;
  const rows = await ExpenseRecurring.findAll({ where });
  return rows;
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
