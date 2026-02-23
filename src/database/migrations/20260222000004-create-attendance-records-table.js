'use strict';

/**
 * Migración: Crear tabla employees.attendance_records
 *
 * Registra la asistencia diaria de empleados (entrada y salida).
 * Un registro por empleado por día. Al marcar entrada se crea el registro;
 * al marcar salida se actualiza el mismo registro y se calculan las horas trabajadas.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendance_records', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: { tableName: 'employees', schema: 'employees' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empleado al que pertenece el registro'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: 'Fecha del registro de asistencia'
      },
      entry_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de entrada'
      },
      exit_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha y hora de salida'
      },
      total_hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Total de horas trabajadas (calculado automáticamente al registrar salida)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones del registro'
      },
      registered_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: { tableName: 'users', schema: 'auth' },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario del sistema que registró la asistencia'
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
      }
    }, {
      schema: 'employees'
    });

    // Un solo registro por empleado por día
    await queryInterface.addIndex(
      { tableName: 'attendance_records', schema: 'employees' },
      ['employee_id', 'date'],
      { unique: true, name: 'attendance_records_employee_date_unique' }
    );

    await queryInterface.addIndex(
      { tableName: 'attendance_records', schema: 'employees' },
      ['date'],
      { name: 'attendance_records_date_idx' }
    );

    await queryInterface.addIndex(
      { tableName: 'attendance_records', schema: 'employees' },
      ['employee_id'],
      { name: 'attendance_records_employee_id_idx' }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'attendance_records', schema: 'employees' });
  }
};
