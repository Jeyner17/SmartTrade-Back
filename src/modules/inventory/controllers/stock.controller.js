const inventoryService = require('../services/stock.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const CLIENT_ERRORS = [
  'Producto no encontrado',
  'Stock insuficiente',
  'El stock máximo debe ser mayor o igual al stock mínimo',
  'Tipo de movimiento inválido'
];

/**
 * Controller de Gestión de Inventario
 * Sprint 7 - Gestión de Inventario
 */
class InventoryController {

  /**
   * GET /api/v1/inventory
   * 1. Obtener stock de todos los productos
   */
  async getInventory(req, res) {
    try {
      const { page, limit, search, categoryId, lowStock, outOfStock } = req.query;

      const result = await inventoryService.getInventory({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        lowStock: lowStock === 'true' || lowStock === true,
        outOfStock: outOfStock === 'true' || outOfStock === true
      });

      return ApiResponse.success(res, result, 'Inventario obtenido exitosamente');
    } catch (error) {
      logger.error('Error en getInventory:', error);
      return ApiResponse.error(res, 'Error al obtener inventario');
    }
  }

  /**
   * GET /api/v1/inventory/:id
   * 2. Obtener stock de un producto específico
   */
  async getProductStock(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const result = await inventoryService.getProductStock(productId);

      return ApiResponse.success(res, result, 'Stock del producto obtenido exitosamente');
    } catch (error) {
      logger.error('Error en getProductStock:', error);
      
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, 'Producto no encontrado');
      }

      return ApiResponse.error(res, 'Error al obtener stock del producto');
    }
  }

  /**
   * POST /api/v1/inventory/movement
   * 3. Registrar movimiento de inventario (entrada/salida manual)
   */
  async registerMovement(req, res) {
    try {
      const { productId, movementType, quantity, reason, notes } = req.body;
      const userId = req.user.id;

      const result = await inventoryService.registerMovement({
        productId,
        movementType,
        quantity,
        reason,
        notes,
        userId
      });

      return ApiResponse.created(res, result, 'Movimiento registrado exitosamente');
    } catch (error) {
      logger.error('Error en registerMovement:', error);

      // Validar errores de cliente
      if (error.message.includes('Stock insuficiente')) {
        return ApiResponse.badRequest(res, error.message);
      }

      if (CLIENT_ERRORS.some(msg => error.message.includes(msg))) {
        return ApiResponse.badRequest(res, error.message);
      }

      return ApiResponse.error(res, 'Error al registrar movimiento');
    }
  }

  /**
   * GET /api/v1/inventory/:id/movements
   * 4. Obtener historial de movimientos de un producto
   */
  async getMovementHistory(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const { page, limit, startDate, endDate, movementType } = req.query;

      const result = await inventoryService.getMovementHistory(productId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        startDate,
        endDate,
        movementType
      });

      return ApiResponse.success(res, result, 'Historial de movimientos obtenido exitosamente');
    } catch (error) {
      logger.error('Error en getMovementHistory:', error);
      return ApiResponse.error(res, 'Error al obtener historial de movimientos');
    }
  }

  /**
   * PUT /api/v1/inventory/:id/limits
   * 5. Actualizar límites de stock (mínimo/máximo) y ubicación
   */
  async updateStockLimits(req, res) {
    try {
      const productId = parseInt(req.params.id);
      const { minStock, maxStock, location } = req.body;

      const result = await inventoryService.updateStockLimits(productId, {
        minStock,
        maxStock,
        location
      });

      return ApiResponse.success(res, result, 'Límites de stock actualizados exitosamente');
    } catch (error) {
      logger.error('Error en updateStockLimits:', error);

      if (CLIENT_ERRORS.some(msg => error.message.includes(msg))) {
        return ApiResponse.badRequest(res, error.message);
      }

      return ApiResponse.error(res, 'Error al actualizar límites de stock');
    }
  }

  /**
   * GET /api/v1/inventory/alerts
   * 6. Obtener productos con stock bajo
   */
  async getLowStockAlerts(req, res) {
    try {
      const result = await inventoryService.getLowStockAlerts();

      return ApiResponse.success(res, result, 'Alertas de stock obtenidas exitosamente');
    } catch (error) {
      logger.error('Error en getLowStockAlerts:', error);
      return ApiResponse.error(res, 'Error al obtener alertas de stock');
    }
  }

  /**
   * POST /api/v1/inventory/adjust
   * 7. Ajustar inventario (inventario físico)
   */
  async adjustInventory(req, res) {
    try {
      const { productId, newStock, reason, notes } = req.body;
      const userId = req.user.id;

      const result = await inventoryService.adjustInventory({
        productId,
        newStock,
        reason,
        notes,
        userId
      });

      return ApiResponse.success(res, result, 'Inventario ajustado exitosamente');
    } catch (error) {
      logger.error('Error en adjustInventory:', error);

      if (CLIENT_ERRORS.some(msg => error.message.includes(msg))) {
        return ApiResponse.badRequest(res, error.message);
      }

      return ApiResponse.error(res, 'Error al ajustar inventario');
    }
  }

  /**
   * GET /api/v1/inventory/value
   * 8. Obtener valor total del inventario
   */
  async getInventoryValue(req, res) {
    try {
      const { categoryId } = req.query;

      const result = await inventoryService.getInventoryValue({
        categoryId: categoryId ? parseInt(categoryId) : undefined
      });

      return ApiResponse.success(res, result, 'Valor del inventario calculado exitosamente');
    } catch (error) {
      logger.error('Error en getInventoryValue:', error);
      return ApiResponse.error(res, 'Error al calcular valor del inventario');
    }
  }
}

module.exports = new InventoryController();
