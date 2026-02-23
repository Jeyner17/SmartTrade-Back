const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.EMPLOYEES;

/**
 * Modelo Attendance - Registro de asistencia diaria
 * Tabla: employees.attendance_records
 * Sprint 4 - Gestión de Empleados
 *
 * Un registro por empleado por día.
 * - Marcar entrada: crea el registro con entry_time.
 * - Marcar salida: actualiza exit_time y calcula total_hours.
 */
module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del registro'
    },

    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
      comment: 'Empleado al que pertenece el registro'
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha del registro de asistencia'
    },

    entryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'entry_time',
      comment: 'Fecha y hora de entrada'
    },

    exitTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'exit_time',
      comment: 'Fecha y hora de salida'
    },

    totalHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'total_hours',
      comment: 'Total de horas trabajadas (calculado al registrar salida)'
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones del registro'
    },

    registeredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'registered_by',
      comment: 'ID del usuario que registró la asistencia'
    }
  }, {
    tableName: 'attendance_records',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,

    indexes: [
      { unique: true, fields: ['employee_id', 'date'], name: 'attendance_records_employee_date_unique' },
      { fields: ['date'],        name: 'attendance_records_date_idx' },
      { fields: ['employee_id'], name: 'attendance_records_employee_id_idx' }
    ],

    comment: 'Registros de asistencia diaria de empleados'
  });

  /**
   * Calcula las horas trabajadas entre entry y exit
   * @returns {number|null}
   */
  Attendance.prototype.calculateHours = function () {
    if (!this.entryTime || !this.exitTime) return null;
    const diffMs = new Date(this.exitTime) - new Date(this.entryTime);
    return parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  };

  return Attendance;
};
