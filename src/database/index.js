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
  Attendance
};

module.exports = db;
