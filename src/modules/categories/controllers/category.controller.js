const categoryService = require('../services/category.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERR = categoryService.constructor.ERRORS || {
  NOT_FOUND:        'Categoría no encontrada',
  NAME_IN_USE:      'Ya existe una categoría con ese nombre en el mismo nivel',
  PARENT_NOT_FOUND: 'La categoría padre no existe',
  CYCLIC_PARENT:    'No se puede asignar un descendiente como categoría padre',
  HAS_CHILDREN:     'No se puede eliminar: la categoría tiene subcategorías'
};

// Errores que retornan 400 (bad request) en lugar de 500
const CLIENT_ERRORS = [
  'Ya existe una categoría con ese nombre en el mismo nivel',
  'La categoría padre no existe',
  'No se puede asignar un descendiente como categoría padre',
  'No se puede eliminar: la categoría tiene subcategorías'
];

/**
 * Controller de Gestión de Categorías
 * Sprint 5 - Gestión de Categorías
 */
class CategoryController {

  /**
   * GET /api/v1/categories
   * Obtener árbol de categorías
   * Query: status (active | inactive | all)
   */
  async getCategories(req, res) {
    try {
      const { status = 'all' } = req.query;
      const tree = await categoryService.getCategories(status);
      return ApiResponse.success(res, tree, 'Categorías obtenidas exitosamente');
    } catch (error) {
      logger.error('Error en getCategories:', error);
      return ApiResponse.error(res, 'Error al obtener categorías');
    }
  }

  /**
   * POST /api/v1/categories
   * Crear nueva categoría
   */
  async createCategory(req, res) {
    try {
      const category = await categoryService.createCategory(req.body, req.user.id);
      return ApiResponse.created(res, category, 'Categoría creada exitosamente');
    } catch (error) {
      logger.error('Error en createCategory:', error);

      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (CLIENT_ERRORS.includes(error.message)) {
        return ApiResponse.badRequest(res, error.message);
      }
      return ApiResponse.error(res, 'Error al crear categoría');
    }
  }

  /**
   * GET /api/v1/categories/:id
   * Obtener categoría por ID
   */
  async getCategoryById(req, res) {
    try {
      const category = await categoryService.getCategoryById(parseInt(req.params.id));
      return ApiResponse.success(res, category, 'Categoría obtenida exitosamente');
    } catch (error) {
      logger.error('Error en getCategoryById:', error);

      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al obtener categoría');
    }
  }

  /**
   * PUT /api/v1/categories/:id
   * Actualizar categoría
   */
  async updateCategory(req, res) {
    try {
      const category = await categoryService.updateCategory(
        parseInt(req.params.id),
        req.body,
        req.user.id
      );
      return ApiResponse.success(res, category, 'Categoría actualizada exitosamente');
    } catch (error) {
      logger.error('Error en updateCategory:', error);

      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (CLIENT_ERRORS.includes(error.message)) {
        return ApiResponse.badRequest(res, error.message);
      }
      return ApiResponse.error(res, 'Error al actualizar categoría');
    }
  }

  /**
   * PATCH /api/v1/categories/:id/status
   * Activar/Desactivar categoría (con cascada en desactivación)
   */
  async toggleStatus(req, res) {
    try {
      const result = await categoryService.toggleStatus(
        parseInt(req.params.id),
        req.user.id
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      logger.error('Error en toggleStatus:', error);

      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al cambiar estado de categoría');
    }
  }

  /**
   * DELETE /api/v1/categories/:id
   * Eliminar categoría (soft delete). Falla si tiene subcategorías.
   */
  async deleteCategory(req, res) {
    try {
      const result = await categoryService.deleteCategory(
        parseInt(req.params.id),
        req.user.id
      );
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      logger.error('Error en deleteCategory:', error);

      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (CLIENT_ERRORS.includes(error.message)) {
        return ApiResponse.badRequest(res, error.message);
      }
      return ApiResponse.error(res, 'Error al eliminar categoría');
    }
  }

  /**
   * GET /api/v1/categories/:id/products
   * Productos de una categoría (vacío hasta Sprint de Productos)
   */
  async getCategoryProducts(req, res) {
    try {
      const result = await categoryService.getCategoryProducts(parseInt(req.params.id));
      return ApiResponse.success(res, result, 'Productos obtenidos exitosamente');
    } catch (error) {
      logger.error('Error en getCategoryProducts:', error);

      if (error.message === 'Categoría no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.error(res, 'Error al obtener productos de la categoría');
    }
  }
}

module.exports = new CategoryController();
