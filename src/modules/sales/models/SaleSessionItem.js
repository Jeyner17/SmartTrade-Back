const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SALES;

module.exports = (sequelize) => {
  const SaleSessionItem = sequelize.define('SaleSessionItem', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sessionId: { type: DataTypes.INTEGER, allowNull: false, field: 'session_id' },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price' },
    taxPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'tax_percent' }
  }, {
    tableName: 'sale_session_items',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['session_id', 'product_id'], unique: true, name: 'sales_session_items_unique' }
    ]
  });

  return SaleSessionItem;
};
