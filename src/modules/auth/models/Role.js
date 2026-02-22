const { DataTypes } = require('sequelize');
const { SCHEMA, ROLES, PERMISSIONS } = require('../../../shared/constants/auth.constants');

/**
 * Modelo Role - Roles del Sistema
 * Tabla: auth.roles
 * Sprint 2 - Autenticación y Autorización
 */
module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del rol'
    },
    
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El nombre del rol es requerido'
        },
        isIn: {
          args: [Object.values(ROLES)],
          msg: 'Rol no válido'
        }
      },
      comment: 'Nombre del rol'
    },
    
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Descripción del rol'
    },
    
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Permisos del rol en formato JSON'
    },
    
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Indica si el rol está activo'
    }
  }, {
    tableName: 'roles',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    
    indexes: [
      {
        unique: true,
        fields: ['name'],
        name: 'roles_name_unique'
      },
      {
        fields: ['is_active'],
        name: 'roles_is_active_idx'
      }
    ],
    
    comment: 'Tabla de roles del sistema'
  });

  /**
   * Método de instancia: Verificar si tiene permiso
   */
  Role.prototype.hasPermission = function(module, action) {
    // Si tiene permiso total (*)
    if (this.permissions['*']) {
      return true;
    }
    
    // Verificar permiso específico
    if (this.permissions[module]) {
      return this.permissions[module].includes(action);
    }
    
    return false;
  };

  /**
   * Método de clase: Obtener roles activos
   */
  Role.getActiveRoles = async function() {
    return await this.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'permissions']
    });
  };

  return Role;
};