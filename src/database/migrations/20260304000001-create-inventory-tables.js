'use strict';

/**
 * Migración: Creación de Tablas del Módulo Inventario
 * Sprint 7 - Gestión de Inventario
 * 
 * Tablas:
 * - inventory.stock_movements: Movimientos de entrada/salida de stock
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear esquema si no existe
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS inventory;');

    // ============================================
    // TABLA: stock_movements
    // ============================================
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único del movimiento'
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del producto (FK a products.products)',
        references: {
          model: { tableName: 'products', schema: 'products' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      movement_type: {
        type: Sequelize.ENUM('entrada', 'salida', 'ajuste', 'inicial'),
        allowNull: false,
        comment: 'Tipo de movimiento: entrada, salida, ajuste, inicial'
      },

      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad movida (positiva para entrada, valor absoluto)'
      },

      stock_before: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Stock antes del movimiento'
      },

      stock_after: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Stock después del movimiento'
      },

      reason: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Motivo del movimiento: compra, venta, devolución, ajuste_inventario, merma, etc.'
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones adicionales del movimiento'
      },

      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Tipo de referencia: purchase, sale, adjustment, etc.'
      },

      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID de la referencia (venta, compra, etc.)'
      },

      performed_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que realizó el movimiento',
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de creación del registro'
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha de última actualización'
      }
    }, {
      schema: 'inventory',
      comment: 'Registro de movimientos de inventario (entradas, salidas, ajustes)'
    });

    // Índices para mejorar el rendimiento
    await queryInterface.addIndex(
      { tableName: 'stock_movements', schema: 'inventory' },
      ['product_id'],
      { name: 'stock_movements_product_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'stock_movements', schema: 'inventory' },
      ['movement_type'],
      { name: 'stock_movements_type_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'stock_movements', schema: 'inventory' },
      ['created_at'],
      { name: 'stock_movements_created_at_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'stock_movements', schema: 'inventory' },
      ['reference_type', 'reference_id'],
      { name: 'stock_movements_reference_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'stock_movements', schema: 'inventory' },
      ['performed_by'],
      { name: 'stock_movements_performed_by_idx' }
    );

    // ============================================
    // AGREGAR CAMPOS A TABLA PRODUCTS
    // ============================================
    // Agregar campos de stock mínimo, máximo y ubicación
    await queryInterface.addColumn(
      { tableName: 'products', schema: 'products' },
      'min_stock',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stock mínimo para alertas'
      }
    );

    await queryInterface.addColumn(
      { tableName: 'products', schema: 'products' },
      'max_stock',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock máximo recomendado'
      }
    );

    await queryInterface.addColumn(
      { tableName: 'products', schema: 'products' },
      'location',
      {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Ubicación física en bodega (ej: A-1-3)'
      }
    );

    // Índice para productos con stock bajo
    await queryInterface.sequelize.query(`
      CREATE INDEX products_low_stock_idx 
      ON products.products (stock) 
      WHERE stock <= min_stock AND is_active = true;
    `);

    console.log('✅ Tablas de inventario creadas exitosamente');
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índice de productos con stock bajo
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS products.products_low_stock_idx;');

    // Eliminar columnas agregadas a products
    await queryInterface.removeColumn({ tableName: 'products', schema: 'products' }, 'location');
    await queryInterface.removeColumn({ tableName: 'products', schema: 'products' }, 'max_stock');
    await queryInterface.removeColumn({ tableName: 'products', schema: 'products' }, 'min_stock');

    // Eliminar tabla stock_movements
    await queryInterface.dropTable({ tableName: 'stock_movements', schema: 'inventory' });

    // Eliminar ENUM
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS inventory.enum_stock_movements_movement_type;');

    console.log('✅ Tablas de inventario eliminadas');
  }
};
