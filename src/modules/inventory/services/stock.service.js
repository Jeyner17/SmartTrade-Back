const { Op } = require('sequelize');
const { sequelize } = require('../../../database');
const logger = require('../../../utils/logger');

/**
 * Servicio de Gestión de Inventario
 * Sprint 7 - Gestión de Inventario
 */
class InventoryService {

  /**
   * 1. Obtener stock de todos los productos con filtros
   * Endpoint: GET /api/v1/inventory
   */
  async getInventory({ page = 1, limit = 10, search, categoryId, lowStock, outOfStock } = {}) {
    // Importación dinámica para evitar circular dependencies
    const { Product, Category } = require('../../../database');
    
    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Filtro de búsqueda
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por categoría
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    // Filtro de stock bajo (stock <= minStock)
    if (lowStock === true || lowStock === 'true') {
      where[Op.and] = sequelize.where(
        sequelize.col('Product.stock'),
        '<=',
        sequelize.col('Product.min_stock')
      );
    }

    // Filtro de sin stock (stock = 0)
    if (outOfStock === true || outOfStock === 'true') {
      where.stock = 0;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
        required: false
      }],
      attributes: [
        'id',
        'name',
        'sku',
        'barcode',
        'stock',
        'minStock',
        'maxStock',
        'location',
        'updatedAt'
      ],
      order: [['name', 'ASC']],
      limit,
      offset
    });

    return {
      inventory: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * 2. Obtener stock de un producto específico
   * Endpoint: GET /api/v1/inventory/:id
   */
  async getProductStock(productId) {
    const { Product, Category } = require('../../../database');

    const product = await Product.findByPk(productId, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      attributes: [
        'id',
        'name',
        'sku',
        'barcode',
        'stock',
        'minStock',
        'maxStock',
        'location',
        'price',
        'cost',
        'updatedAt'
      ]
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Calcular alertas
    const alerts = [];
    if (product.stock === 0) {
      alerts.push({ type: 'danger', message: 'Producto sin stock' });
    } else if (product.stock <= product.minStock) {
      alerts.push({ 
        type: 'warning', 
        message: `Stock bajo. Mínimo: ${product.minStock}, Actual: ${product.stock}` 
      });
    }

    if (product.maxStock && product.stock > product.maxStock) {
      alerts.push({ 
        type: 'info', 
        message: `Stock excede el máximo recomendado (${product.maxStock})` 
      });
    }

    return {
      product,
      stockStatus: {
        current: product.stock,
        min: product.minStock,
        max: product.maxStock,
        difference: product.stock - product.minStock,
        needsRestock: product.stock <= product.minStock
      },
      alerts
    };
  }

  /**
   * 3. Registrar movimiento de inventario (entrada/salida manual)
   * Endpoint: POST /api/v1/inventory/movement
   */
  async registerMovement({ productId, movementType, quantity, reason, notes, userId }) {
    const { Product, StockMovement } = require('../../../database');
    
    const transaction = await sequelize.transaction();

    try {
      // Obtener producto con lock
      const product = await Product.findByPk(productId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const stockBefore = product.stock;
      let stockAfter;

      // Calcular nuevo stock según tipo de movimiento
      if (movementType === 'entrada') {
        stockAfter = stockBefore + quantity;
      } else if (movementType === 'salida') {
        if (stockBefore < quantity) {
          throw new Error(`Stock insuficiente. Actual: ${stockBefore}, Solicitado: ${quantity}`);
        }
        stockAfter = stockBefore - quantity;
      } else {
        throw new Error('Tipo de movimiento inválido');
      }

      // Actualizar stock del producto
      await product.update({ stock: stockAfter }, { transaction });

      // Registrar movimiento
      const movement = await StockMovement.create({
        productId,
        movementType,
        quantity,
        stockBefore,
        stockAfter,
        reason,
        notes,
        performedBy: userId
      }, { transaction });

      await transaction.commit();

      logger.info(`Movimiento de inventario registrado: ${movementType} de ${quantity} unidades para producto ${productId}`);

      return {
        movement,
        product: {
          id: product.id,
          name: product.name,
          stockBefore,
          stockAfter,
          difference: stockAfter - stockBefore
        }
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al registrar movimiento:', error);
      throw error;
    }
  }

  /**
   * 4. Obtener historial de movimientos de un producto
   * Endpoint: GET /api/v1/inventory/:id/movements
   */
  async getMovementHistory(productId, { page = 1, limit = 20, startDate, endDate, movementType } = {}) {
    try {
      const { StockMovement, Product, User } = require('../../../database');
      
      const offset = (page - 1) * limit;
      const where = { productId };

      // Filtro por tipo de movimiento
      if (movementType) {
        where.movementType = movementType;
      }

      // Filtro por rango de fechas
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }

      const { count, rows } = await StockMovement.findAndCountAll({
        where,
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'sku'],
            required: false
          },
          {
            model: User,
            as: 'performedByUser',
            attributes: ['id', 'username', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      logger.info(`Historial de movimientos obtenido: ${count} registros para producto ${productId}`);

      return {
        movements: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Error al obtener historial de movimientos:', error);
      throw error;
    }
  }

  /**
   * 5. Actualizar límites de stock (mínimo/máximo) y ubicación
   * Endpoint: PUT /api/v1/inventory/:id/limits
   */
  async updateStockLimits(productId, { minStock, maxStock, location }) {
    const { Product } = require('../../../database');

    const product = await Product.findByPk(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    // Validar que maxStock sea mayor o igual a minStock
    if (maxStock !== null && maxStock !== undefined && maxStock < minStock) {
      throw new Error('El stock máximo debe ser mayor o igual al stock mínimo');
    }

    await product.update({
      minStock,
      maxStock: maxStock || null,
      location: location || null
    });

    logger.info(`Límites de stock actualizados para producto ${productId}: min=${minStock}, max=${maxStock}`);

    return {
      product: {
        id: product.id,
        name: product.name,
        minStock: product.minStock,
        maxStock: product.maxStock,
        location: product.location,
        currentStock: product.stock
      }
    };
  }

  /**
   * 6. Obtener productos con stock bajo
   * Endpoint: GET /api/v1/inventory/alerts
   */
  async getLowStockAlerts() {
    const { Product, Category } = require('../../../database');

    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.and]: sequelize.where(
          sequelize.col('Product.stock'),
          '<=',
          sequelize.col('Product.min_stock')
        )
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      attributes: [
        'id',
        'name',
        'sku',
        'stock',
        'minStock',
        'maxStock',
        [sequelize.literal('min_stock - stock'), 'deficit']
      ],
      order: [[sequelize.literal('stock - min_stock'), 'ASC']] // Los más críticos primero
    });

    const summary = {
      total: products.length,
      outOfStock: products.filter(p => p.stock === 0).length,
      critical: products.filter(p => p.stock > 0 && p.stock <= p.minStock * 0.3).length,
      warning: products.filter(p => p.stock > p.minStock * 0.3 && p.stock <= p.minStock).length
    };

    return {
      alerts: products,
      summary
    };
  }

  /**
   * 7. Ajustar inventario (inventario físico)
   * Endpoint: POST /api/v1/inventory/adjust
   */
  async adjustInventory({ productId, newStock, reason, notes, userId }) {
    const { Product, StockMovement } = require('../../../database');
    
    const transaction = await sequelize.transaction();

    try {
      // Obtener producto con lock
      const product = await Product.findByPk(productId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      const stockBefore = product.stock;
      const stockAfter = newStock;
      const difference = stockAfter - stockBefore;

      // Actualizar stock
      await product.update({ stock: stockAfter }, { transaction });

      // Registrar movimiento de ajuste
      const movement = await StockMovement.create({
        productId,
        movementType: 'ajuste',
        quantity: Math.abs(difference),
        stockBefore,
        stockAfter,
        reason,
        notes: notes || `Ajuste de inventario. Diferencia: ${difference >= 0 ? '+' : ''}${difference}`,
        performedBy: userId
      }, { transaction });

      await transaction.commit();

      logger.info(`Inventario ajustado para producto ${productId}: ${stockBefore} → ${stockAfter} (${difference >= 0 ? '+' : ''}${difference})`);

      return {
        adjustment: {
          productId: product.id,
          productName: product.name,
          stockBefore,
          stockAfter,
          difference,
          reason
        },
        movement
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error al ajustar inventario:', error);
      throw error;
    }
  }

  /**
   * 8. Obtener valor total del inventario
   * Endpoint: GET /api/v1/inventory/value
   */
  async getInventoryValue({ categoryId } = {}) {
    const { Product, Category } = require('../../../database');
    
    const where = { isActive: true };
    
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }

    const products = await Product.findAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      attributes: [
        'id',
        'name',
        'stock',
        'cost',
        'price',
        [sequelize.literal('stock * COALESCE(cost, 0)'), 'totalCost'],
        [sequelize.literal('stock * price'), 'totalValue']
      ],
      raw: false
    });

    // Calcular totales
    const totalCostValue = products.reduce((sum, p) => {
      return sum + (p.stock * (parseFloat(p.cost) || 0));
    }, 0);

    const totalSaleValue = products.reduce((sum, p) => {
      return sum + (p.stock * parseFloat(p.price));
    }, 0);

    const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
    const totalProducts = products.length;

    // Agrupar por categoría
    const byCategory = products.reduce((acc, p) => {
      const categoryName = p.category ? p.category.name : 'Sin categoría';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          products: 0,
          items: 0,
          costValue: 0,
          saleValue: 0
        };
      }
      acc[categoryName].products++;
      acc[categoryName].items += p.stock;
      acc[categoryName].costValue += p.stock * (parseFloat(p.cost) || 0);
      acc[categoryName].saleValue += p.stock * parseFloat(p.price);
      return acc;
    }, {});

    return {
      summary: {
        totalProducts,      // Cantidad de productos diferentes
        totalItems,         // Cantidad total de unidades
        totalCostValue: parseFloat(totalCostValue.toFixed(2)),    // Valor de costo
        totalSaleValue: parseFloat(totalSaleValue.toFixed(2)),    // Valor de venta
        potentialProfit: parseFloat((totalSaleValue - totalCostValue).toFixed(2))
      },
      byCategory
    };
  }
}

module.exports = new InventoryService();
