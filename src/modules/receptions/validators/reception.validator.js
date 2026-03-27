const { body, query, param, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');

const RECEPTION_STATUS = ['en_proceso', 'parcial', 'completa', 'cancelada'];
const DISCREPANCY_TYPES = ['faltante', 'sobrante', 'dañado', 'otro'];

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
// VALIDACIONES: Listar recepciones
// ============================================
const validateListReceptions = [
	query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
	query('supplierId').optional().isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),
	query('status').optional().isIn(RECEPTION_STATUS).withMessage(`status debe ser uno de: ${RECEPTION_STATUS.join(', ')}`),
	query('startDate').optional().isISO8601().withMessage('startDate debe ser una fecha ISO8601 válida'),
	query('endDate').optional().isISO8601().withMessage('endDate debe ser una fecha ISO8601 válida')
];

// ============================================
// VALIDACIONES: Crear recepción
// ============================================
const validateCreateReception = [
	body('purchaseOrderId')
		.notEmpty().withMessage('purchaseOrderId es requerido')
		.isInt({ min: 1 }).withMessage('purchaseOrderId debe ser un entero positivo'),

	body('receptionDate')
		.optional({ nullable: true })
		.isISO8601().withMessage('receptionDate debe ser una fecha ISO8601 válida'),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres')
];

// ============================================
// VALIDACIONES: Obtener recepción por ID
// ============================================
const validateGetReception = [
	param('id')
		.notEmpty().withMessage('ID es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo')
];

// ============================================
// VALIDACIONES: Verificar producto por escaneo
// ============================================
const validateVerifyBarcode = [
	body('purchaseOrderId')
		.notEmpty().withMessage('purchaseOrderId es requerido')
		.isInt({ min: 1 }).withMessage('purchaseOrderId debe ser un entero positivo'),

	body('barcode')
		.notEmpty().withMessage('barcode es requerido')
		.isString().trim()
		.isLength({ min: 1 }).withMessage('barcode no puede estar vacío')
];

// ============================================
// VALIDACIONES: Registrar escaneo
// ============================================
const validateRegisterScan = [
	param('id')
		.notEmpty().withMessage('ID de recepción es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('productId')
		.notEmpty().withMessage('productId es requerido')
		.isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

	body('quantityScanned')
		.optional({ nullable: true })
		.isInt().withMessage('quantityScanned debe ser un entero')
		.custom(value => Number(value) !== 0).withMessage('quantityScanned no puede ser 0')
];

// ============================================
// VALIDACIONES: Confirmar recepción
// ============================================
const validateConfirmReception = [
	param('id')
		.notEmpty().withMessage('ID de recepción es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres')
];

// ============================================
// VALIDACIONES: Reportar discrepancia
// ============================================
const validateReportDiscrepancy = [
	param('id')
		.notEmpty().withMessage('ID de recepción es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('productId')
		.notEmpty().withMessage('productId es requerido')
		.isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

	body('quantityExpected')
		.notEmpty().withMessage('quantityExpected es requerida')
		.isInt({ min: 0 }).withMessage('quantityExpected debe ser un entero >= 0'),

	body('quantityReceived')
		.notEmpty().withMessage('quantityReceived es requerida')
		.isInt({ min: 0 }).withMessage('quantityReceived debe ser un entero >= 0'),

	body('type')
		.notEmpty().withMessage('type es requerido')
		.isIn(DISCREPANCY_TYPES).withMessage(`type debe ser uno de: ${DISCREPANCY_TYPES.join(', ')}`),

	body('notes')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('notes no puede superar 1000 caracteres'),

	body('observations')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres')
];

// ============================================
// VALIDACIONES: Listar discrepancias
// ============================================
const validateListDiscrepancies = [
	query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100'),
	query('receptionId').optional().isInt({ min: 1 }).withMessage('receptionId debe ser un entero positivo'),
	query('supplierId').optional().isInt({ min: 1 }).withMessage('supplierId debe ser un entero positivo'),
	query('type').optional().isIn(DISCREPANCY_TYPES).withMessage(`type debe ser uno de: ${DISCREPANCY_TYPES.join(', ')}`),
	query('startDate').optional().isISO8601().withMessage('startDate debe ser una fecha ISO8601 válida'),
	query('endDate').optional().isISO8601().withMessage('endDate debe ser una fecha ISO8601 válida'),
	query('resolved').optional().isIn(['true', 'false']).withMessage('resolved debe ser true o false')
];

// ============================================
// VALIDACIONES: Resolver discrepancia
// ============================================
const validateResolveDiscrepancy = [
	param('id')
		.notEmpty().withMessage('ID de discrepancia es requerido')
		.isInt({ min: 1 }).withMessage('ID debe ser un entero positivo'),

	body('resolutionNotes')
		.optional({ nullable: true })
		.isString().trim()
		.isLength({ max: 1000 }).withMessage('resolutionNotes no puede superar 1000 caracteres')
];

module.exports = {
	validate,
	validateListReceptions,
	validateCreateReception,
	validateGetReception,
	validateVerifyBarcode,
	validateRegisterScan,
	validateConfirmReception,
	validateReportDiscrepancy,
	validateListDiscrepancies,
	validateResolveDiscrepancy
};
