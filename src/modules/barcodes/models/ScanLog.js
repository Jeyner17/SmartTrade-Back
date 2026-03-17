const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const { BARCODE_TYPES, SCAN_CONTEXTS, SCAN_RESULTS } = require('../../../shared/constants/barcodes.constants');

const SCHEMA = DB_SCHEMAS.BARCODES;

/**
 * Modelo ScanLog — Historial de escaneos
 * Tabla: barcodes.scan_logs
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 */
module.exports = (sequelize) => {
    const ScanLog = sequelize.define('ScanLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único del registro de escaneo'
        },

        // Datos del código escaneado
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: { notEmpty: { msg: 'El código escaneado es requerido' } },
            comment: 'Valor del código escaneado'
        },

        codeType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'barcode',
            field: 'code_type',
            validate: {
                isIn: {
                    args: [BARCODE_TYPES],
                    msg: `Tipo de código inválido. Valores: ${BARCODE_TYPES.join(', ')}`
                }
            },
            comment: 'Tipo de código: barcode | qr'
        },

        context: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'consulta',
            validate: {
                isIn: {
                    args: [SCAN_CONTEXTS],
                    msg: `Contexto inválido. Valores: ${SCAN_CONTEXTS.join(', ')}`
                }
            },
            comment: 'Contexto de uso: venta | recepcion | consulta'
        },

        // Resultado del escaneo
        resultType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'not_found',
            field: 'result_type',
            validate: {
                isIn: {
                    args: [SCAN_RESULTS],
                    msg: `Resultado inválido. Valores: ${SCAN_RESULTS.join(', ')}`
                }
            },
            comment: 'Resultado del escaneo: found | not_found | error'
        },

        productId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'product_id',
            comment: 'ID del producto encontrado (si aplica)'
        },

        resultData: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: null,
            field: 'result_data',
            comment: 'Datos adicionales del resultado en formato JSON'
        },

        // Auditoría
        performedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'performed_by',
            comment: 'ID del usuario que realizó el escaneo'
        },

        scannedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'scanned_at',
            comment: 'Fecha y hora del escaneo'
        }
    }, {
        tableName: 'scan_logs',
        schema: SCHEMA,
        timestamps: true,
        underscored: true,

        indexes: [
            { fields: ['code'], name: 'scan_logs_code_idx' },
            { fields: ['performed_by'], name: 'scan_logs_performed_by_idx' },
            { fields: ['product_id'], name: 'scan_logs_product_id_idx' },
            { fields: ['scanned_at'], name: 'scan_logs_scanned_at_idx' },
            { fields: ['context'], name: 'scan_logs_context_idx' }
        ],

        comment: 'Historial de escaneos de códigos de barras y QR'
    });

    return ScanLog;
};
