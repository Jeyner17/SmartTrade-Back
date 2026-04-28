'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable(
        { schema: 'cashRegister', tableName: 'cash_counts' },
        { transaction }
      );

      await queryInterface.dropTable(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        { transaction }
      );

      await queryInterface.dropTable(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        { transaction }
      );

      // Antes de recrear tablas, eliminar tipos ENUM antiguos para evitar errores
      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "cashRegister"."enum_cash_movements_payment_method";`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DROP TYPE IF EXISTS "cashRegister"."enum_cash_movements_type";`,
        { transaction }
      );

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
          casier_id: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          opened_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          closed_at: {
            type: Sequelize.DATE,
            allowNull: true
          },
          base_amount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
          },
          expected_total: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
          },
          physical_total: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
          },
          difference: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
          },
          status: {
            type: Sequelize.ENUM('OPEN', 'COUNTED', 'CLOSED'),
            allowNull: false,
            defaultValue: 'OPEN'
          },
          observations: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          closed_by: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          authorized_by: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          schema: 'cashRegister',
          transaction
        }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['casier_id'],
        { transaction, name: 'cash_sessions_casier_id_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['cash_box_number'],
        { transaction, name: 'cash_sessions_cash_box_number_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['status'],
        { transaction, name: 'cash_sessions_status_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['opened_at'],
        { transaction, name: 'cash_sessions_opened_at_idx' }
      );

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
            onUpdate: 'CASCADE',
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
            type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'CREDIT'),
            allowNull: true
          },
          concept: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          sale_id: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          related_movement_id: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          received_by: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          authorized_by: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          reference: {
            type: Sequelize.STRING(100),
            allowNull: true
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          schema: 'cashRegister',
          transaction
        }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['cash_session_id'],
        { transaction, name: 'cash_movements_cash_session_id_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['type'],
        { transaction, name: 'cash_movements_type_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['sale_id'],
        { transaction, name: 'cash_movements_sale_id_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['created_at'],
        { transaction, name: 'cash_movements_created_at_idx' }
      );

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
            onUpdate: 'CASCADE',
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
          difference_percentage: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: true
          },
          counted_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          counted_by: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          verified_by: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          observations: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          schema: 'cashRegister',
          transaction
        }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_counts' },
        ['cash_session_id'],
        { transaction, name: 'cash_counts_cash_session_id_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_counts' },
        ['counted_at'],
        { transaction, name: 'cash_counts_counted_at_idx' }
      );

      await transaction.commit();
      console.log('✅ Migration: Cash Register tables recreated with snake_case columns');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable(
        { schema: 'cashRegister', tableName: 'cash_counts' },
        { transaction }
      );

      await queryInterface.dropTable(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        { transaction }
      );

      await queryInterface.dropTable(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
