'use strict';

/**
 * Migración: Agregar campos de IVA a la tabla purchase_orders
 * Sprint 10 - Correción de cálculo de IVA en órdenes de compra
 *
 * Tabla: purchases.purchase_orders
 * Campos agregados:
 * - iva_percent (porcentaje de IVA aplicado)
 * - iva_amount (monto del IVA calculado)
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      { tableName: 'purchase_orders', schema: 'purchases' },
      'iva_percent',
      {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Porcentaje de IVA aplicado'
      }
    );

    await queryInterface.addColumn(
      { tableName: 'purchase_orders', schema: 'purchases' },
      'iva_amount',
      {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Monto del IVA calculado'
      }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn(
      { tableName: 'purchase_orders', schema: 'purchases' },
      'iva_amount'
    );

    await queryInterface.removeColumn(
      { tableName: 'purchase_orders', schema: 'purchases' },
      'iva_percent'
    );
  }
};
