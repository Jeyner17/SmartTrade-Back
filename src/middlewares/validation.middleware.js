const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware Global de Validación
 * Sistema Integral de Gestión Comercial
 * 
 * Procesa los resultados de express-validator y retorna
 * respuestas estandarizadas en caso de errores
 */

/**
 * Middleware principal de validación
 * Verifica los resultados de express-validator
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Formatear errores para respuesta consistente
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param || 'unknown',
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    // Log de errores de validación
    logger.warn('Error de validación en la petición', {
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
      ip: req.ip
    });

    return ApiResponse.validationError(
      res,
      formattedErrors,
      'Los datos proporcionados no son válidos'
    );
  }

  next();
};

/**
 * Middleware para validar IDs en parámetros de ruta
 * Verifica que el ID sea un número entero positivo
 */
const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = parseInt(req.params[paramName]);

    if (isNaN(id) || id <= 0) {
      return ApiResponse.validationError(
        res,
        [{ field: paramName, message: 'ID inválido', value: req.params[paramName] }],
        'El ID proporcionado no es válido'
      );
    }

    // Agregar ID parseado al request para uso posterior
    req.validatedId = id;
    next();
  };
};

/**
 * Middleware para validar que el body no esté vacío
 */
const validateNotEmptyBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return ApiResponse.validationError(
      res,
      [{ message: 'El cuerpo de la petición está vacío' }],
      'Debe proporcionar datos para procesar'
    );
  }

  next();
};

/**
 * Middleware para sanitizar datos del body
 * Elimina campos vacíos, null y undefined
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};

/**
 * Función auxiliar para sanitizar objetos recursivamente
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sanitizado
 */
const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Omitir valores null, undefined y strings vacíos
    if (value === null || value === undefined || value === '') {
      continue;
    }

    // Si es un objeto, sanitizar recursivamente
    if (typeof value === 'object' && !Array.isArray(value)) {
      const sanitizedNested = sanitizeObject(value);
      if (Object.keys(sanitizedNested).length > 0) {
        sanitized[key] = sanitizedNested;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Middleware para validar archivos subidos
 * @param {Object} options - Opciones de validación
 * @param {Array} options.allowedTypes - Tipos MIME permitidos
 * @param {number} options.maxSize - Tamaño máximo en bytes
 * @param {boolean} options.required - Si el archivo es requerido
 */
const validateFile = (options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize = 2 * 1024 * 1024, // 2MB por defecto
    required = true
  } = options;

  return (req, res, next) => {
    // Si el archivo es requerido y no está presente
    if (required && !req.file) {
      return ApiResponse.validationError(
        res,
        [{ field: 'file', message: 'El archivo es requerido' }],
        'Debe proporcionar un archivo'
      );
    }

    // Si no hay archivo y no es requerido, continuar
    if (!req.file) {
      return next();
    }

    // Validar tipo de archivo
    if (!allowedTypes.includes(req.file.mimetype)) {
      return ApiResponse.validationError(
        res,
        [{
          field: 'file',
          message: `Tipo de archivo no permitido. Use: ${allowedTypes.join(', ')}`,
          value: req.file.mimetype
        }],
        'Tipo de archivo no válido'
      );
    }

    // Validar tamaño
    if (req.file.size > maxSize) {
      return ApiResponse.validationError(
        res,
        [{
          field: 'file',
          message: `El archivo es demasiado grande. Máximo: ${maxSize / 1024 / 1024}MB`,
          value: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
        }],
        'Archivo demasiado grande'
      );
    }

    next();
  };
};

/**
 * Middleware para validar paginación
 * @param {Object} options - Opciones
 * @param {number} options.maxLimit - Límite máximo de resultados
 */
const validatePagination = (options = {}) => {
  const { maxLimit = 100 } = options;

  return (req, res, next) => {
    // Parsear y validar page
    let page = parseInt(req.query.page) || 1;
    if (page < 1) page = 1;

    // Parsear y validar limit
    let limit = parseInt(req.query.limit) || 10;
    if (limit < 1) limit = 10;
    if (limit > maxLimit) limit = maxLimit;

    // Agregar al request
    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };

    next();
  };
};

module.exports = {
  validateRequest,
  validateId,
  validateNotEmptyBody,
  sanitizeBody,
  validateFile,
  validatePagination,
  sanitizeObject
};