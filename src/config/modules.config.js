/**
 * Configuración de Módulos del Sistema
 * Sistema Integral de Gestión Comercial
 * 
 * Para agregar un nuevo módulo:
 * 1. Crear la carpeta del módulo en src/modules/
 * 2. Crear el archivo de rutas en routes/
 * 3. Agregar la configuración aquí
 */

const modules = [
  // ==========================================
  // SPRINT 1: CONFIGURACIÓN DEL SISTEMA
  // ==========================================
  {
    name: 'settings',
    route: '/settings',
    path: '../modules/settings/routes/setting.routes',
    enabled: true,
    description: 'Configuración del sistema',
    version: '1.0.0',
    sprint: 1
  },

  // ==========================================
  // SPRINT 2: AUTENTICACIÓN Y AUTORIZACIÓN
  // ==========================================
  {
    name: 'auth',
    route: '/auth',
    path: '../modules/auth/routes/auth.routes',
    enabled: true,
    description: 'Autenticación y autorización',
    version: '1.0.0',
    sprint: 2,
    public: true // Tiene rutas públicas
  },
  {
    name: 'roles',
    route: '/roles',
    path: '../modules/auth/routes/role.routes',
    enabled: true,
    description: 'Gestión de roles y permisos',
    version: '1.0.0',
    sprint: 2
  },

  // ==========================================
  // SPRINT 3: GESTIÓN DE USUARIOS
  // ==========================================
  {
    name: 'users',
    route: '/users',
    path: '../modules/users/routes/user.routes',
    enabled: true,
    description: 'Gestión de usuarios del sistema',
    version: '1.0.0',
    sprint: 3
  },

  // ==========================================
  // SPRINT 4: GESTIÓN DE EMPLEADOS
  // ==========================================
  {
    name: 'employees',
    route: '/employees',
    path: '../modules/employees/routes/employee.routes',
    enabled: true,
    description: 'Gestión de empleados y asistencia',
    version: '1.0.0',
    sprint: 4
  },

  // ==========================================
  // SPRINT 5: GESTIÓN DE CATEGORÍAS
  // ==========================================
  {
    name: 'categories',
    route: '/categories',
    path: '../modules/categories/routes/category.routes',
    enabled: true,
    description: 'Gestión de categorías de productos',
    version: '1.0.0',
    sprint: 5
  },

  // ==========================================
  // SPRINT 6: GESTIÓN DE PRODUCTOS
  // ==========================================
  {
    name: 'products',
    route: '/products',
    path: '../modules/products/routes/product.routes',
    enabled: true,
    description: 'Gestión de productos del catálogo',
    version: '1.0.0',
    sprint: 6
  },

  // ==========================================
  // SPRINT 7: INVENTARIO
  // ==========================================
  {
    name: 'inventory',
    route: '/inventory',
    path: '../modules/inventory/routes/stock.routes',
    enabled: true,
    description: 'Control de inventario y stock',
    version: '1.0.0',
    sprint: 7
  },

  // ==========================================
  // SPRINT 8: PROVEEDORES
  // ==========================================
  {
    name: 'suppliers',
    route: '/suppliers',
    path: '../modules/suppliers/routes/supplier.routes',
    enabled: true,
    description: 'Gestión de proveedores',
    version: '1.0.0',
    sprint: 8
  },

  // ==========================================
  // SPRINT 9: COMPRAS
  // ==========================================
  {
    name: 'purchases',
    route: '/purchases',
    path: '../modules/purchases/routes/purchase.routes',
    enabled: true,
    description: 'Órdenes de compra',
    version: '1.0.0',
    sprint: 9
  },

  // ==========================================
  // SPRINT 10: RECEPCIÓN DE MERCANCÍA
  // ==========================================
  {
    name: 'receptions',
    route: '/receptions',
    path: '../modules/receptions/routes/reception.routes',
    enabled: true,
    description: 'Recepción y control de mercancía',
    version: '1.0.0',
    sprint: 10
  },

  // ==========================================
  // SPRINT 11: ESCANEO DE CÓDIGOS DE BARRAS/QR
  // ==========================================
  {
    name: 'barcodes',
    route: '/barcodes',
    path: '../modules/barcodes/routes/barcode.routes',
    enabled: true,
    description: 'Escaneo y generación de códigos de barras y QR',
    version: '1.0.0',
    sprint: 11
  },

  // ==========================================
  // SPRINT 12: PUNTO DE VENTA (POS)
  // ==========================================
  {
    name: 'pos',
    route: '/pos',
    path: '../modules/sales/routes/sale.routes',
    enabled: true,
    description: 'Punto de venta, carrito y ventas',
    version: '1.0.0',
    sprint: 12
  },

  // ==========================================
  // SPRINT 14: GESTIÓN DE CAJA
  // ==========================================
  {
    name: 'cashRegister',
    route: '/cash',
    path: '../modules/cashRegister/routes/cash-register.routes',
    enabled: true,
    description: 'Gestión de caja, sesiones y arqueos',
    version: '1.0.0',
    sprint: 14
  },

  // ==========================================
  // SPRINT 15: CREDITOS Y CUENTAS POR COBRAR
  // ==========================================
  {
    name: 'credits',
    route: '/credits',
    path: '../modules/credits/routes/credit.routes',
    enabled: true,
    description: 'Gestion de creditos y cuentas por cobrar',
    version: '1.0.0',
    sprint: 15
  },

  // ==========================================
  // SPRINT 16: GASTOS OPERATIVOS
  // ==========================================
  {
    name: 'expenses',
    route: '/expenses',
    path: '../modules/expenses/routes/expense.routes',
    enabled: true,
    description: 'Gastos operativos y reportes',
    version: '1.0.0',
    sprint: 16
  },

  // ==========================================
  // SPRINT 19: NOTIFICACIONES
  // ==========================================
  {
    name: 'notifications',
    route: '/notifications',
    path: '../modules/notifications/routes/notification.routes',
    enabled: true,
    description: 'Plantillas, envio y reglas de notificaciones',
    version: '1.0.0',
    sprint: 19
  },

  // ==========================================
  // MÁS MÓDULOS FUTUROS...
  // ==========================================
];

module.exports = modules;