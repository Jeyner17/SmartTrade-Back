'use strict';

/**
 * Seeder: Datos iniciales de productos
 *
 * Inserta 7 productos de ejemplo vinculados a las categorías del Sprint 5.
 * Stock variado para que la grilla y tabla se vean completas.
 * Sprint 6 - Gestión de Productos
 */
module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // ============================================
    // OBTENER IDs DE CATEGORÍAS
    // ============================================
    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories.categories WHERE deleted_at IS NULL ORDER BY id ASC`
    );

    const catId = (name) => categories.find(c => c.name === name)?.id ?? null;

    const idBebidas        = catId('Bebidas');
    const idBebCalientes   = catId('Bebidas Calientes');
    const idBebFrias       = catId('Bebidas Frías');
    const idAlimentos      = catId('Alimentos');
    const idLacteos        = catId('Lácteos');
    const idTecnologia     = catId('Tecnología');
    const idCelulares      = catId('Celulares');

    // ============================================
    // INSERTAR PRODUCTOS
    // ============================================
    await queryInterface.bulkInsert(
      { tableName: 'products', schema: 'products' },
      [
        {
          name:        'Café Molido Premium 500g',
          description: 'Café de altura 100% arábica, tostado oscuro, molido fino',
          sku:         'CAF-001',
          barcode:     '7800000000001',
          price:       8.50,
          cost:        4.20,
          tax_percent: 0,      // alimentos básicos sin IVA
          stock:       45,
          category_id: idBebCalientes,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Jugo de Naranja Natural 1L',
          description: 'Jugo de naranja exprimido, sin preservantes, refrigerado',
          sku:         'JUG-001',
          barcode:     '7800000000002',
          price:       2.75,
          cost:        1.30,
          tax_percent: 0,
          stock:       80,
          category_id: idBebFrias,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Agua Mineral 500ml',
          description: 'Agua mineral natural sin gas',
          sku:         'AGU-001',
          barcode:     '7800000000003',
          price:       0.60,
          cost:        0.25,
          tax_percent: 0,
          stock:       200,
          category_id: idBebFrias,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Leche Entera 1L',
          description: 'Leche de vaca pasteurizada, entera, sin lactosa',
          sku:         'LEC-001',
          barcode:     '7800000000004',
          price:       1.20,
          cost:        0.75,
          tax_percent: 0,
          stock:       120,
          category_id: idLacteos,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Queso Mozzarella 400g',
          description: 'Queso mozzarella fresco, ideal para pizzas y ensaladas',
          sku:         'QUE-001',
          barcode:     '7800000000005',
          price:       4.90,
          cost:        2.80,
          tax_percent: 0,
          stock:       35,
          category_id: idLacteos,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Smartphone Samsung Galaxy A15',
          description: 'Pantalla 6.5", 128GB almacenamiento, 4GB RAM, cámara 50MP',
          sku:         'CEL-001',
          barcode:     '7800000000006',
          price:       299.99,
          cost:        195.00,
          tax_percent: 15,
          stock:       12,
          category_id: idCelulares,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Auriculares Bluetooth TWS',
          description: 'Auriculares inalámbricos con cancelación de ruido, 24h batería',
          sku:         'AUR-001',
          barcode:     '7800000000007',
          price:       45.00,
          cost:        22.50,
          tax_percent: 15,
          stock:       28,
          category_id: idTecnologia,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        }
      ],
      {}
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete(
      { tableName: 'products', schema: 'products' },
      null,
      {}
    );
  }
};
