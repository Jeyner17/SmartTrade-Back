const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.CATEGORIES;

/**
 * Modelo Category - Categorías de productos (árbol jerárquico)
 * Tabla: categories.categories
 * Sprint 5 - Gestión de Categorías
 *
 * Soporta jerarquía padre → hijo mediante auto-referencia (parentId).
 * - level 0: categoría raíz (sin padre)
 * - level 1: subcategoría de primer nivel
 * - level N: subcategoría de nivel N
 */
module.exports = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único de la categoría'
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'name',
      validate: { notEmpty: { msg: 'El nombre de la categoría es requerido' } },
      comment: 'Nombre de la categoría'
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción opcional de la categoría'
    },

    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id',
      comment: 'ID de la categoría padre (null = categoría raíz)'
    },

    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Nivel jerárquico: 0=raíz, 1=hijo, 2=nieto...'
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Indica si la categoría está activa'
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
    tableName: 'categories',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    paranoid: true,

    indexes: [
      { fields: ['parent_id'],  name: 'categories_parent_id_idx' },
      { fields: ['level'],      name: 'categories_level_idx' },
      { fields: ['is_active'],  name: 'categories_is_active_idx' },
      { fields: ['name'],       name: 'categories_name_idx' }
    ],

    comment: 'Categorías y subcategorías de productos'
  });

  return Category;
};
