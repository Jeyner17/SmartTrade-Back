const logger = require('../utils/logger');

/**
 * Middleware de Auditoría
 * Sprint 2 - Autenticación y Autorización
 * 
 * Registra acciones importantes del usuario
 */

/**
 * Middleware para registrar acciones de auditoría
 * @param {string} action - Acción realizada
 */
const auditLog = (action) => {
  return (req, res, next) => {
    // Guardar el método send original
    const originalSend = res.send;

    // Sobrescribir el método send
    res.send = function (data) {
      // Registrar solo si fue exitoso (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logger.info('Acción de auditoría', {
          action,
          userId: req.user?.id,
          username: req.user?.username,
          role: req.user?.roleName,
          method: req.method,
          url: req.originalUrl,
          ip: req.clientIp || req.ip,
          userAgent: req.userAgent || req.headers['user-agent'],
          timestamp: new Date().toISOString()
        });

        // TODO: En el futuro, guardar en tabla de auditoría
      }

      // Llamar al método original
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Middleware para registrar accesos a recursos sensibles
 */
const auditSensitiveAccess = (req, res, next) => {
  logger.warn('Acceso a recurso sensible', {
    userId: req.user?.id,
    username: req.user?.username,
    role: req.user?.roleName,
    method: req.method,
    url: req.originalUrl,
    ip: req.clientIp || req.ip,
    timestamp: new Date().toISOString()
  });

  next();
};

module.exports = {
  auditLog,
  auditSensitiveAccess
};