'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Crear esquema suppliers si no existe
        await queryInterface.sequelize.query(
            `CREATE SCHEMA IF NOT EXISTS suppliers;`
        );

        // 2. Crear tabla suppliers.suppliers
        await queryInterface.createTable('suppliers', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                comment: 'ID único del proveedor'
            },

            trade_name: {
                type: Sequelize.STRING(150),
                allowNull: false,
                comment: 'Nombre comercial / marca'
            },

            legal_name: {
                type: Sequelize.STRING(200),
                allowNull: true,
                comment: 'Razón social'
            },

            ruc: {
                type: Sequelize.STRING(20),
                allowNull: false,
                unique: true,
                comment: 'Número de RUC único'
            },

            address: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Dirección del proveedor'
            },

            phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
                comment: 'Teléfono principal'
            },

            email: {
                type: Sequelize.STRING(150),
                allowNull: true,
                comment: 'Correo electrónico principal'
            },

            website: {
                type: Sequelize.STRING(255),
                allowNull: true,
                comment: 'Sitio web'
            },

            payment_terms: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'contado',
                comment: 'Condiciones de pago'
            },

            bank_name: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Nombre del banco'
            },

            bank_account: {
                type: Sequelize.STRING(50),
                allowNull: true,
                comment: 'Número de cuenta bancaria'
            },

            bank_account_type: {
                type: Sequelize.STRING(30),
                allowNull: true,
                comment: 'Tipo de cuenta: ahorros, corriente'
            },

            quality_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: true,
                comment: 'Promedio calificaciones de calidad (0-5)'
            },

            punctuality_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: true,
                comment: 'Promedio calificaciones de puntualidad (0-5)'
            },

            overall_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: true,
                comment: 'Calificación general promedio (0-5)'
            },

            evaluations_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Total de evaluaciones realizadas'
            },

            status: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'active',
                comment: 'Estado: active, inactive, suspended'
            },

            status_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Motivo del cambio de estado'
            },

            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Observaciones generales'
            },

            created_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'ID del usuario creador'
            },

            updated_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'ID del usuario actualizador'
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },

            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Soft delete'
            }
        }, {
            schema: 'suppliers',
            comment: 'Proveedores de la empresa'
        });

        // 3. Crear tabla suppliers.supplier_contacts
        await queryInterface.createTable('supplier_contacts', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                comment: 'ID único del contacto'
            },

            supplier_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: { tableName: 'suppliers', schema: 'suppliers' }, key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'FK al proveedor'
            },

            name: {
                type: Sequelize.STRING(150),
                allowNull: false,
                comment: 'Nombre del contacto'
            },

            position: {
                type: Sequelize.STRING(100),
                allowNull: true,
                comment: 'Cargo del contacto'
            },

            phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
                comment: 'Teléfono del contacto'
            },

            email: {
                type: Sequelize.STRING(150),
                allowNull: true,
                comment: 'Email del contacto'
            },

            is_primary: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Contacto principal del proveedor'
            },

            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Observaciones del contacto'
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            }
        }, {
            schema: 'suppliers',
            comment: 'Contactos de proveedores'
        });

        // 4. Crear tabla suppliers.supplier_evaluations
        await queryInterface.createTable('supplier_evaluations', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                comment: 'ID único de la evaluación'
            },

            supplier_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: { tableName: 'suppliers', schema: 'suppliers' }, key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'FK al proveedor'
            },

            quality_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: false,
                comment: 'Calificación de calidad (1-5)'
            },

            punctuality_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: false,
                comment: 'Calificación de puntualidad (1-5)'
            },

            overall_rating: {
                type: Sequelize.DECIMAL(3, 2),
                allowNull: false,
                comment: 'Promedio general de la evaluación'
            },

            observations: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Observaciones de la evaluación'
            },

            evaluated_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                comment: 'ID del usuario evaluador'
            },

            purchase_reference: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'ID de la compra relacionada (opcional)'
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            }
        }, {
            schema: 'suppliers',
            comment: 'Evaluaciones de proveedores'
        });

        // 5. Crear índices — tabla debe ser { tableName, schema } para schemas no-public
        await queryInterface.addIndex(
            { tableName: 'suppliers', schema: 'suppliers' },
            ['ruc'],
            { unique: true, name: 'suppliers_ruc_unique' }
        );
        await queryInterface.addIndex(
            { tableName: 'suppliers', schema: 'suppliers' },
            ['trade_name'],
            { name: 'suppliers_trade_name_idx' }
        );
        await queryInterface.addIndex(
            { tableName: 'suppliers', schema: 'suppliers' },
            ['status'],
            { name: 'suppliers_status_idx' }
        );
        await queryInterface.addIndex(
            { tableName: 'suppliers', schema: 'suppliers' },
            ['overall_rating'],
            { name: 'suppliers_overall_rating_idx' }
        );

        await queryInterface.addIndex(
            { tableName: 'supplier_contacts', schema: 'suppliers' },
            ['supplier_id'],
            { name: 'supplier_contacts_supplier_id_idx' }
        );
        await queryInterface.addIndex(
            { tableName: 'supplier_contacts', schema: 'suppliers' },
            ['is_primary'],
            { name: 'supplier_contacts_is_primary_idx' }
        );

        await queryInterface.addIndex(
            { tableName: 'supplier_evaluations', schema: 'suppliers' },
            ['supplier_id'],
            { name: 'supplier_evaluations_supplier_id_idx' }
        );
        await queryInterface.addIndex(
            { tableName: 'supplier_evaluations', schema: 'suppliers' },
            ['evaluated_by'],
            { name: 'supplier_evaluations_evaluated_by_idx' }
        );
        await queryInterface.addIndex(
            { tableName: 'supplier_evaluations', schema: 'suppliers' },
            ['created_at'],
            { name: 'supplier_evaluations_created_at_idx' }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable({ tableName: 'supplier_evaluations', schema: 'suppliers' });
        await queryInterface.dropTable({ tableName: 'supplier_contacts', schema: 'suppliers' });
        await queryInterface.dropTable({ tableName: 'suppliers', schema: 'suppliers' });
        await queryInterface.sequelize.query(`DROP SCHEMA IF EXISTS suppliers CASCADE;`);
    }
};
