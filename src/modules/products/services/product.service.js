const { Op } = require('sequelize');
const { Product, PriceHistory, Category, User } = require('../../../database');
const { deleteFile, getProductImageUrl } = require('../../../utils/file.util');
const logger = require('../../../utils/logger');

const ERROR = {
  NOT_FOUND:        'Producto no encontrado',
  SKU_IN_USE:       'El SKU ya está registrado',
  BARCODE_IN_USE:   'El código de barras ya está registrado',
  CATEGORY_INVALID: 'La categoría especificada no existe'
};

/**
 * Servicio de Gestión de Productos
 * Sprint 6 - Gestión de Productos
 */
class ProductService {

  // ============================================
  // LISTAR
  // ============================================

  async getProducts({ page = 1, limit = 10, search, categoryId, isActive, minPrice, maxPrice } = {}) {
    const offset = (page - 1) * limit;
    const where  = {};

    if (search) {
      where[Op.or] = [
        { name:    { [Op.iLike]: `%${search}%` } },
        { sku:     { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categoryId !== undefined) where.categoryId = categoryId;
    if (isActive   !== undefined) where.isActive   = isActive;

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false
      }],
      order: [['name', 'ASC']],
      limit,
      offset
    });

    return {
      products: rows,
      pagination: {
        total:   count,
        page,
        limit,
        pages:   Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };
  }

  // ============================================
  // OBTENER POR ID
  // ============================================

  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'level'],
          required: false
        },
        {
          model: PriceHistory,
          as: 'priceHistory',
          include: [{
            model: User,
            as: 'changedByUser',
            attributes: ['id', 'username'],
            required: false
          }],
          order: [['createdAt', 'DESC']],
          limit: 10,
          separate: true
        }
      ]
    });

    if (!product) throw new Error(ERROR.NOT_FOUND);
    return product;
  }

  // ============================================
  // BUSCAR POR CÓDIGO DE BARRAS
  // ============================================

  async findByBarcode(code) {
    const product = await Product.findOne({
      where: { barcode: code },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false
      }]
    });

    if (!product) throw new Error(ERROR.NOT_FOUND);
    return product;
  }

  // ============================================
  // CREAR
  // ============================================

  async createProduct(data, userId) {
    const { name, description, sku, barcode, price, cost, taxPercent = 15,
            categoryId, isActive = true } = data;

    // Verificar SKU único
    if (sku) {
      const existing = await Product.findOne({ where: { sku } });
      if (existing) throw new Error(ERROR.SKU_IN_USE);
    }

    // Verificar barcode único
    if (barcode) {
      const existing = await Product.findOne({ where: { barcode } });
      if (existing) throw new Error(ERROR.BARCODE_IN_USE);
    }

    const product = await Product.create({
      name, description, sku, barcode, price, cost, taxPercent,
      categoryId, isActive, createdBy: userId
    });

    await product.reload({
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'], required: false }]
    });

    logger.success('Producto creado', { productId: product.id, createdBy: userId });
    return product;
  }

  // ============================================
  // ACTUALIZAR
  // ============================================

  async updateProduct(id, data, userId) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error(ERROR.NOT_FOUND);

    // Verificar SKU único si cambió
    if (data.sku !== undefined && data.sku !== null && data.sku !== product.sku) {
      const existing = await Product.findOne({
        where: { sku: data.sku, id: { [Op.ne]: id } }
      });
      if (existing) throw new Error(ERROR.SKU_IN_USE);
    }

    // Verificar barcode único si cambió
    if (data.barcode !== undefined && data.barcode !== null && data.barcode !== product.barcode) {
      const existing = await Product.findOne({
        where: { barcode: data.barcode, id: { [Op.ne]: id } }
      });
      if (existing) throw new Error(ERROR.BARCODE_IN_USE);
    }

    const updates = { updatedBy: userId };
    const fields = ['name', 'description', 'sku', 'barcode', 'price', 'cost',
                    'taxPercent', 'categoryId', 'isActive'];
    fields.forEach(f => { if (data[f] !== undefined) updates[f] = data[f]; });

    await product.update(updates);
    await product.reload({
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'], required: false }]
    });

    logger.info('Producto actualizado', { productId: id, updatedBy: userId });
    return product;
  }

  // ============================================
  // ACTUALIZAR PRECIO
  // ============================================

  async updatePrice(id, { newPrice, reason }, userId) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error(ERROR.NOT_FOUND);

    // Guardar historial
    await PriceHistory.create({
      productId:     id,
      previousPrice: product.price,
      newPrice,
      reason,
      changedBy:     userId
    });

    await product.update({ price: newPrice, updatedBy: userId });

    logger.info('Precio actualizado', { productId: id, previousPrice: product.price, newPrice, updatedBy: userId });
    return {
      message: 'Precio actualizado exitosamente',
      product: { id, name: product.name, previousPrice: product.price, newPrice }
    };
  }

  // ============================================
  // SUBIR / REEMPLAZAR IMAGEN
  // ============================================

  async uploadImage(id, file, userId) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error(ERROR.NOT_FOUND);

    // Eliminar imagen anterior si existe
    if (product.imageUrl) {
      const oldPath = product.imageUrl.replace(/^\/uploads\//, 'uploads/');
      await deleteFile(oldPath);
    }

    const imageUrl = getProductImageUrl(file.filename);
    await product.update({ imageUrl, updatedBy: userId });

    logger.info('Imagen de producto actualizada', { productId: id, imageUrl });
    return { message: 'Imagen cargada exitosamente', imageUrl };
  }

  // ============================================
  // ACTIVAR / DESACTIVAR
  // ============================================

  async toggleStatus(id, userId) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error(ERROR.NOT_FOUND);

    const newStatus = !product.isActive;
    await product.update({ isActive: newStatus, updatedBy: userId });

    const action = newStatus ? 'activado' : 'desactivado';
    logger.info(`Producto ${action}`, { productId: id, updatedBy: userId });

    return {
      message:  `Producto ${action} exitosamente`,
      product:  { id, isActive: newStatus }
    };
  }

  // ============================================
  // ELIMINAR
  // ============================================

  async deleteProduct(id, userId) {
    const product = await Product.findByPk(id);
    if (!product) throw new Error(ERROR.NOT_FOUND);

    await product.update({ updatedBy: userId });
    await product.destroy(); // paranoid soft delete

    logger.info('Producto eliminado (soft delete)', { productId: id, deletedBy: userId });
    return { message: 'Producto eliminado exitosamente' };
  }
}

ProductService.ERRORS = ERROR;
module.exports = new ProductService();
