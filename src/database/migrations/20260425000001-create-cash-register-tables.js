'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Crear schema si no existe
      await queryInterface.sequelize.query(
        `CREATE SCHEMA IF NOT EXISTS "cashRegister";`,
        { transaction }
      );

      // 1. Crear tabla cash_sessions
      await queryInterface.createTable(
        'cash_sessions',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          cashBoxNumber: {
            type: Sequelize.STRING(50),
            allowNull: false
          },
          casierId: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          openedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          closedAt: {
            type: Sequelize.DATE,
            allowNull: true
          },
          baseAmount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
          },
          expectedTotal: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: true
          },
          physicalTotal: {
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
          closedBy: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          authorizedBy: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          schema: 'cashRegister',
          transaction
        }
      );

      // Crear índices para cash_sessions
      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['casierId'],
        { transaction, name: 'cash_sessions_casierId_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['cashBoxNumber'],
        { transaction, name: 'cash_sessions_cashBoxNumber_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['status'],
        { transaction, name: 'cash_sessions_status_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_sessions' },
        ['openedAt'],
        { transaction, name: 'cash_sessions_openedAt_idx' }
      );

      // 2. Crear tabla cash_movements
      await queryInterface.createTable(
        'cash_movements',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          cashSessionId: {
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
          paymentMethod: {
            type: Sequelize.ENUM('CASH', 'CARD', 'TRANSFER', 'CREDIT'),
            allowNull: true
          },
          concept: {
            type: Sequelize.STRING(255),
            allowNull: true
          },
          saleId: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          relatedMovementId: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          receivedBy: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          authorizedBy: {
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
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          schema: 'cashRegister',
          transaction
        }
      );

      // Crear índices para cash_movements
      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['cashSessionId'],
        { transaction, name: 'cash_movements_cashSessionId_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['type'],
        { transaction, name: 'cash_movements_type_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['saleId'],
        { transaction, name: 'cash_movements_saleId_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_movements' },
        ['createdAt'],
        { transaction, name: 'cash_movements_createdAt_idx' }
      );

      // 3. Crear tabla cash_counts
      await queryInterface.createTable(
        'cash_counts',
        {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          cashSessionId: {
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
          countData: {
            type: Sequelize.JSON,
            allowNull: false
          },
          totalCounted: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          expectedAmount: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          difference: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false
          },
          differencePercentage: {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: true
          },
          countedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW
          },
          countedBy: {
            type: Sequelize.INTEGER,
            allowNull: false
          },
          verifiedBy: {
            type: Sequelize.INTEGER,
            allowNull: true
          },
          observations: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
          }
        },
        {
          schema: 'cashRegister',
          transaction
        }
      );

      // Crear índices para cash_counts
      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_counts' },
        ['cashSessionId'],
        { transaction, name: 'cash_counts_cashSessionId_idx' }
      );

      await queryInterface.addIndex(
        { schema: 'cashRegister', tableName: 'cash_counts' },
        ['countedAt'],
        { transaction, name: 'cash_counts_countedAt_idx' }
      );

      await transaction.commit();
      console.log('✅ Migration: Cash Register tables created successfully');
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
      console.log('✅ Migration reverted: Cash Register tables removed');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
