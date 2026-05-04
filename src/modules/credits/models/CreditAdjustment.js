const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.CREDITS;

module.exports = (sequelize) => {
  const CreditAdjustment = sequelize.define('CreditAdjustment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    creditId: { type: DataTypes.INTEGER, allowNull: false, field: 'credit_id' },
    type: {
      type: DataTypes.ENUM('INTEREST', 'FORGIVENESS', 'REFINANCE'),
      allowNull: false
    },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: true },
    authorizedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'authorized_by' },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'credit_adjustments',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['credit_id'], name: 'credit_adjustments_credit_id_idx' },
      { fields: ['type'], name: 'credit_adjustments_type_idx' }
    ]
  });

  return CreditAdjustment;
};
