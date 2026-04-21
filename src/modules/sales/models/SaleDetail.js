const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SALES;

module.exports = (sequelize) => {
	const SaleDetail = sequelize.define('SaleDetail', {
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		saleId: { type: DataTypes.INTEGER, allowNull: false, field: 'sale_id' },
		productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
		quantity: { type: DataTypes.INTEGER, allowNull: false },
		unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price' },
		taxPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'tax_percent' },
		lineSubtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'line_subtotal' },
		lineTax: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'line_tax' },
		lineTotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'line_total' }
	}, {
		tableName: 'sale_details',
		schema: SCHEMA,
		timestamps: true,
		underscored: true,
		indexes: [
			{ fields: ['sale_id'], name: 'sale_details_sale_id_idx' },
			{ fields: ['product_id'], name: 'sale_details_product_id_idx' }
		]
	});

	return SaleDetail;
};
