/**
 * Constantes para el módulo de Configuración del Sistema
 * Sprint 1 - Configuración del Sistema
 */

// Tipos de configuración
const CONFIG_TYPES = {
  COMPANY: 'company',           // Datos de la empresa
  FISCAL: 'fiscal',             // Configuración fiscal
  BUSINESS: 'business',         // Parámetros de negocio
  TECHNICAL: 'technical',       // Configuraciones técnicas
  BACKUP: 'backup',             // Configuración de backups
  APPEARANCE: 'appearance'      // Apariencia del sistema
};

// Países soportados
const COUNTRIES = {
  EC: 'Ecuador',
  CO: 'Colombia',
  PE: 'Perú',
  US: 'Estados Unidos',
  MX: 'México'
};

// Monedas soportadas
const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'Dólar estadounidense' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  COP: { code: 'COP', symbol: '$', name: 'Peso colombiano' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  MXN: { code: 'MXN', symbol: '$', name: 'Peso mexicano' }
};

// Regímenes fiscales
const TAX_REGIMES = {
  GENERAL: 'Régimen General',
  SIMPLIFIED: 'Régimen Simplificado',
  RISE: 'RISE',
  POPULAR: 'Régimen Popular'
};

// Frecuencias de backup
const BACKUP_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

// Formatos de fecha
const DATE_FORMATS = {
  'DD/MM/YYYY': 'DD/MM/YYYY',
  'MM/DD/YYYY': 'MM/DD/YYYY',
  'YYYY-MM-DD': 'YYYY-MM-DD'
};

// Formatos de hora
const TIME_FORMATS = {
  '12H': '12h',
  '24H': '24h'
};

// Valores por defecto del sistema
const DEFAULT_VALUES = {
  // Empresa
  COMPANY_NAME: 'Mi Empresa',
  COMPANY_EMAIL: 'contacto@empresa.com',
  COMPANY_PHONE: '',
  COMPANY_ADDRESS: '',
  COMPANY_RUC: '',
  COMPANY_LOGO: null,
  
  // Fiscal
  COUNTRY: 'EC',
  CURRENCY: 'USD',
  TAX_REGIME: 'GENERAL',
  IVA_PERCENTAGE: 15,
  
  // Negocio
  MIN_STOCK: 10,
  DEFAULT_CREDIT_DAYS: 30,
  MAX_DISCOUNT_PERCENTAGE: 20,
  
  // Técnico
  SESSION_TIMEOUT_MINUTES: 120,
  LOG_RETENTION_DAYS: 90,
  DATE_FORMAT: 'DD/MM/YYYY',
  TIME_FORMAT: '24H',
  
  // Backup
  BACKUP_ENABLED: true,
  BACKUP_FREQUENCY: 'daily',
  BACKUP_TIME: '02:00'
};

// Límites de validación
const VALIDATION_LIMITS = {
  // Empresa
  COMPANY_NAME_MIN: 3,
  COMPANY_NAME_MAX: 200,
  RUC_MIN: 10,
  RUC_MAX: 13,
  PHONE_MIN: 7,
  PHONE_MAX: 20,
  ADDRESS_MAX: 500,
  
  // Fiscal
  IVA_MIN: 0,
  IVA_MAX: 100,
  
  // Negocio
  MIN_STOCK_MIN: 0,
  MIN_STOCK_MAX: 1000,
  CREDIT_DAYS_MIN: 0,
  CREDIT_DAYS_MAX: 365,
  MAX_DISCOUNT_MIN: 0,
  MAX_DISCOUNT_MAX: 100,
  
  // Técnico
  SESSION_TIMEOUT_MIN: 15,
  SESSION_TIMEOUT_MAX: 480,
  LOG_RETENTION_MIN: 7,
  LOG_RETENTION_MAX: 365,
  
  // Logo
  MAX_LOGO_SIZE_MB: 2,
  ALLOWED_LOGO_FORMATS: ['image/jpeg', 'image/png', 'image/jpg']
};

// Mensajes de error
const ERROR_MESSAGES = {
  CONFIG_NOT_FOUND: 'Configuración no encontrada',
  INVALID_CONFIG_TYPE: 'Tipo de configuración inválido',
  INVALID_COUNTRY: 'País no válido',
  INVALID_CURRENCY: 'Moneda no válida',
  INVALID_TAX_REGIME: 'Régimen fiscal no válido',
  INVALID_BACKUP_FREQUENCY: 'Frecuencia de backup no válida',
  INVALID_DATE_FORMAT: 'Formato de fecha no válido',
  INVALID_TIME_FORMAT: 'Formato de hora no válido',
  LOGO_TOO_LARGE: 'El logo es demasiado grande. Máximo 2MB',
  INVALID_LOGO_FORMAT: 'Formato de imagen no válido. Use JPG o PNG',
  UPDATE_FAILED: 'Error al actualizar la configuración'
};

// Mensajes de éxito
const SUCCESS_MESSAGES = {
  CONFIG_RETRIEVED: 'Configuración obtenida exitosamente',
  CONFIG_UPDATED: 'Configuración actualizada exitosamente',
  LOGO_UPLOADED: 'Logo cargado exitosamente',
  BACKUP_CONFIGURED: 'Backup configurado exitosamente'
};

module.exports = {
  CONFIG_TYPES,
  COUNTRIES,
  CURRENCIES,
  TAX_REGIMES,
  BACKUP_FREQUENCIES,
  DATE_FORMATS,
  TIME_FORMATS,
  DEFAULT_VALUES,
  VALIDATION_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};