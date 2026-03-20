const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.PURCHASES;

/**
 * Modelo PurchaseOrder - Órdenes de Compra
 * Tabla: purchases.purchase_orders
 * Sprint 9 - Compras
 */
module.exports = (sequelize) => {
	const PurchaseOrder = sequelize.define('PurchaseOrder', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
			comment: 'ID único de la orden'
		},

		orderNumber: {
			type: DataTypes.STRING(30),
			allowNull: false,
			unique: true,
			field: 'order_number',
			comment: 'Número de orden autogenerado'
		},

		supplierId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			field: 'supplier_id',
			comment: 'ID del proveedor'
		},

		orderDate: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			field: 'order_date',
			defaultValue: DataTypes.NOW,
			comment: 'Fecha de emisión'
		},

		expectedDeliveryDate: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			field: 'expected_delivery_date',
			comment: 'Fecha esperada de entrega'
		},

		status: {
			type: DataTypes.ENUM('pendiente', 'confirmada', 'recibida', 'cancelada'),
			allowNull: false,
			defaultValue: 'pendiente',
			comment: 'Estado de la orden'
		},

		subtotal: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			defaultValue: 0,
			field: 'subtotal',
			comment: 'Subtotal calculado'
		},

		totalAmount: {
			type: DataTypes.DECIMAL(12, 2),
			allowNull: false,
			defaultValue: 0,
			field: 'total_amount',
			comment: 'Monto total calculado'
		},

		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
			comment: 'Observaciones de la orden'
		},

		statusObservations: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'status_observations',
			comment: 'Observaciones del último cambio de estado'
		},

		receivedAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'received_at',
			comment: 'Fecha/hora de recepción'
		},

		cancelledAt: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'cancelled_at',
			comment: 'Fecha/hora de cancelación'
		},

		createdBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'created_by',
			comment: 'Usuario que creó la orden'
		},

		updatedBy: {
			type: DataTypes.INTEGER,
			allowNull: true,
			field: 'updated_by',
			comment: 'Usuario que actualizó la orden'
		}
	}, {
		tableName: 'purchase_orders',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		paranoid: false,

		indexes: [
			{ unique: true, fields: ['order_number'], name: 'purchase_orders_order_number_unique' },
			{ fields: ['supplier_id'], name: 'purchase_orders_supplier_id_idx' },
			{ fields: ['status'], name: 'purchase_orders_status_idx' },
			{ fields: ['order_date'], name: 'purchase_orders_order_date_idx' }
		],

		comment: 'Órdenes de compra a proveedores'
	});

	return PurchaseOrder;
};

