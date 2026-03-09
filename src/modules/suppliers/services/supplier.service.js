const { Op, fn, col, literal } = require('sequelize');
const { Supplier, SupplierContact, SupplierEvaluation } = require('../../../database');
const logger = require('../../../utils/logger');
const { SUPPLIER_ERRORS: ERROR } = require('../../../shared/constants/suppliers.constants');

/**
 * Servicio de Gestión de Proveedores
 * Sprint 8 - Gestión de Proveedores
 */
class SupplierService {

    // ============================================
    // 1. LISTAR PROVEEDORES
    // ============================================

    /**
     * Listar proveedores con paginación y filtros
     * @param {Object} options - Filtros y paginación
     */
    async getSuppliers({ page = 1, limit = 10, search, status, minRating }) {
        const offset = (page - 1) * limit;
        const where = {};

        if (search) {
            where[Op.or] = [
                { tradeName: { [Op.iLike]: `%${search}%` } },
                { legalName: { [Op.iLike]: `%${search}%` } },
                { ruc: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (status) where.status = status;
        if (minRating) where.overallRating = { [Op.gte]: parseFloat(minRating) };

        const { count, rows } = await Supplier.findAndCountAll({
            where,
            include: [{
                model: SupplierContact,
                as: 'contacts',
                where: { isPrimary: true },
                required: false,
                attributes: ['name', 'position', 'phone', 'email']
            }],
            order: [['tradeName', 'ASC']],
            limit,
            offset
        });

        return {
            suppliers: rows,
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

    // ============================================
    // 2. CREAR PROVEEDOR
    // ============================================

    /**
     * Registrar un nuevo proveedor
     * @param {Object} data - Datos del proveedor
     * @param {number} createdById - ID del usuario creador
     */
    async createSupplier(data, createdById) {
        const {
            tradeName, legalName, ruc, address, phone, email, website,
            paymentTerms, bankName, bankAccount, bankAccountType,
            notes, contacts = []
        } = data;

        // Verificar RUC único
        const existing = await Supplier.findOne({ where: { ruc } });
        if (existing) throw new Error(ERROR.RUC_IN_USE);

        // Crear proveedor
        const supplier = await Supplier.create({
            tradeName, legalName, ruc, address, phone, email, website,
            paymentTerms, bankName, bankAccount, bankAccountType,
            notes, status: 'active',
            createdBy: createdById
        });

        // Crear contactos si se proveen
        if (contacts.length > 0) {
            // Asegurar que solo uno sea primary
            const contactsData = contacts.map((c, i) => ({
                ...c,
                supplierId: supplier.id,
                isPrimary: i === 0 ? true : (c.isPrimary || false)
            }));
            await SupplierContact.bulkCreate(contactsData);
        }

        // Recargar con contactos
        await supplier.reload({
            include: [{ model: SupplierContact, as: 'contacts' }]
        });

        logger.success('Proveedor creado', { supplierId: supplier.id, createdBy: createdById });
        return supplier;
    }

    // ============================================
    // 3. OBTENER PROVEEDOR POR ID
    // ============================================

    /**
     * Obtener información completa del proveedor
     * @param {number} id - ID del proveedor
     */
    async getSupplierById(id) {
        const supplier = await Supplier.findByPk(id, {
            include: [
                {
                    model: SupplierContact,
                    as: 'contacts',
                    order: [['isPrimary', 'DESC'], ['name', 'ASC']]
                },
                {
                    model: SupplierEvaluation,
                    as: 'evaluations',
                    order: [['createdAt', 'DESC']],
                    limit: 5,
                    attributes: ['id', 'qualityRating', 'punctualityRating', 'overallRating', 'observations', 'createdAt']
                }
            ]
        });

        if (!supplier) throw new Error(ERROR.NOT_FOUND);

        // Estadísticas de compras (placeholder — cuando se implemente el módulo purchases)
        const purchaseStats = {
            totalPurchases: 0,
            totalAmount: 0,
            lastPurchaseDate: null,
            note: 'Las estadísticas de compras estarán disponibles cuando se implemente el módulo purchases'
        };

        return { supplier, purchaseStats };
    }

    // ============================================
    // 4. ACTUALIZAR PROVEEDOR
    // ============================================

    /**
     * Modificar datos de un proveedor
     * @param {number} id - ID del proveedor
     * @param {Object} data - Datos a actualizar
     * @param {number} updatedById - ID del usuario actualizador
     */
    async updateSupplier(id, data, updatedById) {
        const supplier = await Supplier.findByPk(id);
        if (!supplier) throw new Error(ERROR.NOT_FOUND);

        // Verificar RUC único si cambió
        if (data.ruc && data.ruc !== supplier.ruc) {
            const existing = await Supplier.findOne({
                where: { ruc: data.ruc, id: { [Op.ne]: id } }
            });
            if (existing) throw new Error(ERROR.RUC_IN_USE);
        }

        const fields = [
            'tradeName', 'legalName', 'ruc', 'address', 'phone', 'email', 'website',
            'paymentTerms', 'bankName', 'bankAccount', 'bankAccountType', 'notes'
        ];

        const updates = { updatedBy: updatedById };
        fields.forEach(field => {
            if (data[field] !== undefined) updates[field] = data[field];
        });

        await supplier.update(updates);

        await supplier.reload({
            include: [{ model: SupplierContact, as: 'contacts' }]
        });

        logger.info('Proveedor actualizado', { supplierId: id, updatedBy: updatedById });
        return supplier;
    }

    // ============================================
    // 5. HISTORIAL DE COMPRAS
    // ============================================

    /**
     * Listar compras realizadas a un proveedor
     * @param {number} id - ID del proveedor
     * @param {Object} options - Filtros de fecha y paginación
     */
    async getSupplierPurchaseHistory(id, { startDate, endDate, page = 1, limit = 10 } = {}) {
        const supplier = await Supplier.findByPk(id, { attributes: ['id', 'tradeName', 'ruc'] });
        if (!supplier) throw new Error(ERROR.NOT_FOUND);

        // Cuando el módulo purchases esté implementado, aquí se consultará la tabla de compras
        // Por ahora retornamos estructura preparada para integración
        const history = {
            supplier: { id: supplier.id, tradeName: supplier.tradeName, ruc: supplier.ruc },
            purchases: [],
            pagination: {
                total: 0,
                page,
                limit,
                pages: 0,
                hasNext: false,
                hasPrev: false
            },
            filters: { startDate, endDate },
            note: 'El historial de compras estará disponible cuando se implemente el módulo purchases (Sprint 9)'
        };

        return history;
    }

    // ============================================
    // 6. EVALUAR PROVEEDOR
    // ============================================

    /**
     * Registrar evaluación de desempeño del proveedor
     * @param {number} id - ID del proveedor
     * @param {Object} evaluationData - Datos de la evaluación
     * @param {number} evaluatedById - ID del usuario evaluador
     */
    async evaluateSupplier(id, evaluationData, evaluatedById) {
        const supplier = await Supplier.findByPk(id);
        if (!supplier) throw new Error(ERROR.NOT_FOUND);

        const { qualityRating, punctualityRating, observations, purchaseReference } = evaluationData;

        // Calcular promedio de la evaluación
        const overallRating = parseFloat(((qualityRating + punctualityRating) / 2).toFixed(2));

        // Crear evaluación
        const evaluation = await SupplierEvaluation.create({
            supplierId: id,
            qualityRating,
            punctualityRating,
            overallRating,
            observations,
            evaluatedBy: evaluatedById,
            purchaseReference: purchaseReference || null
        });

        // Recalcular promedios del proveedor
        const allEvaluations = await SupplierEvaluation.findAll({
            where: { supplierId: id },
            attributes: ['qualityRating', 'punctualityRating', 'overallRating']
        });

        const count = allEvaluations.length;
        const avgQuality = parseFloat((allEvaluations.reduce((s, e) => s + parseFloat(e.qualityRating), 0) / count).toFixed(2));
        const avgPunctuality = parseFloat((allEvaluations.reduce((s, e) => s + parseFloat(e.punctualityRating), 0) / count).toFixed(2));
        const avgOverall = parseFloat(((avgQuality + avgPunctuality) / 2).toFixed(2));

        await supplier.update({
            qualityRating: avgQuality,
            punctualityRating: avgPunctuality,
            overallRating: avgOverall,
            evaluationsCount: count
        });

        logger.info('Proveedor evaluado', { supplierId: id, evaluatedBy: evaluatedById, overallRating: avgOverall });

        return {
            evaluation,
            newRatings: {
                qualityRating: avgQuality,
                punctualityRating: avgPunctuality,
                overallRating: avgOverall,
                evaluationsCount: count
            }
        };
    }

    // ============================================
    // 7. CAMBIAR ESTADO
    // ============================================

    /**
     * Activar o desactivar un proveedor
     * @param {number} id - ID del proveedor
     * @param {string} status - Nuevo estado: active, inactive, suspended
     * @param {string} reason - Motivo del cambio
     * @param {number} updatedById - ID del usuario que realiza el cambio
     */
    async changeSupplierStatus(id, status, reason, updatedById) {
        const supplier = await Supplier.findByPk(id);
        if (!supplier) throw new Error(ERROR.NOT_FOUND);

        const previousStatus = supplier.status;

        await supplier.update({
            status,
            statusReason: reason || null,
            updatedBy: updatedById
        });

        logger.info('Estado de proveedor cambiado', {
            supplierId: id,
            from: previousStatus,
            to: status,
            updatedBy: updatedById
        });

        return {
            message: `Proveedor ${status === 'active' ? 'activado' : status === 'inactive' ? 'desactivado' : 'suspendido'} exitosamente`,
            supplier: {
                id: supplier.id,
                tradeName: supplier.tradeName,
                previousStatus,
                newStatus: status,
                statusReason: reason || null
            }
        };
    }

    // ============================================
    // 8. ELIMINAR PROVEEDOR
    // ============================================

    /**
     * Eliminar proveedor (solo si no tiene compras asociadas)
     * @param {number} id - ID del proveedor
     * @param {number} deletedById - ID del usuario que elimina
     */
    async deleteSupplier(id, deletedById) {
        const supplier = await Supplier.findByPk(id);
        if (!supplier) throw new Error(ERROR.NOT_FOUND);

        // Verificar compras (cuando el módulo purchases esté implementado)
        // const purchasesCount = await Purchase.count({ where: { supplierId: id } });
        // if (purchasesCount > 0) throw new Error(ERROR.HAS_PURCHASES);

        // Marcar como inactivo antes del soft delete
        await supplier.update({ status: 'inactive', updatedBy: deletedById });
        await supplier.destroy(); // paranoid soft delete

        logger.info('Proveedor eliminado (soft delete)', { supplierId: id, deletedBy: deletedById });
        return { message: 'Proveedor eliminado exitosamente' };
    }
}

module.exports = new SupplierService();
