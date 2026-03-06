const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.INVENTORY;

/**
 * Modelo StockMovement - Movimientos de Inventario
 * Tabla: inventory.stock_movements
 * Sprint 7 - Gestión de Inventario
 * 
 * Registra todas las entradas, salidas y ajustes de stock
 */
module.exports = (sequelize) => {
  const StockMovement = sequelize.define('StockMovement', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del movimiento'
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      comment: 'ID del producto'
    },

    movementType: {
      type: DataTypes.ENUM('entrada', 'salida', 'ajuste', 'inicial'),
      allowNull: false,
      field: 'movement_type',
      validate: {
        isIn: {
          args: [['entrada', 'salida', 'ajuste', 'inicial']],
          msg: 'El tipo de movimiento debe ser: entrada, salida, ajuste o inicial'
        }
      },
      comment: 'Tipo de movimiento'
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'La cantidad debe ser mayor a 0' },
        isInt: { msg: 'La cantidad debe ser un número entero' }
      },
      comment: 'Cantidad movida'
    },

    stockBefore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_before',
      comment: 'Stock antes del movimiento'
    },

    stockAfter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'stock_after',
      comment: 'Stock después del movimiento'
    },

    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'El motivo es requerido' }
      },
      comment: 'Motivo del movimiento'
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales'
    },

    referenceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'reference_type',
      comment: 'Tipo de referencia (purchase, sale, etc.)'
    },

    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reference_id',
      comment: 'ID de la referencia'
    },

    performedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'performed_by',
      comment: 'Usuario que realizó el movimiento'
    }
  }, {
    tableName: 'stock_movements',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    paranoid: false, // No soft delete para movimientos

    indexes: [
      { fields: ['product_id'], name: 'stock_movements_product_id_idx' },
      { fields: ['movement_type'], name: 'stock_movements_type_idx' },
      { fields: ['created_at'], name: 'stock_movements_created_at_idx' },
      { fields: ['reference_type', 'reference_id'], name: 'stock_movements_reference_idx' },
      { fields: ['performed_by'], name: 'stock_movements_performed_by_idx' }
    ],

    comment: 'Registro de movimientos de inventario'
  });

  return StockMovement;
};
