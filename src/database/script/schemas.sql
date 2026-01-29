-- ============================================
-- CREAR TODOS LOS ESQUEMAS DEL SISTEMA
-- Sistema de Gestión Comercial
-- ============================================

-- 1. Configuración del Sistema
CREATE SCHEMA IF NOT EXISTS settings;

-- 2. Autenticación y Autorización
CREATE SCHEMA IF NOT EXISTS auth;

-- 3. Gestión de Usuarios
CREATE SCHEMA IF NOT EXISTS users;

-- 4. Gestión de Empleados
CREATE SCHEMA IF NOT EXISTS employees;

-- 5. Categorías de Productos
CREATE SCHEMA IF NOT EXISTS categories;

-- 6. Proveedores
CREATE SCHEMA IF NOT EXISTS suppliers;

-- 7. Gestión de Productos
CREATE SCHEMA IF NOT EXISTS products;

-- 8. Códigos de Barras y QR
CREATE SCHEMA IF NOT EXISTS barcodes;

-- 9. Inventario y Stock
CREATE SCHEMA IF NOT EXISTS inventory;

-- 10. Compras y Órdenes de Compra
CREATE SCHEMA IF NOT EXISTS purchases;

-- 11. Recepción de Mercancía
CREATE SCHEMA IF NOT EXISTS reception;

-- 12. Punto de Venta (POS)
CREATE SCHEMA IF NOT EXISTS pos;

-- 13. Ventas
CREATE SCHEMA IF NOT EXISTS sales;

-- 14. Facturación Electrónica
CREATE SCHEMA IF NOT EXISTS invoicing;

-- 15. Gestión de Caja
CREATE SCHEMA IF NOT EXISTS cash_register;

-- 16. Créditos y Cuentas por Cobrar
CREATE SCHEMA IF NOT EXISTS credits;

-- 17. Gastos Operativos
CREATE SCHEMA IF NOT EXISTS expenses;

-- 18. Finanzas y Contabilidad
CREATE SCHEMA IF NOT EXISTS finance;

-- 19. Notificaciones
CREATE SCHEMA IF NOT EXISTS notifications;

-- 20. Auditoría y Logs
CREATE SCHEMA IF NOT EXISTS audit;

-- 21. Generador de Reportes
CREATE SCHEMA IF NOT EXISTS reports;

-- 22. Dashboard y Analytics
CREATE SCHEMA IF NOT EXISTS analytics;