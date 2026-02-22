'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.STRING(255),
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
      { tableName: 'refresh_tokens', schema: 'auth' },
      ['token'],
      { unique: true, name: 'refresh_tokens_token_unique' }
    );

    await queryInterface.addIndex(
      { tableName: 'refresh_tokens', schema: 'auth' },
      ['user_id'],
      { name: 'refresh_tokens_user_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'refresh_tokens', schema: 'auth' },
      ['expires_at'],
      { name: 'refresh_tokens_expires_at_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'refresh_tokens', schema: 'auth' },
      ['is_revoked'],
      { name: 'refresh_tokens_is_revoked_idx' }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable({ tableName: 'refresh_tokens', schema: 'auth' });
  }
};