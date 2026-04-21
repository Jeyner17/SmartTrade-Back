'use strict';

/**
 * Sprint 12: Punto de Venta (POS)
 * Crea tablas para sesiones de carrito, clientes rápidos y ventas.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS sales;');

    await queryInterface.createTable('customers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING(150), allowNull: false },
      document_number: { type: Sequelize.STRING(30), allowNull: true },
      phone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(120), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'sales',
      comment: 'Clientes para ventas de POS (registro rápido)'
    });

    await queryInterface.createTable('sale_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      cashier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'users', schema: 'auth' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: { tableName: 'customers', schema: 'sales' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      status: {
        type: Sequelize.ENUM('open', 'closed', 'canceled'),
        allowNull: false,
        defaultValue: 'open'
      },
      discount_type: {
        type: Sequelize.ENUM('none', 'percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'none'
      },
      discount_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_reason: { type: Sequelize.STRING(255), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      closed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'sales',
      comment: 'Sesiones de carrito temporal del POS'
    });

    await queryInterface.createTable('sale_session_items', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'sale_sessions', schema: 'sales' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'products', schema: 'products' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      tax_percent: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'sales',
      comment: 'Productos agregados a una sesión de POS'
    });

    await queryInterface.createTable('sales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      ticket_number: { type: Sequelize.STRING(30), allowNull: false, unique: true },
      session_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: { tableName: 'sale_sessions', schema: 'sales' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: { tableName: 'customers', schema: 'sales' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cashier_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'users', schema: 'auth' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      payment_method: {
        type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('completed', 'voided'),
        allowNull: false,
        defaultValue: 'completed'
      },
      subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      iva_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_type: {
        type: Sequelize.ENUM('none', 'percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'none'
      },
      discount_value: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      discount_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      total_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      amount_received: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      change_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      void_reason: { type: Sequelize.STRING(255), allowNull: true },
      voided_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'sales',
      comment: 'Ventas finalizadas del POS'
    });

    await queryInterface.createTable('sale_details', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'sales', schema: 'sales' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'products', schema: 'products' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      tax_percent: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      line_subtotal: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      line_tax: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      line_total: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'sales',
      comment: 'Detalle de productos vendidos'
    });

    await queryInterface.addIndex({ tableName: 'customers', schema: 'sales' }, ['document_number'], {
      name: 'sales_customers_document_idx'
    });
    await queryInterface.addIndex({ tableName: 'customers', schema: 'sales' }, ['phone'], {
      name: 'sales_customers_phone_idx'
    });

    await queryInterface.addIndex({ tableName: 'sale_sessions', schema: 'sales' }, ['cashier_id'], {
      name: 'sales_sessions_cashier_idx'
    });
    await queryInterface.addIndex({ tableName: 'sale_sessions', schema: 'sales' }, ['status'], {
      name: 'sales_sessions_status_idx'
    });

    await queryInterface.addIndex({ tableName: 'sale_session_items', schema: 'sales' }, ['session_id', 'product_id'], {
      name: 'sales_session_items_unique',
      unique: true
    });
    await queryInterface.addIndex({ tableName: 'sale_session_items', schema: 'sales' }, ['product_id'], {
      name: 'sales_session_items_product_idx'
    });

    await queryInterface.addIndex({ tableName: 'sales', schema: 'sales' }, ['ticket_number'], {
      name: 'sales_ticket_number_unique',
      unique: true
    });
    await queryInterface.addIndex({ tableName: 'sales', schema: 'sales' }, ['cashier_id', 'created_at'], {
      name: 'sales_cashier_created_idx'
    });
    await queryInterface.addIndex({ tableName: 'sales', schema: 'sales' }, ['status'], {
      name: 'sales_status_idx'
    });

    await queryInterface.addIndex({ tableName: 'sale_details', schema: 'sales' }, ['sale_id'], {
      name: 'sale_details_sale_id_idx'
    });
    await queryInterface.addIndex({ tableName: 'sale_details', schema: 'sales' }, ['product_id'], {
      name: 'sale_details_product_id_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'sale_details', schema: 'sales' });
    await queryInterface.dropTable({ tableName: 'sales', schema: 'sales' });
    await queryInterface.dropTable({ tableName: 'sale_session_items', schema: 'sales' });
    await queryInterface.dropTable({ tableName: 'sale_sessions', schema: 'sales' });
    await queryInterface.dropTable({ tableName: 'customers', schema: 'sales' });

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS sales.enum_sale_sessions_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS sales.enum_sale_sessions_discount_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS sales.enum_sales_payment_method;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS sales.enum_sales_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS sales.enum_sales_discount_type;');
  }
};
