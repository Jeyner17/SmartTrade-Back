const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SALES;

module.exports = (sequelize) => {
  const SaleSession = sequelize.define('SaleSession', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cashierId: { type: DataTypes.INTEGER, allowNull: false, field: 'cashier_id' },
    customerId: { type: DataTypes.INTEGER, allowNull: true, field: 'customer_id' },
    status: {
      type: DataTypes.ENUM('open', 'closed', 'canceled'),
      allowNull: false,
      defaultValue: 'open'
    },
    discountType: {
      type: DataTypes.ENUM('none', 'percentage', 'fixed'),
      allowNull: false,
      defaultValue: 'none',
      field: 'discount_type'
    },
    discountValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'discount_value'
    },
    discountReason: { type: DataTypes.STRING(255), allowNull: true, field: 'discount_reason' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    closedAt: { type: DataTypes.DATE, allowNull: true, field: 'closed_at' }
  }, {
    tableName: 'sale_sessions',
    schema: SCHEMA,
    timestamps: true,
    underscored: true
  });

  return SaleSession;
};
