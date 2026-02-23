'use strict';

/**
 * Migración: Crear tabla auth.password_resets
 *
 * Registra el historial de resets de contraseña realizados por administradores.
 * Permite auditar quién realizó cada reset, cuándo y si la contraseña temporal fue utilizada.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('password_resets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      temporary_password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Contraseña temporal hasheada'
      },
      reset_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del administrador que realizó el reset'
      },
      used: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la contraseña temporal fue usada'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Fecha de expiración de la contraseña temporal'
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

    await queryInterface.addIndex(
      { tableName: 'password_resets', schema: 'auth' },
      ['user_id'],
      { name: 'password_resets_user_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'password_resets', schema: 'auth' },
      ['used'],
      { name: 'password_resets_used_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'password_resets', schema: 'auth' });
  }
};
