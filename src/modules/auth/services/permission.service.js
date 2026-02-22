const { Role } = require('../../../database');
const { MODULES, ACTIONS, ERROR_MESSAGES } = require('../../../shared/constants/auth.constants');
const logger = require('../../../utils/logger');

/**
 * Servicio de Permisos
 * Sprint 2 - Autenticación y Autorización
 */
class PermissionService {
  /**
   * Verificar si un rol tiene permiso para una acción en un módulo
   * @param {number} roleId - ID del rol
   * @param {string} module - Módulo a verificar
   * @param {string} action - Acción a verificar
   * @returns {Promise<boolean>}
   */
  async hasPermission(roleId, module, action) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
      }

      // Verificar si el rol está activo
      if (!role.isActive) {
        return false;
      }

      // Usar el método del modelo
      return role.hasPermission(module, action);

    } catch (error) {
      logger.error('Error al verificar permiso:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los permisos de un rol
   * @param {number} roleId - ID del rol
   * @returns {Promise<Object>} Permisos del rol
   */
  async getRolePermissions(roleId) {
    try {
      const role = await Role.findByPk(roleId, {
        attributes: ['id', 'name', 'description', 'permissions']
      });

      if (!role) {
        throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
      }

      return {
        roleId: role.id,
        roleName: role.name,
        permissions: role.permissions
      };

    } catch (error) {
      logger.error('Error al obtener permisos del rol:', error);
      throw error;
    }
  }

  /**
   * Verificar múltiples permisos a la vez
   * @param {number} roleId - ID del rol
   * @param {Array} checks - Array de {module, action}
   * @returns {Promise<Object>} Mapa de permisos
   */
  async checkMultiplePermissions(roleId, checks) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
      }

      const results = {};

      for (const check of checks) {
        const key = `${check.module}.${check.action}`;
        results[key] = role.hasPermission(check.module, check.action);
      }

      return results;

    } catch (error) {
      logger.error('Error al verificar múltiples permisos:', error);
      throw error;
    }
  }

  /**
   * Obtener módulos accesibles para un rol
   * @param {number} roleId - ID del rol
   * @returns {Promise<Array>} Lista de módulos con permisos
   */
  async getAccessibleModules(roleId) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        throw new Error(ERROR_MESSAGES.ROLE_NOT_FOUND);
      }

      const permissions = role.permissions;
      const modules = [];

      // Si tiene permiso total
      if (permissions['*']) {
        return Object.values(MODULES).map(module => ({
          module,
          actions: Object.values(ACTIONS)
        }));
      }

      // Listar módulos con permisos específicos
      for (const [module, actions] of Object.entries(permissions)) {
        modules.push({
          module,
          actions: Array.isArray(actions) ? actions : []
        });
      }

      return modules;

    } catch (error) {
      logger.error('Error al obtener módulos accesibles:', error);
      throw error;
    }
  }

  /**
   * Verificar si tiene permiso de administrador total
   * @param {number} roleId - ID del rol
   * @returns {Promise<boolean>}
   */
  async isSuperAdmin(roleId) {
    try {
      const role = await Role.findByPk(roleId);

      if (!role) {
        return false;
      }

      // Verificar si tiene permiso total (*)
      return !!role.permissions['*'];

    } catch (error) {
      logger.error('Error al verificar super admin:', error);
      return false;
    }
  }

  /**
   * Obtener lista de todos los roles disponibles
   * @returns {Promise<Array>} Lista de roles
   */
  async getAllRoles() {
    try {
      const roles = await Role.getActiveRoles();
      
      return roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions
      }));

    } catch (error) {
      logger.error('Error al obtener roles:', error);
      throw error;
    }
  }

  /**
   * Formatear permisos para el frontend
   * @param {Object} permissions - Permisos del rol
   * @returns {Object} Permisos formateados
   */
  formatPermissionsForFrontend(permissions) {
    // Si tiene permiso total
    if (permissions['*']) {
      return {
        isAdmin: true,
        modules: Object.values(MODULES),
        permissions: permissions
      };
    }

    return {
      isAdmin: false,
      modules: Object.keys(permissions),
      permissions: permissions
    };
  }
}

module.exports = new PermissionService();