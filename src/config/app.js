require('dotenv').config();

/**
 * Configuración de la Aplicación
 * Sistema Integral de Gestión Comercial
 */

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*'
};