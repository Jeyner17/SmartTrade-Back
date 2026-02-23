const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.EMPLOYEES;

const DOCUMENT_TYPES = ['cedula', 'pasaporte', 'ruc'];
const AREAS          = ['administracion', 'caja', 'bodega', 'atencion', 'ventas'];
const SHIFTS         = ['morning', 'afternoon', 'night'];

/**
 * Modelo Employee - Empleados del sistema
 * Tabla: employees.employees
 * Sprint 4 - Gestión de Empleados
 */
module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del empleado'
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name',
      validate: { notEmpty: { msg: 'El nombre es requerido' } },
      comment: 'Nombre(s) del empleado'
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name',
      validate: { notEmpty: { msg: 'El apellido es requerido' } },
      comment: 'Apellido(s) del empleado'
    },

    documentType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'document_type',
      validate: {
        isIn: {
          args: [DOCUMENT_TYPES],
          msg: `Tipo de documento inválido. Valores: ${DOCUMENT_TYPES.join(', ')}`
        }
      },
      comment: 'Tipo de documento: cedula, pasaporte, ruc'
    },

    documentNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'document_number',
      validate: { notEmpty: { msg: 'El número de documento es requerido' } },
      comment: 'Número de documento único'
    },

    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'birth_date',
      comment: 'Fecha de nacimiento'
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección domiciliaria'
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Teléfono de contacto'
    },

    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: { isEmail: { msg: 'Email inválido' } },
      comment: 'Correo electrónico personal'
    },

    photoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'photo_url',
      comment: 'URL de la foto del empleado'
    },

    area: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: {
          args: [AREAS],
          msg: `Área inválida. Valores: ${AREAS.join(', ')}`
        }
      },
      comment: 'Área de trabajo: administracion, caja, bodega, atencion, ventas'
    },

    shift: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: {
          args: [SHIFTS],
          msg: `Turno inválido. Valores: ${SHIFTS.join(', ')}`
        }
      },
      comment: 'Turno: morning, afternoon, night'
    },

    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Salario mensual (confidencial)'
    },

    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'hire_date',
      validate: { notEmpty: { msg: 'La fecha de ingreso es requerida' } },
      comment: 'Fecha de ingreso a la empresa'
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      comment: 'ID del usuario del sistema vinculado'
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Indica si el empleado está activo'
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by',
      comment: 'ID del usuario que creó este registro'
    },

    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updated_by',
      comment: 'ID del usuario que actualizó este registro'
    }
  }, {
    tableName: 'employees',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    paranoid: true,

    indexes: [
      { unique: true, fields: ['document_number'], name: 'employees_document_number_unique' },
      { fields: ['area'],      name: 'employees_area_idx' },
      { fields: ['shift'],     name: 'employees_shift_idx' },
      { fields: ['is_active'], name: 'employees_is_active_idx' },
      { fields: ['user_id'],   name: 'employees_user_id_idx' }
    ],

    comment: 'Empleados de la empresa'
  });

  Employee.prototype.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
  };

  Employee.DOCUMENT_TYPES = DOCUMENT_TYPES;
  Employee.AREAS          = AREAS;
  Employee.SHIFTS         = SHIFTS;

  return Employee;
};
