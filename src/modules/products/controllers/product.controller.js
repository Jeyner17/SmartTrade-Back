const productService = require('../services/product.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const CLIENT_ERRORS = [
  'El SKU ya está registrado',
  'El código de barras ya está registrado',
  'La categoría especificada no existe'
];

/**
 * Controller de Gestión de Productos
 * Sprint 6 - Gestión de Productos
 */
class ProductController {

  /**
   * GET /api/v1/products
   */
  async getProducts(req, res) {
    try {
      const { page, limit, search, categoryId, isActive, minPrice, maxPrice } = req.query;

      const result = await productService.getProducts({
        page:       parseInt(page)  || 1,
        limit:      parseInt(limit) || 10,
        search:     search     || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        isActive:   isActive   !== undefined ? isActive === 'true' : undefined,
        minPrice:   minPrice   ? parseFloat(minPrice) : undefined,
        maxPrice:   maxPrice   ? parseFloat(maxPrice) : undefined
      });

      return ApiResponse.success(res, result, 'Productos obtenidos exitosamente');
    } catch (error) {
      logger.error('Error en getProducts:', error);
      return ApiResponse.error(res, 'Error al obtener productos');
    }
  }

  /**
   * POST /api/v1/products
   */
  async createProduct(req, res) {
    try {
      const product = await productService.createProduct(req.body, req.user.id);
      return ApiResponse.created(res, product, 'Producto creado exitosamente');
    } catch (error) {
      logger.error('Error en createProduct:', error);
      if (CLIENT_ERRORS.includes(error.message)) {
        return ApiResponse.conflict(res, error.message);
      }
      return ApiResponse.error(res, 'Error al crear producto');
    }
  }

  /**
   * GET /api/v1/products/barcode/:code
   */
  async findByBarcode(req, res) {
    try {
      const product = await productService.findByBarcode(req.params.code);
      return ApiResponse.success(res, product, 'Producto encontrado');
    } catch (error) {
      logger.error('Error en findByBarcode:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, 'No se encontró producto con ese código de barras');
      }
      return ApiResponse.error(res, 'Error al buscar producto');
    }
  }

  /**
   * GET /api/v1/products/:id
   */
  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(parseInt(req.params.id));
      return ApiResponse.success(res, product, 'Producto obtenido exitosamente');
    } catch (error) {
      logger.error('Error en getProductById:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al obtener producto');
    }
  }

  /**
   * PUT /api/v1/products/:id
   */
  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(
        parseInt(req.params.id), req.body, req.user.id
      );
      return ApiResponse.success(res, product, 'Producto actualizado exitosamente');
    } catch (error) {
      logger.error('Error en updateProduct:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (CLIENT_ERRORS.includes(error.message)) {
        return ApiResponse.conflict(res, error.message);
      }
      return ApiResponse.error(res, 'Error al actualizar producto');
    }
  }

  /**
   * PATCH /api/v1/products/:id/price
   */
  async updatePrice(req, res) {
    try {
      const result = await productService.updatePrice(
        parseInt(req.params.id), req.body, req.user.id
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      logger.error('Error en updatePrice:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al actualizar precio');
    }
  }

  /**
   * POST /api/v1/products/:id/image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'No se recibió ninguna imagen', 400);
      }

      const result = await productService.uploadImage(
        parseInt(req.params.id), req.file, req.user.id
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      logger.error('Error en uploadImage:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al subir imagen');
    }
  }

  /**
   * PATCH /api/v1/products/:id/status
   */
  async toggleStatus(req, res) {
    try {
      const result = await productService.toggleStatus(
        parseInt(req.params.id), req.user.id
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      logger.error('Error en toggleStatus:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al cambiar estado del producto');
    }
  }

  /**
   * DELETE /api/v1/products/:id
   */
  async deleteProduct(req, res) {
    try {
      const result = await productService.deleteProduct(
        parseInt(req.params.id), req.user.id
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      logger.error('Error en deleteProduct:', error);
      if (error.message === 'Producto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al eliminar producto');
    }
  }
}

module.exports = new ProductController();
