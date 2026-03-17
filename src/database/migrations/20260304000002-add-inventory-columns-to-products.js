'use strict';

/**
 * Migración correctiva: Agrega columnas de stock a products.products
 *
 * La migración 20260304000001-create-inventory-tables fue marcada como
 * ejecutada en SequelizeMeta pero los ADD COLUMN nunca se aplicaron.
 * Esta migración agrega las columnas faltantes de forma segura.
 */

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Agregar min_stock si no existe
        await queryInterface.sequelize.query(`
            ALTER TABLE products.products
            ADD COLUMN IF NOT EXISTS min_stock INTEGER NOT NULL DEFAULT 0;
        `);

        // Agregar max_stock si no existe
        await queryInterface.sequelize.query(`
            ALTER TABLE products.products
            ADD COLUMN IF NOT EXISTS max_stock INTEGER;
        `);

        // Agregar location si no existe
        await queryInterface.sequelize.query(`
            ALTER TABLE products.products
            ADD COLUMN IF NOT EXISTS location VARCHAR(100);
        `);

        // Agregar índice de stock bajo si no existe
        await queryInterface.sequelize.query(`
            CREATE INDEX IF NOT EXISTS products_low_stock_idx
            ON products.products (stock)
            WHERE stock <= min_stock AND is_active = true;
        `);

        console.log('✅ Columnas min_stock, max_stock y location agregadas a products.products');
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query('DROP INDEX IF EXISTS products.products_low_stock_idx;');
        await queryInterface.removeColumn({ tableName: 'products', schema: 'products' }, 'location');
        await queryInterface.removeColumn({ tableName: 'products', schema: 'products' }, 'max_stock');
        await queryInterface.removeColumn({ tableName: 'products', schema: 'products' }, 'min_stock');
        console.log('✅ Columnas eliminadas de products.products');
    }
};
