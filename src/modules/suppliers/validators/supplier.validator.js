const { body, query, param, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');
const { SUPPLIER_STATUS, PAYMENT_TERMS } = require('../../../shared/constants/suppliers.constants');


/**
 * Middleware que procesa los errores de validación
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formatted = errors.array().map(e => ({
            field: e.path,
            message: e.msg
        }));
        return ApiResponse.validationError(res, formatted, 'Error de validación');
    }
    next();
};

// ============================================
// LISTAR PROVEEDORES (GET /)
// ============================================
const validateGetSuppliers = [
    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),
    query('search').optional().isString().trim(),
    query('status').optional().isIn(SUPPLIER_STATUS).withMessage(`status debe ser uno de: ${SUPPLIER_STATUS.join(', ')}`),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).withMessage('minRating debe ser un número entre 0 y 5')
];

// ============================================
// CREAR PROVEEDOR (POST /)
// ============================================
const validateCreateSupplier = [
    body('tradeName')
        .notEmpty().withMessage('tradeName (nombre comercial) es requerido')
        .isString().trim()
        .isLength({ max: 150 }).withMessage('tradeName no puede superar 150 caracteres'),

    body('legalName')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 200 }).withMessage('legalName no puede superar 200 caracteres'),

    body('ruc')
        .notEmpty().withMessage('ruc es requerido')
        .isString().trim()
        .isLength({ min: 10, max: 20 }).withMessage('ruc debe tener entre 10 y 20 caracteres'),

    body('address')
        .optional({ nullable: true })
        .isString().trim(),

    body('phone')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 20 }).withMessage('phone no puede superar 20 caracteres'),

    body('email')
        .optional({ nullable: true })
        .isEmail().withMessage('email debe ser un correo válido'),

    body('website')
        .optional({ nullable: true })
        .isURL().withMessage('website debe ser una URL válida'),

    body('paymentTerms')
        .optional()
        .isIn(PAYMENT_TERMS).withMessage(`paymentTerms debe ser uno de: ${PAYMENT_TERMS.join(', ')}`),

    body('bankName')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 100 }).withMessage('bankName no puede superar 100 caracteres'),

    body('bankAccount')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 50 }).withMessage('bankAccount no puede superar 50 caracteres'),

    body('bankAccountType')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 30 }).withMessage('bankAccountType no puede superar 30 caracteres'),

    body('notes')
        .optional({ nullable: true })
        .isString().trim(),

    // Validación del array de contactos
    body('contacts')
        .optional()
        .isArray().withMessage('contacts debe ser un arreglo'),

    body('contacts.*.name')
        .optional()
        .notEmpty().withMessage('El nombre del contacto es requerido')
        .isString().trim()
        .isLength({ max: 150 }).withMessage('El nombre del contacto no puede superar 150 caracteres'),

    body('contacts.*.position')
        .optional({ nullable: true })
        .isString().trim(),

    body('contacts.*.phone')
        .optional({ nullable: true })
        .isString().trim(),

    body('contacts.*.email')
        .optional({ nullable: true })
        .isEmail().withMessage('El email del contacto debe ser válido'),

    body('contacts.*.isPrimary')
        .optional()
        .isBoolean().withMessage('isPrimary debe ser true o false')
];

// ============================================
// ACTUALIZAR PROVEEDOR (PUT /:id)
// ============================================
const validateUpdateSupplier = [
    body('tradeName')
        .optional()
        .isString().trim()
        .isLength({ max: 150 }).withMessage('tradeName no puede superar 150 caracteres'),

    body('legalName')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 200 }).withMessage('legalName no puede superar 200 caracteres'),

    body('ruc')
        .optional()
        .isString().trim()
        .isLength({ min: 10, max: 20 }).withMessage('ruc debe tener entre 10 y 20 caracteres'),

    body('address')
        .optional({ nullable: true })
        .isString().trim(),

    body('phone')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 20 }).withMessage('phone no puede superar 20 caracteres'),

    body('email')
        .optional({ nullable: true })
        .isEmail().withMessage('email debe ser un correo válido'),

    body('website')
        .optional({ nullable: true })
        .isURL().withMessage('website debe ser una URL válida'),

    body('paymentTerms')
        .optional()
        .isIn(PAYMENT_TERMS).withMessage(`paymentTerms debe ser uno de: ${PAYMENT_TERMS.join(', ')}`),

    body('bankName')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 100 }).withMessage('bankName no puede superar 100 caracteres'),

    body('bankAccount')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 50 }).withMessage('bankAccount no puede superar 50 caracteres'),

    body('bankAccountType')
        .optional({ nullable: true })
        .isString().trim(),

    body('notes')
        .optional({ nullable: true })
        .isString().trim()
];

// ============================================
// HISTORIAL DE COMPRAS (GET /:id/purchases)
// ============================================
const validateGetPurchaseHistory = [
    query('startDate')
        .optional()
        .isISO8601().withMessage('startDate debe ser una fecha válida (YYYY-MM-DD)'),

    query('endDate')
        .optional()
        .isISO8601().withMessage('endDate debe ser una fecha válida (YYYY-MM-DD)'),

    query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100')
];

// ============================================
// EVALUAR PROVEEDOR (POST /:id/evaluate)
// ============================================
const validateEvaluateSupplier = [
    body('qualityRating')
        .notEmpty().withMessage('qualityRating es requerido')
        .isFloat({ min: 1, max: 5 }).withMessage('qualityRating debe ser un número entre 1 y 5'),

    body('punctualityRating')
        .notEmpty().withMessage('punctualityRating es requerido')
        .isFloat({ min: 1, max: 5 }).withMessage('punctualityRating debe ser un número entre 1 y 5'),

    body('observations')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 1000 }).withMessage('observations no puede superar 1000 caracteres'),

    body('purchaseReference')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('purchaseReference debe ser un entero positivo')
];

// ============================================
// CAMBIAR ESTADO (PATCH /:id/status)
// ============================================
const validateChangeStatus = [
    body('status')
        .notEmpty().withMessage('status es requerido')
        .isIn(SUPPLIER_STATUS).withMessage(`status debe ser uno de: ${SUPPLIER_STATUS.join(', ')}`),

    body('reason')
        .optional({ nullable: true })
        .isString().trim()
        .isLength({ max: 500 }).withMessage('reason no puede superar 500 caracteres')
];

module.exports = {
    validate,
    validateGetSuppliers,
    validateCreateSupplier,
    validateUpdateSupplier,
    validateGetPurchaseHistory,
    validateEvaluateSupplier,
    validateChangeStatus
};
