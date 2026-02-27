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

// Módulo: Auth (Sprint 2)
const Role = require('../modules/auth/models/Role')(sequelize);
const User = require('../modules/auth/models/User')(sequelize);
const RefreshToken = require('../modules/auth/models/RefreshToken')(sequelize);

// Módulo: Users (Sprint 3)
const PasswordReset = require('../modules/users/models/PasswordReset')(sequelize);

// Módulo: Employees (Sprint 4)
const Employee   = require('../modules/employees/models/Employee')(sequelize);
const Attendance = require('../modules/employees/models/Attendance')(sequelize);

// Módulo: Categories (Sprint 5)
const Category = require('../modules/categories/models/Category')(sequelize);

// Módulo: Products (Sprint 6)
const Product      = require('../modules/products/models/Product')(sequelize);
const PriceHistory = require('../modules/products/models/PriceHistory')(sequelize);

// ============================================
// DEFINIR RELACIONES
// ============================================

// User pertenece a Role
User.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

// Role tiene muchos Users
Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users'
});

// User tiene muchos RefreshTokens
User.hasMany(RefreshToken, {
  foreignKey: 'userId',
  as: 'refreshTokens'
});

// RefreshToken pertenece a User
RefreshToken.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User tiene muchos PasswordResets
User.hasMany(PasswordReset, {
  foreignKey: 'userId',
  as: 'passwordResets'
});

// PasswordReset pertenece a User
PasswordReset.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Employee pertenece a User (usuario vinculado del sistema)
Employee.belongsTo(User, {
  foreignKey: 'userId',
  as: 'linkedUser'
});

// Employee tiene muchos registros de Attendance
Employee.hasMany(Attendance, {
  foreignKey: 'employeeId',
  as: 'attendanceRecords'
});

// Attendance pertenece a Employee
Attendance.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee'
});

// Category auto-referencia: padre → hijos
Category.belongsTo(Category, {
  foreignKey: 'parentId',
  as: 'parent'
});

Category.hasMany(Category, {
  foreignKey: 'parentId',
  as: 'children'
});

// Category tiene muchos Products
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});

// Product pertenece a Category
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Product tiene muchos PriceHistory
Product.hasMany(PriceHistory, {
  foreignKey: 'productId',
  as: 'priceHistory'
});

// PriceHistory pertenece a Product
PriceHistory.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product'
});

// User tiene muchos PriceHistory (cambios de precio realizados)
User.hasMany(PriceHistory, {
  foreignKey: 'changedBy',
  as: 'priceChanges'
});

// PriceHistory pertenece a User (quien cambió el precio)
PriceHistory.belongsTo(User, {
  foreignKey: 'changedBy',
  as: 'changedByUser'
});

// ============================================
// EXPORTAR
// ============================================

const db = {
  sequelize,
  Sequelize,

  // Modelos Settings
  Setting,

  // Modelos Auth
  Role,
  User,
  RefreshToken,

  // Modelos Users
  PasswordReset,

  // Modelos Employees
  Employee,
  Attendance,

  // Modelos Categories
  Category,

  // Modelos Products
  Product,
  PriceHistory
};

module.exports = db;
