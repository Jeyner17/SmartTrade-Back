const express = require('express');
const router = express.Router();

const saleController = require('../controllers/sale.controller');
const {
	validate,
	validateCreateSale,
	validateAddCartItem,
	validateRemoveCartItem,
	validateUpdateCartItemQuantity,
	validateApplyDiscount,
	validateCalculateTotal,
	validateProcessPayment,
	validateSearchCustomer,
	validateQuickCreateCustomer,
	validateListTodaySales,
	validateGetSaleById,
	validateVoidSale,
	validatePopularProducts
} = require('../validators/sale.validator');

const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

router.use(authMiddleware);

// 8. Buscar cliente
router.get(
	'/customers/search',
	requirePermission(MODULES.POS, ACTIONS.VIEW),
	validateSearchCustomer,
	validate,
	asyncHandler(saleController.searchCustomer)
);

// 9. Crear cliente rápido
router.post(
	'/customers/quick',
	requirePermission(MODULES.POS, ACTIONS.CREATE),
	validateQuickCreateCustomer,
	validate,
	auditLog('POS_QUICK_CREATE_CUSTOMER'),
	asyncHandler(saleController.quickCreateCustomer)
);

// 13. Productos más vendidos
router.get(
	'/products/popular',
	requirePermission(MODULES.SALES, ACTIONS.VIEW),
	validatePopularProducts,
	validate,
	asyncHandler(saleController.getPopularProducts)
);

// 10. Ventas del día
router.get(
	'/sales/today',
	requirePermission(MODULES.SALES, ACTIONS.VIEW),
	validateListTodaySales,
	validate,
	asyncHandler(saleController.listTodaySales)
);

// 1. Crear nueva venta directa
router.post(
	'/sales',
	requirePermission(MODULES.POS, ACTIONS.CREATE),
	validateCreateSale,
	validate,
	auditLog('POS_CREATE_SALE'),
	asyncHandler(saleController.createSale)
);

// 2. Agregar producto a carrito
router.post(
	'/cart/items',
	requirePermission(MODULES.POS, ACTIONS.CREATE),
	validateAddCartItem,
	validate,
	asyncHandler(saleController.addProductToCart)
);

// 3. Eliminar producto del carrito
router.delete(
	'/cart/:sessionId/items/:productId',
	requirePermission(MODULES.POS, ACTIONS.EDIT),
	validateRemoveCartItem,
	validate,
	asyncHandler(saleController.removeProductFromCart)
);

// 4. Modificar cantidad en carrito
router.put(
	'/cart/:sessionId/items/:productId',
	requirePermission(MODULES.POS, ACTIONS.EDIT),
	validateUpdateCartItemQuantity,
	validate,
	asyncHandler(saleController.updateCartQuantity)
);

// 5. Aplicar descuento
router.post(
	'/cart/:sessionId/discount',
	requirePermission(MODULES.POS, ACTIONS.EDIT),
	validateApplyDiscount,
	validate,
	asyncHandler(saleController.applyDiscount)
);

// 6. Calcular total
router.get(
	'/cart/:sessionId/total',
	requirePermission(MODULES.POS, ACTIONS.VIEW),
	validateCalculateTotal,
	validate,
	asyncHandler(saleController.calculateTotal)
);

// 7. Procesar pago
router.post(
	'/cart/:sessionId/payment',
	requirePermission(MODULES.POS, ACTIONS.CREATE),
	validateProcessPayment,
	validate,
	auditLog('POS_PROCESS_PAYMENT'),
	asyncHandler(saleController.processPayment)
);

// 11. Obtener detalle de venta
router.get(
	'/sales/:id',
	requirePermission(MODULES.SALES, ACTIONS.VIEW),
	validateGetSaleById,
	validate,
	asyncHandler(saleController.getSaleById)
);

// 12. Anular venta
router.post(
	'/sales/:id/void',
	requirePermission(MODULES.SALES, ACTIONS.EDIT),
	validateVoidSale,
	validate,
	auditLog('POS_VOID_SALE'),
	asyncHandler(saleController.voidSale)
);

module.exports = router;
