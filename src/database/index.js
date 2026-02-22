const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

/**
 * Configuración de Sequelize con soporte para esquemas
 * Sistema Integral de Gestión Comercial
 */
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define
  }
);

// ============================================
// IMPORTAR MODELOS
// ============================================

// Módulo: Settings (Configuración del Sistema)
const Setting = require('../modules/settings/models/Setting')(sequelize);

// Módulo: Auth
const Role = require('../modules/auth/models/Role')(sequelize);
const User = require('../modules/auth/models/User')(sequelize);
const RefreshToken = require('../modules/auth/models/RefreshToken')(sequelize);

// ============================================
// DEFINIR RELACIONES
// ============================================

// User pertenece a Role
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

// Role tiene muchos Users
Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users'
});

// User tiene muchos RefreshTokens
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens'
});

// RefreshToken pertenece a User
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ============================================
// EXPORTAR
// ============================================

const db = {
  sequelize,
  Sequelize,
  
  // Modelos Settings
  Setting,
  
  // Modelos Auth
  Role,
  User,
  RefreshToken
};

module.exports = db;