const express = require('express');
const router  = express.Router();

// Controller
const productController = require('../controllers/product.controller');

// Validators
const {
  validate,
  validateGetProducts,
  validateCreateProduct,
  validateUpdateProduct,
  validateUpdatePrice
} = require('../validators/product.validator');

// Middlewares
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { uploadProductImage } = require('../../../utils/file.util');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

/**
 * Rutas de Gestión de Productos
 * Sprint 6 - Gestión de Productos
 *
 * Prefix: /api/v1/products
 * Todos los endpoints requieren autenticación JWT
 */

// Aplicar autenticación a todas las rutas del módulo
router.use(authMiddleware);

/**
 * GET /api/v1/products
 * Listar productos con filtros y paginación
 */
router.get(
  '/',
  requirePermission(MODULES.PRODUCTS, ACTIONS.VIEW),
  validateGetProducts,
  validate,
  asyncHandler(productController.getProducts)
);

/**
 * POST /api/v1/products
 * Crear nuevo producto
 */
router.post(
  '/',
  requirePermission(MODULES.PRODUCTS, ACTIONS.CREATE),
  validateCreateProduct,
  validate,
  auditLog('CREATE_PRODUCT'),
  asyncHandler(productController.createProduct)
);

/**
 * GET /api/v1/products/barcode/:code
 * Buscar producto por código de barras
 * IMPORTANTE: definir antes de /:id para evitar conflicto de ruta
 */
router.get(
  '/barcode/:code',
  requirePermission(MODULES.PRODUCTS, ACTIONS.VIEW),
  asyncHandler(productController.findByBarcode)
);

/**
 * GET /api/v1/products/:id
 * Obtener producto por ID (incluye categoría e historial de precios)
 */
router.get(
  '/:id',
  requirePermission(MODULES.PRODUCTS, ACTIONS.VIEW),
  asyncHandler(productController.getProductById)
);

/**
 * PUT /api/v1/products/:id
 * Actualizar datos del producto
 */
router.put(
  '/:id',
  requirePermission(MODULES.PRODUCTS, ACTIONS.EDIT),
  validateUpdateProduct,
  validate,
  auditLog('UPDATE_PRODUCT'),
  asyncHandler(productController.updateProduct)
);

/**
 * PATCH /api/v1/products/:id/price
 * Actualizar precio y registrar en historial
 */
router.patch(
  '/:id/price',
  requirePermission(MODULES.PRODUCTS, ACTIONS.EDIT),
  validateUpdatePrice,
  validate,
  auditLog('UPDATE_PRODUCT_PRICE'),
  asyncHandler(productController.updatePrice)
);

/**
 * POST /api/v1/products/:id/image
 * Subir imagen del producto (multipart/form-data, campo: image)
 */
router.post(
  '/:id/image',
  requirePermission(MODULES.PRODUCTS, ACTIONS.EDIT),
  uploadProductImage.single('image'),
  auditLog('UPLOAD_PRODUCT_IMAGE'),
  asyncHandler(productController.uploadImage)
);

/**
 * PATCH /api/v1/products/:id/status
 * Activar o desactivar producto
 */
router.patch(
  '/:id/status',
  requirePermission(MODULES.PRODUCTS, ACTIONS.EDIT),
  auditLog('TOGGLE_PRODUCT_STATUS'),
  asyncHandler(productController.toggleStatus)
);

/**
 * DELETE /api/v1/products/:id
 * Eliminar producto (soft delete)
 */
router.delete(
  '/:id',
  requirePermission(MODULES.PRODUCTS, ACTIONS.DELETE),
  auditLog('DELETE_PRODUCT'),
  asyncHandler(productController.deleteProduct)
);

module.exports = router;
