/**
 * Configuración de JWT
 * Sprint 2 - Autenticación y Autorización
 */

module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_in_production',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Opciones adicionales
  issuer: 'gestion-comercial',
  audience: 'gestion-comercial-users'
};