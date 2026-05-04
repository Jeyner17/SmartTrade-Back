/**
 * Migration: create expenses schema and tables
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS "expenses"');

    await queryInterface.createTable(
      { schema: 'expenses', tableName: 'expense_categories' },
      {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING, allowNull: false },
        description: { type: Sequelize.TEXT },
        type: { type: Sequelize.ENUM('FIXED', 'VARIABLE'), allowNull: false, defaultValue: 'VARIABLE' },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }
    );

    await queryInterface.createTable(
      { schema: 'expenses', tableName: 'expenses' },
      {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        category_id: { type: Sequelize.BIGINT, allowNull: false },
        concept: { type: Sequelize.STRING, allowNull: false },
        date: { type: Sequelize.DATEONLY, allowNull: false },
        payment_method: { type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'BANK'), allowNull: false, defaultValue: 'CASH' },
        receipt_number: { type: Sequelize.STRING },
        supplier_id: { type: Sequelize.BIGINT },
        notes: { type: Sequelize.TEXT },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }
    );

    await queryInterface.createTable(
      { schema: 'expenses', tableName: 'expense_receipts' },
      {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        expense_id: { type: Sequelize.BIGINT, allowNull: false },
        file_url: { type: Sequelize.STRING, allowNull: false },
        file_name: { type: Sequelize.STRING },
        mime_type: { type: Sequelize.STRING },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }
    );

    await queryInterface.createTable(
      { schema: 'expenses', tableName: 'expense_recurrings' },
      {
        id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
        amount: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        category_id: { type: Sequelize.BIGINT, allowNull: false },
        concept: { type: Sequelize.STRING, allowNull: false },
        frequency: { type: Sequelize.ENUM('MONTHLY', 'BIWEEKLY', 'WEEKLY'), allowNull: false, defaultValue: 'MONTHLY' },
        start_date: { type: Sequelize.DATEONLY, allowNull: false },
        next_date: { type: Sequelize.DATEONLY },
        active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
      }
    );

    // Foreign keys
    await queryInterface.addConstraint({ schema: 'expenses', tableName: 'expenses' }, {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_expenses_category',
      references: { table: { schema: 'expenses', tableName: 'expense_categories' }, field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint({ schema: 'expenses', tableName: 'expense_receipts' }, {
      fields: ['expense_id'],
      type: 'foreign key',
      name: 'fk_receipts_expense',
      references: { table: { schema: 'expenses', tableName: 'expenses' }, field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint({ schema: 'expenses', tableName: 'expense_recurrings' }, {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_recurrings_category',
      references: { table: { schema: 'expenses', tableName: 'expense_categories' }, field: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables
    await queryInterface.dropTable({ schema: 'expenses', tableName: 'expense_recurrings' });
    await queryInterface.dropTable({ schema: 'expenses', tableName: 'expense_receipts' });
    await queryInterface.dropTable({ schema: 'expenses', tableName: 'expenses' });
    await queryInterface.dropTable({ schema: 'expenses', tableName: 'expense_categories' });

    // Drop enums if exist (idempotent)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "expenses"."enum_expenses_payment_method"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "expenses"."enum_expense_categories_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "expenses"."enum_expense_recurrings_frequency"');

    // Optionally drop schema
    // await queryInterface.sequelize.query('DROP SCHEMA IF EXISTS "expenses" CASCADE');
  }
};
