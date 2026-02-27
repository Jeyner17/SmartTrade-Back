const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.PRODUCTS;

/**
 * Modelo Product - Catálogo de productos
 * Tabla: products.products
 * Sprint 6 - Gestión de Productos
 *
 * Incluye campo `stock` denormalizado (se actualizará desde módulo Inventario).
 */
module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del producto'
    },

    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: { msg: 'El nombre del producto es requerido' } },
      comment: 'Nombre del producto'
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del producto'
    },

    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'Código interno (Stock Keeping Unit)'
    },

    barcode: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'Código de barras del producto'
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'El precio no puede ser negativo' },
        notNull: { msg: 'El precio de venta es requerido' }
      },
      comment: 'Precio de venta al público'
    },

    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'El costo no puede ser negativo' }
      },
      comment: 'Costo de adquisición'
    },

    taxPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 15,
      field: 'tax_percent',
      validate: {
        min: { args: [0],   msg: 'El IVA no puede ser negativo' },
        max: { args: [100], msg: 'El IVA no puede superar el 100%' }
      },
      comment: 'Porcentaje de IVA (default 15% Ecuador)'
    },

    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'image_url',
      comment: 'URL de la imagen del producto'
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Stock disponible (actualizado por módulo Inventario)'
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id',
      comment: 'Categoría a la que pertenece el producto'
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Indica si el producto está activo en el catálogo'
    },

    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by',
      comment: 'ID del usuario que creó el registro'
    },

    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'updated_by',
      comment: 'ID del usuario que actualizó el registro'
    }
  }, {
    tableName: 'products',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    paranoid: true,

    indexes: [
      { unique: true, fields: ['sku'],         name: 'products_sku_unique',      where: { sku: { [require('sequelize').Op.ne]: null } } },
      { unique: true, fields: ['barcode'],      name: 'products_barcode_unique',  where: { barcode: { [require('sequelize').Op.ne]: null } } },
      { fields: ['category_id'], name: 'products_category_id_idx' },
      { fields: ['is_active'],   name: 'products_is_active_idx' },
      { fields: ['name'],        name: 'products_name_idx' }
    ],

    comment: 'Catálogo de productos del sistema'
  });

  return Product;
};
