/**
 * Constantes del módulo de Códigos de Barras/QR
 * Sprint 11 - Escaneo de Códigos de Barras/QR
 */

// Tipos de código soportados
const BARCODE_TYPES = ['barcode', 'qr'];

// Contextos de uso al escanear
const SCAN_CONTEXTS = ['venta', 'recepcion', 'consulta'];

// Resultados posibles de un escaneo
const SCAN_RESULTS = ['found', 'not_found', 'error'];

// Tipos de datos que puede codificar un QR
const QR_TYPES = ['producto', 'factura', 'credito'];

// Tipos de escáner físico
const SCANNER_TYPES = ['camera', 'device'];

// Formatos de código de barras/QR reconocidos por el frontend
const BARCODE_FORMATS = [
    'EAN_13',
    'EAN_8',
    'CODE_128',
    'CODE_39',
    'QR_CODE',
    'DATA_MATRIX',
    'UPC_A',
    'UPC_E',
    'ITF',
    'CODABAR'
];

// Mensajes de error
const BARCODE_ERRORS = {
    NOT_FOUND: 'Código no encontrado en el sistema',
    PRODUCT_NOT_FOUND: 'No existe un producto con ese código de barras',
    INVALID_CODE: 'El código proporcionado es inválido o está vacío',
    INVALID_TYPE: 'Tipo de código no soportado',
    INVALID_CONTEXT: 'Contexto de escaneo no válido',
    INVALID_QR_FORMAT: 'El contenido del QR no tiene el formato esperado',
    INVALID_QR_TYPE: 'Tipo de QR no soportado',
    CONFIG_NOT_FOUND: 'No se encontró configuración para este usuario',
    GENERATE_ERROR: 'Error al generar el código QR'
};

// Mensajes de éxito
const BARCODE_SUCCESS = {
    SCAN_REGISTERED: 'Escaneo registrado exitosamente',
    QR_GENERATED: 'Código QR generado exitosamente',
    CONFIG_SAVED: 'Configuración del escáner guardada exitosamente',
    CODE_VERIFIED: 'Verificación de código completada'
};

module.exports = {
    BARCODE_TYPES,
    SCAN_CONTEXTS,
    SCAN_RESULTS,
    QR_TYPES,
    SCANNER_TYPES,
    BARCODE_FORMATS,
    BARCODE_ERRORS,
    BARCODE_SUCCESS
};
