'use strict';

/**
 * Sprint 15: Creditos y Cuentas por Cobrar
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS credits;');

    await queryInterface.createTable('customers', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING(150), allowNull: false },
      document_number: { type: Sequelize.STRING(30), allowNull: false },
      address: { type: Sequelize.STRING(255), allowNull: true },
      phone: { type: Sequelize.STRING(30), allowNull: true },
      email: { type: Sequelize.STRING(120), allowNull: true },
      credit_limit: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      references: { type: Sequelize.TEXT, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'credits',
      comment: 'Clientes habilitados para compras a credito'
    });

    await queryInterface.createTable('credits', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'customers', schema: 'credits' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'sales', schema: 'sales' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      parent_credit_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: { tableName: 'credits', schema: 'credits' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      principal_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      interest_rate: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      mora_rate_daily: { type: Sequelize.DECIMAL(8, 6), allowNull: false, defaultValue: 0.001 },
      term_days: { type: Sequelize.INTEGER, allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      outstanding_balance: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'PAID', 'OVERDUE', 'FORGIVEN', 'REFINANCED'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      observations: { type: Sequelize.TEXT, allowNull: true },
      last_payment_date: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'credits',
      comment: 'Creditos generados a partir de ventas'
    });

    await queryInterface.createTable('credit_payments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      credit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'credits', schema: 'credits' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      payment_method: {
        type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia'),
        allowNull: false
      },
      payment_date: { type: Sequelize.DATE, allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      recorded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: { tableName: 'users', schema: 'auth' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'credits',
      comment: 'Pagos aplicados a creditos'
    });

    await queryInterface.createTable('credit_reminders', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      credit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'credits', schema: 'credits' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      days_before_due: { type: Sequelize.INTEGER, allowNull: false },
      scheduled_for: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM('PENDING', 'SENT', 'CANCELED'),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      channel: {
        type: Sequelize.ENUM('WHATSAPP', 'EMAIL', 'SMS', 'SYSTEM'),
        allowNull: false,
        defaultValue: 'SYSTEM'
      },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'credits',
      comment: 'Recordatorios programados para pagos'
    });

    await queryInterface.createTable('credit_adjustments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      credit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: { tableName: 'credits', schema: 'credits' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('INTEREST', 'FORGIVENESS', 'REFINANCE'),
        allowNull: false
      },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: true },
      authorized_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: { tableName: 'users', schema: 'auth' }, key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, {
      schema: 'credits',
      comment: 'Ajustes sobre creditos (mora, condonaciones, refinanciaciones)'
    });

    await queryInterface.addIndex({ tableName: 'customers', schema: 'credits' }, ['document_number'], {
      name: 'credits_customers_document_unique',
      unique: true
    });
    await queryInterface.addIndex({ tableName: 'customers', schema: 'credits' }, ['phone'], {
      name: 'credits_customers_phone_idx'
    });

    await queryInterface.addIndex({ tableName: 'credits', schema: 'credits' }, ['customer_id'], {
      name: 'credits_customer_id_idx'
    });
    await queryInterface.addIndex({ tableName: 'credits', schema: 'credits' }, ['sale_id'], {
      name: 'credits_sale_id_idx'
    });
    await queryInterface.addIndex({ tableName: 'credits', schema: 'credits' }, ['status', 'due_date'], {
      name: 'credits_status_due_date_idx'
    });

    await queryInterface.addIndex({ tableName: 'credit_payments', schema: 'credits' }, ['credit_id', 'payment_date'], {
      name: 'credit_payments_credit_date_idx'
    });
    await queryInterface.addIndex({ tableName: 'credit_reminders', schema: 'credits' }, ['credit_id'], {
      name: 'credit_reminders_credit_id_idx'
    });
    await queryInterface.addIndex({ tableName: 'credit_reminders', schema: 'credits' }, ['status', 'scheduled_for'], {
      name: 'credit_reminders_status_schedule_idx'
    });
    await queryInterface.addIndex({ tableName: 'credit_adjustments', schema: 'credits' }, ['credit_id'], {
      name: 'credit_adjustments_credit_id_idx'
    });
    await queryInterface.addIndex({ tableName: 'credit_adjustments', schema: 'credits' }, ['type'], {
      name: 'credit_adjustments_type_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable({ tableName: 'credit_adjustments', schema: 'credits' });
    await queryInterface.dropTable({ tableName: 'credit_reminders', schema: 'credits' });
    await queryInterface.dropTable({ tableName: 'credit_payments', schema: 'credits' });
    await queryInterface.dropTable({ tableName: 'credits', schema: 'credits' });
    await queryInterface.dropTable({ tableName: 'customers', schema: 'credits' });

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS credits.enum_credits_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS credits.enum_credit_payments_payment_method;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS credits.enum_credit_reminders_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS credits.enum_credit_reminders_channel;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS credits.enum_credit_adjustments_type;');
  }
};
