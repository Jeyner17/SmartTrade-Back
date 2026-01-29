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

// TODO: Importar modelos de otros módulos aquí cuando se creen
// const User = require('../modules/auth/models/User')(sequelize);
// const Role = require('../modules/auth/models/Role')(sequelize);
// etc...

// ============================================
// DEFINIR RELACIONES
// ============================================

// TODO: Definir relaciones entre modelos aquí

// ============================================
// EXPORTAR
// ============================================

const db = {
  sequelize,
  Sequelize,
  
  // Modelos Settings
  Setting
  
  // TODO: Exportar otros modelos aquí
};

module.exports = db;