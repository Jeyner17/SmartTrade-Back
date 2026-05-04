const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.CREDITS;

module.exports = (sequelize) => {
	const CreditCustomer = sequelize.define('CreditCustomer', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		fullName: { type: DataTypes.STRING(150), allowNull: false, field: 'full_name' },
		documentNumber: { type: DataTypes.STRING(30), allowNull: false, field: 'document_number' },
		address: { type: DataTypes.STRING(255), allowNull: true },
		phone: { type: DataTypes.STRING(30), allowNull: true },
		email: { type: DataTypes.STRING(120), allowNull: true },
		creditLimit: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'credit_limit' },
		references: { type: DataTypes.TEXT, allowNull: true },
		isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' }
	}, {
		tableName: 'customers',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		indexes: [
			{ fields: ['document_number'], unique: true, name: 'credits_customers_document_unique' },
			{ fields: ['phone'], name: 'credits_customers_phone_idx' }
		]
	});

	return CreditCustomer;
};
