const { User, Role } = require('../../../database');
const tokenService = require('./token.service');
const permissionService = require('./permission.service');
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SECURITY
} = require('../../../shared/constants/auth.constants');
const logger = require('../../../utils/logger');

/**
 * Servicio de Autenticación
 * Sprint 2 - Autenticación y Autorización
 */
class AuthService {
  /**
   * Iniciar sesión
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @param {string} ipAddress - Dirección IP
   * @param {string} userAgent - User agent
   * @returns {Promise<Object>} Datos de sesión
   */
  async login(username, password, ipAddress = null, userAgent = null) {
    try {
      // Buscar usuario con su rol
      const user = await User.findOne({
        where: { username },
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description', 'permissions']
        }]
      });

      // Verificar que el usuario existe
      if (!user) {
        logger.warn('Intento de login con usuario inexistente', { username, ipAddress });
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Verificar que la cuenta esté activa
      if (!user.isActive) {
        logger.warn('Intento de login en cuenta inactiva', { username, ipAddress });
        throw new Error(ERROR_MESSAGES.ACCOUNT_INACTIVE);
      }

      // Verificar que la cuenta no esté bloqueada
      if (user.isLocked()) {
        logger.warn('Intento de login en cuenta bloqueada', { username, ipAddress });
        throw new Error(ERROR_MESSAGES.ACCOUNT_LOCKED);
      }

      // Verificar contraseña
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        // Incrementar intentos fallidos
        await user.incLoginAttempts();

        logger.warn('Intento de login con contraseña incorrecta', {
          username,
          attempts: user.loginAttempts + 1,
          ipAddress
        });

        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Login exitoso - resetear intentos fallidos
      await user.resetLoginAttempts();

      // Generar tokens
      const accessToken = tokenService.generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name
      });

      const refreshToken = await tokenService.generateRefreshToken(
        user.id,
        ipAddress,
        userAgent
      );

      // Obtener permisos formateados
      const permissions = permissionService.formatPermissionsForFrontend(
        user.role.permissions
      );

      logger.success('Login exitoso', {
        userId: user.id,
        username: user.username,
        role: user.role.name,
        ipAddress
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.getFullName(),
          role: {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description
          }
        },
        permissions,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: SECURITY.JWT_EXPIRES_IN
        }
      };

    } catch (error) {
      logger.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   * @param {string} refreshToken - Token de refresco a invalidar
   * @param {number} userId - ID del usuario (opcional)
   * @returns {Promise<Object>}
   */
  async logout(refreshToken, userId = null) {
    try {
      // Revocar el refresh token específico
      await tokenService.revokeRefreshToken(refreshToken);

      logger.info('Logout exitoso', { userId });

      return {
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
      };

    } catch (error) {
      logger.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Cerrar todas las sesiones de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>}
   */
  async logoutAll(userId) {
    try {
      const count = await tokenService.revokeAllUserTokens(userId);

      logger.info('Logout de todas las sesiones', { userId, count });

      return {
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        sessionsRevoked: count
      };

    } catch (error) {
      logger.error('Error en logout all:', error);
      throw error;
    }
  }

  /**
   * Refrescar token de acceso
   * @param {string} refreshToken - Token de refresco
   * @param {string} ipAddress - Dirección IP
   * @param {string} userAgent - User agent
   * @returns {Promise<Object>} Nuevos tokens
   */
  async refreshToken(refreshToken, ipAddress = null, userAgent = null) {
    try {
      // Verificar refresh token
      const { refreshToken: tokenRecord, decoded } = await tokenService.verifyRefreshToken(
        refreshToken
      );

      // Buscar usuario con rol
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'permissions']
        }]
      });

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verificar que la cuenta esté activa
      if (!user.isActive) {
        throw new Error(ERROR_MESSAGES.ACCOUNT_INACTIVE);
      }

      // Revocar el refresh token anterior
      await tokenService.revokeRefreshToken(refreshToken);

      // Generar nuevos tokens
      const newAccessToken = tokenService.generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name
      });

      const newRefreshToken = await tokenService.generateRefreshToken(
        user.id,
        ipAddress,
        userAgent
      );

      logger.info('Token refrescado exitosamente', { userId: user.id });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: SECURITY.JWT_EXPIRES_IN
      };

    } catch (error) {
      logger.error('Error al refrescar token:', error);
      throw error;
    }
  }

  /**
   * Verificar permisos de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} module - Módulo a verificar
   * @param {string} action - Acción a verificar
   * @returns {Promise<boolean>}
   */
  async verifyPermission(userId, module, action) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'roleId']
      });

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const hasPermission = await permissionService.hasPermission(
        user.roleId,
        module,
        action
      );

      return hasPermission;

    } catch (error) {
      logger.error('Error al verificar permiso:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description', 'permissions']
        }],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Obtener módulos accesibles
      const accessibleModules = await permissionService.getAccessibleModules(user.roleId);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.getFullName(),
        role: {
          id: user.role.id,
          name: user.role.name,
          description: user.role.description
        },
        permissions: permissionService.formatPermissionsForFrontend(user.role.permissions),
        accessibleModules,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      };

    } catch (error) {
      logger.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   * @param {number} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Verificar contraseña actual
      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Actualizar contraseña
      user.password = newPassword;
      await user.save();

      // Revocar todos los tokens existentes por seguridad
      await tokenService.revokeAllUserTokens(userId);

      logger.info('Contraseña cambiada exitosamente', { userId });

      return {
        message: SUCCESS_MESSAGES.PASSWORD_UPDATED
      };

    } catch (error) {
      logger.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Validar token de acceso
   * @param {string} token - Token a validar
   * @returns {Object} Datos del usuario del token
   */
  validateAccessToken(token) {
    try {
      return tokenService.verifyAccessToken(token);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();