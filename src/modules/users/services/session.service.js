const { Op } = require('sequelize');
const { RefreshToken } = require('../../../database');
const logger = require('../../../utils/logger');

/**
 * Servicio de Gestión de Sesiones de Usuarios
 * Sprint 3 - Gestión de Usuarios
 */
class SessionService {
  /**
   * Obtener sesiones activas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de sesiones activas
   */
  async getUserSessions(userId) {
    const sessions = await RefreshToken.findAll({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      attributes: ['id', 'ipAddress', 'userAgent', 'createdAt', 'expiresAt'],
      order: [['createdAt', 'DESC']]
    });

    return sessions.map(session => ({
      id: session.id,
      ipAddress: session.ipAddress || 'Desconocida',
      userAgent: session.userAgent || 'Desconocido',
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isActive: session.expiresAt > new Date()
    }));
  }

  /**
   * Cerrar todas las sesiones activas de un usuario (por administrador)
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Resultado
   */
  async revokeAllUserSessions(userId) {
    const [count] = await RefreshToken.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } }
    );

    logger.info('Sesiones revocadas por administrador', { userId, sessionsRevoked: count });

    return {
      message: count > 0
        ? `Se cerraron ${count} sesión(es) activa(s)`
        : 'El usuario no tenía sesiones activas',
      sessionsRevoked: count
    };
  }

  /**
   * Contar sesiones activas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de sesiones activas
   */
  async countActiveSessions(userId) {
    return await RefreshToken.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });
  }
}

module.exports = new SessionService();
