module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const ExpenseRecurring = sequelize.define(
    'ExpenseRecurring',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
      categoryId: { type: DataTypes.BIGINT, allowNull: false },
      concept: { type: DataTypes.STRING, allowNull: false },
      frequency: { type: DataTypes.ENUM('MONTHLY', 'BIWEEKLY', 'WEEKLY'), allowNull: false, defaultValue: 'MONTHLY' },
      startDate: { type: DataTypes.DATEONLY, allowNull: false },
      nextDate: { type: DataTypes.DATEONLY, allowNull: true },
      active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
    },
    {
      schema: 'expenses',
      tableName: 'expense_recurrings',
      timestamps: true
    }
  );

  return ExpenseRecurring;
};
