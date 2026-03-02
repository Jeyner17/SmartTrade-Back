const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.SUPPLIERS;

/**
 * Modelo SupplierContact - Contactos del proveedor
 * Tabla: suppliers.supplier_contacts
 * Sprint 8 - Gestión de Proveedores
 */
module.exports = (sequelize) => {
    const SupplierContact = sequelize.define('SupplierContact', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID único del contacto'
        },

        supplierId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'supplier_id',
            comment: 'ID del proveedor al que pertenece este contacto'
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: { notEmpty: { msg: 'El nombre del contacto es requerido' } },
            comment: 'Nombre completo del contacto'
        },

        position: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Cargo o puesto del contacto'
        },

        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Teléfono del contacto'
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            validate: { isEmail: { msg: 'Email del contacto inválido' } },
            comment: 'Correo electrónico del contacto'
        },

        isPrimary: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_primary',
            comment: 'Indica si es el contacto principal del proveedor'
        },

        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Observaciones sobre el contacto'
        }
    }, {
        tableName: 'supplier_contacts',
        schema: SCHEMA,
        timestamps: true,
        underscored: true,

        indexes: [
            { fields: ['supplier_id'], name: 'supplier_contacts_supplier_id_idx' },
            { fields: ['is_primary'], name: 'supplier_contacts_is_primary_idx' }
        ],

        comment: 'Contactos de los proveedores'
    });

    return SupplierContact;
};
