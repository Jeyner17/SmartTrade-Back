'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Actualizar registros existentes con valores antiguos al nuevo default 'transferencia'
        await queryInterface.sequelize.query(`
            UPDATE suppliers.suppliers
            SET payment_terms = 'transferencia'
            WHERE payment_terms IN ('contado', 'credito_15', 'credito_30', 'credito_60', 'credito_90');
        `);

        // 2. Cambiar el valor por defecto de la columna
        await queryInterface.changeColumn(
            { tableName: 'suppliers', schema: 'suppliers' },
            'payment_terms',
            {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'transferencia',
                comment: 'Forma de pago preferida: transferencia, cheque, efectivo'
            }
        );
    },

    async down(queryInterface, Sequelize) {
        // Revertir: volver al default anterior 'contado'
        await queryInterface.changeColumn(
            { tableName: 'suppliers', schema: 'suppliers' },
            'payment_terms',
            {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'contado',
                comment: 'Condiciones de pago: contado, credito_15, credito_30, credito_60, credito_90'
            }
        );

        // Nota: no se puede revertir automáticamente los datos ya que
        // no sabemos cuál era el valor original de cada registro.
    }
};
