const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SUPPLIERS;

const SUPPLIER_STATUS = ['active', 'inactive', 'suspended'];
const PAYMENT_TERMS = ['contado', 'credito_15', 'credito_30', 'credito_60', 'credito_90'];

/**
 * Modelo Supplier - Proveedores del sistema
 * Tabla: suppliers.suppliers
 * Sprint 8 - Gestión de Proveedores
 */
module.exports = (sequelize) => {
    const Supplier = sequelize.define('Supplier', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único del proveedor'
        },

        tradeName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            field: 'trade_name',
            validate: { notEmpty: { msg: 'El nombre comercial es requerido' } },
            comment: 'Nombre comercial / marca del proveedor'
        },

        legalName: {
            type: DataTypes.STRING(200),
            allowNull: true,
            field: 'legal_name',
            comment: 'Razón social del proveedor'
        },

        ruc: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: { notEmpty: { msg: 'El RUC es requerido' } },
            comment: 'Número de RUC único'
        },

        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Dirección del proveedor'
        },

        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Teléfono principal'
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            validate: { isEmail: { msg: 'Email inválido' } },
            comment: 'Correo electrónico principal'
        },

        website: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Sitio web del proveedor'
        },

        // Datos de pago
        paymentTerms: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'contado',
            field: 'payment_terms',
            validate: {
                isIn: {
                    args: [PAYMENT_TERMS],
                    msg: `Términos de pago inválidos. Valores: ${PAYMENT_TERMS.join(', ')}`
                }
            },
            comment: 'Condiciones de pago: contado, credito_15, credito_30, credito_60, credito_90'
        },

        bankName: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'bank_name',
            comment: 'Nombre del banco'
        },

        bankAccount: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'bank_account',
            comment: 'Número de cuenta bancaria'
        },

        bankAccountType: {
            type: DataTypes.STRING(30),
            allowNull: true,
            field: 'bank_account_type',
            comment: 'Tipo de cuenta: ahorros, corriente'
        },

        // Calificación / Evaluación
        qualityRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            field: 'quality_rating',
            validate: { min: 0, max: 5 },
            comment: 'Promedio de calificaciones de calidad (0-5)'
        },

        punctualityRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            field: 'punctuality_rating',
            validate: { min: 0, max: 5 },
            comment: 'Promedio de calificaciones de puntualidad (0-5)'
        },

        overallRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: true,
            field: 'overall_rating',
            validate: { min: 0, max: 5 },
            comment: 'Calificación general promedio (0-5)'
        },

        evaluationsCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'evaluations_count',
            comment: 'Total de evaluaciones realizadas'
        },

        // Estado
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'active',
            validate: {
                isIn: {
                    args: [SUPPLIER_STATUS],
                    msg: `Estado inválido. Valores: ${SUPPLIER_STATUS.join(', ')}`
                }
            },
            comment: 'Estado del proveedor: active, inactive, suspended'
        },

        statusReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'status_reason',
            comment: 'Motivo del cambio de estado'
        },

        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones generales del proveedor'
        },

        // Auditoría
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'created_by',
            comment: 'ID del usuario que creó el registro'
        },

        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'updated_by',
            comment: 'ID del usuario que actualizó el registro'
        }
    }, {
        tableName: 'suppliers',
        schema: SCHEMA,
        timestamps: true,
        underscored: true,
        paranoid: true,

        indexes: [
            { unique: true, fields: ['ruc'], name: 'suppliers_ruc_unique' },
            { fields: ['trade_name'], name: 'suppliers_trade_name_idx' },
            { fields: ['status'], name: 'suppliers_status_idx' },
            { fields: ['overall_rating'], name: 'suppliers_overall_rating_idx' }
        ],

        comment: 'Proveedores de la empresa'
    });

    Supplier.SUPPLIER_STATUS = SUPPLIER_STATUS;
    Supplier.PAYMENT_TERMS = PAYMENT_TERMS;

    return Supplier;
};
