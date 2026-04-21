const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SALES;

module.exports = (sequelize) => {
	const Sale = sequelize.define('Sale', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		ticketNumber: { type: DataTypes.STRING(30), allowNull: false, unique: true, field: 'ticket_number' },
		sessionId: { type: DataTypes.INTEGER, allowNull: true, field: 'session_id' },
		customerId: { type: DataTypes.INTEGER, allowNull: true, field: 'customer_id' },
		cashierId: { type: DataTypes.INTEGER, allowNull: false, field: 'cashier_id' },
		paymentMethod: {
			type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
			allowNull: false,
			field: 'payment_method'
		},
		status: {
			type: DataTypes.ENUM('completed', 'voided'),
			allowNull: false,
			defaultValue: 'completed'
		},
		subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
		ivaAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'iva_amount' },
		discountType: {
			type: DataTypes.ENUM('none', 'percentage', 'fixed'),
			allowNull: false,
			defaultValue: 'none',
			field: 'discount_type'
		},
		discountValue: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'discount_value' },
		discountAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'discount_amount' },
		totalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'total_amount' },
		amountReceived: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'amount_received' },
		changeAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'change_amount' },
		notes: { type: DataTypes.TEXT, allowNull: true },
		voidReason: { type: DataTypes.STRING(255), allowNull: true, field: 'void_reason' },
		voidedAt: { type: DataTypes.DATE, allowNull: true, field: 'voided_at' }
	}, {
		tableName: 'sales',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		indexes: [
			{ fields: ['ticket_number'], unique: true, name: 'sales_ticket_number_unique' },
			{ fields: ['cashier_id', 'created_at'], name: 'sales_cashier_created_idx' },
			{ fields: ['status'], name: 'sales_status_idx' }
		]
	});

	return Sale;
};
