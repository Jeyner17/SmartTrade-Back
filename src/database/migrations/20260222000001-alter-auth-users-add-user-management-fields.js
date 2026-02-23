'use strict';

/**
 * Migración: Extender tabla auth.users con campos de gestión y auditoría
 *
 * Campos agregados:
 * - must_change_password: Forzar cambio de contraseña en el próximo inicio de sesión
 * - created_by: ID del usuario que creó el registro (auditoría)
 * - updated_by: ID del usuario que realizó la última modificación (auditoría)
 * - deleted_at: Marca de tiempo para eliminación lógica (soft delete)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: 'users', schema: 'auth' },
      'must_change_password',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el usuario debe cambiar su contraseña en el próximo inicio de sesión'
      }
    );

    await queryInterface.addColumn(
      { tableName: 'users', schema: 'auth' },
      'created_by',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que creó este registro'
      }
    );

    await queryInterface.addColumn(
      { tableName: 'users', schema: 'auth' },
      'updated_by',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que realizó la última modificación'
      }
    );

    await queryInterface.addColumn(
      { tableName: 'users', schema: 'auth' },
      'deleted_at',
      {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación lógica. NULL indica que el registro está activo'
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn({ tableName: 'users', schema: 'auth' }, 'deleted_at');
    await queryInterface.removeColumn({ tableName: 'users', schema: 'auth' }, 'updated_by');
    await queryInterface.removeColumn({ tableName: 'users', schema: 'auth' }, 'created_by');
    await queryInterface.removeColumn({ tableName: 'users', schema: 'auth' }, 'must_change_password');
  }
};
