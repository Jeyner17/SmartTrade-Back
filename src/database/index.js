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
const Employee = require('../modules/employees/models/Employee')(sequelize);
const Attendance = require('../modules/employees/models/Attendance')(sequelize);

// Módulo: Categories (Sprint 5)
const Category = require('../modules/categories/models/Category')(sequelize);

// Módulo: Products (Sprint 6)
const Product = require('../modules/products/models/Product')(sequelize);
const PriceHistory = require('../modules/products/models/PriceHistory')(sequelize);

// Módulo: Inventory (Sprint 7)
const StockMovement = require('../modules/inventory/models/StockMovement')(sequelize);

// Módulo: Suppliers (Sprint 8)
const Supplier = require('../modules/suppliers/models/Supplier')(sequelize);
const SupplierContact = require('../modules/suppliers/models/SupplierContact')(sequelize);
const SupplierEvaluation = require('../modules/suppliers/models/SupplierEvaluation')(sequelize);

// Módulo: Barcodes (Sprint 11)
const ScanLog = require('../modules/barcodes/models/ScanLog')(sequelize);
const ScannerConfig = require('../modules/barcodes/models/ScannerConfig')(sequelize);

// ============================================
// DEFINIR RELACIONES
// ============================================

// User pertenece a Role
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

// User ↔ RefreshToken
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ↔ PasswordReset
User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets' });
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Employee ↔ User
Employee.belongsTo(User, { foreignKey: 'userId', as: 'linkedUser' });

// Employee ↔ Attendance
Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendanceRecords' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Category auto-referencia
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });
Category.hasMany(Category, { foreignKey: 'parentId', as: 'children' });

// Category ↔ Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Product ↔ PriceHistory
Product.hasMany(PriceHistory, { foreignKey: 'productId', as: 'priceHistory' });
PriceHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User ↔ PriceHistory
User.hasMany(PriceHistory, { foreignKey: 'changedBy', as: 'priceChanges' });
PriceHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

// Product ↔ StockMovement
Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User ↔ StockMovement
User.hasMany(StockMovement, { foreignKey: 'performedBy', as: 'inventoryMovements' });
StockMovement.belongsTo(User, { foreignKey: 'performedBy', as: 'performedByUser' });

// Supplier ↔ SupplierContact
Supplier.hasMany(SupplierContact, { foreignKey: 'supplierId', as: 'contacts' });
SupplierContact.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// Supplier ↔ SupplierEvaluation
Supplier.hasMany(SupplierEvaluation, { foreignKey: 'supplierId', as: 'evaluations' });
SupplierEvaluation.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// ScanLog ↔ User
User.hasMany(ScanLog, { foreignKey: 'performedBy', as: 'scanLogs' });
ScanLog.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

// ScanLog → Product (solo sentido inverso, evita romper queries cross-schema en products)
ScanLog.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ScannerConfig ↔ User
User.hasOne(ScannerConfig, { foreignKey: 'userId', as: 'scannerConfig' });
ScannerConfig.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ============================================
// EXPORTAR
// ============================================

const db = {
  sequelize,
  Sequelize,

  // Settings
  Setting,

  // Auth
  Role,
  User,
  RefreshToken,

  // Users
  PasswordReset,

  // Employees
  Employee,
  Attendance,

  // Categories
  Category,

  // Products
  Product,
  PriceHistory,

  // Inventory
  StockMovement,

  // Suppliers
  Supplier,
  SupplierContact,
  SupplierEvaluation,

  // Barcodes
  ScanLog,
  ScannerConfig
};

module.exports = db;
