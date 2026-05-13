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

// Módulo: Purchases (Sprint 9)
const PurchaseOrder = require('../modules/purchases/models/PurchaseOrder')(sequelize);
const PurchaseDetail = require('../modules/purchases/models/PurchaseDetail')(sequelize);
const PurchaseStatusHistory = require('../modules/purchases/models/PurchaseStatusHistory')(sequelize);

// Módulo: Receptions (Sprint 10)
const Reception = require('../modules/receptions/models/Reception')(sequelize);
const ReceptionDetail = require('../modules/receptions/models/ReceptionDetail')(sequelize);
const Discrepancy = require('../modules/receptions/models/Discrepancy')(sequelize);

// Módulo: Barcodes (Sprint 11)
const ScanLog = require('../modules/barcodes/models/ScanLog')(sequelize);
const ScannerConfig = require('../modules/barcodes/models/ScannerConfig')(sequelize);

// Módulo: POS / Sales (Sprint 12)
const Customer = require('../modules/sales/models/Customer')(sequelize);
const SaleSession = require('../modules/sales/models/SaleSession')(sequelize);
const SaleSessionItem = require('../modules/sales/models/SaleSessionItem')(sequelize);
const Sale = require('../modules/sales/models/Sale')(sequelize);
const SaleDetail = require('../modules/sales/models/SaleDetail')(sequelize);

// Módulo: Cash Register (Sprint 14)
const CashSession = require('../modules/cashRegister/models/CashSession')(sequelize);
const CashMovement = require('../modules/cashRegister/models/CashMovement')(sequelize);
const CashCount = require('../modules/cashRegister/models/CashCount')(sequelize);

// Módulo: Credits (Sprint 15)
const CreditCustomer = require('../modules/credits/models/Customer')(sequelize);
const Credit = require('../modules/credits/models/Credit')(sequelize);
const CreditPayment = require('../modules/credits/models/CreditPayment')(sequelize);
const CreditReminder = require('../modules/credits/models/CreditReminder')(sequelize);
const CreditAdjustment = require('../modules/credits/models/CreditAdjustment')(sequelize);

// Módulo: Expenses (Sprint 16)
const ExpenseCategory = require('../modules/expenses/models/ExpenseCategory')(sequelize);
const Expense = require('../modules/expenses/models/Expense')(sequelize);
const ExpenseReceipt = require('../modules/expenses/models/ExpenseReceipt')(sequelize);
const ExpenseRecurring = require('../modules/expenses/models/ExpenseRecurring')(sequelize);

// Módulo: Notifications (Sprint 19)
const NotificationTemplate = require('../modules/notifications/models/NotificationTemplate')(sequelize);
const Notification = require('../modules/notifications/models/Notification')(sequelize);
const NotificationRule = require('../modules/notifications/models/NotificationRule')(sequelize);
const NotificationSubscription = require('../modules/notifications/models/NotificationSubscription')(sequelize);

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

// Supplier ↔ PurchaseOrder
Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

// PurchaseOrder ↔ PurchaseDetail
PurchaseOrder.hasMany(PurchaseDetail, { foreignKey: 'purchaseOrderId', as: 'details' });
PurchaseDetail.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'order' });

// Product ↔ PurchaseDetail
Product.hasMany(PurchaseDetail, { foreignKey: 'productId', as: 'purchaseDetails' });
PurchaseDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// PurchaseOrder ↔ PurchaseStatusHistory
PurchaseOrder.hasMany(PurchaseStatusHistory, { foreignKey: 'purchaseOrderId', as: 'statusHistory' });
PurchaseStatusHistory.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'order' });

// User ↔ PurchaseOrder
User.hasMany(PurchaseOrder, { foreignKey: 'createdBy', as: 'purchaseOrdersCreated' });
User.hasMany(PurchaseOrder, { foreignKey: 'updatedBy', as: 'purchaseOrdersUpdated' });
PurchaseOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
PurchaseOrder.belongsTo(User, { foreignKey: 'updatedBy', as: 'updatedByUser' });

// User ↔ PurchaseStatusHistory
User.hasMany(PurchaseStatusHistory, { foreignKey: 'changedBy', as: 'purchaseStatusChanges' });
PurchaseStatusHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changedByUser' });

// ============ SPRINT 10: RECEPTIONS ============

// PurchaseOrder ↔ Reception
PurchaseOrder.hasMany(Reception, { foreignKey: 'purchaseOrderId', as: 'receptions' });
Reception.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });

// Reception ↔ ReceptionDetail
Reception.hasMany(ReceptionDetail, { foreignKey: 'receptionId', as: 'details' });
ReceptionDetail.belongsTo(Reception, { foreignKey: 'receptionId', as: 'reception' });

// Product ↔ ReceptionDetail
Product.hasMany(ReceptionDetail, { foreignKey: 'productId', as: 'receptionDetails' });
ReceptionDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Reception ↔ Discrepancy
Reception.hasMany(Discrepancy, { foreignKey: 'receptionId', as: 'discrepancies' });
Discrepancy.belongsTo(Reception, { foreignKey: 'receptionId', as: 'reception' });

// Product ↔ Discrepancy
Product.hasMany(Discrepancy, { foreignKey: 'productId', as: 'discrepancies' });
Discrepancy.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User ↔ Reception (who created)
User.hasMany(Reception, { foreignKey: 'createdBy', as: 'receptionsCreated' });
Reception.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });

// User ↔ Discrepancy (who reported)
User.hasMany(Discrepancy, { foreignKey: 'reportedBy', as: 'discrepanciesReported' });
Discrepancy.belongsTo(User, { foreignKey: 'reportedBy', as: 'reportedByUser' });

// ScanLog ↔ User
User.hasMany(ScanLog, { foreignKey: 'performedBy', as: 'scanLogs' });
ScanLog.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

// ScanLog → Product (solo sentido inverso, evita romper queries cross-schema en products)
ScanLog.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// ScannerConfig ↔ User
User.hasOne(ScannerConfig, { foreignKey: 'userId', as: 'scannerConfig' });
ScannerConfig.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ============ SPRINT 12: POS / SALES ============

// Customer ↔ Sale
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// User (cashier) ↔ Sale
User.hasMany(Sale, { foreignKey: 'cashierId', as: 'salesByCashier' });
Sale.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });

// Sale ↔ SaleDetail
Sale.hasMany(SaleDetail, { foreignKey: 'saleId', as: 'details' });
SaleDetail.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

// Product ↔ SaleDetail
Product.hasMany(SaleDetail, { foreignKey: 'productId', as: 'saleDetails' });
SaleDetail.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// SaleSession ↔ SaleSessionItem
SaleSession.hasMany(SaleSessionItem, { foreignKey: 'sessionId', as: 'items' });
SaleSessionItem.belongsTo(SaleSession, { foreignKey: 'sessionId', as: 'session' });

// Product ↔ SaleSessionItem
Product.hasMany(SaleSessionItem, { foreignKey: 'productId', as: 'saleSessionItems' });
SaleSessionItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Customer ↔ SaleSession
Customer.hasMany(SaleSession, { foreignKey: 'customerId', as: 'saleSessions' });
SaleSession.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

// User (cashier) ↔ SaleSession
User.hasMany(SaleSession, { foreignKey: 'cashierId', as: 'openSaleSessions' });
SaleSession.belongsTo(User, { foreignKey: 'cashierId', as: 'cashier' });

// SaleSession ↔ Sale
SaleSession.hasMany(Sale, { foreignKey: 'sessionId', as: 'generatedSales' });
Sale.belongsTo(SaleSession, { foreignKey: 'sessionId', as: 'session' });

// ============ SPRINT 14: CASH REGISTER ============

// User (cashier) ↔ CashSession
User.hasMany(CashSession, { foreignKey: 'casierId', as: 'cashSessions' });
CashSession.belongsTo(User, { foreignKey: 'casierId', as: 'cashier' });

// CashSession ↔ CashMovement
CashSession.hasMany(CashMovement, { foreignKey: 'cashSessionId', as: 'movements' });
CashMovement.belongsTo(CashSession, { foreignKey: 'cashSessionId', as: 'session' });

// CashSession ↔ CashCount
CashSession.hasOne(CashCount, { foreignKey: 'cashSessionId', as: 'count' });
CashCount.belongsTo(CashSession, { foreignKey: 'cashSessionId', as: 'session' });

// Sale ↔ CashMovement
Sale.hasMany(CashMovement, { foreignKey: 'saleId', as: 'cashMovements' });
CashMovement.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

// ============ SPRINT 15: CREDITS ============

// CreditCustomer ↔ Credit
CreditCustomer.hasMany(Credit, { foreignKey: 'customerId', as: 'credits' });
Credit.belongsTo(CreditCustomer, { foreignKey: 'customerId', as: 'customer' });

// Sale ↔ Credit
Sale.hasMany(Credit, { foreignKey: 'saleId', as: 'credits' });
Credit.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

// Credit ↔ CreditPayment
Credit.hasMany(CreditPayment, { foreignKey: 'creditId', as: 'payments' });
CreditPayment.belongsTo(Credit, { foreignKey: 'creditId', as: 'credit' });

// Credit ↔ CreditReminder
Credit.hasMany(CreditReminder, { foreignKey: 'creditId', as: 'reminders' });
CreditReminder.belongsTo(Credit, { foreignKey: 'creditId', as: 'credit' });

// Credit ↔ CreditAdjustment
Credit.hasMany(CreditAdjustment, { foreignKey: 'creditId', as: 'adjustments' });
CreditAdjustment.belongsTo(Credit, { foreignKey: 'creditId', as: 'credit' });

// User ↔ CreditPayment
User.hasMany(CreditPayment, { foreignKey: 'recordedBy', as: 'creditPayments' });
CreditPayment.belongsTo(User, { foreignKey: 'recordedBy', as: 'recordedByUser' });

// User ↔ CreditAdjustment
User.hasMany(CreditAdjustment, { foreignKey: 'authorizedBy', as: 'creditAdjustments' });
CreditAdjustment.belongsTo(User, { foreignKey: 'authorizedBy', as: 'authorizedByUser' });

// ============ SPRINT 19: NOTIFICATIONS ============

// NotificationTemplate ↔ Notification
NotificationTemplate.hasMany(Notification, { foreignKey: 'templateId', as: 'notifications' });
Notification.belongsTo(NotificationTemplate, { foreignKey: 'templateId', as: 'template' });

// NotificationRule ↔ NotificationTemplate
NotificationTemplate.hasMany(NotificationRule, { foreignKey: 'templateId', as: 'rules' });
NotificationRule.belongsTo(NotificationTemplate, { foreignKey: 'templateId', as: 'template' });

// NotificationRule ↔ Notification
NotificationRule.hasMany(Notification, { foreignKey: 'ruleId', as: 'notifications' });
Notification.belongsTo(NotificationRule, { foreignKey: 'ruleId', as: 'rule' });

// User ↔ Notification
User.hasMany(Notification, { foreignKey: 'createdBy', as: 'notificationsCreated' });
Notification.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });

// ============ SPRINT 16: EXPENSES ============

// Category ↔ Expense
ExpenseCategory.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
Expense.belongsTo(ExpenseCategory, { foreignKey: 'categoryId', as: 'category' });

// Expense ↔ Receipt
Expense.hasMany(ExpenseReceipt, { foreignKey: 'expenseId', as: 'receipts' });
ExpenseReceipt.belongsTo(Expense, { foreignKey: 'expenseId', as: 'expense' });

// Category ↔ Recurring
ExpenseCategory.hasMany(ExpenseRecurring, { foreignKey: 'categoryId', as: 'recurrings' });
ExpenseRecurring.belongsTo(ExpenseCategory, { foreignKey: 'categoryId', as: 'category' });

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

  // Purchases
  PurchaseOrder,
  PurchaseDetail,
  PurchaseStatusHistory,

  // Receptions
  Reception,
  ReceptionDetail,
  Discrepancy,

  // Barcodes
  ScanLog,
  ScannerConfig,

  // POS / Sales
  Customer,
  SaleSession,
  SaleSessionItem,
  Sale,
  SaleDetail,

  // Cash Register
  CashSession,
  CashMovement,
  CashCount,

  // Credits
  CreditCustomer,
  Credit,
  CreditPayment,
  CreditReminder,
  CreditAdjustment
  ,
  // Expenses
  ExpenseCategory,
  Expense,
  ExpenseReceipt,
  ExpenseRecurring,

  // Notifications
  NotificationTemplate,
  Notification,
  NotificationRule,
  NotificationSubscription
};

module.exports = db;
