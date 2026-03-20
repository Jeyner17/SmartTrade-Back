'use strict';

/**
 * Migración: Crear tablas del módulo de compras
 * Sprint 9 - Compras
 *
 * Tablas:
 * - purchases.purchase_orders
 * - purchases.purchase_details
 * - purchases.purchase_order_status_history
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS purchases;');

    await queryInterface.createTable('purchase_orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      order_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        comment: 'Número de orden autogenerado (PO-YYYYMMDD-XXXX)'
      },
      supplier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'suppliers', schema: 'suppliers' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Proveedor de la orden'
      },
      order_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
        comment: 'Fecha de emisión de la orden'
      },
      expected_delivery_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Fecha estimada de entrega'
      },
      status: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'recibida', 'cancelada'),
        allowNull: false,
        defaultValue: 'pendiente',
        comment: 'Estado de la orden'
      },
      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Subtotal de la orden'
      },
      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Monto total de la orden'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones de la orden'
      },
      status_observations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones del último cambio de estado'
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha/hora de recepción final de la orden'
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha/hora de cancelación de la orden'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'purchases',
      comment: 'Órdenes de compra a proveedores'
    });

    await queryInterface.createTable('purchase_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'purchase_orders', schema: 'purchases' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Orden de compra a la que pertenece el detalle'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'products', schema: 'products' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Producto comprado'
      },
      quantity_ordered: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad solicitada'
      },
      quantity_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad efectivamente recibida'
      },
      unit_cost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Costo unitario de compra'
      },
      line_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de línea (cantidad * costo unitario)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones del detalle'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'purchases',
      comment: 'Detalle de productos de una orden de compra'
    });

    await queryInterface.createTable('purchase_order_status_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'purchase_orders', schema: 'purchases' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Orden de compra asociada'
      },
      previous_status: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'recibida', 'cancelada'),
        allowNull: true,
        comment: 'Estado anterior'
      },
      new_status: {
        type: Sequelize.ENUM('pendiente', 'confirmada', 'recibida', 'cancelada'),
        allowNull: false,
        comment: 'Estado nuevo'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones del cambio'
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que ejecutó el cambio'
      },
      changed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha/hora del cambio'
      }
    }, {
      schema: 'purchases',
      comment: 'Historial de cambios de estado de órdenes de compra'
    });

    await queryInterface.addIndex(
      { tableName: 'purchase_orders', schema: 'purchases' },
      ['order_number'],
      { unique: true, name: 'purchase_orders_order_number_unique' }
    );
    await queryInterface.addIndex(
      { tableName: 'purchase_orders', schema: 'purchases' },
      ['supplier_id'],
      { name: 'purchase_orders_supplier_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'purchase_orders', schema: 'purchases' },
      ['status'],
      { name: 'purchase_orders_status_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'purchase_orders', schema: 'purchases' },
      ['order_date'],
      { name: 'purchase_orders_order_date_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'purchase_details', schema: 'purchases' },
      ['purchase_order_id'],
      { name: 'purchase_details_order_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'purchase_details', schema: 'purchases' },
      ['product_id'],
      { name: 'purchase_details_product_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'purchase_order_status_history', schema: 'purchases' },
      ['purchase_order_id'],
      { name: 'purchase_status_history_order_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'purchase_order_status_history', schema: 'purchases' },
      ['changed_at'],
      { name: 'purchase_status_history_changed_at_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'purchase_order_status_history', schema: 'purchases' });
    await queryInterface.dropTable({ tableName: 'purchase_details', schema: 'purchases' });
    await queryInterface.dropTable({ tableName: 'purchase_orders', schema: 'purchases' });

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS purchases.enum_purchase_orders_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS purchases.enum_purchase_order_status_history_previous_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS purchases.enum_purchase_order_status_history_new_status;');
  }
};
