const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * 1. VALIDAR: ABRIR CAJA
 */
const validateOpenCash = [
  body('casierId')
    .isInt({ min: 1 })
    .withMessage('ID del cajero inválido'),
  body('cashBoxNumber')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Número de caja es requerido'),
  body('baseAmount')
    .optional()
    .isDecimal()
    .withMessage('Monto de base debe ser decimal')
];

/**
 * 2. VALIDAR: REGISTRAR VENTA EN CAJA
 */
const validateAddSaleToSession = [
  body('saleId')
    .isInt({ min: 1 })
    .withMessage('ID de venta inválido'),
  body('amount')
    .isDecimal()
    .withMessage('Monto debe ser decimal')
    .custom(v => parseFloat(v) > 0)
    .withMessage('Monto debe ser mayor a 0'),
  body('paymentMethod')
    .isIn(['CASH', 'CARD', 'TRANSFER', 'CREDIT'])
    .withMessage('Método de pago inválido'),
  body('reference')
    .optional()
    .isString()
    .trim()
];

/**
 * 3. VALIDAR: REGISTRAR INGRESO
 */
const validateAddIncome = [
  body('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido'),
  body('amount')
    .isDecimal()
    .withMessage('Monto debe ser decimal')
    .custom(v => parseFloat(v) > 0)
    .withMessage('Monto debe ser mayor a 0'),
  body('concept')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Concepto es requerido'),
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'CARD', 'TRANSFER', 'CREDIT']),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('reference')
    .optional()
    .isString()
    .trim()
];

/**
 * 4. VALIDAR: REGISTRAR EGRESO
 */
const validateAddExpense = [
  body('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido'),
  body('amount')
    .isDecimal()
    .withMessage('Monto debe ser decimal')
    .custom(v => parseFloat(v) > 0)
    .withMessage('Monto debe ser mayor a 0'),
  body('concept')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Concepto es requerido'),
  body('authorizedBy')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de autorizador inválido'),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('reference')
    .optional()
    .isString()
    .trim()
];

/**
 * 5. VALIDAR: RETIRO DE EFECTIVO
 */
const validateWithdrawCash = [
  body('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido'),
  body('amount')
    .isDecimal()
    .withMessage('Monto debe ser decimal')
    .custom(v => parseFloat(v) > 0)
    .withMessage('Monto debe ser mayor a 0'),
  body('receivedBy')
    .isInt({ min: 1 })
    .withMessage('ID de receptor inválido'),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('reference')
    .optional()
    .isString()
    .trim()
];

/**
 * 6. VALIDAR: OBTENER ESTADO DE CAJA
 */
const validateGetCashStatus = [
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido')
];

/**
 * 7. VALIDAR: CALCULAR ARQUEO
 */
const validateCalculateExamination = [
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido')
];

/**
 * 8. VALIDAR: CERRAR CAJA
 */
const validateCloseCash = [
  body('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido'),
  body('countData')
    .isObject()
    .withMessage('Conteo debe ser un objeto'),
  body('countedBy')
    .isInt({ min: 1 })
    .withMessage('ID de contador inválido'),
  body('verifiedBy')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de verificador inválido'),
  body('observations')
    .optional()
    .isString()
    .trim()
];

/**
 * 9. VALIDAR: LISTAR SESIONES DE CAJA
 */
const validateListCashSessions = [
  query('casierId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de cajero inválido'),
  query('cashBoxNumber')
    .optional()
    .isString(),
  query('status')
    .optional()
    .isIn(['OPEN', 'COUNTED', 'CLOSED'])
    .withMessage('Estado inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha inicio inválida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha fin inválida'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Límite debe estar entre 1 y 500'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset debe ser >= 0')
];

/**
 * 10. VALIDAR: OBTENER DETALLE DE SESIÓN
 */
const validateGetCashSessionDetail = [
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido')
];

/**
 * 11. VALIDAR: GENERAR REPORTE
 */
const validateGenerateReport = [
  param('sessionId')
    .isInt({ min: 1 })
    .withMessage('ID de sesión inválido')
];

module.exports = {
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
};
