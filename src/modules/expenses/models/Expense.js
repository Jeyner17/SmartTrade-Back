module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Expense = sequelize.define(
    'Expense',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      categoryId: { type: DataTypes.BIGINT, allowNull: false },
      concept: { type: DataTypes.STRING, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      paymentMethod: { type: DataTypes.ENUM('CASH', 'CARD', 'TRANSFER', 'BANK'), allowNull: false, defaultValue: 'CASH' },
      receiptNumber: { type: DataTypes.STRING, allowNull: true },
      supplierId: { type: DataTypes.BIGINT, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true }
    },
    {
      schema: 'expenses',
      tableName: 'expenses',
      timestamps: true
    }
  );

  return Expense;
};
