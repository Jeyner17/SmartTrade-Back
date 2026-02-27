'use strict';

/**
 * Migración: Crear tabla categories.categories
 *
 * Almacena las categorías y subcategorías de productos.
 * Soporta jerarquía padre → hijo mediante auto-referencia (parent_id).
 * Sprint 5 - Gestión de Categorías
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear el esquema si no existe
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS categories;');

    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Nombre de la categoría'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción opcional de la categoría'
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'categories', schema: 'categories' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID de la categoría padre (null = categoría raíz)'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Nivel jerárquico: 0=raíz, 1=hijo, 2=nieto...'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si la categoría está activa'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que creó este registro'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que actualizó este registro'
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de eliminación lógica (soft delete)'
      }
    }, {
      schema: 'categories'
    });

    // Índices
    await queryInterface.addIndex(
      { tableName: 'categories', schema: 'categories' },
      ['parent_id'],
      { name: 'categories_parent_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'categories', schema: 'categories' },
      ['level'],
      { name: 'categories_level_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'categories', schema: 'categories' },
      ['is_active'],
      { name: 'categories_is_active_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'categories', schema: 'categories' },
      ['name'],
      { name: 'categories_name_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'categories', schema: 'categories' });
  }
};
