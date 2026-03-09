'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // =============================================
        // PROVEEDORES DE EJEMPLO
        // =============================================
        const now = new Date();

        const suppliers = await queryInterface.bulkInsert(
            { tableName: 'suppliers', schema: 'suppliers' },
            [
                {
                    trade_name: 'Distribuidora El Sol',
                    legal_name: 'EL SOL S.A.',
                    ruc: '0912345678001',
                    address: 'Av. Principal 123, Guayaquil',
                    phone: '0987654321',
                    email: 'ventas@distribuidoraelsol.com',
                    website: 'https://www.distribuidoraelsol.com',
                    payment_terms: 'credito_30',
                    bank_name: 'Banco Pichincha',
                    bank_account: '2200123456',
                    bank_account_type: 'corriente',
                    quality_rating: null,
                    punctuality_rating: null,
                    overall_rating: null,
                    evaluations_count: 0,
                    status: 'active',
                    status_reason: null,
                    notes: 'Proveedor principal de abarrotes y productos de primera necesidad',
                    created_by: 1,
                    updated_by: null,
                    created_at: now,
                    updated_at: now,
                    deleted_at: null
                },
                {
                    trade_name: 'TecnoInsumos',
                    legal_name: 'TECNOINSUMOS CIA. LTDA.',
                    ruc: '1791234567001',
                    address: 'Calle República 456, Quito',
                    phone: '0991234567',
                    email: 'contacto@tecnoinsumos.ec',
                    website: null,
                    payment_terms: 'credito_15',
                    bank_name: 'Banco Guayaquil',
                    bank_account: '4400987654',
                    bank_account_type: 'ahorros',
                    quality_rating: 4.50,
                    punctuality_rating: 4.00,
                    overall_rating: 4.25,
                    evaluations_count: 2,
                    status: 'active',
                    status_reason: null,
                    notes: 'Proveedor de equipos tecnológicos y accesorios',
                    created_by: 1,
                    updated_by: null,
                    created_at: now,
                    updated_at: now,
                    deleted_at: null
                },
                {
                    trade_name: 'Papelera Andina',
                    legal_name: 'PAPELERA ANDINA S.A.',
                    ruc: '0990123456001',
                    address: 'Parque Industrial, Cuenca',
                    phone: '0978563412',
                    email: 'pedidos@papeleraandina.com',
                    website: null,
                    payment_terms: 'contado',
                    bank_name: null,
                    bank_account: null,
                    bank_account_type: null,
                    quality_rating: null,
                    punctuality_rating: null,
                    overall_rating: null,
                    evaluations_count: 0,
                    status: 'inactive',
                    status_reason: 'Proveedor temporalmente suspendido por falta de stock',
                    notes: 'Suministros de oficina y papelería',
                    created_by: 1,
                    updated_by: 1,
                    created_at: now,
                    updated_at: now,
                    deleted_at: null
                }
            ],
            { returning: true }
        );

        // Obtener IDs insertados
        const insertedSuppliers = await queryInterface.sequelize.query(
            `SELECT id FROM suppliers.suppliers ORDER BY created_at DESC LIMIT 3`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (insertedSuppliers.length < 2) return;

        const [s1Id, s2Id] = insertedSuppliers.map(s => s.id).reverse();

        // =============================================
        // CONTACTOS DE PROVEEDORES
        // =============================================
        await queryInterface.bulkInsert(
            { tableName: 'supplier_contacts', schema: 'suppliers' },
            [
                {
                    supplier_id: s1Id,
                    name: 'Carlos Mendoza',
                    position: 'Gerente de Ventas',
                    phone: '0987001122',
                    email: 'c.mendoza@distribuidoraelsol.com',
                    is_primary: true,
                    notes: 'Contacto para pedidos mayores a $500',
                    created_at: now,
                    updated_at: now
                },
                {
                    supplier_id: s1Id,
                    name: 'Ana Lucía Torres',
                    position: 'Ejecutiva de Cuenta',
                    phone: '0987003344',
                    email: 'a.torres@distribuidoraelsol.com',
                    is_primary: false,
                    notes: 'Contacto para pedidos regulares',
                    created_at: now,
                    updated_at: now
                },
                {
                    supplier_id: s2Id,
                    name: 'Roberto Jiménez',
                    position: 'Director Comercial',
                    phone: '0991112233',
                    email: 'r.jimenez@tecnoinsumos.ec',
                    is_primary: true,
                    notes: null,
                    created_at: now,
                    updated_at: now
                }
            ]
        );

        // =============================================
        // EVALUACIONES DE PROVEEDOR 2 (TecnoInsumos)
        // =============================================
        await queryInterface.bulkInsert(
            { tableName: 'supplier_evaluations', schema: 'suppliers' },
            [
                {
                    supplier_id: s2Id,
                    quality_rating: 4.00,
                    punctuality_rating: 3.50,
                    overall_rating: 3.75,
                    observations: 'Buena calidad pero demora en la entrega',
                    evaluated_by: 1,
                    purchase_reference: null,
                    created_at: now,
                    updated_at: now
                },
                {
                    supplier_id: s2Id,
                    quality_rating: 5.00,
                    punctuality_rating: 4.50,
                    overall_rating: 4.75,
                    observations: 'Excelente servicio en el segundo pedido',
                    evaluated_by: 1,
                    purchase_reference: null,
                    created_at: now,
                    updated_at: now
                }
            ]
        );

        console.log('✅ Seeder suppliers: Proveedores, contactos y evaluaciones de ejemplo insertados correctamente.');
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete({ tableName: 'supplier_evaluations', schema: 'suppliers' }, null, {});
        await queryInterface.bulkDelete({ tableName: 'supplier_contacts', schema: 'suppliers' }, null, {});
        await queryInterface.bulkDelete({ tableName: 'suppliers', schema: 'suppliers' }, null, {});
        console.log('✅ Seeder suppliers: Datos de ejemplo eliminados correctamente.');
    }
};
