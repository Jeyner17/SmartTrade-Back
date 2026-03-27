const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.RECEPTIONS;

/**
 * Modelo ReceptionDetail - Detalle de Recepción
 * Tabla: receptions.reception_details
 * Sprint 10 - Recepción de Mercancía
 */
module.exports = (sequelize) => {
	const ReceptionDetail = sequelize.define('ReceptionDetail', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			comment: 'ID único del detalle'
		},

		receptionId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'reception_id',
			comment: 'Recepción asociada'
		},

		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'product_id',
			comment: 'Producto recibido'
		},

		quantityExpected: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			field: 'quantity_expected',
			validate: {
				min: { args: [0], msg: 'La cantidad esperada no puede ser negativa' },
				isInt: { msg: 'La cantidad esperada debe ser un entero' }
			},
			comment: 'Cantidad esperada'
		},

		quantityReceived: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
			field: 'quantity_received',
			validate: {
				min: { args: [0], msg: 'La cantidad recibida no puede ser negativa' },
				isInt: { msg: 'La cantidad recibida debe ser un entero' }
			},
			comment: 'Cantidad recibida'
		},

		unitReceived: {
			type: DataTypes.STRING(20),
			allowNull: true,
			field: 'unit_received',
			comment: 'Unidad de medida recibida'
		},

		status: {
			type: DataTypes.ENUM('pendiente', 'parcial', 'completa', 'exceso'),
			allowNull: false,
			defaultValue: 'pendiente',
			comment: 'Estado del detalle'
		},

		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Observaciones del detalle'
		}
	}, {
		tableName: 'reception_details',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		paranoid: false,

		indexes: [
			{ fields: ['reception_id'], name: 'reception_details_reception_id_idx' },
			{ fields: ['product_id'], name: 'reception_details_product_id_idx' }
		],

		comment: 'Detalle de productos en una recepción'
	});

	return ReceptionDetail;
};
