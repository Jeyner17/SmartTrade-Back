/**
 * Utilidad para generación de códigos QR en base64
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 *
 * Requiere: npm install qrcode
 */

const QRCode = require('qrcode');
const logger = require('./logger');

/**
 * Genera un código QR en formato base64 (data URI)
 * @param {string|Object} data - Datos a codificar (string o JSON serializable)
 * @param {Object} options - Opciones de generación
 * @param {number} options.width - Ancho en px (default: 300)
 * @param {string} options.errorCorrectionLevel - L | M | Q | H (default: 'M')
 * @param {string} options.color - Color del QR en hex (default: '#000000')
 * @param {string} options.background - Color de fondo en hex (default: '#ffffff')
 * @returns {Promise<string>} Data URI en base64 (data:image/png;base64,...)
 */
async function generateQRBase64(data, options = {}) {
    const {
        width = 300,
        errorCorrectionLevel = 'M',
        color = '#000000',
        background = '#ffffff'
    } = options;

    // Serializar a string si es objeto
    const content = typeof data === 'object' ? JSON.stringify(data) : String(data);

    const qrDataUrl = await QRCode.toDataURL(content, {
        width,
        errorCorrectionLevel,
        color: {
            dark: color,
            light: background
        },
        margin: 1
    });

    return qrDataUrl;
}

/**
 * Genera un código QR como Buffer (PNG en memoria)
 * @param {string|Object} data - Datos a codificar
 * @param {Object} options - Opciones de generación
 * @returns {Promise<Buffer>}
 */
async function generateQRBuffer(data, options = {}) {
    const {
        width = 300,
        errorCorrectionLevel = 'M'
    } = options;

    const content = typeof data === 'object' ? JSON.stringify(data) : String(data);

    return await QRCode.toBuffer(content, {
        width,
        errorCorrectionLevel,
        margin: 1
    });
}

/**
 * Genera una cadena SVG del código QR
 * @param {string|Object} data - Datos a codificar
 * @returns {Promise<string>} SVG como string
 */
async function generateQRSvg(data) {
    const content = typeof data === 'object' ? JSON.stringify(data) : String(data);
    return await QRCode.toString(content, { type: 'svg', margin: 1 });
}

module.exports = {
    generateQRBase64,
    generateQRBuffer,
    generateQRSvg
};
