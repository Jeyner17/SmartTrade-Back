const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { SCHEMA, SECURITY, ERROR_MESSAGES } = require('../../../shared/constants/auth.constants');

/**
 * Modelo User - Usuarios del Sistema
 * Tabla: auth.users
 * Sprint 2 - Autenticación y Autorización
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del usuario'
    },
    
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: ERROR_MESSAGES.USERNAME_REQUIRED
        },
        len: {
          args: [3, 50],
          msg: 'El nombre de usuario debe tener entre 3 y 50 caracteres'
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: 'El nombre de usuario solo puede contener letras, números y guion bajo'
        }
      },
      comment: 'Nombre de usuario único'
    },
    
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El email es requerido'
        },
        isEmail: {
          msg: 'Email inválido'
        }
      },
      comment: 'Correo electrónico del usuario'
    },
    
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: ERROR_MESSAGES.PASSWORD_REQUIRED
        },
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener al menos 6 caracteres'
        }
      },
      comment: 'Contraseña hasheada'
    },
    
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: {
          msg: 'El nombre es requerido'
        }
      },
      comment: 'Nombre del usuario'
    },
    
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: {
          msg: 'El apellido es requerido'
        }
      },
      comment: 'Apellido del usuario'
    },
    
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
      references: {
        model: 'roles',
        key: 'id'
      },
      comment: 'ID del rol asignado'
    },
    
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Indica si el usuario está activo'
    },
    
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login',
      comment: 'Fecha y hora del último inicio de sesión'
    },
    
    loginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'login_attempts',
      comment: 'Número de intentos fallidos de inicio de sesión'
    },
    
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lock_until',
      comment: 'Fecha hasta la cual la cuenta está bloqueada'
    }
  }, {
    tableName: 'users',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    
    indexes: [
      {
        unique: true,
        fields: ['username'],
        name: 'users_username_unique'
      },
      {
        unique: true,
        fields: ['email'],
        name: 'users_email_unique'
      },
      {
        fields: ['role_id'],
        name: 'users_role_id_idx'
      },
      {
        fields: ['is_active'],
        name: 'users_is_active_idx'
      }
    ],
    
    comment: 'Tabla de usuarios del sistema',
    
    // Hooks para hashear contraseña
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, SECURITY.PASSWORD_SALT_ROUNDS);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, SECURITY.PASSWORD_SALT_ROUNDS);
        }
      }
    }
  });

  /**
   * Método de instancia: Comparar contraseña
   */
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  /**
   * Método de instancia: Verificar si está bloqueado
   */
  User.prototype.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
  };

  /**
   * Método de instancia: Incrementar intentos fallidos
   */
  User.prototype.incLoginAttempts = async function() {
    // Si ya está bloqueado y el tiempo expiró, resetear
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return await this.update({
        loginAttempts: 1,
        lockUntil: null
      });
    }

    // Incrementar intentos
    const updates = { loginAttempts: this.loginAttempts + 1 };

    // Bloquear cuenta si alcanzó el máximo
    if (this.loginAttempts + 1 >= SECURITY.MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
      updates.lockUntil = new Date(Date.now() + SECURITY.LOCK_TIME);
    }

    return await this.update(updates);
  };

  /**
   * Método de instancia: Resetear intentos fallidos
   */
  User.prototype.resetLoginAttempts = async function() {
    return await this.update({
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date()
    });
  };

  /**
   * Método de instancia: Obtener nombre completo
   */
  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  /**
   * Método de instancia: Convertir a JSON (sin password)
   */
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};