const userService = require('../services/user.service');
const sessionService = require('../services/session.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');
const { ERROR_MESSAGES } = require('../../../shared/constants/auth.constants');

/**
 * Controller de Gestión de Usuarios
 * Sprint 3 - Gestión de Usuarios
 */
class UserController {
  /**
   * GET /api/v1/users
   * Listar usuarios con paginación y filtros
   */
  async getUsers(req, res) {
    try {
      const { page, limit, search, roleId, isActive } = req.query;

      const result = await userService.getUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || undefined,
        roleId: roleId !== undefined ? parseInt(roleId) : undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      });

      return ApiResponse.success(res, result, 'Usuarios obtenidos exitosamente');

    } catch (error) {
      logger.error('Error en getUsers:', error);
      return ApiResponse.error(res, 'Error al obtener usuarios');
    }
  }

  /**
   * GET /api/v1/users/:id
   * Obtener usuario por ID con detalle completo
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(parseInt(req.params.id));
      return ApiResponse.success(res, { user }, 'Usuario obtenido exitosamente');

    } catch (error) {
      logger.error('Error en getUserById:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al obtener usuario');
    }
  }

  /**
   * POST /api/v1/users
   * Crear nuevo usuario
   */
  async createUser(req, res) {
    try {
      const result = await userService.createUser(req.body, req.user.id);
      return ApiResponse.created(res, result, 'Usuario creado exitosamente');

    } catch (error) {
      logger.error('Error en createUser:', error);

      if (error.message.includes('ya está en uso')) {
        return ApiResponse.conflict(res, error.message);
      }

      if (error.message === ERROR_MESSAGES.ROLE_NOT_FOUND) {
        return ApiResponse.validationError(
          res,
          [{ field: 'roleId', message: error.message }],
          error.message
        );
      }

      return ApiResponse.error(res, 'Error al crear usuario');
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Actualizar datos de un usuario
   */
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(
        parseInt(req.params.id),
        req.body,
        req.user.id
      );

      return ApiResponse.success(res, { user }, 'Usuario actualizado exitosamente');

    } catch (error) {
      logger.error('Error en updateUser:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message.includes('ya está en uso')) {
        return ApiResponse.conflict(res, error.message);
      }

      if (error.message === ERROR_MESSAGES.ROLE_NOT_FOUND) {
        return ApiResponse.validationError(
          res,
          [{ field: 'roleId', message: error.message }],
          error.message
        );
      }

      return ApiResponse.error(res, 'Error al actualizar usuario');
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Eliminar usuario (soft delete)
   */
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(parseInt(req.params.id), req.user.id);
      return ApiResponse.success(res, result, result.message);

    } catch (error) {
      logger.error('Error en deleteUser:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message.includes('propia cuenta')) {
        return ApiResponse.forbidden(res, error.message);
      }

      return ApiResponse.error(res, 'Error al eliminar usuario');
    }
  }

  /**
   * POST /api/v1/users/:id/reset-password
   * Resetear contraseña de usuario (solo administradores)
   */
  async resetPassword(req, res) {
    try {
      const result = await userService.resetPassword(
        parseInt(req.params.id),
        req.body.newPassword || null,
        req.user.id
      );

      return ApiResponse.success(res, result, result.message);

    } catch (error) {
      logger.error('Error en resetPassword:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al resetear contraseña');
    }
  }

  /**
   * PATCH /api/v1/users/:id/status
   * Cambiar estado del usuario (activar/desactivar/bloquear/desbloquear)
   */
  async changeStatus(req, res) {
    try {
      const result = await userService.changeStatus(
        parseInt(req.params.id),
        req.body.status,
        req.user.id
      );

      return ApiResponse.success(res, result, result.message);

    } catch (error) {
      logger.error('Error en changeStatus:', error);

      if (error.message === ERROR_MESSAGES.USER_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if (error.message.includes('propia cuenta') || error.message === 'Estado inválido') {
        return ApiResponse.validationError(
          res,
          [{ message: error.message }],
          error.message
        );
      }

      return ApiResponse.error(res, 'Error al cambiar estado del usuario');
    }
  }

  /**
   * GET /api/v1/users/:id/sessions
   * Ver sesiones activas del usuario
   */
  async getUserSessions(req, res) {
    try {
      const sessions = await sessionService.getUserSessions(parseInt(req.params.id));
      const activeSessions = await sessionService.countActiveSessions(parseInt(req.params.id));

      return ApiResponse.success(
        res,
        { sessions, totalActive: activeSessions },
        'Sesiones obtenidas exitosamente'
      );

    } catch (error) {
      logger.error('Error en getUserSessions:', error);
      return ApiResponse.error(res, 'Error al obtener sesiones');
    }
  }

  /**
   * POST /api/v1/users/:id/logout-all
   * Cerrar todas las sesiones activas de un usuario
   */
  async logoutAllSessions(req, res) {
    try {
      const result = await sessionService.revokeAllUserSessions(parseInt(req.params.id));
      return ApiResponse.success(res, result, result.message);

    } catch (error) {
      logger.error('Error en logoutAllSessions:', error);
      return ApiResponse.error(res, 'Error al cerrar sesiones');
    }
  }

  /**
   * GET /api/v1/users/roles
   * Obtener roles disponibles para asignar al crear/editar un usuario
   */
  async getAvailableRoles(req, res) {
    try {
      const roles = await userService.getAvailableRoles();
      return ApiResponse.success(res, roles, 'Roles obtenidos exitosamente');

    } catch (error) {
      logger.error('Error en getAvailableRoles:', error);
      return ApiResponse.error(res, 'Error al obtener roles');
    }
  }

  /**
   * POST /api/v1/users/check-availability
   * Verificar disponibilidad de username y/o email
   */
  async checkAvailability(req, res) {
    try {
      const { username, email, excludeId } = req.body;
      const result = await userService.checkAvailability(username, email, excludeId || null);

      return ApiResponse.success(res, result, 'Verificación completada');

    } catch (error) {
      logger.error('Error en checkAvailability:', error);
      return ApiResponse.error(res, 'Error al verificar disponibilidad');
    }
  }
}

module.exports = new UserController();
