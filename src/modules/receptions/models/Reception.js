const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.RECEPTIONS;

/**
 * Modelo Reception - Recepciones de Mercancía
 * Tabla: receptions.receptions
 * Sprint 10 - Recepción de Mercancía
 */
module.exports = (sequelize) => {
	const Reception = sequelize.define('Reception', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			comment: 'ID único de la recepción'
		},

		purchaseOrderId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'purchase_order_id',
			comment: 'Orden de compra asociada'
		},

		receptionNumber: {
			type: DataTypes.STRING(30),
			allowNull: false,
			unique: true,
			field: 'reception_number',
			comment: 'Número de recepción autogenerado'
		},

		receptionDate: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			field: 'reception_date',
			comment: 'Fecha de recepción'
		},

		status: {
			type: DataTypes.ENUM('en_proceso', 'parcial', 'completa', 'cancelada'),
			allowNull: false,
			defaultValue: 'en_proceso',
			comment: 'Estado de la recepción'
		},

		totalItemsExpected: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			field: 'total_items_expected',
			comment: 'Total de ítems esperados'
		},

		totalItemsReceived: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			field: 'total_items_received',
			comment: 'Total de ítems recibidos'
		},

		hasDiscrepancies: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			field: 'has_discrepancies',
			comment: 'Indica si hay discrepancias'
		},

		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Observaciones de la recepción'
		},

		confirmedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'confirmed_at',
			comment: 'Fecha de confirmación final'
		},

		createdBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'created_by',
			comment: 'Usuario que creó la recepción'
		},

		updatedBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'updated_by',
			comment: 'Usuario que actualizó la recepción'
		}
	}, {
		tableName: 'receptions',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		paranoid: false,

		indexes: [
			{ fields: ['purchase_order_id'], name: 'receptions_purchase_order_id_idx' },
			{ unique: true, fields: ['reception_number'], name: 'receptions_number_unique' },
			{ fields: ['status'], name: 'receptions_status_idx' },
			{ fields: ['reception_date'], name: 'receptions_date_idx' }
		],

		comment: 'Recepciones de mercancía de órdenes de compra'
	});

	return Reception;
};
