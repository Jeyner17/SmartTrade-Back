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
  // SPRINT 5: CATEGORÍAS (Ejemplo futuro)
  // ==========================================
  // {
  //   name: 'categories',
  //   route: '/categories',
  //   path: '../modules/categories/routes/category.routes',
  //   enabled: false,
  //   description: 'Gestión de categorías de productos',
  //   version: '1.0.0',
  //   sprint: 5
  // },

  // ==========================================
  // SPRINT 6: PRODUCTOS (Ejemplo futuro)
  // ==========================================
  // {
  //   name: 'products',
  //   route: '/products',
  //   path: '../modules/products/routes/product.routes',
  //   enabled: false,
  //   description: 'Gestión de productos',
  //   version: '1.0.0',
  //   sprint: 6
  // },

  // ==========================================
  // SPRINT 7: INVENTARIO (Ejemplo futuro)
  // ==========================================
  // {
  //   name: 'inventory',
  //   route: '/inventory',
  //   path: '../modules/inventory/routes/inventory.routes',
  //   enabled: false,
  //   description: 'Control de inventario y stock',
  //   version: '1.0.0',
  //   sprint: 7
  // },

  // ==========================================
  // SPRINT 8: PROVEEDORES (Ejemplo futuro)
  // ==========================================
  // {
  //   name: 'suppliers',
  //   route: '/suppliers',
  //   path: '../modules/suppliers/routes/supplier.routes',
  //   enabled: false,
  //   description: 'Gestión de proveedores',
  //   version: '1.0.0',
  //   sprint: 8
  // },

  // ==========================================
  // SPRINT 9: COMPRAS (Ejemplo futuro)
  // ==========================================
  // {
  //   name: 'purchases',
  //   route: '/purchases',
  //   path: '../modules/purchases/routes/purchase.routes',
  //   enabled: false,
  //   description: 'Órdenes de compra',
  //   version: '1.0.0',
  //   sprint: 9
  // },

  // ==========================================
  // MÁS MÓDULOS FUTUROS...
  // ==========================================
];

module.exports = modules;