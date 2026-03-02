const supplierService = require('../services/supplier.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERR = {
    NOT_FOUND: 'Proveedor no encontrado',
    RUC_IN_USE: 'El RUC ya está registrado por otro proveedor',
    HAS_PURCHASES: 'No se puede eliminar el proveedor porque tiene compras asociadas'
};

/**
 * Controller de Gestión de Proveedores
 * Sprint 8 - Gestión de Proveedores
 */
class SupplierController {

    // ============================================
    // 1. LISTAR PROVEEDORES
    // ============================================

    /**
     * GET /api/v1/suppliers
     */
    async getSuppliers(req, res) {
        try {
            const { page, limit, search, status, minRating } = req.query;

            const result = await supplierService.getSuppliers({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                search: search || undefined,
                status: status || undefined,
                minRating: minRating || undefined
            });

            return ApiResponse.success(res, result, 'Proveedores obtenidos exitosamente');

        } catch (error) {
            logger.error('Error en getSuppliers:', error);
            return ApiResponse.error(res, 'Error al obtener proveedores');
        }
    }

    // ============================================
    // 2. CREAR PROVEEDOR
    // ============================================

    /**
     * POST /api/v1/suppliers
     */
    async createSupplier(req, res) {
        try {
            const supplier = await supplierService.createSupplier(req.body, req.user.id);
            return ApiResponse.created(res, supplier, 'Proveedor creado exitosamente');

        } catch (error) {
            logger.error('Error en createSupplier:', error);

            if (error.message === ERR.RUC_IN_USE) {
                return ApiResponse.conflict(res, error.message);
            }

            return ApiResponse.error(res, 'Error al crear proveedor');
        }
    }

    // ============================================
    // 3. OBTENER PROVEEDOR POR ID
    // ============================================

    /**
     * GET /api/v1/suppliers/:id
     */
    async getSupplierById(req, res) {
        try {
            const result = await supplierService.getSupplierById(parseInt(req.params.id));
            return ApiResponse.success(res, result, 'Proveedor obtenido exitosamente');

        } catch (error) {
            logger.error('Error en getSupplierById:', error);

            if (error.message === ERR.NOT_FOUND) {
                return ApiResponse.notFound(res, error.message);
            }

            return ApiResponse.error(res, 'Error al obtener proveedor');
        }
    }

    // ============================================
    // 4. ACTUALIZAR PROVEEDOR
    // ============================================

    /**
     * PUT /api/v1/suppliers/:id
     */
    async updateSupplier(req, res) {
        try {
            const supplier = await supplierService.updateSupplier(
                parseInt(req.params.id),
                req.body,
                req.user.id
            );

            return ApiResponse.success(res, supplier, 'Proveedor actualizado exitosamente');

        } catch (error) {
            logger.error('Error en updateSupplier:', error);

            if (error.message === ERR.NOT_FOUND) {
                return ApiResponse.notFound(res, error.message);
            }

            if (error.message === ERR.RUC_IN_USE) {
                return ApiResponse.conflict(res, error.message);
            }

            return ApiResponse.error(res, 'Error al actualizar proveedor');
        }
    }

    // ============================================
    // 5. HISTORIAL DE COMPRAS
    // ============================================

    /**
     * GET /api/v1/suppliers/:id/purchases
     */
    async getPurchaseHistory(req, res) {
        try {
            const { startDate, endDate, page, limit } = req.query;

            const result = await supplierService.getSupplierPurchaseHistory(
                parseInt(req.params.id),
                {
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    page: parseInt(page) || 1,
                    limit: parseInt(limit) || 10
                }
            );

            return ApiResponse.success(res, result, 'Historial de compras obtenido exitosamente');

        } catch (error) {
            logger.error('Error en getPurchaseHistory:', error);

            if (error.message === ERR.NOT_FOUND) {
                return ApiResponse.notFound(res, error.message);
            }

            return ApiResponse.error(res, 'Error al obtener historial de compras');
        }
    }

    // ============================================
    // 6. EVALUAR PROVEEDOR
    // ============================================

    /**
     * POST /api/v1/suppliers/:id/evaluate
     */
    async evaluateSupplier(req, res) {
        try {
            const result = await supplierService.evaluateSupplier(
                parseInt(req.params.id),
                req.body,
                req.user.id
            );

            return ApiResponse.created(res, result, 'Evaluación registrada exitosamente');

        } catch (error) {
            logger.error('Error en evaluateSupplier:', error);

            if (error.message === ERR.NOT_FOUND) {
                return ApiResponse.notFound(res, error.message);
            }

            return ApiResponse.error(res, 'Error al registrar evaluación');
        }
    }

    // ============================================
    // 7. CAMBIAR ESTADO
    // ============================================

    /**
     * PATCH /api/v1/suppliers/:id/status
     */
    async changeStatus(req, res) {
        try {
            const { status, reason } = req.body;

            const result = await supplierService.changeSupplierStatus(
                parseInt(req.params.id),
                status,
                reason || null,
                req.user.id
            );

            return ApiResponse.success(res, result, result.message);

        } catch (error) {
            logger.error('Error en changeStatus:', error);

            if (error.message === ERR.NOT_FOUND) {
                return ApiResponse.notFound(res, error.message);
            }

            return ApiResponse.error(res, 'Error al cambiar estado del proveedor');
        }
    }

    // ============================================
    // 8. ELIMINAR PROVEEDOR
    // ============================================

    /**
     * DELETE /api/v1/suppliers/:id
     */
    async deleteSupplier(req, res) {
        try {
            const result = await supplierService.deleteSupplier(parseInt(req.params.id), req.user.id);
            return ApiResponse.success(res, result, result.message);

        } catch (error) {
            logger.error('Error en deleteSupplier:', error);

            if (error.message === ERR.NOT_FOUND) {
                return ApiResponse.notFound(res, error.message);
            }

            if (error.message === ERR.HAS_PURCHASES) {
                return ApiResponse.conflict(res, error.message);
            }

            return ApiResponse.error(res, 'Error al eliminar proveedor');
        }
    }
}

module.exports = new SupplierController();
