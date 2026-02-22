const { DataTypes } = require('sequelize');
const { SCHEMA } = require('../../../shared/constants/auth.constants');

/**
 * Modelo RefreshToken - Tokens de Refresco
 * Tabla: auth.refresh_tokens
 * Sprint 2 - Autenticación y Autorización
 */
module.exports = (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del refresh token'
    },
    
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
      comment: 'Token de refresco'
    },
    
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'ID del usuario asociado'
    },
    
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at',
      comment: 'Fecha de expiración del token'
    },
    
    isRevoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_revoked',
      comment: 'Indica si el token ha sido revocado'
    },
    
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
      comment: 'Dirección IP que generó el token'
    },
    
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'user_agent',
      comment: 'User agent del navegador'
    }
  }, {
    tableName: 'refresh_tokens',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    
    indexes: [
      {
        unique: true,
        fields: ['token'],
        name: 'refresh_tokens_token_unique'
      },
      {
        fields: ['user_id'],
        name: 'refresh_tokens_user_id_idx'
      },
      {
        fields: ['expires_at'],
        name: 'refresh_tokens_expires_at_idx'
      },
      {
        fields: ['is_revoked'],
        name: 'refresh_tokens_is_revoked_idx'
      }
    ],
    
    comment: 'Tabla de tokens de refresco'
  });

  /**
   * Método de instancia: Verificar si está expirado
   */
  RefreshToken.prototype.isExpired = function() {
    return this.expiresAt < new Date();
  };

  /**
   * Método de instancia: Verificar si es válido
   */
  RefreshToken.prototype.isValid = function() {
    return !this.isRevoked && !this.isExpired();
  };

  /**
   * Método de clase: Limpiar tokens expirados
   */
  RefreshToken.cleanExpired = async function() {
    return await this.destroy({
      where: {
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });
  };

  return RefreshToken;
};