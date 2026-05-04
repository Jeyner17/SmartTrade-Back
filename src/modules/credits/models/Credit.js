const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.CREDITS;

module.exports = (sequelize) => {
	const Credit = sequelize.define('Credit', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		customerId: { type: DataTypes.INTEGER, allowNull: false, field: 'customer_id' },
		saleId: { type: DataTypes.INTEGER, allowNull: false, field: 'sale_id' },
		parentCreditId: { type: DataTypes.INTEGER, allowNull: true, field: 'parent_credit_id' },
		principalAmount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'principal_amount' },
		interestRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'interest_rate' },
		moraRateDaily: { type: DataTypes.DECIMAL(8, 6), allowNull: false, defaultValue: 0.001, field: 'mora_rate_daily' },
		termDays: { type: DataTypes.INTEGER, allowNull: false, field: 'term_days' },
		startDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'start_date' },
		dueDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'due_date' },
		outstandingBalance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'outstanding_balance' },
		status: {
			type: DataTypes.ENUM('ACTIVE', 'PAID', 'OVERDUE', 'FORGIVEN', 'REFINANCED'),
			allowNull: false,
			defaultValue: 'ACTIVE'
		},
		observations: { type: DataTypes.TEXT, allowNull: true },
		lastPaymentDate: { type: DataTypes.DATE, allowNull: true, field: 'last_payment_date' }
	}, {
		tableName: 'credits',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		indexes: [
			{ fields: ['customer_id'], name: 'credits_customer_id_idx' },
			{ fields: ['sale_id'], name: 'credits_sale_id_idx' },
			{ fields: ['status', 'due_date'], name: 'credits_status_due_date_idx' }
		]
	});

	return Credit;
};
