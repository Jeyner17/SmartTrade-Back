const authService = require('../modules/auth/services/auth.service');
const tokenService = require('../modules/auth/services/token.service');
const { ERROR_MESSAGES } = require('../shared/constants/auth.constants');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware de Autenticación
 * Sprint 2 - Autenticación y Autorización
 */

/**
 * Middleware principal de autenticación
 * Verifica que el usuario esté autenticado mediante JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    // Verificar formato: "Bearer <token>"
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return ApiResponse.unauthorized(res, 'Formato de token inválido. Use: Bearer <token>');
    }

    const token = parts[1];

    // Verificar token
    const decoded = tokenService.verifyAccessToken(token);

    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      roleId: decoded.roleId,
      roleName: decoded.roleName
    };

    // Agregar token al request por si se necesita
    req.token = token;

    logger.debug('Usuario autenticado', {
      userId: req.user.id,
      username: req.user.username,
      route: req.originalUrl
    });

    next();

  } catch (error) {
    logger.warn('Fallo de autenticación', {
      error: error.message,
      route: req.originalUrl,
      ip: req.ip
    });

    if (error.message === ERROR_MESSAGES.TOKEN_EXPIRED) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    if (error.message === ERROR_MESSAGES.TOKEN_INVALID) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_INVALID);
    }

    return ApiResponse.unauthorized(res, 'No autorizado');
  }
};

/**
 * Middleware opcional de autenticación
 * Verifica token si existe, pero no falla si no hay token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No hay token, pero continuar sin error
      return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
      const token = parts[1];

      try {
        const decoded = tokenService.verifyAccessToken(token);

        req.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          roleId: decoded.roleId,
          roleName: decoded.roleName
        };

        req.token = token;
      } catch (error) {
        // Token inválido o expirado, pero continuar sin error
        logger.debug('Token opcional inválido o expirado', { error: error.message });
      }
    }

    next();

  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
};

/**
 * Middleware para requerir un rol específico
 * @param {string|Array<string>} allowedRoles - Rol o roles permitidos
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Asegurarse que el usuario esté autenticado
    if (!req.user) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    // Convertir a array si es un solo rol
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Verificar si el usuario tiene alguno de los roles permitidos
    if (!roles.includes(req.user.roleName)) {
      logger.warn('Acceso denegado por rol', {
        userId: req.user.id,
        userRole: req.user.roleName,
        requiredRoles: roles,
        route: req.originalUrl
      });

      return ApiResponse.forbidden(
        res,
        `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      );
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario esté activo
 */
const requireActiveUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    const { User } = require('../database');

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'isActive', 'lockUntil']
    });

    if (!user) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      return ApiResponse.forbidden(res, ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    if (user.isLocked()) {
      return ApiResponse.forbidden(res, ERROR_MESSAGES.ACCOUNT_LOCKED);
    }

    next();

  } catch (error) {
    logger.error('Error al verificar usuario activo:', error);
    return ApiResponse.error(res, 'Error al verificar estado del usuario');
  }
};

/**
 * Middleware para extraer información del cliente
 * Agrega IP y user agent al request
 */
const extractClientInfo = (req, res, next) => {
  // Obtener IP real (considerar proxies)
  req.clientIp = req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress;

  // Obtener user agent
  req.userAgent = req.headers['user-agent'] || 'Unknown';

  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireActiveUser,
  extractClientInfo
};