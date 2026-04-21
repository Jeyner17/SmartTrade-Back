const express = require('express');
const router = express.Router();

const CashRegisterController = require('../controllers/cash-register.controller');
const {
  validate,
  validateOpenCash,
  validateAddSaleToSession,
  validateAddIncome,
  validateAddExpense,
  validateWithdrawCash,
  validateGetCashStatus,
  validateCalculateExamination,
  validateCloseCash,
  validateListCashSessions,
  validateGetCashSessionDetail,
  validateGenerateReport
} = require('../validators/cash-register.validator');

const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { auditLog } = require('../../../middlewares/audit.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

// Instanciar controller directamente
const controller = new CashRegisterController();

router.use(authMiddleware);

/**
 * 1. ABRIR CAJA
 * POST /api/v1/cash/sessions/open
 */
router.post(
  '/sessions/open',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.CREATE),
  validateOpenCash,
  validate,
  auditLog('CASH_OPEN_SESSION'),
  asyncHandler((req, res) => controller.openCash(req, res))
);

/**
 * 2. REGISTRAR VENTA EN CAJA
 * POST /api/v1/cash/sales
 */
router.post(
  '/sales',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.CREATE),
  validateAddSaleToSession,
  validate,
  asyncHandler((req, res) => controller.addSaleToSession(req, res))
);

/**
 * 3. REGISTRAR INGRESO
 * POST /api/v1/cash/movements/income
 */
router.post(
  '/movements/income',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.CREATE),
  validateAddIncome,
  validate,
  auditLog('CASH_ADD_INCOME'),
  asyncHandler((req, res) => controller.addIncome(req, res))
);

/**
 * 4. REGISTRAR EGRESO
 * POST /api/v1/cash/movements/expense
 */
router.post(
  '/movements/expense',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.EDIT),
  validateAddExpense,
  validate,
  auditLog('CASH_ADD_EXPENSE'),
  asyncHandler((req, res) => controller.addExpense(req, res))
);

/**
 * 5. RETIRO DE EFECTIVO
 * POST /api/v1/cash/movements/withdrawal
 */
router.post(
  '/movements/withdrawal',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.EDIT),
  validateWithdrawCash,
  validate,
  auditLog('CASH_WITHDRAW'),
  asyncHandler((req, res) => controller.withdrawCash(req, res))
);

/**
 * 6. OBTENER ESTADO DE CAJA
 * GET /api/v1/cash/sessions/:sessionId/status
 */
router.get(
  '/sessions/:sessionId/status',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.VIEW),
  validateGetCashStatus,
  validate,
  asyncHandler((req, res) => controller.getCashStatus(req, res))
);

/**
 * 7. CALCULAR ARQUEO
 * GET /api/v1/cash/sessions/:sessionId/examination
 */
router.get(
  '/sessions/:sessionId/examination',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.VIEW),
  validateCalculateExamination,
  validate,
  asyncHandler((req, res) => controller.calculateExamination(req, res))
);

/**
 * 8. CERRAR CAJA
 * POST /api/v1/cash/sessions/close
 */
router.post(
  '/sessions/close',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.EDIT),
  validateCloseCash,
  validate,
  auditLog('CASH_CLOSE_SESSION'),
  asyncHandler((req, res) => controller.closeCash(req, res))
);

/**
 * 9. LISTAR SESIONES
 * GET /api/v1/cash/sessions
 */
router.get(
  '/sessions',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.VIEW),
  validateListCashSessions,
  validate,
  asyncHandler((req, res) => controller.listCashSessions(req, res))
);

/**
 * 10. OBTENER DETALLE DE SESIÓN
 * GET /api/v1/cash/sessions/:sessionId
 */
router.get(
  '/sessions/:sessionId',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.VIEW),
  validateGetCashSessionDetail,
  validate,
  asyncHandler((req, res) => controller.getCashSessionDetail(req, res))
);

/**
 * 11. GENERAR REPORTE PDF
 * GET /api/v1/cash/sessions/:sessionId/report
 */
router.get(
  '/sessions/:sessionId/report',
  requirePermission(MODULES.CASH_REGISTER, ACTIONS.VIEW),
  validateGenerateReport,
  validate,
  asyncHandler((req, res) => controller.generateReport(req, res))
);

module.exports = router;
