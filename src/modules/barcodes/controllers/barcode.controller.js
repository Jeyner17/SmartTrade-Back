const barcodeService = require('../services/barcode.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');
const { BARCODE_ERRORS } = require('../../../shared/constants/barcodes.constants');

/**
 * Controller de Escaneo de Códigos de Barras/QR
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 */
class BarcodeController {

    // ============================================
    // 1. ESCANEAR CÓDIGO DE BARRAS
    // ============================================

    /**
     * POST /api/v1/barcodes/scan/barcode
     */
    async scanBarcode(req, res) {
        try {
            const { code, context } = req.body;
            const userId = req.user?.id || null;

            const result = await barcodeService.scanBarcode(code, context, userId);

            return ApiResponse.success(res, result, 'Escaneo de código de barras procesado');

        } catch (error) {
            logger.error('Error en scanBarcode:', error);
            return ApiResponse.error(res, 'Error al escanear código de barras');
        }
    }

    // ============================================
    // 2. ESCANEAR CÓDIGO QR
    // ============================================

    /**
     * POST /api/v1/barcodes/scan/qr
     */
    async scanQR(req, res) {
        try {
            const { data, type } = req.body;
            const userId = req.user?.id || null;

            const result = await barcodeService.scanQR(data, type, userId);

            return ApiResponse.success(res, result, 'QR procesado exitosamente');

        } catch (error) {
            logger.error('Error en scanQR:', error);

            if (error.message === BARCODE_ERRORS.INVALID_QR_TYPE) {
                return ApiResponse.validationError(res, [{ field: 'type', message: error.message }], 'Tipo de QR inválido');
            }

            return ApiResponse.error(res, 'Error al procesar código QR');
        }
    }

    // ============================================
    // 3. VERIFICAR CÓDIGO
    // ============================================

    /**
     * GET /api/v1/barcodes/verify?code=...
     */
    async verifyCode(req, res) {
        try {
            const { code } = req.query;

            const result = await barcodeService.verifyCode(code);

            return ApiResponse.success(res, result, 'Verificación de código completada');

        } catch (error) {
            logger.error('Error en verifyCode:', error);
            return ApiResponse.error(res, 'Error al verificar código');
        }
    }

    // ============================================
    // 4. GENERAR CÓDIGO QR
    // ============================================

    /**
     * POST /api/v1/barcodes/generate
     */
    async generateQR(req, res) {
        try {
            const { type, data, options = {} } = req.body;

            const result = await barcodeService.generateQR(type, data, options);

            return ApiResponse.success(res, result, 'Código QR generado exitosamente');

        } catch (error) {
            logger.error('Error en generateQR:', error);

            if (error.message === BARCODE_ERRORS.INVALID_QR_TYPE) {
                return ApiResponse.validationError(res, [{ field: 'type', message: error.message }], 'Tipo de QR inválido');
            }

            if (error.message === BARCODE_ERRORS.GENERATE_ERROR) {
                return ApiResponse.error(res, error.message);
            }

            return ApiResponse.error(res, 'Error al generar código QR');
        }
    }

    // ============================================
    // 5. REGISTRAR ESCANEO
    // ============================================

    /**
     * POST /api/v1/barcodes/logs
     */
    async registerScan(req, res) {
        try {
            const userId = req.user?.id || null;

            const result = await barcodeService.registerScan(req.body, userId);

            return ApiResponse.created(res, result, 'Escaneo registrado en historial');

        } catch (error) {
            logger.error('Error en registerScan:', error);
            return ApiResponse.error(res, 'Error al registrar escaneo');
        }
    }

    // ============================================
    // 6. HISTORIAL DE ESCANEOS
    // ============================================

    /**
     * GET /api/v1/barcodes/logs
     */
    async getScanHistory(req, res) {
        try {
            const { page, limit, userId, productId, context, startDate, endDate, resultType, codeType } = req.query;

            const result = await barcodeService.getScanHistory(
                { userId, productId, context, startDate, endDate, resultType, codeType },
                { page: parseInt(page) || 1, limit: parseInt(limit) || 10 }
            );

            return ApiResponse.success(res, result, 'Historial de escaneos obtenido exitosamente');

        } catch (error) {
            logger.error('Error en getScanHistory:', error);
            return ApiResponse.error(res, 'Error al obtener historial de escaneos');
        }
    }

    // ============================================
    // 7. CONFIGURAR ESCÁNER
    // ============================================

    /**
     * PUT /api/v1/barcodes/config
     */
    async saveScannerConfig(req, res) {
        try {
            const userId = req.user.id;
            const { scannerType, allowedFormats, settings } = req.body;

            const result = await barcodeService.saveScannerConfig(userId, {
                scannerType,
                allowedFormats,
                settings
            });

            return ApiResponse.success(res, result, result.message);

        } catch (error) {
            logger.error('Error en saveScannerConfig:', error);
            return ApiResponse.error(res, 'Error al guardar configuración del escáner');
        }
    }

    /**
     * GET /api/v1/barcodes/config
     * Obtener la configuración del escáner del usuario autenticado
     */
    async getScannerConfig(req, res) {
        try {
            const userId = req.user.id;

            const result = await barcodeService.getScannerConfig(userId);

            return ApiResponse.success(res, result, 'Configuración del escáner obtenida');

        } catch (error) {
            logger.error('Error en getScannerConfig:', error);
            return ApiResponse.error(res, 'Error al obtener configuración del escáner');
        }
    }
}

module.exports = new BarcodeController();
