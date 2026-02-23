'use strict';

/**
 * Migración: Crear tabla employees.employees
 *
 * Almacena los datos personales y laborales de los empleados.
 * Incluye vinculación opcional con un usuario del sistema (auth.users).
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Crear el esquema si no existe
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS employees;');

    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre(s) del empleado'
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Apellido(s) del empleado'
      },
      document_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Tipo de documento: cedula, pasaporte, ruc'
      },
      document_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Número de documento único'
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: 'Fecha de nacimiento'
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Dirección domiciliaria'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Teléfono de contacto'
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Correo electrónico personal'
      },
      photo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la foto del empleado'
      },
      area: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Área de trabajo: administracion, caja, bodega, atencion, ventas'
      },
      shift: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Turno asignado: morning, afternoon, night'
      },
      salary: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Salario mensual (confidencial)'
      },
      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha de ingreso a la empresa'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario del sistema vinculado al empleado'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica si el empleado está activo en la empresa'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que registró al empleado'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID del usuario que realizó la última modificación'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de baja del empleado (soft delete)'
      }
    }, {
      schema: 'employees'
    });

    // Índices
    await queryInterface.addIndex(
      { tableName: 'employees', schema: 'employees' },
      ['document_number'],
      { unique: true, name: 'employees_document_number_unique' }
    );

    await queryInterface.addIndex(
      { tableName: 'employees', schema: 'employees' },
      ['area'],
      { name: 'employees_area_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'employees', schema: 'employees' },
      ['shift'],
      { name: 'employees_shift_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'employees', schema: 'employees' },
      ['is_active'],
      { name: 'employees_is_active_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'employees', schema: 'employees' },
      ['user_id'],
      { name: 'employees_user_id_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'employees', schema: 'employees' });
  }
};
