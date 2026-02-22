const permissionService = require('../services/permission.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

/**
 * Controller de Roles
 * Sprint 2 - Autenticación y Autorización
 */
class RoleController {
  /**
   * GET /api/v1/roles
   * Obtener todos los roles disponibles
   */
  async getAllRoles(req, res) {
    try {
      const roles = await permissionService.getAllRoles();

      return ApiResponse.success(
        res,
        roles,
        'Roles obtenidos exitosamente'
      );

    } catch (error) {
      logger.error('Error en getAllRoles controller:', error);
      return ApiResponse.error(res, 'Error al obtener roles');
    }
  }

  /**
   * GET /api/v1/roles/:roleId
   * Obtener un rol específico por ID
   */
  async getRoleById(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);

      const rolePermissions = await permissionService.getRolePermissions(roleId);

      return ApiResponse.success(
        res,
        rolePermissions,
        'Rol obtenido exitosamente'
      );

    } catch (error) {
      logger.error('Error en getRoleById controller:', error);

      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, 'Rol no encontrado');
      }

      return ApiResponse.error(res, 'Error al obtener rol');
    }
  }

  /**
   * GET /api/v1/roles/:roleId/permissions
   * Obtener permisos de un rol específico
   */
  async getRolePermissions(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);

      const permissions = await permissionService.getRolePermissions(roleId);

      return ApiResponse.success(
        res,
        permissions,
        'Permisos obtenidos exitosamente'
      );

    } catch (error) {
      logger.error('Error en getRolePermissions controller:', error);

      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, 'Rol no encontrado');
      }

      return ApiResponse.error(res, 'Error al obtener permisos');
    }
  }

  /**
   * GET /api/v1/roles/:roleId/modules
   * Obtener módulos accesibles para un rol
   */
  async getAccessibleModules(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);

      const modules = await permissionService.getAccessibleModules(roleId);

      return ApiResponse.success(
        res,
        modules,
        'Módulos obtenidos exitosamente'
      );

    } catch (error) {
      logger.error('Error en getAccessibleModules controller:', error);

      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, 'Rol no encontrado');
      }

      return ApiResponse.error(res, 'Error al obtener módulos accesibles');
    }
  }

  /**
   * POST /api/v1/roles/:roleId/check-permission
   * Verificar si un rol tiene un permiso específico
   */
  async checkRolePermission(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);
      const { module, action } = req.body;

      const hasPermission = await permissionService.hasPermission(
        roleId,
        module,
        action
      );

      return ApiResponse.success(
        res,
        {
          roleId,
          module,
          action,
          hasPermission
        },
        hasPermission ? 'Permiso concedido' : 'Permiso denegado'
      );

    } catch (error) {
      logger.error('Error en checkRolePermission controller:', error);

      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, 'Rol no encontrado');
      }

      return ApiResponse.error(res, 'Error al verificar permiso');
    }
  }

  /**
   * POST /api/v1/roles/:roleId/check-multiple-permissions
   * Verificar múltiples permisos de un rol
   */
  async checkMultiplePermissions(req, res) {
    try {
      const roleId = parseInt(req.params.roleId);
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return ApiResponse.validationError(
          res,
          [{ field: 'permissions', message: 'Debe ser un array de permisos' }],
          'Formato de permisos inválido'
        );
      }

      const results = await permissionService.checkMultiplePermissions(
        roleId,
        permissions
      );

      return ApiResponse.success(
        res,
        {
          roleId,
          results
        },
        'Permisos verificados exitosamente'
      );

    } catch (error) {
      logger.error('Error en checkMultiplePermissions controller:', error);

      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, 'Rol no encontrado');
      }

      return ApiResponse.error(res, 'Error al verificar permisos');
    }
  }
}

module.exports = new RoleController();