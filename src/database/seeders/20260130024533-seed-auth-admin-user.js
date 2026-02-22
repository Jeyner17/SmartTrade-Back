'use strict';

const bcrypt = require('bcryptjs');
const { SECURITY } = require('../../shared/constants/auth.constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Primero obtener el ID del rol Administrador
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM auth.roles WHERE name = 'Administrador' LIMIT 1;`
    );

    if (roles.length === 0) {
      throw new Error('Rol Administrador no encontrado');
    }

    const adminRoleId = roles[0].id;

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('Admin123', SECURITY.PASSWORD_SALT_ROUNDS);

    // Crear usuario administrador
    await queryInterface.bulkInsert(
      { tableName: 'users', schema: 'auth' },
      [
        {
          username: 'admin',
          email: 'admin@gestioncomercial.com',
          password: hashedPassword,
          first_name: 'Administrador',
          last_name: 'Sistema',
          role_id: adminRoleId,
          is_active: true,
          login_attempts: 0,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      { tableName: 'users', schema: 'auth' },
      { username: 'admin' },
      {}
    );
  }
};