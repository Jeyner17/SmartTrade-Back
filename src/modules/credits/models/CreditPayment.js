const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.CREDITS;

module.exports = (sequelize) => {
	const CreditPayment = sequelize.define('CreditPayment', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		creditId: { type: DataTypes.INTEGER, allowNull: false, field: 'credit_id' },
		amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
		paymentMethod: {
			type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia'),
			allowNull: false,
			field: 'payment_method'
		},
		paymentDate: { type: DataTypes.DATE, allowNull: false, field: 'payment_date' },
		notes: { type: DataTypes.TEXT, allowNull: true },
		recordedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'recorded_by' }
	}, {
		tableName: 'credit_payments',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		indexes: [
			{ fields: ['credit_id', 'payment_date'], name: 'credit_payments_credit_date_idx' }
		]
	});

	return CreditPayment;
};
