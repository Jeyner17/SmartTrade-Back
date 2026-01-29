/**
 * Constantes de Esquemas de Base de Datos PostgreSQL
 * 
 * Organización modular del sistema en esquemas separados
 * para mejor mantenimiento, seguridad y escalabilidad
 * 
 * Sistema Integral de Gestión Comercial
 */

const DB_SCHEMAS = {
  // Módulo: Autenticación y Autorización
  AUTH: 'auth',
  
  // Módulo: Gestión de Usuarios (separado de auth para escalabilidad)
  USERS: 'users',
  
  // Módulo: Gestión de Empleados
  EMPLOYEES: 'employees',
  
  // Módulo: Categorías de Productos
  CATEGORIES: 'categories',
  
  // Módulo: Gestión de Productos
  PRODUCTS: 'products',
  
  // Módulo: Inventario y Stock
  INVENTORY: 'inventory',
  
  // Módulo: Proveedores
  SUPPLIERS: 'suppliers',
  
  // Módulo: Compras y Órdenes de Compra
  PURCHASES: 'purchases',
  
  // Módulo: Recepción de Mercancía
  RECEPTION: 'reception',
  
  // Módulo: Códigos de Barras y QR
  BARCODES: 'barcodes',
  
  // Módulo: Punto de Venta (POS)
  POS: 'pos',
  
  // Módulo: Ventas
  SALES: 'sales',
  
  // Módulo: Facturación Electrónica
  INVOICING: 'invoicing',
  
  // Módulo: Gestión de Caja
  CASH_REGISTER: 'cash_register',
  
  // Módulo: Créditos y Cuentas por Cobrar
  CREDITS: 'credits',
  
  // Módulo: Gastos Operativos
  EXPENSES: 'expenses',
  
  // Módulo: Finanzas y Contabilidad
  FINANCE: 'finance',
  
  // Módulo: Auditoría y Logs
  AUDIT: 'audit',
  
  // Módulo: Notificaciones
  NOTIFICATIONS: 'notifications',
  
  // Módulo: Generador de Reportes
  REPORTS: 'reports',
  
  // Módulo: Dashboard y Analytics
  ANALYTICS: 'analytics',
  
  // Módulo: Configuración del Sistema
  SETTINGS: 'settings'
};

/**
 * Descripción de cada esquema
 */
const SCHEMA_DESCRIPTIONS = {
  [DB_SCHEMAS.AUTH]: 'Autenticación, roles y permisos',
  [DB_SCHEMAS.USERS]: 'Gestión de usuarios del sistema',
  [DB_SCHEMAS.EMPLOYEES]: 'Información de empleados y asistencia',
  [DB_SCHEMAS.CATEGORIES]: 'Categorías y subcategorías de productos',
  [DB_SCHEMAS.PRODUCTS]: 'Catálogo de productos',
  [DB_SCHEMAS.INVENTORY]: 'Control de stock y movimientos',
  [DB_SCHEMAS.SUPPLIERS]: 'Proveedores y contactos',
  [DB_SCHEMAS.PURCHASES]: 'Órdenes de compra',
  [DB_SCHEMAS.RECEPTION]: 'Recepción y verificación de mercancía',
  [DB_SCHEMAS.BARCODES]: 'Gestión de códigos de barras y QR',
  [DB_SCHEMAS.POS]: 'Punto de venta',
  [DB_SCHEMAS.SALES]: 'Ventas realizadas',
  [DB_SCHEMAS.INVOICING]: 'Facturación electrónica',
  [DB_SCHEMAS.CASH_REGISTER]: 'Arqueo de caja',
  [DB_SCHEMAS.CREDITS]: 'Créditos y pagos',
  [DB_SCHEMAS.EXPENSES]: 'Gastos operativos',
  [DB_SCHEMAS.FINANCE]: 'Contabilidad y finanzas',
  [DB_SCHEMAS.AUDIT]: 'Auditoría de acciones',
  [DB_SCHEMAS.NOTIFICATIONS]: 'Notificaciones del sistema',
  [DB_SCHEMAS.REPORTS]: 'Reportes generados',
  [DB_SCHEMAS.ANALYTICS]: 'Dashboard y métricas',
  [DB_SCHEMAS.SETTINGS]: 'Configuración general del sistema'
};

/**
 * Orden de creación de esquemas (para migraciones)
 * Los esquemas con dependencias deben crearse después
 */
const SCHEMA_CREATION_ORDER = [
  DB_SCHEMAS.SETTINGS,      // 1. Primero (sin dependencias)
  DB_SCHEMAS.AUTH,          // 2. Autenticación
  DB_SCHEMAS.USERS,         // 3. Usuarios
  DB_SCHEMAS.EMPLOYEES,     // 4. Empleados
  DB_SCHEMAS.CATEGORIES,    // 5. Categorías
  DB_SCHEMAS.SUPPLIERS,     // 6. Proveedores
  DB_SCHEMAS.PRODUCTS,      // 7. Productos (depende de categorías)
  DB_SCHEMAS.BARCODES,      // 8. Códigos (depende de productos)
  DB_SCHEMAS.INVENTORY,     // 9. Inventario (depende de productos)
  DB_SCHEMAS.PURCHASES,     // 10. Compras (depende de proveedores, productos)
  DB_SCHEMAS.RECEPTION,     // 11. Recepción (depende de compras)
  DB_SCHEMAS.POS,           // 12. POS
  DB_SCHEMAS.SALES,         // 13. Ventas (depende de productos, empleados)
  DB_SCHEMAS.INVOICING,     // 14. Facturación (depende de ventas)
  DB_SCHEMAS.CASH_REGISTER, // 15. Caja (depende de ventas)
  DB_SCHEMAS.CREDITS,       // 16. Créditos (depende de ventas)
  DB_SCHEMAS.EXPENSES,      // 17. Gastos
  DB_SCHEMAS.FINANCE,       // 18. Finanzas (depende de ventas, compras, gastos)
  DB_SCHEMAS.NOTIFICATIONS, // 19. Notificaciones
  DB_SCHEMAS.AUDIT,         // 20. Auditoría
  DB_SCHEMAS.REPORTS,       // 21. Reportes
  DB_SCHEMAS.ANALYTICS      // 22. Analytics (último)
];

module.exports = {
  DB_SCHEMAS,
  SCHEMA_DESCRIPTIONS,
  SCHEMA_CREATION_ORDER
};