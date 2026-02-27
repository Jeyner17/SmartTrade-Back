'use strict';

/**
 * Seeder: Datos iniciales de categorías
 *
 * Inserta una estructura de ejemplo para demostrar la jerarquía:
 *   Bebidas (raíz)
 *     └── Bebidas Calientes   (nivel 1)
 *     └── Bebidas Frías       (nivel 1)
 *   Alimentos (raíz)
 *     └── Lácteos             (nivel 1)
 *     └── Panadería           (nivel 1)
 *   Tecnología (raíz)
 *     └── Celulares           (nivel 1)
 *     └── Accesorios          (nivel 1)
 *         └── Fundas          (nivel 2)
 *
 * Sprint 5 - Gestión de Categorías
 */
module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // ============================================
    // 1. INSERTAR CATEGORÍAS RAÍZ (nivel 0)
    // ============================================
    await queryInterface.bulkInsert(
      { tableName: 'categories', schema: 'categories' },
      [
        {
          name:        'Bebidas',
          description: 'Bebidas calientes y frías',
          parent_id:   null,
          level:       0,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Alimentos',
          description: 'Productos alimenticios en general',
          parent_id:   null,
          level:       0,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Tecnología',
          description: 'Dispositivos electrónicos y accesorios',
          parent_id:   null,
          level:       0,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        }
      ],
      {}
    );

    // ============================================
    // 2. OBTENER IDs DE LAS RAÍCES
    // ============================================
    const [roots] = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories.categories WHERE parent_id IS NULL AND deleted_at IS NULL ORDER BY id ASC`
    );

    const idOf = (name) => {
      const found = roots.find(r => r.name === name);
      if (!found) throw new Error(`Categoría raíz "${name}" no encontrada`);
      return found.id;
    };

    const idBebidas     = idOf('Bebidas');
    const idAlimentos   = idOf('Alimentos');
    const idTecnologia  = idOf('Tecnología');

    // ============================================
    // 3. INSERTAR SUBCATEGORÍAS NIVEL 1
    // ============================================
    await queryInterface.bulkInsert(
      { tableName: 'categories', schema: 'categories' },
      [
        // Hijos de Bebidas
        {
          name:        'Bebidas Calientes',
          description: 'Café, té, chocolate caliente',
          parent_id:   idBebidas,
          level:       1,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Bebidas Frías',
          description: 'Jugos, refrescos, agua',
          parent_id:   idBebidas,
          level:       1,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        // Hijos de Alimentos
        {
          name:        'Lácteos',
          description: 'Leche, queso, yogur',
          parent_id:   idAlimentos,
          level:       1,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Panadería',
          description: 'Pan, galletas, pasteles',
          parent_id:   idAlimentos,
          level:       1,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        // Hijos de Tecnología
        {
          name:        'Celulares',
          description: 'Teléfonos inteligentes y básicos',
          parent_id:   idTecnologia,
          level:       1,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        },
        {
          name:        'Accesorios',
          description: 'Fundas, cables, cargadores',
          parent_id:   idTecnologia,
          level:       1,
          is_active:   true,
          created_at:  now,
          updated_at:  now
        }
      ],
      {}
    );

    // ============================================
    // 4. OBTENER ID DE ACCESORIOS PARA NIVEL 2
    // ============================================
    const [nivel1] = await queryInterface.sequelize.query(
      `SELECT id, name FROM categories.categories WHERE parent_id IS NOT NULL AND level = 1 AND deleted_at IS NULL ORDER BY id ASC`
    );

    const idAccesorios = nivel1.find(r => r.name === 'Accesorios')?.id;

    if (idAccesorios) {
      // ============================================
      // 5. INSERTAR SUBCATEGORÍAS NIVEL 2
      // ============================================
      await queryInterface.bulkInsert(
        { tableName: 'categories', schema: 'categories' },
        [
          {
            name:        'Fundas',
            description: 'Fundas y protectores para celulares',
            parent_id:   idAccesorios,
            level:       2,
            is_active:   true,
            created_at:  now,
            updated_at:  now
          },
          {
            name:        'Cables y Cargadores',
            description: 'Cables USB, cargadores rápidos',
            parent_id:   idAccesorios,
            level:       2,
            is_active:   true,
            created_at:  now,
            updated_at:  now
          }
        ],
        {}
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete(
      { tableName: 'categories', schema: 'categories' },
      null,
      {}
    );
  }
};
