'use strict';

/**
 * Migración: Crear tablas del módulo de recepción de mercancía
 * Sprint 10 - Recepción de Mercancía
 *
 * Tablas:
 * - receptions.receptions
 * - receptions.reception_details
 * - receptions.discrepancies
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS receptions;');

    // Tabla: receptions (recepciones principales)
    await queryInterface.createTable('receptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      purchase_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'purchase_orders', schema: 'purchases' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Orden de compra asociada'
      },
      reception_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
        comment: 'Número de recepción autogenerado (REC-YYYYMMDD-XXXX)'
      },
      reception_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_DATE'),
        comment: 'Fecha de recepción'
      },
      status: {
        type: Sequelize.ENUM('en_proceso', 'parcial', 'completa', 'cancelada'),
        allowNull: false,
        defaultValue: 'en_proceso',
        comment: 'Estado de la recepción'
      },
      total_items_expected: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de ítems esperados'
      },
      total_items_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Total de ítems efectivamente recibidos'
      },
      has_discrepancies: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si hay discrepancias reportadas'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones de la recepción'
      },
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha/hora de confirmación final'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      schema: 'receptions',
      comment: 'Recepciones de mercancía'
    });

    // Tabla: reception_details (detalle de productos por recepción)
    await queryInterface.createTable('reception_details', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reception_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'receptions', schema: 'receptions' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Recepción asociada'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'products', schema: 'products' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Producto recibido'
      },
      quantity_expected: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad esperada según orden'
      },
      quantity_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad efectivamente recibida'
      },
      unit_received: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Unidad de medida recibida'
      },
      status: {
        type: Sequelize.ENUM('pendiente', 'parcial', 'completa', 'exceso'),
        allowNull: false,
        defaultValue: 'pendiente',
        comment: 'Estado del detalle respecto a lo esperado'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones del detalle'
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
      schema: 'receptions',
      comment: 'Detalles de productos recibidos'
    });

    // Tabla: discrepancies (discrepancias reportadas)
    await queryInterface.createTable('discrepancies', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reception_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'receptions', schema: 'receptions' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Recepción donde se reportó la discrepancia'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'products', schema: 'products' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Producto con discrepancia'
      },
      quantity_expected: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad esperada'
      },
      quantity_received: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Cantidad recibida'
      },
      discrepancy_type: {
        type: Sequelize.ENUM('faltante', 'sobrante', 'dañado', 'otro'),
        allowNull: false,
        comment: 'Tipo de discrepancia'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripciones de la discrepancia'
      },
      resolved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si la discrepancia fue resuelta'
      },
      resolution_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notas sobre cómo se resolvió'
      },
      reported_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Usuario que reportó la discrepancia'
      },
      reported_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha/hora del reporte'
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha/hora de resolución'
      }
    }, {
      schema: 'receptions',
      comment: 'Discrepancias en recepciones'
    });

    // Índices
    await queryInterface.addIndex(
      { tableName: 'receptions', schema: 'receptions' },
      ['purchase_order_id'],
      { name: 'receptions_purchase_order_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'receptions', schema: 'receptions' },
      ['reception_number'],
      { unique: true, name: 'receptions_number_unique' }
    );
    await queryInterface.addIndex(
      { tableName: 'receptions', schema: 'receptions' },
      ['status'],
      { name: 'receptions_status_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'receptions', schema: 'receptions' },
      ['reception_date'],
      { name: 'receptions_date_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'reception_details', schema: 'receptions' },
      ['reception_id'],
      { name: 'reception_details_reception_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'reception_details', schema: 'receptions' },
      ['product_id'],
      { name: 'reception_details_product_id_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'discrepancies', schema: 'receptions' },
      ['reception_id'],
      { name: 'discrepancies_reception_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'discrepancies', schema: 'receptions' },
      ['product_id'],
      { name: 'discrepancies_product_id_idx' }
    );
    await queryInterface.addIndex(
      { tableName: 'discrepancies', schema: 'receptions' },
      ['reported_by'],
      { name: 'discrepancies_reported_by_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'discrepancies', schema: 'receptions' });
    await queryInterface.dropTable({ tableName: 'reception_details', schema: 'receptions' });
    await queryInterface.dropTable({ tableName: 'receptions', schema: 'receptions' });

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS receptions.enum_receptions_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS receptions.enum_reception_details_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS receptions.enum_discrepancies_discrepancy_type;');
  }
};
