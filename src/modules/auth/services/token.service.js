const jwt = require('jsonwebtoken');
const jwtConfig = require('../../../config/jwt');
const { RefreshToken } = require('../../../database');
const { ERROR_MESSAGES } = require('../../../shared/constants/auth.constants');
const logger = require('../../../utils/logger');

/**
 * Servicio de Tokens JWT
 * Sprint 2 - Autenticación y Autorización
 */
class TokenService {
  /**
   * Generar Access Token (JWT)
   * @param {Object} payload - Datos del usuario a incluir en el token
   * @returns {string} Token JWT
   */
  generateAccessToken(payload) {
    try {
      const token = jwt.sign(
        {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          roleId: payload.roleId,
          roleName: payload.roleName
        },
        jwtConfig.secret,
        {
          expiresIn: jwtConfig.expiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        }
      );

      logger.info('Access token generado', { userId: payload.id });
      return token;

    } catch (error) {
      logger.error('Error al generar access token:', error);
      throw new Error('Error al generar token de acceso');
    }
  }

  /**
   * Generar Refresh Token
   * @param {number} userId - ID del usuario
   * @param {string} ipAddress - Dirección IP
   * @param {string} userAgent - User agent del navegador
   * @returns {Promise<string>} Refresh token
   */
  async generateRefreshToken(userId, ipAddress = null, userAgent = null) {
    try {
      // Generar token JWT para refresh
      const token = jwt.sign(
        { userId },
        jwtConfig.refreshSecret,
        {
          expiresIn: jwtConfig.refreshExpiresIn,
          issuer: jwtConfig.issuer,
          audience: jwtConfig.audience
        }
      );

      // Calcular fecha de expiración
      const expiresAt = new Date();
      const daysMatch = jwtConfig.refreshExpiresIn.match(/(\d+)d/);
      if (daysMatch) {
        expiresAt.setDate(expiresAt.getDate() + parseInt(daysMatch[1]));
      }

      // Guardar en base de datos
      await RefreshToken.create({
        token,
        userId,
        expiresAt,
        ipAddress,
        userAgent
      });

      logger.info('Refresh token generado y guardado', { userId });
      return token;

    } catch (error) {
      logger.error('Error al generar refresh token:', error);
      throw new Error('Error al generar refresh token');
    }
  }

  /**
   * Verificar Access Token
   * @param {string} token - Token a verificar
   * @returns {Object} Payload decodificado
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      return decoded;

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
      } else {
        throw new Error(ERROR_MESSAGES.TOKEN_INVALID);
      }
    }
  }

  /**
   * Verificar Refresh Token
   * @param {string} token - Refresh token a verificar
   * @returns {Promise<Object>} Token de BD y payload decodificado
   */
  async verifyRefreshToken(token) {
    try {
      // Verificar firma JWT
      const decoded = jwt.verify(token, jwtConfig.refreshSecret, {
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience
      });

      // Buscar en base de datos
      const refreshToken = await RefreshToken.findOne({
        where: { token }
      });

      if (!refreshToken) {
        throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
      }

      // Verificar que no esté revocado
      if (refreshToken.isRevoked) {
        throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
      }

      // Verificar que no esté expirado
      if (refreshToken.isExpired()) {
        throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED);
      }

      return { refreshToken, decoded };

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED);
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
      } else {
        throw error;
      }
    }
  }

  /**
   * Revocar Refresh Token
   * @param {string} token - Token a revocar
   * @returns {Promise<boolean>}
   */
  async revokeRefreshToken(token) {
    try {
      const refreshToken = await RefreshToken.findOne({
        where: { token }
      });

      if (!refreshToken) {
        return false;
      }

      await refreshToken.update({ isRevoked: true });

      logger.info('Refresh token revocado', { tokenId: refreshToken.id });
      return true;

    } catch (error) {
      logger.error('Error al revocar refresh token:', error);
      throw new Error('Error al revocar refresh token');
    }
  }

  /**
   * Revocar todos los refresh tokens de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de tokens revocados
   */
  async revokeAllUserTokens(userId) {
    try {
      const result = await RefreshToken.update(
        { isRevoked: true },
        {
          where: {
            userId,
            isRevoked: false
          }
        }
      );

      logger.info('Todos los refresh tokens del usuario revocados', { userId, count: result[0] });
      return result[0];

    } catch (error) {
      logger.error('Error al revocar tokens del usuario:', error);
      throw new Error('Error al revocar tokens');
    }
  }

  /**
   * Limpiar tokens expirados (tarea programada)
   * @returns {Promise<number>} Cantidad de tokens eliminados
   */
  async cleanExpiredTokens() {
    try {
      const count = await RefreshToken.cleanExpired();
      logger.info('Tokens expirados limpiados', { count });
      return count;

    } catch (error) {
      logger.error('Error al limpiar tokens expirados:', error);
      throw error;
    }
  }

  /**
   * Decodificar token sin verificar (para debugging)
   * @param {string} token - Token a decodificar
   * @returns {Object} Payload decodificado
   */
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new TokenService();