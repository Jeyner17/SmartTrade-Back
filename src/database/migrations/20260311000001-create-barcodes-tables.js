'use strict';

/**
 * Migración: Crear tablas del módulo de Códigos de Barras/QR
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 *
 * Tablas creadas:
 * - barcodes.scan_logs       → Historial de escaneos
 * - barcodes.scanner_configs → Configuraciones del escáner por usuario
 */

module.exports = {
    async up(queryInterface, Sequelize) {

        // ============================================
        // 1. CREAR ESQUEMA barcodes
        // ============================================
        await queryInterface.sequelize.query(
            `CREATE SCHEMA IF NOT EXISTS barcodes;`
        );

        // ============================================
        // 2. TABLA: barcodes.scan_logs
        //    Historial de todos los escaneos realizados
        // ============================================
        await queryInterface.createTable(
            { schema: 'barcodes', tableName: 'scan_logs' },
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    comment: 'ID único del registro de escaneo'
                },

                // Datos del código escaneado
                code: {
                    type: Sequelize.STRING(255),
                    allowNull: false,
                    comment: 'Valor del código escaneado'
                },

                code_type: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    defaultValue: 'barcode',
                    comment: 'Tipo: barcode | qr'
                },

                context: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                    defaultValue: 'consulta',
                    comment: 'Contexto de uso: venta | recepcion | consulta'
                },

                // Resultado del escaneo
                result_type: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    defaultValue: 'not_found',
                    comment: 'Resultado: found | not_found | error'
                },

                product_id: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    comment: 'ID del producto encontrado (si aplica)'
                },

                result_data: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                    defaultValue: null,
                    comment: 'Datos adicionales del resultado (JSON)'
                },

                // Auditoría
                performed_by: {
                    type: Sequelize.INTEGER,
                    allowNull: true,
                    comment: 'ID del usuario que realizó el escaneo'
                },

                scanned_at: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                    comment: 'Fecha y hora del escaneo'
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
            }
        );

        // Índices para scan_logs
        await queryInterface.addIndex(
            { schema: 'barcodes', tableName: 'scan_logs' },
            ['code'],
            { name: 'scan_logs_code_idx' }
        );
        await queryInterface.addIndex(
            { schema: 'barcodes', tableName: 'scan_logs' },
            ['performed_by'],
            { name: 'scan_logs_performed_by_idx' }
        );
        await queryInterface.addIndex(
            { schema: 'barcodes', tableName: 'scan_logs' },
            ['product_id'],
            { name: 'scan_logs_product_id_idx' }
        );
        await queryInterface.addIndex(
            { schema: 'barcodes', tableName: 'scan_logs' },
            ['scanned_at'],
            { name: 'scan_logs_scanned_at_idx' }
        );
        await queryInterface.addIndex(
            { schema: 'barcodes', tableName: 'scan_logs' },
            ['context'],
            { name: 'scan_logs_context_idx' }
        );

        // ============================================
        // 3. TABLA: barcodes.scanner_configs
        //    Configuraciones del escáner por usuario
        // ============================================
        await queryInterface.createTable(
            { schema: 'barcodes', tableName: 'scanner_configs' },
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    comment: 'ID único de la configuración'
                },

                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    unique: true,
                    comment: 'ID del usuario (una configuración por usuario)'
                },

                scanner_type: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    defaultValue: 'camera',
                    comment: 'Tipo de escáner: camera | device'
                },

                allowed_formats: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                    defaultValue: ['EAN_13', 'EAN_8', 'CODE_128', 'QR_CODE'],
                    comment: 'Formatos de código permitidos (array JSON)'
                },

                settings: {
                    type: Sequelize.JSONB,
                    allowNull: true,
                    defaultValue: {},
                    comment: 'Configuraciones adicionales (JSON libre)'
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
            }
        );

        // Índice para scanner_configs
        await queryInterface.addIndex(
            { schema: 'barcodes', tableName: 'scanner_configs' },
            ['user_id'],
            { unique: true, name: 'scanner_configs_user_id_unique' }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable({ schema: 'barcodes', tableName: 'scanner_configs' });
        await queryInterface.dropTable({ schema: 'barcodes', tableName: 'scan_logs' });
        await queryInterface.sequelize.query(`DROP SCHEMA IF EXISTS barcodes CASCADE;`);
    }
};
