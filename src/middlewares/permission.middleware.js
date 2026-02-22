const permissionService = require('../modules/auth/services/permission.service');
const { ERROR_MESSAGES } = require('../shared/constants/auth.constants');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware de Permisos
 * Sprint 2 - Autenticación y Autorización
 */

/**
 * Middleware para verificar permiso específico
 * @param {string} module - Módulo a verificar
 * @param {string} action - Acción a verificar
 */
const requirePermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
      }

      // Verificar permiso
      const hasPermission = await permissionService.hasPermission(
        req.user.roleId,
        module,
        action
      );

      if (!hasPermission) {
        logger.warn('Permiso denegado', {
          userId: req.user.id,
          username: req.user.username,
          role: req.user.roleName,
          module,
          action,
          route: req.originalUrl
        });

        return ApiResponse.forbidden(
          res,
          `No tiene permisos para ${action} en el módulo ${module}`
        );
      }

      logger.debug('Permiso concedido', {
        userId: req.user.id,
        module,
        action
      });

      next();

    } catch (error) {
      logger.error('Error al verificar permiso:', error);
      return ApiResponse.error(res, 'Error al verificar permisos');
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (requiere al menos uno)
 * @param {Array<{module: string, action: string}>} permissions - Array de permisos
 */
const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
      }

      // Verificar si tiene alguno de los permisos
      let hasAnyPermission = false;

      for (const { module, action } of permissions) {
        const hasPermission = await permissionService.hasPermission(
          req.user.roleId,
          module,
          action
        );

        if (hasPermission) {
          hasAnyPermission = true;
          break;
        }
      }

      if (!hasAnyPermission) {
        logger.warn('Ningún permiso concedido', {
          userId: req.user.id,
          requiredPermissions: permissions,
          route: req.originalUrl
        });

        return ApiResponse.forbidden(
          res,
          ERROR_MESSAGES.PERMISSION_DENIED
        );
      }

      next();

    } catch (error) {
      logger.error('Error al verificar permisos:', error);
      return ApiResponse.error(res, 'Error al verificar permisos');
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (requiere todos)
 * @param {Array<{module: string, action: string}>} permissions - Array de permisos
 */
const requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
      }

      // Verificar todos los permisos
      for (const { module, action } of permissions) {
        const hasPermission = await permissionService.hasPermission(
          req.user.roleId,
          module,
          action
        );

        if (!hasPermission) {
          logger.warn('Permiso faltante', {
            userId: req.user.id,
            module,
            action,
            route: req.originalUrl
          });

          return ApiResponse.forbidden(
            res,
            `Falta permiso: ${action} en ${module}`
          );
        }
      }

      next();

    } catch (error) {
      logger.error('Error al verificar permisos:', error);
      return ApiResponse.error(res, 'Error al verificar permisos');
    }
  };
};

/**
 * Middleware para verificar si es super admin
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    const isSuperAdmin = await permissionService.isSuperAdmin(req.user.roleId);

    if (!isSuperAdmin) {
      logger.warn('Acceso denegado - Se requiere super admin', {
        userId: req.user.id,
        role: req.user.roleName,
        route: req.originalUrl
      });

      return ApiResponse.forbidden(
        res,
        'Solo los administradores pueden acceder a este recurso'
      );
    }

    next();

  } catch (error) {
    logger.error('Error al verificar super admin:', error);
    return ApiResponse.error(res, 'Error al verificar permisos de administrador');
  }
};

/**
 * Middleware para verificar propiedad del recurso
 * Solo permite acceso si el usuario es dueño del recurso o es admin
 * @param {string} userIdField - Campo en req.params que contiene el userId a verificar
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, ERROR_MESSAGES.TOKEN_REQUIRED);
      }

      const resourceUserId = parseInt(req.params[userIdField]);

      // Verificar si es el dueño del recurso
      if (req.user.id === resourceUserId) {
        return next();
      }

      // Verificar si es super admin
      const isSuperAdmin = await permissionService.isSuperAdmin(req.user.roleId);

      if (isSuperAdmin) {
        return next();
      }

      logger.warn('Acceso denegado - No es dueño ni admin', {
        userId: req.user.id,
        resourceUserId,
        route: req.originalUrl
      });

      return ApiResponse.forbidden(
        res,
        'No tiene permiso para acceder a este recurso'
      );

    } catch (error) {
      logger.error('Error al verificar propiedad:', error);
      return ApiResponse.error(res, 'Error al verificar permisos');
    }
  };
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireSuperAdmin,
  requireOwnershipOrAdmin
};