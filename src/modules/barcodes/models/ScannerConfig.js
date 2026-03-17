const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const { SCANNER_TYPES, BARCODE_FORMATS } = require('../../../shared/constants/barcodes.constants');

const SCHEMA = DB_SCHEMAS.BARCODES;

/**
 * Modelo ScannerConfig — Configuraciones del escáner por usuario
 * Tabla: barcodes.scanner_configs
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 */
module.exports = (sequelize) => {
    const ScannerConfig = sequelize.define('ScannerConfig', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único de la configuración'
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            field: 'user_id',
            comment: 'ID del usuario (una configuración por usuario)'
        },

        scannerType: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'camera',
            field: 'scanner_type',
            validate: {
                isIn: {
                    args: [SCANNER_TYPES],
                    msg: `Tipo de escáner inválido. Valores: ${SCANNER_TYPES.join(', ')}`
                }
            },
            comment: 'Tipo de escáner: camera | device'
        },

        allowedFormats: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: ['EAN_13', 'EAN_8', 'CODE_128', 'QR_CODE'],
            field: 'allowed_formats',
            comment: 'Formatos de código permitidos (array JSON)'
        },

        settings: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {},
            comment: 'Configuraciones adicionales en formato JSON libre'
        }
    }, {
        tableName: 'scanner_configs',
        schema: SCHEMA,
        timestamps: true,
        underscored: true,

        indexes: [
            { unique: true, fields: ['user_id'], name: 'scanner_configs_user_id_unique' }
        ],

        comment: 'Configuraciones del escáner por usuario'
    });

    ScannerConfig.SCANNER_TYPES = SCANNER_TYPES;
    ScannerConfig.BARCODE_FORMATS = BARCODE_FORMATS;

    return ScannerConfig;
};
