'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'roles', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      lock_until: {
        type: Sequelize.DATE,
        allowNull: true
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
      schema: 'auth'
    });

    // Crear índices
    await queryInterface.addIndex(
      { tableName: 'users', schema: 'auth' },
      ['username'],
      { unique: true, name: 'users_username_unique' }
    );

    await queryInterface.addIndex(
      { tableName: 'users', schema: 'auth' },
      ['email'],
      { unique: true, name: 'users_email_unique' }
    );

    await queryInterface.addIndex(
      { tableName: 'users', schema: 'auth' },
      ['role_id'],
      { name: 'users_role_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'users', schema: 'auth' },
      ['is_active'],
      { name: 'users_is_active_idx' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: 'users', schema: 'auth' });
  }
};