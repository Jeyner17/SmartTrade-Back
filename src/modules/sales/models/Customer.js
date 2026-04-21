const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SALES;

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: { type: DataTypes.STRING(150), allowNull: false, field: 'full_name' },
    documentNumber: { type: DataTypes.STRING(30), allowNull: true, field: 'document_number' },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(120), allowNull: true }
  }, {
    tableName: 'customers',
    schema: SCHEMA,
    timestamps: true,
    underscored: true
  });

  return Customer;
};
