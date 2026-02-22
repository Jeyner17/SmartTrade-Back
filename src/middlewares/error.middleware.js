const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

/**
 * Middleware de Manejo de Errores Global
 * Sistema Integral de Gestión Comercial
 */

/**
 * Middleware principal de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('Error capturado en middleware global:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id || 'anonymous'
  });

  // Error de Sequelize - Validación
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));

    return ApiResponse.validationError(
      res,
      errors,
      'Error de validación en la base de datos'
    );
  }

  // Error de Sequelize - Unique Constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return ApiResponse.conflict(
      res,
      `El valor del campo "${field}" ya existe en el sistema`
    );
  }

  // Error de Sequelize - Foreign Key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return ApiResponse.validationError(
      res,
      [{ message: 'Referencia inválida a otro registro' }],
      'Error de integridad referencial'
    );
  }

  // Error de Sequelize - Database
  if (err.name === 'SequelizeDatabaseError') {
    return ApiResponse.error(
      res,
      'Error en la base de datos',
      500
    );
  }

  // Error de Multer (archivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.validationError(
        res,
        [{ field: 'file', message: 'El archivo es demasiado grande' }],
        'Archivo demasiado grande'
      );
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return ApiResponse.validationError(
        res,
        [{ field: 'file', message: 'Campo de archivo inesperado' }],
        'Error en la carga del archivo'
      );
    }

    return ApiResponse.error(res, 'Error al procesar el archivo', 400);
  }

   // Errores de autenticación JWT
  if (err.name === 'UnauthorizedError') {
    return ApiResponse.unauthorized(res, 'Token inválido o expirado');
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Token inválido');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expirado');
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.validationError(
      res,
      [{ message: 'JSON mal formado' }],
      'Error de sintaxis en los datos enviados'
    );
  }

  // Error 404 personalizado
  if (err.status === 404) {
    return ApiResponse.notFound(res, err.message || 'Recurso no encontrado');
  }

  // Error 403 personalizado
  if (err.status === 403) {
    return ApiResponse.forbidden(res, err.message || 'Acceso denegado');
  }

  // Error 401 personalizado
  if (err.status === 401) {
    return ApiResponse.unauthorized(res, err.message || 'No autorizado');
  }

  // Error 400 personalizado
  if (err.status === 400) {
    return ApiResponse.error(res, err.message || 'Petición inválida', 400);
  }

  // Error genérico del servidor
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorMessage = isDevelopment
    ? err.message
    : 'Error interno del servidor';

  return ApiResponse.error(
    res,
    errorMessage,
    err.status || 500,
    isDevelopment ? { stack: err.stack } : null
  );
};

/**
 * Middleware para rutas no encontradas (404)
 */
const notFound = (req, res) => {
  logger.warn('Ruta no encontrada', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  return ApiResponse.notFound(
    res,
    `La ruta ${req.method} ${req.originalUrl} no existe`
  );
};

/**
 * Middleware para errores asíncronos
 * Wrapper para funciones async que captura errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};