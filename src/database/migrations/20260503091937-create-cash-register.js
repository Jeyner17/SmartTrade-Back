'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        `CREATE SCHEMA IF NOT EXISTS "cashRegister";`,
        { transaction }
      );

      // LIMPIAR ENUMS SI EXISTEN
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "cashRegister"."enum_cash_sessions_status";`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "cashRegister"."enum_cash_movements_type";`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "cashRegister"."enum_cash_movements_payment_method";`,
        { transaction }
      );

      // =========================
      // cash_sessions
      // =========================
      await queryInterface.createTable(
        'cash_sessions',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          cash_box_number: {
            type: Sequelize.STRING(50),
            allowNull: false
          },
          cashier_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          opened_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          closed_at: {
            type: Sequelize.DATE
          },
          base_amount: {
            type: Sequelize.DECIMAL(12, 2),
            defaultValue: 0
          },
          expected_total: Sequelize.DECIMAL(12, 2),
          physical_total: Sequelize.DECIMAL(12, 2),
          difference: Sequelize.DECIMAL(12, 2),
          status: {
            type: Sequelize.ENUM('OPEN', 'COUNTED', 'CLOSED'),
            defaultValue: 'OPEN'
          },
          observations: Sequelize.TEXT,
          closed_by: Sequelize.INTEGER,
          authorized_by: Sequelize.INTEGER,
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        { schema: 'cashRegister', transaction }
      );

      // =========================
      // cash_movements
      // =========================
      await queryInterface.createTable(
        'cash_movements',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          cash_session_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              schema: 'cashRegister',
              model: 'cash_sessions',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          type: {
            type: Sequelize.ENUM('SALE', 'INCOME', 'EXPENSE', 'WITHDRAWAL'),
            allowNull: false
          },
          amount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          payment_method: {
            type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'CREDIT')
          },
          concept: Sequelize.STRING,
          sale_id: Sequelize.INTEGER,
          related_movement_id: Sequelize.INTEGER,
          received_by: Sequelize.INTEGER,
          authorized_by: Sequelize.INTEGER,
          description: Sequelize.TEXT,
          reference: Sequelize.STRING,
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        { schema: 'cashRegister', transaction }
      );

      // =========================
      // cash_counts
      // =========================
      await queryInterface.createTable(
        'cash_counts',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          cash_session_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              schema: 'cashRegister',
              model: 'cash_sessions',
              key: 'id'
            },
            onDelete: 'CASCADE'
          },
          count_data: {
            type: Sequelize.JSON,
            allowNull: false
          },
          total_counted: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          expected_amount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          difference: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          difference_percentage: Sequelize.DECIMAL(5, 2),
          counted_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
          },
          counted_by: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          verified_by: Sequelize.INTEGER,
          observations: Sequelize.TEXT,
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        { schema: 'cashRegister', transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable({ schema: 'cashRegister', tableName: 'cash_counts' }, { transaction });
      await queryInterface.dropTable({ schema: 'cashRegister', tableName: 'cash_movements' }, { transaction });
      await queryInterface.dropTable({ schema: 'cashRegister', tableName: 'cash_sessions' }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};