const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.RECEPTIONS;

/**
 * Modelo Discrepancy - Discrepancias de Recepción
 * Tabla: receptions.discrepancies
 * Sprint 10 - Recepción de Mercancía
 */
module.exports = (sequelize) => {
	const Discrepancy = sequelize.define('Discrepancy', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			comment: 'ID único de la discrepancia'
		},

		receptionId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'reception_id',
			comment: 'Recepción donde se reportó'
		},

		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'product_id',
			comment: 'Producto con discrepancia'
		},

		quantityExpected: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'quantity_expected',
			comment: 'Cantidad esperada'
		},

		quantityReceived: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'quantity_received',
			comment: 'Cantidad recibida'
		},

		discrepancyType: {
			type: DataTypes.ENUM('faltante', 'sobrante', 'dañado', 'otro'),
			allowNull: false,
			field: 'discrepancy_type',
			comment: 'Tipo de discrepancia'
		},

		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Descripción de la discrepancia'
		},

		resolved: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			comment: 'Indica si fue resuelta'
		},

		resolutionNotes: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'resolution_notes',
			comment: 'Notas sobre la resolución'
		},

		reportedBy: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'reported_by',
			comment: 'Usuario que reportó'
		},

		reportedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			field: 'reported_at',
			defaultValue: DataTypes.NOW,
			comment: 'Fecha del reporte'
		},

		resolvedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'resolved_at',
			comment: 'Fecha de resolución'
		}
	}, {
		tableName: 'discrepancies',
		schema: SCHEMA,
		timestamps: false,
		underscored: true,
		paranoid: false,

		indexes: [
			{ fields: ['reception_id'], name: 'discrepancies_reception_id_idx' },
			{ fields: ['product_id'], name: 'discrepancies_product_id_idx' },
			{ fields: ['reported_by'], name: 'discrepancies_reported_by_idx' }
		],

		comment: 'Discrepancias reportadas en recepciones'
	});

	return Discrepancy;
};
