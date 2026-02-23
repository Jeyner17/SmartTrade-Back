const { DataTypes } = require('sequelize');
const { SCHEMA } = require('../../../shared/constants/auth.constants');

/**
 * Modelo PasswordReset - Historial de resets de contraseña
 * Tabla: auth.password_resets
 * Sprint 3 - Gestión de Usuarios
 */
module.exports = (sequelize) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del registro'
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      comment: 'ID del usuario al que se le reseteó la contraseña'
    },

    temporaryPassword: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'temporary_password',
      comment: 'Contraseña temporal hasheada'
    },

    resetBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reset_by',
      comment: 'ID del administrador que realizó el reset'
    },

    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si la contraseña temporal fue usada'
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
      comment: 'Fecha de expiración'
    }
  }, {
    tableName: 'password_resets',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    comment: 'Historial de resets de contraseña realizados por administradores'
  });

  return PasswordReset;
};
