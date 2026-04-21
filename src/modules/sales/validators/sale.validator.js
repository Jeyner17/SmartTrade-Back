const { body, query, param, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'transferencia'];
const DISCOUNT_TYPES = ['none', 'percentage', 'fixed'];
const PERIODS = ['day', 'week', 'month', 'range'];

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
		return ApiResponse.validationError(res, formatted, 'Error de validación');
	}
	next();
};

const validateCreateSale = [
	body('products').isArray({ min: 1 }).withMessage('products debe contener al menos un producto'),
	body('products.*.productId').isInt({ min: 1 }).withMessage('productId debe ser entero positivo'),
	body('products.*.quantity').isInt({ min: 1 }).withMessage('quantity debe ser entero mayor a 0'),
	body('products.*.unitPrice').isFloat({ min: 0 }).withMessage('unitPrice debe ser numero >= 0'),
	body('discountType').optional().isIn(DISCOUNT_TYPES).withMessage(`discountType debe ser: ${DISCOUNT_TYPES.join(', ')}`),
	body('discountValue').optional().isFloat({ min: 0 }).withMessage('discountValue debe ser numero >= 0'),
	body('customerId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('customerId debe ser entero positivo'),
	body('paymentMethod').isIn(PAYMENT_METHODS).withMessage(`paymentMethod debe ser: ${PAYMENT_METHODS.join(', ')}`),
	body('amountReceived').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('amountReceived debe ser numero >= 0'),
	body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 }).withMessage('notes no puede superar 1000 caracteres')
];

const validateAddCartItem = [
	body('sessionId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('sessionId debe ser entero positivo'),
	body('productId').isInt({ min: 1 }).withMessage('productId debe ser entero positivo'),
	body('quantity').optional().isInt({ min: 1 }).withMessage('quantity debe ser entero mayor a 0'),
	body('customerId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('customerId debe ser entero positivo')
];

const validateRemoveCartItem = [
	param('sessionId').isInt({ min: 1 }).withMessage('sessionId debe ser entero positivo'),
	param('productId').isInt({ min: 1 }).withMessage('productId debe ser entero positivo')
];

const validateUpdateCartItemQuantity = [
	param('sessionId').isInt({ min: 1 }).withMessage('sessionId debe ser entero positivo'),
	param('productId').isInt({ min: 1 }).withMessage('productId debe ser entero positivo'),
	body('quantity').isInt({ min: 0 }).withMessage('quantity debe ser entero >= 0')
];

const validateApplyDiscount = [
	param('sessionId').isInt({ min: 1 }).withMessage('sessionId debe ser entero positivo'),
	body('discountType').isIn(DISCOUNT_TYPES).withMessage(`discountType debe ser: ${DISCOUNT_TYPES.join(', ')}`),
	body('value').isFloat({ min: 0 }).withMessage('value debe ser numero >= 0'),
	body('reason').optional({ nullable: true }).isString().isLength({ max: 255 }).withMessage('reason no puede superar 255 caracteres')
];

const validateCalculateTotal = [
	param('sessionId').isInt({ min: 1 }).withMessage('sessionId debe ser entero positivo')
];

const validateProcessPayment = [
	param('sessionId').isInt({ min: 1 }).withMessage('sessionId debe ser entero positivo'),
	body('paymentMethod').isIn(PAYMENT_METHODS).withMessage(`paymentMethod debe ser: ${PAYMENT_METHODS.join(', ')}`),
	body('amountReceived').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('amountReceived debe ser numero >= 0'),
	body('customerId').optional({ nullable: true }).isInt({ min: 1 }).withMessage('customerId debe ser entero positivo'),
	body('notes').optional({ nullable: true }).isString().isLength({ max: 1000 }).withMessage('notes no puede superar 1000 caracteres')
];

const validateSearchCustomer = [
	query('term').isString().trim().isLength({ min: 1, max: 120 }).withMessage('term es requerido y debe tener entre 1 y 120 caracteres')
];

const validateQuickCreateCustomer = [
	body('fullName').isString().trim().isLength({ min: 2, max: 150 }).withMessage('fullName debe tener entre 2 y 150 caracteres'),
	body('documentNumber').optional({ nullable: true }).isString().trim().isLength({ max: 30 }).withMessage('documentNumber no puede superar 30 caracteres'),
	body('phone').optional({ nullable: true }).isString().trim().isLength({ max: 30 }).withMessage('phone no puede superar 30 caracteres')
];

const validateListTodaySales = [
	query('cashierId').optional().isInt({ min: 1 }).withMessage('cashierId debe ser entero positivo'),
	query('startHour').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startHour debe tener formato HH:mm'),
	query('endHour').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endHour debe tener formato HH:mm')
];

const validateGetSaleById = [
	param('id').isInt({ min: 1 }).withMessage('id debe ser entero positivo')
];

const validateVoidSale = [
	param('id').isInt({ min: 1 }).withMessage('id debe ser entero positivo'),
	body('reason').isString().trim().isLength({ min: 3, max: 255 }).withMessage('reason debe tener entre 3 y 255 caracteres')
];

const validatePopularProducts = [
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
	query('period').optional().isIn(PERIODS).withMessage(`period debe ser: ${PERIODS.join(', ')}`),
	query('startDate').optional().isISO8601().withMessage('startDate debe ser fecha valida ISO8601'),
	query('endDate').optional().isISO8601().withMessage('endDate debe ser fecha valida ISO8601')
];

module.exports = {
	validate,
	validateCreateSale,
	validateAddCartItem,
	validateRemoveCartItem,
	validateUpdateCartItemQuantity,
	validateApplyDiscount,
	validateCalculateTotal,
	validateProcessPayment,
	validateSearchCustomer,
	validateQuickCreateCustomer,
	validateListTodaySales,
	validateGetSaleById,
	validateVoidSale,
	validatePopularProducts,
	PAYMENT_METHODS,
	DISCOUNT_TYPES
};
