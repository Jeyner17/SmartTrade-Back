const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.PURCHASES;

/**
 * Modelo PurchaseStatusHistory - Historial de estados de órdenes
 * Tabla: purchases.purchase_order_status_history
 * Sprint 9 - Compras
 */
module.exports = (sequelize) => {
  const PurchaseStatusHistory = sequelize.define('PurchaseStatusHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del historial'
    },

    purchaseOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'purchase_order_id',
      comment: 'Orden de compra asociada'
    },

    previousStatus: {
      type: DataTypes.ENUM('pendiente', 'confirmada', 'recibida', 'cancelada'),
      allowNull: true,
      field: 'previous_status',
      comment: 'Estado anterior'
    },

    newStatus: {
      type: DataTypes.ENUM('pendiente', 'confirmada', 'recibida', 'cancelada'),
      allowNull: false,
      field: 'new_status',
      comment: 'Estado nuevo'
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del cambio'
    },

    changedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'changed_by',
      comment: 'Usuario que realizó el cambio'
    },

    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'changed_at',
      comment: 'Fecha del cambio de estado'
    }
  }, {
    tableName: 'purchase_order_status_history',
    schema: SCHEMA,
    timestamps: false,
    underscored: true,
    paranoid: false,

    indexes: [
      { fields: ['purchase_order_id'], name: 'purchase_status_history_order_id_idx' },
      { fields: ['changed_at'], name: 'purchase_status_history_changed_at_idx' }
    ],

    comment: 'Historial de cambios de estado de órdenes de compra'
  });

  return PurchaseStatusHistory;
};
