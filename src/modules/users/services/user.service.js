const { Op } = require('sequelize');
const { User, Role, RefreshToken, PasswordReset } = require('../../../database');
const { ERROR_MESSAGES, SECURITY } = require('../../../shared/constants/auth.constants');
const logger = require('../../../utils/logger');

/**
 * Servicio de Gestión de Usuarios
 * Sprint 3 - Gestión de Usuarios
 */
class UserService {
  /**
   * Listar usuarios con paginación y filtros
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista paginada de usuarios
   */
  async getUsers({ page = 1, limit = 10, search, roleId, isActive }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (roleId !== undefined) {
      where.roleId = roleId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name']
      }],
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Obtener usuario por ID con detalle completo
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'description']
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Crear nuevo usuario
   * @param {Object} data - Datos del usuario
   * @param {number} createdById - ID del usuario que crea
   * @returns {Promise<Object>} Usuario creado y contraseña temporal
   */
  async createUser(data, createdById) {
    const {
      username,
      email,
      firstName,
      lastName,
      roleId,
      isActive = true,
      mustChangePassword = true,
      password
    } = data;

    // Verificar unicidad de username
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      throw new Error('El nombre de usuario ya está en uso');
    }

    // Verificar unicidad de email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('El email ya está en uso');
    }

    // Verificar que el rol existe y está activo
    const role = await Role.findByPk(roleId);
    if (!role) {
      throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    // Usar password proporcionado o generar uno temporal
    const finalPassword = password || this._generateTempPassword();

    const user = await User.create({
      username,
      email,
      password: finalPassword,
      firstName,
      lastName,
      roleId,
      isActive,
      mustChangePassword,
      createdBy: createdById
    });

    // Recargar con relaciones
    await user.reload({
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    logger.success('Usuario creado exitosamente', {
      userId: user.id,
      username: user.username,
      createdBy: createdById
    });

    return {
      user,
      temporaryPassword: !password ? finalPassword : null,
      mustChangePassword
    };
  }

  /**
   * Actualizar datos de un usuario
   * @param {number} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @param {number} updatedById - ID del usuario que actualiza
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(id, data, updatedById) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const { username, email, firstName, lastName, roleId, isActive } = data;

    // Verificar unicidad de username si cambió
    if (username && username !== user.username) {
      const existing = await User.findOne({
        where: { username, id: { [Op.ne]: id } }
      });
      if (existing) throw new Error('El nombre de usuario ya está en uso');
    }

    // Verificar unicidad de email si cambió
    if (email && email !== user.email) {
      const existing = await User.findOne({
        where: { email, id: { [Op.ne]: id } }
      });
      if (existing) throw new Error('El email ya está en uso');
    }

    // Verificar que el rol existe
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
    }

    const updates = { updatedBy: updatedById };
    if (username !== undefined) updates.username = username;
    if (email !== undefined) updates.email = email;
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (roleId !== undefined) updates.roleId = roleId;
    if (isActive !== undefined) updates.isActive = isActive;

    await user.update(updates);

    await user.reload({
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    logger.info('Usuario actualizado', { userId: user.id, updatedBy: updatedById });

    return user;
  }

  /**
   * Eliminar usuario (soft delete)
   * @param {number} id - ID del usuario
   * @param {number} deletedById - ID del usuario que elimina
   * @returns {Promise<Object>} Mensaje de confirmación
   */
  async deleteUser(id, deletedById) {
    if (id === deletedById) {
      throw new Error('No puede eliminar su propia cuenta');
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Desactivar cuenta antes de soft delete
    await user.update({ isActive: false, updatedBy: deletedById });

    // Soft delete (paranoid: true en el modelo)
    await user.destroy();

    // Revocar todos los tokens activos
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId: id, isRevoked: false } }
    );

    logger.info('Usuario eliminado (soft delete)', { userId: id, deletedBy: deletedById });

    return { message: 'Usuario eliminado exitosamente' };
  }

  /**
   * Resetear contraseña de usuario (por administrador)
   * @param {number} id - ID del usuario
   * @param {string|null} newPassword - Nueva contraseña (opcional, se genera si no se provee)
   * @param {number} resetById - ID del admin que hace el reset
   * @returns {Promise<Object>} Resultado con contraseña temporal
   */
  async resetPassword(id, newPassword, resetById) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const tempPassword = newPassword || this._generateTempPassword();

    // Actualizar contraseña (el hook de beforeUpdate la hashea)
    await user.update({
      password: tempPassword,
      mustChangePassword: true,
      loginAttempts: 0,
      lockUntil: null,
      updatedBy: resetById
    });

    // Registrar el reset en el historial
    await PasswordReset.create({
      userId: id,
      temporaryPassword: user.password, // Ya hasheada por el hook
      resetBy: resetById,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
    });

    // Revocar todos los tokens activos del usuario
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId: id, isRevoked: false } }
    );

    logger.info('Contraseña reseteada por administrador', {
      userId: id,
      resetBy: resetById
    });

    return {
      message: 'Contraseña reseteada exitosamente',
      temporaryPassword: tempPassword,
      mustChangePassword: true,
      expiresIn: '24 horas'
    };
  }

  /**
   * Cambiar estado del usuario
   * @param {number} id - ID del usuario
   * @param {string} status - Nuevo estado: 'active' | 'inactive' | 'unlock' | 'lock'
   * @param {number} updatedById - ID del admin que hace el cambio
   * @returns {Promise<Object>} Resultado
   */
  async changeStatus(id, status, updatedById) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (id === updatedById && status === 'inactive') {
      throw new Error('No puede desactivar su propia cuenta');
    }

    const updates = { updatedBy: updatedById };

    switch (status) {
      case 'active':
        updates.isActive = true;
        updates.loginAttempts = 0;
        updates.lockUntil = null;
        break;

      case 'inactive':
        updates.isActive = false;
        // Revocar sesiones activas
        await RefreshToken.update(
          { isRevoked: true },
          { where: { userId: id, isRevoked: false } }
        );
        break;

      case 'unlock':
        updates.loginAttempts = 0;
        updates.lockUntil = null;
        break;

      case 'lock':
        // Bloquear por 24 horas
        updates.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await RefreshToken.update(
          { isRevoked: true },
          { where: { userId: id, isRevoked: false } }
        );
        break;

      default:
        throw new Error('Estado inválido');
    }

    await user.update(updates);
    await user.reload({ attributes: { exclude: ['password'] } });

    const statusMessages = {
      active: 'Usuario activado exitosamente',
      inactive: 'Usuario desactivado exitosamente',
      unlock: 'Cuenta desbloqueada exitosamente',
      lock: 'Cuenta bloqueada exitosamente'
    };

    logger.info('Estado de usuario cambiado', { userId: id, status, updatedBy: updatedById });

    return {
      message: statusMessages[status],
      user: {
        id: user.id,
        username: user.username,
        isActive: user.isActive,
        loginAttempts: user.loginAttempts,
        lockUntil: user.lockUntil
      }
    };
  }

  /**
   * Verificar disponibilidad de username y/o email
   * @param {string} username - Username a verificar
   * @param {string} email - Email a verificar
   * @param {number} excludeId - ID a excluir (para edición)
   * @returns {Promise<Object>} Disponibilidad de cada campo
   */
  async checkAvailability(username, email, excludeId = null) {
    const result = {};

    if (username) {
      const where = { username };
      if (excludeId) where.id = { [Op.ne]: excludeId };
      const existing = await User.findOne({ where });
      result.username = {
        available: !existing,
        value: username
      };
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        const where = { email };
        if (excludeId) where.id = { [Op.ne]: excludeId };
        const existing = await User.findOne({ where });
        result.email = {
          available: !existing,
          value: email
        };
      } else {
        result.email = {
          available: null,
          value: email
        };
      }
    }

    return result;
  }

  /**
   * Obtener roles disponibles para asignar a un usuario
   * @returns {Promise<Array>} Lista de roles activos
   */
  async getAvailableRoles() {
    const roles = await Role.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']]
    });

    return roles;
  }

  /**
   * Generar contraseña temporal segura
   * @returns {string} Contraseña temporal
   */
  _generateTempPassword() {
    const uppercase = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$';

    // Asegurar al menos uno de cada tipo
    let password = '';
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));

    // Rellenar hasta 10 caracteres
    const all = uppercase + lowercase + numbers + symbols;
    for (let i = 4; i < 10; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length));
    }

    // Mezclar caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

module.exports = new UserService();
