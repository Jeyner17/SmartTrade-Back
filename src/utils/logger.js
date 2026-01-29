/**
 * Utilidad para logging del sistema
 * Sistema Integral de Gestión Comercial
 */

const logger = {
  /**
   * Log de información
   */
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp} - ${message}`, data || '');
  },

  /**
   * Log de error
   */
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp} - ${message}`, error || '');
    if (error && error.stack) {
      console.error(error.stack);
    }
  },

  /**
   * Log de advertencia
   */
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp} - ${message}`, data || '');
  },

  /**
   * Log de debug (solo en desarrollo)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${timestamp} - ${message}`, data || '');
    }
  },

  /**
   * Log de éxito
   */
  success: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[SUCCESS] ${timestamp} - ${message}`, data || '');
  }
};

module.exports = logger;