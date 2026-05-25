'use strict';

/**
 * Agrega el saldo posterior al pago en credit_payments.
 * Permite guardar el saldo calculado al momento de registrar cada pago.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn({ tableName: 'credit_payments', schema: 'credits' }, 'balance_after', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Saldo del credito despues de aplicar este pago'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn({ tableName: 'credit_payments', schema: 'credits' }, 'balance_after');
  }
};