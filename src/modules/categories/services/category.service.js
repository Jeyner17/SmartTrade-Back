const { Op } = require('sequelize');
const { Category } = require('../../../database');
const logger = require('../../../utils/logger');

const ERROR = {
  NOT_FOUND:        'Categoría no encontrada',
  NAME_IN_USE:      'Ya existe una categoría con ese nombre en el mismo nivel',
  PARENT_NOT_FOUND: 'La categoría padre no existe',
  CYCLIC_PARENT:    'No se puede asignar un descendiente como categoría padre',
  HAS_CHILDREN:     'No se puede eliminar: la categoría tiene subcategorías'
};

/**
 * Servicio de Gestión de Categorías
 * Sprint 5 - Gestión de Categorías
 */
class CategoryService {

  // ============================================
  // LISTAR / ÁRBOL
  // ============================================

  /**
   * Obtener todas las categorías como árbol jerárquico
   * @param {string} status - 'active' | 'inactive' | 'all'
   */
  async getCategories(status = 'all') {
    const where = {};
    if (status === 'active')   where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const flat = await Category.findAll({
      where,
      order: [['level', 'ASC'], ['name', 'ASC']]
    });

    return this._buildTree(flat, null);
  }

  /**
   * Construye árbol recursivo a partir de lista plana
   */
  _buildTree(flat, parentId) {
    return flat
      .filter(c => c.parentId === parentId)
      .map(c => ({
        id:           c.id,
        name:         c.name,
        description:  c.description,
        parentId:     c.parentId,
        level:        c.level,
        isActive:     c.isActive,
        productCount: 0, // se llenará en Sprint de Productos
        createdAt:    c.createdAt,
        updatedAt:    c.updatedAt,
        children:     this._buildTree(flat, c.id)
      }));
  }

  // ============================================
  // OBTENER POR ID
  // ============================================

  async getCategoryById(id) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error(ERROR.NOT_FOUND);
    return category;
  }

  // ============================================
  // CREAR
  // ============================================

  async createCategory(data, userId) {
    const { name, description, parentId = null, isActive = true } = data;

    // Calcular nivel
    let level = 0;
    if (parentId !== null) {
      const parent = await Category.findByPk(parentId);
      if (!parent) throw new Error(ERROR.PARENT_NOT_FOUND);
      level = parent.level + 1;
    }

    // Verificar nombre único dentro del mismo nivel/padre
    const existing = await Category.findOne({
      where: { name, parentId: parentId ?? null }
    });
    if (existing) throw new Error(ERROR.NAME_IN_USE);

    const category = await Category.create({
      name, description, parentId, level, isActive,
      createdBy: userId
    });

    logger.success('Categoría creada', { categoryId: category.id, createdBy: userId });
    return category;
  }

  // ============================================
  // ACTUALIZAR
  // ============================================

  async updateCategory(id, data, userId) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error(ERROR.NOT_FOUND);

    const updates = { updatedBy: userId };

    // Verificar nombre único si cambió
    if (data.name !== undefined && data.name !== category.name) {
      const parentIdToCheck = data.parentId !== undefined ? data.parentId : category.parentId;
      const existing = await Category.findOne({
        where: { name: data.name, parentId: parentIdToCheck ?? null, id: { [Op.ne]: id } }
      });
      if (existing) throw new Error(ERROR.NAME_IN_USE);
      updates.name = data.name;
    }

    if (data.description !== undefined) updates.description = data.description;
    if (data.isActive    !== undefined) updates.isActive    = data.isActive;

    // Cambio de padre: recalcular nivel y validar que no sea descendiente
    if (data.parentId !== undefined && data.parentId !== category.parentId) {
      const newParentId = data.parentId;

      if (newParentId !== null) {
        // Validar que el nuevo padre no sea descendiente de esta categoría
        const isDescendant = await this._isDescendant(id, newParentId);
        if (isDescendant) throw new Error(ERROR.CYCLIC_PARENT);

        const newParent = await Category.findByPk(newParentId);
        if (!newParent) throw new Error(ERROR.PARENT_NOT_FOUND);
        updates.level = newParent.level + 1;
      } else {
        updates.level = 0;
      }

      updates.parentId = newParentId;
    }

    await category.update(updates);
    await category.reload();

    logger.info('Categoría actualizada', { categoryId: id, updatedBy: userId });
    return category;
  }

  // ============================================
  // TOGGLE STATUS (con cascada)
  // ============================================

  async toggleStatus(id, userId) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error(ERROR.NOT_FOUND);

    const newStatus = !category.isActive;

    // Actualizar esta categoría
    await category.update({ isActive: newStatus, updatedBy: userId });

    // Si se desactiva, propagar en cascada a todos los descendientes
    if (!newStatus) {
      const descendants = await this._getAllDescendantIds(id);
      if (descendants.length > 0) {
        await Category.update(
          { isActive: false, updatedBy: userId },
          { where: { id: { [Op.in]: descendants } } }
        );
      }
    }

    const action = newStatus ? 'activada' : 'desactivada';
    logger.info(`Categoría ${action}`, { categoryId: id, updatedBy: userId });

    return {
      message: `Categoría ${action} exitosamente`,
      category: { id, isActive: newStatus }
    };
  }

  // ============================================
  // ELIMINAR
  // ============================================

  async deleteCategory(id, userId) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error(ERROR.NOT_FOUND);

    // Verificar que no tenga subcategorías (incluyendo eliminadas lógicamente)
    const childrenCount = await Category.count({
      where: { parentId: id },
      paranoid: false
    });
    if (childrenCount > 0) throw new Error(ERROR.HAS_CHILDREN);

    await category.update({ updatedBy: userId });
    await category.destroy(); // paranoid soft delete

    logger.info('Categoría eliminada (soft delete)', { categoryId: id, deletedBy: userId });
    return { message: 'Categoría eliminada exitosamente' };
  }

  // ============================================
  // PRODUCTOS POR CATEGORÍA
  // ============================================

  async getCategoryProducts(id) {
    const category = await Category.findByPk(id);
    if (!category) throw new Error(ERROR.NOT_FOUND);

    // Se llenará en el Sprint de Productos cuando exista el modelo Product
    return {
      category: {
        id:   category.id,
        name: category.name
      },
      products: [],
      total: 0
    };
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  /**
   * Verificar si targetId es descendiente de ancestorId
   */
  async _isDescendant(ancestorId, targetId) {
    const descendants = await this._getAllDescendantIds(ancestorId);
    return descendants.includes(targetId);
  }

  /**
   * Obtener todos los IDs de descendientes de una categoría
   */
  async _getAllDescendantIds(parentId) {
    const children = await Category.findAll({
      where: { parentId },
      attributes: ['id'],
      paranoid: false
    });

    const ids = children.map(c => c.id);

    for (const childId of ids) {
      const subIds = await this._getAllDescendantIds(childId);
      ids.push(...subIds);
    }

    return ids;
  }
}

CategoryService.ERRORS = ERROR;
module.exports = new CategoryService();
