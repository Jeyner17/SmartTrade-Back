const { Op } = require('sequelize');
const { ScanLog, ScannerConfig, Product, User } = require('../../../database');
const { generateQRBase64 } = require('../../../utils/qrGenerator');
const logger = require('../../../utils/logger');
const {
    BARCODE_ERRORS: ERROR,
    SCAN_RESULTS,
    QR_TYPES
} = require('../../../shared/constants/barcodes.constants');

/**
 * Servicio de Escaneo de Códigos de Barras/QR
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 */
class BarcodeService {

    // ============================================
    // 1. ESCANEAR CÓDIGO DE BARRAS
    // ============================================

    /**
     * Busca un producto por su código de barras y registra el escaneo
     * @param {string} code       - Código de barras escaneado
     * @param {string} context    - Contexto: venta | recepcion | consulta
     * @param {number} userId     - ID del usuario que escanea
     */
    async scanBarcode(code, context = 'consulta', userId = null) {
        // Buscar el producto por barcode
        const product = await Product.findOne({
            where: { barcode: code },
            attributes: ['id', 'name', 'barcode', 'salePrice', 'stock', 'imageUrl', 'status']
        });

        const found = !!product;
        const resultType = found ? 'found' : 'not_found';

        const resultData = found
            ? {
                id: product.id,
                name: product.name,
                barcode: product.barcode,
                price: product.salePrice,
                stock: product.stock,
                imageUrl: product.imageUrl || null,
                status: product.status
            }
            : { message: ERROR.PRODUCT_NOT_FOUND };

        // Registrar el escaneo en el historial
        await ScanLog.create({
            code,
            codeType: 'barcode',
            context,
            resultType,
            productId: found ? product.id : null,
            resultData,
            performedBy: userId,
            scannedAt: new Date()
        });

        logger.info('Código de barras escaneado', { code, context, found, userId });

        return {
            found,
            code,
            context,
            product: found ? resultData : null,
            message: found ? 'Producto encontrado' : ERROR.PRODUCT_NOT_FOUND
        };
    }

    // ============================================
    // 2. ESCANEAR CÓDIGO QR
    // ============================================

    /**
     * Decodifica un código QR y procesa la información según su tipo
     * @param {string} data    - Contenido del QR (ya decodificado por el frontend)
     * @param {string} type    - Tipo esperado: producto | factura | credito
     * @param {number} userId  - ID del usuario
     */
    async scanQR(data, type, userId = null) {
        if (!QR_TYPES.includes(type)) {
            throw new Error(ERROR.INVALID_QR_TYPE);
        }

        // Intentar parsear el contenido del QR (puede ser JSON o string)
        let parsed;
        try {
            parsed = typeof data === 'string' ? JSON.parse(data) : data;
        } catch {
            // Si no es JSON válido, tratar como string plano
            parsed = { raw: data };
        }

        let resultData = null;
        let resultType = 'found';
        let found = true;

        // Procesar según el tipo de QR
        switch (type) {
            case 'producto': {
                const productId = parsed.id || parsed.productId;
                if (productId) {
                    const product = await Product.findByPk(productId, {
                        attributes: ['id', 'name', 'barcode', 'salePrice', 'stock', 'imageUrl', 'status']
                    });
                    if (product) {
                        resultData = {
                            type: 'producto',
                            id: product.id,
                            name: product.name,
                            barcode: product.barcode,
                            price: product.salePrice,
                            stock: product.stock,
                            imageUrl: product.imageUrl || null
                        };
                    } else {
                        found = false;
                        resultType = 'not_found';
                        resultData = { message: ERROR.PRODUCT_NOT_FOUND };
                    }
                } else {
                    // QR con datos directos del producto embebidos
                    resultData = { type: 'producto', ...parsed };
                }
                break;
            }

            case 'factura': {
                // Retornar datos de la factura tal como vienen en el QR
                resultData = {
                    type: 'factura',
                    invoiceNumber: parsed.invoiceNumber || parsed.numero || null,
                    date: parsed.date || parsed.fecha || null,
                    total: parsed.total || null,
                    ruc: parsed.ruc || null,
                    raw: parsed
                };
                break;
            }

            case 'credito': {
                resultData = {
                    type: 'credito',
                    creditId: parsed.creditId || parsed.id || null,
                    clientName: parsed.clientName || parsed.cliente || null,
                    amount: parsed.amount || parsed.monto || null,
                    dueDate: parsed.dueDate || parsed.fechaVencimiento || null,
                    raw: parsed
                };
                break;
            }
        }

        // Registrar en historial
        const codePreview = typeof data === 'string' && data.length > 100
            ? data.substring(0, 100) + '...'
            : data;

        await ScanLog.create({
            code: typeof codePreview === 'string' ? codePreview : JSON.stringify(codePreview),
            codeType: 'qr',
            context: 'consulta',
            resultType,
            productId: (type === 'producto' && found && resultData?.id) ? resultData.id : null,
            resultData,
            performedBy: userId,
            scannedAt: new Date()
        });

        logger.info('QR escaneado', { type, found, userId });

        return {
            found,
            type,
            data: resultData,
            message: found ? 'QR procesado exitosamente' : ERROR.NOT_FOUND
        };
    }

    // ============================================
    // 3. VERIFICAR CÓDIGO
    // ============================================

    /**
     * Verifica si un código existe en el sistema sin registrar acción
     * @param {string} code - Código a verificar (barcode o texto)
     */
    async verifyCode(code) {
        // Buscar en productos por barcode
        const product = await Product.findOne({
            where: { barcode: code },
            attributes: ['id', 'name', 'barcode', 'status']
        });

        const exists = !!product;

        return {
            exists,
            code,
            basicInfo: exists
                ? { id: product.id, name: product.name, status: product.status }
                : null
        };
    }

    // ============================================
    // 4. GENERAR CÓDIGO QR
    // ============================================

    /**
     * Crea un código QR con información específica y lo retorna en base64
     * @param {string} type - Tipo: producto | factura | credito
     * @param {Object} data - Datos a codificar en el QR
     * @param {Object} options - Opciones de generación (width, color, etc.)
     */
    async generateQR(type, data, options = {}) {
        if (!QR_TYPES.includes(type)) {
            throw new Error(ERROR.INVALID_QR_TYPE);
        }

        // Estructura estandarizada del QR
        const qrPayload = {
            type,
            version: '1.0',
            generatedAt: new Date().toISOString(),
            ...data
        };

        try {
            const qrBase64 = await generateQRBase64(qrPayload, options);

            logger.info('QR generado', { type });

            return {
                type,
                qrBase64,
                payload: qrPayload
            };
        } catch (error) {
            logger.error('Error al generar QR:', error);
            throw new Error(ERROR.GENERATE_ERROR);
        }
    }

    // ============================================
    // 5. REGISTRAR ESCANEO
    // ============================================

    /**
     * Guarda manualmente un escaneo en el historial de auditoría
     * @param {Object} scanData - Datos del escaneo
     * @param {number} userId   - ID del usuario
     */
    async registerScan(scanData, userId) {
        const { code, codeType, context, resultType, productId, resultData } = scanData;

        const log = await ScanLog.create({
            code,
            codeType: codeType || 'barcode',
            context: context || 'consulta',
            resultType: resultType || 'found',
            productId: productId || null,
            resultData: resultData || null,
            performedBy: userId,
            scannedAt: new Date()
        });

        logger.info('Escaneo registrado manualmente', { logId: log.id, userId });

        return {
            id: log.id,
            message: 'Escaneo registrado en historial',
            registeredAt: log.scannedAt
        };
    }

    // ============================================
    // 6. OBTENER HISTORIAL DE ESCANEOS
    // ============================================

    /**
     * Devuelve registros de escaneos con filtros y paginación
     * @param {Object} filters     - Filtros: userId, productId, context, startDate, endDate, resultType
     * @param {Object} pagination  - page, limit
     */
    async getScanHistory(filters = {}, pagination = {}) {
        const { userId, productId, context, startDate, endDate, resultType, codeType } = filters;
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const where = {};

        if (userId) where.performedBy = parseInt(userId);
        if (productId) where.productId = parseInt(productId);
        if (context) where.context = context;
        if (resultType) where.resultType = resultType;
        if (codeType) where.codeType = codeType;

        // Filtros de fecha
        if (startDate || endDate) {
            where.scannedAt = {};
            if (startDate) where.scannedAt[Op.gte] = new Date(startDate);
            if (endDate) where.scannedAt[Op.lte] = new Date(endDate + 'T23:59:59');
        }

        const { count, rows } = await ScanLog.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'performer',
                    attributes: ['id', 'username', 'fullName'],
                    required: false
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'barcode'],
                    required: false
                }
            ],
            order: [['scannedAt', 'DESC']],
            limit,
            offset
        });

        return {
            logs: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
                hasNext: page < Math.ceil(count / limit),
                hasPrev: page > 1
            }
        };
    }

    // ============================================
    // 7. CONFIGURAR ESCÁNER
    // ============================================

    /**
     * Guarda o actualiza la configuración del escáner para un usuario
     * @param {number} userId  - ID del usuario
     * @param {Object} config  - Configuración: scannerType, allowedFormats, settings
     */
    async saveScannerConfig(userId, config) {
        const { scannerType, allowedFormats, settings } = config;

        const [scannerConfig, created] = await ScannerConfig.upsert({
            userId,
            scannerType: scannerType || 'camera',
            allowedFormats: allowedFormats || ['EAN_13', 'EAN_8', 'CODE_128', 'QR_CODE'],
            settings: settings || {}
        }, {
            returning: true
        });

        logger.info(`Configuración de escáner ${created ? 'creada' : 'actualizada'}`, { userId });

        return {
            config: scannerConfig,
            created,
            message: created ? 'Configuración creada exitosamente' : 'Configuración actualizada exitosamente'
        };
    }

    /**
     * Obtiene la configuración del escáner de un usuario
     * @param {number} userId - ID del usuario
     */
    async getScannerConfig(userId) {
        const config = await ScannerConfig.findOne({ where: { userId } });

        if (!config) {
            // Retornar configuración por defecto si no existe
            return {
                userId,
                scannerType: 'camera',
                allowedFormats: ['EAN_13', 'EAN_8', 'CODE_128', 'QR_CODE'],
                settings: {},
                isDefault: true,
                message: 'Usando configuración por defecto'
            };
        }

        return config;
    }
}

module.exports = new BarcodeService();
