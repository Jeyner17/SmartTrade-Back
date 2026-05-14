const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: 'Errores de validacion',
			errors: errors.array().map(err => ({
				field: err.param,
				message: err.msg
			}))
		});
	}

	next();
};

const validateCreateCustomer = [
	body('fullName').isString().trim().notEmpty().withMessage('Nombre es requerido'),
	body('documentNumber').isString().trim().notEmpty().withMessage('Documento es requerido'),
	body('address').optional().isString().trim(),
	body('phone').optional().isString().trim(),
	body('email').optional().isEmail().withMessage('Email invalido'),
	body('creditLimit').isDecimal().withMessage('Limite de credito invalido'),
	body('references').optional().isString()
];

const validateCreateCredit = [
	body('saleId').isInt({ min: 1 }).withMessage('ID de venta invalido'),
	body('customerId').isInt({ min: 1 }).withMessage('ID de cliente invalido'),
	body('termDays').isInt({ min: 1 }).withMessage('Plazo en dias invalido'),
	body('interestRate').optional().isDecimal({ min: 0 }).withMessage('Tasa de interes invalida'),
	body('observations').optional().isString().trim()
];

const validateListCustomers = [
	query('term').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('Termino de busqueda invalido'),
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1, max: 100 })
];

const validateListSalesForCredit = [
	query('term').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('Termino de busqueda invalido'),
	query('customerId').optional().isInt({ min: 1 }).withMessage('ID de cliente invalido'),
	query('status').optional().isIn(['completed', 'voided']).withMessage('Estado de venta invalido'),
	query('startDate').optional().isISO8601().withMessage('Fecha inicio invalida'),
	query('endDate').optional().isISO8601().withMessage('Fecha fin invalida'),
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1, max: 100 })
];

const validateListCredits = [
	query('customerId').optional().isInt({ min: 1 }).withMessage('ID de cliente invalido'),
	query('status').optional().isIn(['ACTIVE', 'PAID', 'OVERDUE', 'FORGIVEN', 'REFINANCED']),
	query('vencidos').optional().isIn(['true', 'false']),
	query('porVencerDias').optional().isInt({ min: 1 }),
	query('page').optional().isInt({ min: 1 }),
	query('limit').optional().isInt({ min: 1, max: 100 })
];

const validateCreditId = [
	param('id').isInt({ min: 1 }).withMessage('ID de credito invalido')
];

const validateRegisterPayment = [
	param('id').isInt({ min: 1 }).withMessage('ID de credito invalido'),
	body('amountPaid').isDecimal().withMessage('Monto pagado invalido'),
	body('paymentMethod').isIn(['efectivo', 'tarjeta', 'transferencia']).withMessage('Metodo de pago invalido'),
	body('paymentDate').optional().isISO8601().withMessage('Fecha de pago invalida'),
	body('notes').optional().isString()
];

const validateCustomerId = [
	param('customerId').isInt({ min: 1 }).withMessage('ID de cliente invalido')
];

const validateCreateReminder = [
	param('id').isInt({ min: 1 }).withMessage('ID de credito invalido'),
	body('daysBeforeDue').isInt({ min: 1 }).withMessage('Dias antes de vencimiento invalidos'),
	body('channel').optional().isIn(['WHATSAPP', 'EMAIL', 'SMS', 'SYSTEM'])
];

const validateListDelinquent = [
	query('minLateDays').optional().isInt({ min: 1 }).withMessage('Dias de atraso minimos invalidos')
];

const validateForgiveDebt = [
	param('id').isInt({ min: 1 }).withMessage('ID de credito invalido'),
	body('amountForgiven').isDecimal().withMessage('Monto a condonar invalido'),
	body('reason').isString().trim().notEmpty().withMessage('Motivo requerido'),
	body('authorizedBy').optional().isInt({ min: 1 })
];

const validateRefinanceCredit = [
	param('id').isInt({ min: 1 }).withMessage('ID de credito invalido'),
	body('termDays').isInt({ min: 1 }).withMessage('Nuevo plazo invalido'),
	body('interestRate').optional().isDecimal({ min: 0 }).withMessage('Nueva tasa invalida'),
	body('moraRateDaily').optional().isDecimal({ min: 0 }).withMessage('Tasa diaria de mora invalida'),
	body('reason').optional().isString().trim(),
	body('authorizedBy').optional().isInt({ min: 1 }),
	body('observations').optional().isString().trim()
];

const validateCreditHistory = [
	param('customerId').isInt({ min: 1 }).withMessage('ID de cliente invalido'),
	query('includePaid').optional().isIn(['true', 'false'])
];

module.exports = {
	validate,
	validateCreateCustomer,
	validateCreateCredit,
	validateListCustomers,
	validateListSalesForCredit,
	validateListCredits,
	validateCreditId,
	validateRegisterPayment,
	validateCustomerId,
	validateCreateReminder,
	validateListDelinquent,
	validateForgiveDebt,
	validateRefinanceCredit,
	validateCreditHistory
};
