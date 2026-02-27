const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.PRODUCTS;

/**
 * Modelo PriceHistory - Historial de cambios de precio
 * Tabla: products.price_history
 * Sprint 6 - Gestión de Productos
 */
module.exports = (sequelize) => {
  const PriceHistory = sequelize.define('PriceHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID del registro de cambio de precio'
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      comment: 'ID del producto cuyo precio cambió'
    },

    previousPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'previous_price',
      comment: 'Precio anterior antes del cambio'
    },

    newPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'new_price',
      comment: 'Precio nuevo después del cambio'
    },

    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Motivo del cambio de precio'
    },

    changedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'changed_by',
      comment: 'ID del usuario que realizó el cambio'
    }
  }, {
    tableName: 'price_history',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    paranoid: false,

    indexes: [
      { fields: ['product_id'], name: 'price_history_product_id_idx' },
      { fields: ['changed_by'], name: 'price_history_changed_by_idx' }
    ],

    comment: 'Historial de cambios de precio de productos'
  });

  return PriceHistory;
};
