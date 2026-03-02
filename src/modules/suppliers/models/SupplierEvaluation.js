const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SUPPLIERS;

/**
 * Modelo SupplierEvaluation - Evaluaciones de proveedores
 * Tabla: suppliers.supplier_evaluations
 * Sprint 8 - Gestión de Proveedores
 */
module.exports = (sequelize) => {
    const SupplierEvaluation = sequelize.define('SupplierEvaluation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único de la evaluación'
        },

        supplierId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'supplier_id',
            comment: 'ID del proveedor evaluado'
        },

        qualityRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false,
            field: 'quality_rating',
            validate: {
                min: { args: [1], msg: 'La calificación de calidad debe ser entre 1 y 5' },
                max: { args: [5], msg: 'La calificación de calidad debe ser entre 1 y 5' }
            },
            comment: 'Calificación de calidad del proveedor (1-5)'
        },

        punctualityRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false,
            field: 'punctuality_rating',
            validate: {
                min: { args: [1], msg: 'La calificación de puntualidad debe ser entre 1 y 5' },
                max: { args: [5], msg: 'La calificación de puntualidad debe ser entre 1 y 5' }
            },
            comment: 'Calificación de puntualidad del proveedor (1-5)'
        },

        overallRating: {
            type: DataTypes.DECIMAL(3, 2),
            allowNull: false,
            field: 'overall_rating',
            comment: 'Promedio de la evaluación ((quality + punctuality) / 2)'
        },

        observations: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones o comentarios de la evaluación'
        },

        evaluatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'evaluated_by',
            comment: 'ID del usuario que realizó la evaluación'
        },

        purchaseReference: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'purchase_reference',
            comment: 'ID de la compra asociada a esta evaluación (opcional)'
        }
    }, {
        tableName: 'supplier_evaluations',
        schema: SCHEMA,
        timestamps: true,
        underscored: true,

        indexes: [
            { fields: ['supplier_id'], name: 'supplier_evaluations_supplier_id_idx' },
            { fields: ['evaluated_by'], name: 'supplier_evaluations_evaluated_by_idx' },
            { fields: ['created_at'], name: 'supplier_evaluations_created_at_idx' }
        ],

        comment: 'Evaluaciones de desempeño de proveedores'
    });

    return SupplierEvaluation;
};
