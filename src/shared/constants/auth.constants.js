const { DB_SCHEMAS } = require('./schemas');

/**
 * Constantes para el módulo de Autenticación
 * Sprint 2 - Autenticación y Autorización
 */

// Esquema de base de datos
const SCHEMA = DB_SCHEMAS.AUTH;

// Configuración de seguridad
const SECURITY = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 15 * 60 * 1000, // 15 minutos en milisegundos
  PASSWORD_SALT_ROUNDS: 10,
  JWT_EXPIRES_IN: '24h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  SESSION_TIMEOUT_MINUTES: 120
};

// Roles del sistema
const ROLES = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  CASHIER: 'Cajero',
  WAREHOUSE: 'Bodeguero',
  EMPLOYEE: 'Empleado'
};

// Módulos del sistema
const MODULES = {
  SETTINGS: 'settings',
  USERS: 'users',
  EMPLOYEES: 'employees',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  SUPPLIERS: 'suppliers',
  PURCHASES: 'purchases',
  RECEPTION: 'reception',
  BARCODES: 'barcodes',
  POS: 'pos',
  SALES: 'sales',
  INVOICING: 'invoicing',
  CASH_REGISTER: 'cash_register',
  CREDITS: 'credits',
  EXPENSES: 'expenses',
  FINANCE: 'finance',
  AUDIT: 'audit',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  ANALYTICS: 'analytics'
};

// Acciones sobre módulos
const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  EXPORT: 'export',
  PRINT: 'print'
};

// Permisos por rol
const PERMISSIONS = {
  [ROLES.ADMIN]: {
    // Administrador tiene todos los permisos
    '*': Object.values(ACTIONS)
  },
  
  [ROLES.SUPERVISOR]: {
    [MODULES.SALES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.EXPORT, ACTIONS.PRINT],
    [MODULES.CASH_REGISTER]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.CREDITS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.INVENTORY]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.PRODUCTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.EMPLOYEES]: [ACTIONS.VIEW],
    [MODULES.REPORTS]: [ACTIONS.VIEW, ACTIONS.EXPORT],
    [MODULES.ANALYTICS]: [ACTIONS.VIEW]
  },
  
  [ROLES.CASHIER]: {
    [MODULES.POS]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.SALES]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.PRINT],
    [MODULES.CASH_REGISTER]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.CREDITS]: [ACTIONS.VIEW, ACTIONS.CREATE],
    [MODULES.PRODUCTS]: [ACTIONS.VIEW]
  },
  
  [ROLES.WAREHOUSE]: {
    [MODULES.INVENTORY]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.PRODUCTS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.SUPPLIERS]: [ACTIONS.VIEW],
    [MODULES.PURCHASES]: [ACTIONS.VIEW],
    [MODULES.RECEPTION]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT],
    [MODULES.BARCODES]: [ACTIONS.VIEW, ACTIONS.CREATE]
  },
  
  [ROLES.EMPLOYEE]: {
    [MODULES.SALES]: [ACTIONS.VIEW],
    [MODULES.PRODUCTS]: [ACTIONS.VIEW]
  }
};

// Mensajes de error
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  ACCOUNT_LOCKED: 'Cuenta bloqueada por múltiples intentos fallidos. Intente más tarde',
  ACCOUNT_INACTIVE: 'La cuenta está desactivada',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',
  TOKEN_REQUIRED: 'Token requerido',
  REFRESH_TOKEN_INVALID: 'Refresh token inválido',
  REFRESH_TOKEN_EXPIRED: 'Refresh token expirado',
  PERMISSION_DENIED: 'No tiene permisos para realizar esta acción',
  USER_NOT_FOUND: 'Usuario no encontrado',
  ROLE_NOT_FOUND: 'Rol no encontrado',
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  USERNAME_REQUIRED: 'El nombre de usuario es requerido'
};

// Mensajes de éxito
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  TOKEN_REFRESHED: 'Token renovado exitosamente',
  PASSWORD_UPDATED: 'Contraseña actualizada exitosamente'
};

module.exports = {
  SCHEMA,
  SECURITY,
  ROLES,
  MODULES,
  ACTIONS,
  PERMISSIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};