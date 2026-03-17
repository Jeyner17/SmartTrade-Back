const { body, query, param, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');
const {
    SCAN_CONTEXTS,
    QR_TYPES,
    SCANNER_TYPES,
    BARCODE_FORMATS,
    BARCODE_TYPES,
    SCAN_RESULTS
} = require('../../../shared/constants/barcodes.constants');

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
// 1. ESCANEAR CÓDIGO DE BARRAS (POST /scan/barcode)
// ============================================
const validateScanBarcode = [
    body('code')
        .notEmpty().withMessage('El código de barras es requerido')
        .isString().trim()
        .isLength({ min: 1, max: 255 }).withMessage('El código no puede superar 255 caracteres'),

    body('context')
        .optional()
        .isIn(SCAN_CONTEXTS).withMessage(`context debe ser uno de: ${SCAN_CONTEXTS.join(', ')}`)
];

// ============================================
// 2. ESCANEAR CÓDIGO QR (POST /scan/qr)
// ============================================
const validateScanQR = [
    body('data')
        .notEmpty().withMessage('Los datos del QR son requeridos'),

    body('type')
        .notEmpty().withMessage('El tipo de QR es requerido')
        .isIn(QR_TYPES).withMessage(`type debe ser uno de: ${QR_TYPES.join(', ')}`)
];

// ============================================
// 3. VERIFICAR CÓDIGO (GET /verify)
// ============================================
const validateVerifyCode = [
    query('code')
        .notEmpty().withMessage('El código a verificar es requerido')
        .isString().trim()
        .isLength({ min: 1, max: 255 }).withMessage('El código no puede superar 255 caracteres')
];

// ============================================
// 4. GENERAR QR (POST /generate)
// ============================================
const validateGenerateQR = [
    body('type')
        .notEmpty().withMessage('El tipo de QR es requerido')
        .isIn(QR_TYPES).withMessage(`type debe ser uno de: ${QR_TYPES.join(', ')}`),

    body('data')
        .notEmpty().withMessage('Los datos a codificar son requeridos'),

    body('options.width')
        .optional()
        .isInt({ min: 100, max: 1000 }).withMessage('El ancho debe ser entre 100 y 1000 px'),

    body('options.errorCorrectionLevel')
        .optional()
        .isIn(['L', 'M', 'Q', 'H']).withMessage('errorCorrectionLevel debe ser L, M, Q o H')
];

// ============================================
// 5. REGISTRAR ESCANEO (POST /logs)
// ============================================
const validateRegisterScan = [
    body('code')
        .notEmpty().withMessage('El código escaneado es requerido')
        .isString().trim()
        .isLength({ min: 1, max: 255 }).withMessage('El código no puede superar 255 caracteres'),

    body('codeType')
        .optional()
        .isIn(BARCODE_TYPES).withMessage(`codeType debe ser uno de: ${BARCODE_TYPES.join(', ')}`),

    body('context')
        .optional()
        .isIn(SCAN_CONTEXTS).withMessage(`context debe ser uno de: ${SCAN_CONTEXTS.join(', ')}`),

    body('resultType')
        .optional()
        .isIn(SCAN_RESULTS).withMessage(`resultType debe ser uno de: ${SCAN_RESULTS.join(', ')}`),

    body('productId')
        .optional({ nullable: true })
        .isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

    body('resultData')
        .optional({ nullable: true })
        .isObject().withMessage('resultData debe ser un objeto JSON')
];

// ============================================
// 6. HISTORIAL DE ESCANEOS (GET /logs)
// ============================================
const validateGetHistory = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page debe ser un entero >= 1'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit debe ser entre 1 y 100'),

    query('userId')
        .optional()
        .isInt({ min: 1 }).withMessage('userId debe ser un entero positivo'),

    query('productId')
        .optional()
        .isInt({ min: 1 }).withMessage('productId debe ser un entero positivo'),

    query('context')
        .optional()
        .isIn(SCAN_CONTEXTS).withMessage(`context debe ser uno de: ${SCAN_CONTEXTS.join(', ')}`),

    query('codeType')
        .optional()
        .isIn(BARCODE_TYPES).withMessage(`codeType debe ser uno de: ${BARCODE_TYPES.join(', ')}`),

    query('resultType')
        .optional()
        .isIn(SCAN_RESULTS).withMessage(`resultType debe ser uno de: ${SCAN_RESULTS.join(', ')}`),

    query('startDate')
        .optional()
        .isISO8601().withMessage('startDate debe ser una fecha válida (YYYY-MM-DD)'),

    query('endDate')
        .optional()
        .isISO8601().withMessage('endDate debe ser una fecha válida (YYYY-MM-DD)')
];

// ============================================
// 7. CONFIGURAR ESCÁNER (PUT /config)
// ============================================
const validateScannerConfig = [
    body('scannerType')
        .notEmpty().withMessage('El tipo de escáner es requerido')
        .isIn(SCANNER_TYPES).withMessage(`scannerType debe ser uno de: ${SCANNER_TYPES.join(', ')}`),

    body('allowedFormats')
        .optional()
        .isArray().withMessage('allowedFormats debe ser un arreglo'),

    body('allowedFormats.*')
        .optional()
        .isIn(BARCODE_FORMATS).withMessage(`Formato inválido. Valores permitidos: ${BARCODE_FORMATS.join(', ')}`),

    body('settings')
        .optional({ nullable: true })
        .isObject().withMessage('settings debe ser un objeto JSON')
];

module.exports = {
    validate,
    validateScanBarcode,
    validateScanQR,
    validateVerifyCode,
    validateGenerateQR,
    validateRegisterScan,
    validateGetHistory,
    validateScannerConfig
};
