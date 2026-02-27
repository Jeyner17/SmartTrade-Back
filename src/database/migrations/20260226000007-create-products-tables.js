'use strict';

/**
 * Migración: Crear tablas del módulo de productos
 *
 * 1. products.products     — Catálogo de productos
 * 2. products.price_history — Historial de cambios de precio
 *
 * Sprint 6 - Gestión de Productos
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear el esquema si no existe
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS products;');

    // ============================================
    // TABLA: products.products
    // ============================================
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Nombre del producto'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del producto'
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Código interno SKU'
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'Código de barras del producto'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio de venta al público'
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Costo de adquisición'
      },
      tax_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 15,
        comment: 'Porcentaje de IVA (default 15% Ecuador)'
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la imagen del producto'
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stock disponible (actualizado por módulo Inventario)'
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'categories', schema: 'categories' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Categoría a la que pertenece el producto'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el producto está activo en el catálogo'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que creó el registro'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que actualizó el registro'
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
      schema: 'products'
    });

    // Índices de products
    await queryInterface.addIndex(
      { tableName: 'products', schema: 'products' },
      ['sku'],
      { unique: true, name: 'products_sku_unique', where: { sku: { [Sequelize.Op.ne]: null } } }
    );
    await queryInterface.addIndex(
      { tableName: 'products', schema: 'products' },
      ['barcode'],
      { unique: true, name: 'products_barcode_unique', where: { barcode: { [Sequelize.Op.ne]: null } } }
    );
    await queryInterface.addIndex(
      { tableName: 'products', schema: 'products' },
      ['category_id'],
      { name: 'products_category_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'products', schema: 'products' },
      ['is_active'],
      { name: 'products_is_active_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'products', schema: 'products' },
      ['name'],
      { name: 'products_name_idx' }
    );

    // ============================================
    // TABLA: products.price_history
    // ============================================
    await queryInterface.createTable('price_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'products', schema: 'products' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del producto cuyo precio cambió'
      },
      previous_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio antes del cambio'
      },
      new_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio después del cambio'
      },
      reason: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Motivo del cambio de precio'
      },
      changed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que realizó el cambio'
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
      schema: 'products'
    });

    // Índices de price_history
    await queryInterface.addIndex(
      { tableName: 'price_history', schema: 'products' },
      ['product_id'],
      { name: 'price_history_product_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'price_history', schema: 'products' },
      ['changed_by'],
      { name: 'price_history_changed_by_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'price_history', schema: 'products' });
    await queryInterface.dropTable({ tableName: 'products',      schema: 'products' });
  }
};
