'use strict';

const { ROLES, PERMISSIONS } = require('../../shared/constants/auth.constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      { tableName: 'roles', schema: 'auth' },
      [
        {
          name: ROLES.ADMIN,
          description: 'Administrador del sistema con acceso total',
          permissions: JSON.stringify(PERMISSIONS[ROLES.ADMIN]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: ROLES.SUPERVISOR,
          description: 'Supervisor con permisos de gestión y reportes',
          permissions: JSON.stringify(PERMISSIONS[ROLES.SUPERVISOR]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: ROLES.CASHIER,
          description: 'Cajero con acceso a ventas y caja',
          permissions: JSON.stringify(PERMISSIONS[ROLES.CASHIER]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: ROLES.WAREHOUSE,
          description: 'Bodeguero con acceso a inventario y productos',
          permissions: JSON.stringify(PERMISSIONS[ROLES.WAREHOUSE]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: ROLES.EMPLOYEE,
          description: 'Empleado con permisos básicos de consulta',
          permissions: JSON.stringify(PERMISSIONS[ROLES.EMPLOYEE]),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'roles', schema: 'auth' },
      null,
      {}
    );
  }
};