const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.PURCHASES;

/**
 * Modelo PurchaseDetail - Detalle de órdenes de compra
 * Tabla: purchases.purchase_details
 * Sprint 9 - Compras
 */
module.exports = (sequelize) => {
	const PurchaseDetail = sequelize.define('PurchaseDetail', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			comment: 'ID único del detalle'
		},

		purchaseOrderId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'purchase_order_id',
			comment: 'Orden de compra asociada'
		},

		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'product_id',
			comment: 'Producto comprado'
		},

		quantityOrdered: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'quantity_ordered',
			validate: {
				min: { args: [1], msg: 'La cantidad ordenada debe ser mayor a 0' },
				isInt: { msg: 'La cantidad ordenada debe ser un entero' }
			},
			comment: 'Cantidad solicitada'
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
			comment: 'Cantidad efectivamente recibida'
		},

		unitCost: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			field: 'unit_cost',
			validate: {
				min: { args: [0], msg: 'El costo unitario no puede ser negativo' }
			},
			comment: 'Costo unitario'
		},

		lineTotal: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			defaultValue: 0,
			field: 'line_total',
			validate: {
				min: { args: [0], msg: 'El total de línea no puede ser negativo' }
			},
			comment: 'Total de línea'
		},

		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Observaciones del detalle'
		}
	}, {
		tableName: 'purchase_details',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		paranoid: false,

		indexes: [
			{ fields: ['purchase_order_id'], name: 'purchase_details_order_id_idx' },
			{ fields: ['product_id'], name: 'purchase_details_product_id_idx' }
		],

		comment: 'Detalle de productos por orden de compra'
	});

	return PurchaseDetail;
};

