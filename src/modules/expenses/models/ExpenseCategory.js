module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const ExpenseCategory = sequelize.define(
    'ExpenseCategory',
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      type: { type: DataTypes.ENUM('FIXED', 'VARIABLE'), allowNull: false, defaultValue: 'VARIABLE' }
    },
    {
      schema: 'expenses',
      tableName: 'expense_categories',
      timestamps: true
    }
  );

  return ExpenseCategory;
};
