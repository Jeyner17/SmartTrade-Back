const validator = require('validator');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware de Seguridad
 * Sprint 1 - Configuración del Sistema
 * 
 * Valida y sanitiza datos para prevenir ataques comunes
 */

/**
 * Sanitizar entradas contra XSS
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Función auxiliar para sanitizar objetos recursivamente
 */
const sanitizeObject = (obj) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Escape de caracteres HTML peligrosos
      sanitized[key] = validator.escape(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? validator.escape(item) :
        typeof item === 'object' ? sanitizeObject(item) :
        item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Validar contra SQL Injection en campos específicos
 */
const preventSqlInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(;|--|\/\*|\*\/|xp_|sp_)/gi,
    /('|")(.*)(OR|AND)(.*)(=|<|>)/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(value)) {
          return true;
        }
      }
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (checkObject(value)) return true;
      } else if (checkValue(value)) {
        return true;
      }
    }
    return false;
  };

  if (req.body && checkObject(req.body)) {
    logger.warn('Intento de SQL Injection detectado', {
      ip: req.ip,
      url: req.originalUrl,
      body: req.body
    });

    return ApiResponse.validationError(
      res,
      [{ message: 'Contenido sospechoso detectado' }],
      'Los datos proporcionados contienen caracteres no permitidos'
    );
  }

  next();
};

/**
 * Validar contra inyección de NoSQL
 */
const preventNoSqlInjection = (req, res, next) => {
  const checkForNoSqlInjection = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      // Verificar operadores de MongoDB
      if (key.startsWith('$')) {
        return true;
      }

      if (typeof value === 'object' && value !== null) {
        if (checkForNoSqlInjection(value)) {
          return true;
        }
      }
    }
    return false;
  };

  if (req.body && checkForNoSqlInjection(req.body)) {
    logger.warn('Intento de NoSQL Injection detectado', {
      ip: req.ip,
      url: req.originalUrl
    });

    return ApiResponse.validationError(
      res,
      [{ message: 'Operadores no permitidos detectados' }],
      'Los datos proporcionados contienen operadores no permitidos'
    );
  }

  next();
};

/**
 * Limitar tamaño del payload
 */
const limitPayloadSize = (maxSize = 10 * 1024 * 1024) => { // 10MB por defecto
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length']);

    if (contentLength && contentLength > maxSize) {
      logger.warn('Payload demasiado grande', {
        ip: req.ip,
        size: contentLength,
        maxSize
      });

      return ApiResponse.error(
        res,
        'El tamaño de la petición excede el límite permitido',
        413
      );
    }

    next();
  };
};

/**
 * Validar Content-Type permitidos
 */
const validateContentType = (allowedTypes = ['application/json', 'multipart/form-data']) => {
  return (req, res, next) => {
    // Skip para peticiones GET
    if (req.method === 'GET') {
      return next();
    }

    const contentType = req.headers['content-type'];

    if (!contentType) {
      return ApiResponse.validationError(
        res,
        [{ message: 'Content-Type header es requerido' }],
        'Header Content-Type faltante'
      );
    }

    const isAllowed = allowedTypes.some(type =>
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      return ApiResponse.validationError(
        res,
        [{
          message: `Content-Type no permitido. Use: ${allowedTypes.join(', ')}`,
          value: contentType
        }],
        'Content-Type no válido'
      );
    }

    next();
  };
};

/**
 * Prevenir CSRF para peticiones que modifican datos
 */
const preventCsrf = (req, res, next) => {
  // Solo validar en métodos que modifican datos
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    // Verificar que la petición venga de un origen confiable
    const origin = req.headers.origin || req.headers.referer;

    if (!origin) {
      logger.warn('Petición sin origen detectada', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method
      });

      return ApiResponse.forbidden(
        res,
        'Petición no autorizada'
      );
    }

    // Aquí puedes agregar lógica adicional para validar el origen
    // Por ejemplo, verificar contra una lista de dominios permitidos
  }

  next();
};

module.exports = {
  sanitizeInput,
  preventSqlInjection,
  preventNoSqlInjection,
  limitPayloadSize,
  validateContentType,
  preventCsrf
};