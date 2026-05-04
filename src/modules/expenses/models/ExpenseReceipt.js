module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const ExpenseReceipt = sequelize.define(
    'ExpenseReceipt',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      expenseId: { type: DataTypes.BIGINT, allowNull: false },
      fileUrl: { type: DataTypes.STRING, allowNull: false },
      fileName: { type: DataTypes.STRING, allowNull: true },
      mimeType: { type: DataTypes.STRING, allowNull: true }
    },
    {
      schema: 'expenses',
      tableName: 'expense_receipts',
      timestamps: false,
      createdAt: 'created_at'
    }
  );

  return ExpenseReceipt;
};
