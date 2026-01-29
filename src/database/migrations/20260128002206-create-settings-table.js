'use strict';

/**
 * Migración: Crear tabla de configuración del sistema
 * Sprint 1 - Configuración del Sistema
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear esquema si no existe
    await queryInterface.sequelize.query(
      'CREATE SCHEMA IF NOT EXISTS settings;'
    );
    
    // Crear tabla settings
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único de la configuración'
      },
      
      config_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Tipo de configuración (company, fiscal, business, technical, backup)'
      },
      
      config_data: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
        comment: 'Datos de configuración en formato JSON'
      },
      
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la configuración está activa'
      },
      
      last_modified_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que modificó por última vez'
      },
      
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación'
      },
      
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de última actualización'
      }
    }, {
      schema: 'settings',
      comment: 'Tabla de configuración del sistema'
    });

    // Crear índices
    await queryInterface.addIndex(
      { tableName: 'settings', schema: 'settings' },
      ['config_type'],
      {
        unique: true,
        name: 'settings_config_type_unique'
      }
    );

    await queryInterface.addIndex(
      { tableName: 'settings', schema: 'settings' },
      ['is_active'],
      {
        name: 'settings_is_active_idx'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar tabla
    await queryInterface.dropTable({ tableName: 'settings', schema: 'settings' });
  }
};