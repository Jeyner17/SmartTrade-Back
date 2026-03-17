const express = require('express');
const router = express.Router();

// Controller
const barcodeController = require('../controllers/barcode.controller');

// Validators
const {
    validate,
    validateScanBarcode,
    validateScanQR,
    validateVerifyCode,
    validateGenerateQR,
    validateRegisterScan,
    validateGetHistory,
    validateScannerConfig
} = require('../validators/barcode.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Escaneo de Códigos de Barras/QR
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 *
 * Prefix: /api/v1/barcodes
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// ============================================
// 1. ESCANEAR CÓDIGO DE BARRAS
// POST /api/v1/barcodes/scan/barcode
// Body: { code, context? }
// ============================================
router.post(
    '/scan/barcode',
    requirePermission(MODULES.BARCODES, ACTIONS.VIEW),
    validateScanBarcode,
    validate,
    asyncHandler(barcodeController.scanBarcode)
);

// ============================================
// 2. ESCANEAR CÓDIGO QR
// POST /api/v1/barcodes/scan/qr
// Body: { data, type }
// ============================================
router.post(
    '/scan/qr',
    requirePermission(MODULES.BARCODES, ACTIONS.VIEW),
    validateScanQR,
    validate,
    asyncHandler(barcodeController.scanQR)
);

// ============================================
// 3. VERIFICAR CÓDIGO
// GET /api/v1/barcodes/verify?code=...
// ============================================
router.get(
    '/verify',
    requirePermission(MODULES.BARCODES, ACTIONS.VIEW),
    validateVerifyCode,
    validate,
    asyncHandler(barcodeController.verifyCode)
);

// ============================================
// 4. GENERAR CÓDIGO QR
// POST /api/v1/barcodes/generate
// Body: { type, data, options? }
// ============================================
router.post(
    '/generate',
    requirePermission(MODULES.BARCODES, ACTIONS.CREATE),
    validateGenerateQR,
    validate,
    auditLog('GENERATE_QR'),
    asyncHandler(barcodeController.generateQR)
);

// ============================================
// 5. REGISTRAR ESCANEO MANUAL
// POST /api/v1/barcodes/logs
// Body: { code, codeType?, context?, resultType?, productId?, resultData? }
// ============================================
router.post(
    '/logs',
    requirePermission(MODULES.BARCODES, ACTIONS.CREATE),
    validateRegisterScan,
    validate,
    auditLog('REGISTER_SCAN'),
    asyncHandler(barcodeController.registerScan)
);

// ============================================
// 6. HISTORIAL DE ESCANEOS
// GET /api/v1/barcodes/logs
// Query: userId?, productId?, context?, codeType?, resultType?, startDate?, endDate?, page?, limit?
// ============================================
router.get(
    '/logs',
    requirePermission(MODULES.BARCODES, ACTIONS.VIEW),
    validateGetHistory,
    validate,
    asyncHandler(barcodeController.getScanHistory)
);

// ============================================
// 7a. OBTENER CONFIGURACIÓN DEL ESCÁNER
// GET /api/v1/barcodes/config
// ============================================
router.get(
    '/config',
    requirePermission(MODULES.BARCODES, ACTIONS.VIEW),
    asyncHandler(barcodeController.getScannerConfig)
);

// ============================================
// 7b. GUARDAR CONFIGURACIÓN DEL ESCÁNER
// PUT /api/v1/barcodes/config
// Body: { scannerType, allowedFormats?, settings? }
// ============================================
router.put(
    '/config',
    requirePermission(MODULES.BARCODES, ACTIONS.EDIT),
    validateScannerConfig,
    validate,
    auditLog('SAVE_SCANNER_CONFIG'),
    asyncHandler(barcodeController.saveScannerConfig)
);

module.exports = router;
