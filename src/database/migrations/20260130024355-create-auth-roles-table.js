'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear esquema si no existe
    await queryInterface.sequelize.query(
      'CREATE SCHEMA IF NOT EXISTS auth;'
    );
    
    // Crear tabla roles
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      { tableName: 'roles', schema: 'auth' },
      ['name'],
      { unique: true, name: 'roles_name_unique' }
    );

    await queryInterface.addIndex(
      { tableName: 'roles', schema: 'auth' },
      ['is_active'],
      { name: 'roles_is_active_idx' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: 'roles', schema: 'auth' });
  }
};