const authService = require('../services/auth.service');
const permissionService = require('../services/permission.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../../../shared/constants/auth.constants');

/**
 * Controller de Autenticación
 * Sprint 2 - Autenticación y Autorización
 */
class AuthController {
  /**
   * POST /api/v1/auth/login
   * Iniciar sesión
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const ipAddress = req.clientIp || req.ip;
      const userAgent = req.userAgent || req.headers['user-agent'];

      const result = await authService.login(
        username,
        password,
        ipAddress,
        userAgent
      );

      return ApiResponse.success(
        res,
        result,
        SUCCESS_MESSAGES.LOGIN_SUCCESS
      );

    } catch (error) {
      logger.error('Error en login controller:', error);

      // Errores específicos de autenticación
      if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
        return ApiResponse.unauthorized(res, error.message);
      }

      if (error.message === ERROR_MESSAGES.ACCOUNT_LOCKED) {
        return ApiResponse.forbidden(res, error.message);
      }

      if (error.message === ERROR_MESSAGES.ACCOUNT_INACTIVE) {
        return ApiResponse.forbidden(res, error.message);
      }

      return ApiResponse.error(res, 'Error al iniciar sesión');
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Cerrar sesión
   */
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;

      await authService.logout(refreshToken, userId);

      return ApiResponse.success(
        res,
        null,
        SUCCESS_MESSAGES.LOGOUT_SUCCESS
      );

    } catch (error) {
      logger.error('Error en logout controller:', error);
      return ApiResponse.error(res, 'Error al cerrar sesión');
    }
  }

  /**
   * POST /api/v1/auth/logout-all
   * Cerrar todas las sesiones del usuario
   */
  async logoutAll(req, res) {
    try {
      const userId = req.user.id;

      const result = await authService.logoutAll(userId);

      return ApiResponse.success(
        res,
        result,
        SUCCESS_MESSAGES.LOGOUT_SUCCESS
      );

    } catch (error) {
      logger.error('Error en logout-all controller:', error);
      return ApiResponse.error(res, 'Error al cerrar sesiones');
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refrescar token de acceso
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.clientIp || req.ip;
      const userAgent = req.userAgent || req.headers['user-agent'];

      const result = await authService.refreshToken(
        refreshToken,
        ipAddress,
        userAgent
      );

      return ApiResponse.success(
        res,
        result,
        SUCCESS_MESSAGES.TOKEN_REFRESHED
      );

    } catch (error) {
      logger.error('Error en refresh token controller:', error);

      if (error.message === ERROR_MESSAGES.REFRESH_TOKEN_INVALID) {
        return ApiResponse.unauthorized(res, error.message);
      }

      if (error.message === ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED) {
        return ApiResponse.unauthorized(res, error.message);
      }

      return ApiResponse.error(res, 'Error al refrescar token');
    }
  }

  /**
   * GET /api/v1/auth/profile
   * Obtener perfil del usuario autenticado
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const profile = await authService.getProfile(userId);

      return ApiResponse.success(
        res,
        profile,
        'Perfil obtenido exitosamente'
      );

    } catch (error) {
      logger.error('Error en getProfile controller:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al obtener perfil');
    }
  }

  /**
   * POST /api/v1/auth/verify-permission
   * Verificar si el usuario tiene un permiso específico
   */
  async verifyPermission(req, res) {
    try {
      const { module, action } = req.body;
      const userId = req.user.id;

      const hasPermission = await authService.verifyPermission(
        userId,
        module,
        action
      );

      return ApiResponse.success(
        res,
        { 
          hasPermission,
          module,
          action
        },
        hasPermission ? 'Permiso concedido' : 'Permiso denegado'
      );

    } catch (error) {
      logger.error('Error en verifyPermission controller:', error);
      return ApiResponse.error(res, 'Error al verificar permiso');
    }
  }

  /**
   * POST /api/v1/auth/change-password
   * Cambiar contraseña del usuario autenticado
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword
      );

      return ApiResponse.success(
        res,
        result,
        SUCCESS_MESSAGES.PASSWORD_UPDATED
      );

    } catch (error) {
      logger.error('Error en changePassword controller:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message === 'Contraseña actual incorrecta') {
        return ApiResponse.validationError(
          res,
          [{ field: 'currentPassword', message: error.message }],
          error.message
        );
      }

      return ApiResponse.error(res, 'Error al cambiar contraseña');
    }
  }

  /**
   * GET /api/v1/auth/me
   * Obtener información básica del usuario autenticado (versión ligera)
   */
  async getCurrentUser(req, res) {
    try {
      return ApiResponse.success(
        res,
        {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          roleName: req.user.roleName
        },
        'Usuario autenticado'
      );

    } catch (error) {
      logger.error('Error en getCurrentUser controller:', error);
      return ApiResponse.error(res, 'Error al obtener usuario');
    }
  }

  /**
   * GET /api/v1/auth/check
   * Verificar si el token es válido (health check de autenticación)
   */
  async checkAuth(req, res) {
    try {
      // Si llegó aquí, el middleware de auth ya validó el token
      return ApiResponse.success(
        res,
        {
          authenticated: true,
          user: {
            id: req.user.id,
            username: req.user.username,
            roleName: req.user.roleName
          }
        },
        'Token válido'
      );

    } catch (error) {
      logger.error('Error en checkAuth controller:', error);
      return ApiResponse.error(res, 'Error al verificar autenticación');
    }
  }
}

module.exports = new AuthController();