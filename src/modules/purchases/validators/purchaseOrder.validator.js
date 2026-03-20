const { body, query, param, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

const ORDER_STATUS = ['pendiente', 'confirmada', 'recibida', 'cancelada'];

/**
 * Middleware que procesa los errores de validación
 */
const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const formatted = errors.array().map(e => ({ field: e.path, message: e.msg }));
		return ApiResponse.validationError(res, formatted, 'Error de validación');
	}
	next();
};

// ============================================
// VALIDACIONES: Listar órdenes de compra
// ============================================
const validateGetPurchaseOrders = [
	query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
	query('supplierId').optional().isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),
	query('status').optional().isIn(ORDER_STATUS).withMessage(`status debe ser uno de: ${ORDER_STATUS.join(', ')}`),
	query('startDate').optional().isISO8601().withMessage('startDate debe tener formato de fecha válido (ISO8601)'),
	query('endDate').optional().isISO8601().withMessage('endDate debe tener formato de fecha válido (ISO8601)')
];

// ============================================
// VALIDACIONES: Crear orden de compra
// ============================================
const validateCreatePurchaseOrder = [
	body('supplierId')
		.notEmpty().withMessage('supplierId es requerido')
		.isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),

	body('products')
		.isArray({ min: 1 }).withMessage('products debe ser un arreglo con al menos un producto'),

	body('products.*.productId')
		.notEmpty().withMessage('productId es requerido')
		.isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

	body('products.*.quantity')
		.notEmpty().withMessage('quantity es requerida')
		.isInt({ min: 1 }).withMessage('quantity debe ser un entero mayor a 0'),

	body('products.*.unitCost')
		.notEmpty().withMessage('unitCost es requerido')
		.isFloat({ min: 0 }).withMessage('unitCost debe ser un número >= 0'),

	body('expectedDeliveryDate')
		.optional({ nullable: true })
		.isISO8601().withMessage('expectedDeliveryDate debe ser una fecha válida (ISO8601)'),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres')
];

// ============================================
// VALIDACIONES: Obtener orden por ID
// ============================================
const validateGetPurchaseOrderById = [
	param('id')
		.notEmpty().withMessage('ID de la orden es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo')
];

// ============================================
// VALIDACIONES: Actualizar orden de compra
// ============================================
const validateUpdatePurchaseOrder = [
	param('id')
		.notEmpty().withMessage('ID de la orden es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('supplierId')
		.optional()
		.isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),

	body('expectedDeliveryDate')
		.optional({ nullable: true })
		.isISO8601().withMessage('expectedDeliveryDate debe ser una fecha válida (ISO8601)'),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres'),

	body('products')
		.optional()
		.isArray({ min: 1 }).withMessage('products debe ser un arreglo con al menos un producto'),

	body('products.*.productId')
		.optional()
		.isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

	body('products.*.quantity')
		.optional()
		.isInt({ min: 1 }).withMessage('quantity debe ser un entero mayor a 0'),

	body('products.*.unitCost')
		.optional()
		.isFloat({ min: 0 }).withMessage('unitCost debe ser un número >= 0')
];

// ============================================
// VALIDACIONES: Cambiar estado de orden
// ============================================
const validateChangePurchaseOrderStatus = [
	param('id')
		.notEmpty().withMessage('ID de la orden es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('newStatus')
		.notEmpty().withMessage('newStatus es requerido')
		.isIn(ORDER_STATUS).withMessage(`newStatus debe ser uno de: ${ORDER_STATUS.join(', ')}`),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres')
];

// ============================================
// VALIDACIONES: Recibir orden
// ============================================
const validateReceivePurchaseOrder = [
	param('id')
		.notEmpty().withMessage('ID de la orden es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('products')
		.optional()
		.isArray().withMessage('products debe ser un arreglo'),

	body('products.*.productId')
		.optional()
		.isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

	body('products.*.quantityReceived')
		.optional()
		.isInt({ min: 0 }).withMessage('quantityReceived debe ser un entero >= 0'),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres')
];

// ============================================
// VALIDACIONES: Cancelar orden
// ============================================
const validateCancelPurchaseOrder = [
	param('id')
		.notEmpty().withMessage('ID de la orden es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('reason')
		.notEmpty().withMessage('reason es requerido')
		.isString().trim()
		.isLength({ max: 500 }).withMessage('reason no puede superar 500 caracteres')
];

// ============================================
// VALIDACIONES: Compras por proveedor
// ============================================
const validateGetPurchasesBySupplier = [
	param('supplierId')
		.notEmpty().withMessage('supplierId es requerido')
		.isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),

	query('startDate').optional().isISO8601().withMessage('startDate debe tener formato de fecha válido (ISO8601)'),
	query('endDate').optional().isISO8601().withMessage('endDate debe tener formato de fecha válido (ISO8601)'),
	query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100')
];

// ============================================
// VALIDACIONES: Reporte de compras
// ============================================
const validateGetPurchasesReport = [
	query('startDate').optional().isISO8601().withMessage('startDate debe tener formato de fecha válido (ISO8601)'),
	query('endDate').optional().isISO8601().withMessage('endDate debe tener formato de fecha válido (ISO8601)'),
	query('supplierId').optional().isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),
	query('status').optional().isIn(ORDER_STATUS).withMessage(`status debe ser uno de: ${ORDER_STATUS.join(', ')}`)
];

module.exports = {
	validate,
	validateGetPurchaseOrders,
	validateCreatePurchaseOrder,
	validateGetPurchaseOrderById,
	validateUpdatePurchaseOrder,
	validateChangePurchaseOrderStatus,
	validateReceivePurchaseOrder,
	validateCancelPurchaseOrder,
	validateGetPurchasesBySupplier,
	validateGetPurchasesReport
};

