const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../../../utils/response');
const { CHANNELS, PRIORITIES, CONTACT_METHODS, SUBSCRIPTION_ACTIONS } = require('../../../shared/constants/notifications.constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((error) => ({
      field: error.path || error.param || 'unknown',
      message: error.msg,
      value: error.value
    }));

    return ApiResponse.validationError(res, formatted, 'Error de validacion');
  }

  next();
};

const validateCreateTemplate = [
  body('name').isString().trim().notEmpty().withMessage('El nombre de la plantilla es requerido'),
  body('type').isIn(Object.values(CHANNELS)).withMessage('El tipo de plantilla no es valido'),
  body('subject').isString().trim().notEmpty().withMessage('El asunto es requerido'),
  body('body').isString().trim().notEmpty().withMessage('El cuerpo es requerido'),
  body('channel').isIn(Object.values(CHANNELS)).withMessage('El canal no es valido'),
  body('variables').optional().custom((value) => Array.isArray(value) || typeof value === 'object').withMessage('Las variables deben ser un arreglo u objeto'),
  body('description').optional().isString().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser true o false')
];

const validateListTemplates = [
  query('type').optional().isIn(Object.values(CHANNELS)).withMessage('El filtro type no es valido')
];

const validateSendNotification = [
  body('recipient').optional().custom((value) => value === null || typeof value === 'object' || typeof value === 'string').withMessage('recipient debe ser un objeto o texto'),
  body('recipient.email').optional().isEmail().withMessage('El email del destinatario no es valido'),
  body('recipient.phone').optional().isString().trim().notEmpty().withMessage('El telefono del destinatario es requerido'),
  body('templateId').optional().isInt({ min: 1 }).withMessage('templateId debe ser un entero positivo'),
  body('message.subject').optional().isString().trim().notEmpty().withMessage('El asunto personalizado es requerido'),
  body('message.body').optional().isString().trim().notEmpty().withMessage('El cuerpo personalizado es requerido'),
  body('subject').optional().isString().trim().notEmpty().withMessage('El asunto personalizado es requerido'),
  body('body').optional().isString().trim().notEmpty().withMessage('El cuerpo personalizado es requerido'),
  body('channel').optional().isIn(Object.values(CHANNELS)).withMessage('El canal no es valido'),
  body('priority').optional().isIn(Object.values(PRIORITIES)).withMessage('La prioridad no es valida'),
  body('variables').optional().custom((value) => Array.isArray(value) || typeof value === 'object').withMessage('Las variables deben ser un arreglo u objeto'),
  body().custom((_, { req }) => {
    const hasTemplate = req.body.templateId !== undefined && req.body.templateId !== null;
    const hasMessageObject = req.body.message && req.body.message.subject && req.body.message.body;
    const hasInlineMessage = req.body.subject && req.body.body;

    if (!hasTemplate && !hasMessageObject && !hasInlineMessage) {
      throw new Error('Debe proporcionar templateId o un mensaje personalizado');
    }

    return true;
  })
];

const validateBulkNotification = [
  body('recipients').isArray({ min: 1 }).withMessage('La lista de destinatarios es requerida'),
  body('recipients.*').custom((value) => typeof value === 'object' || typeof value === 'string').withMessage('Cada destinatario debe ser un objeto o texto'),
  body('templateId').isInt({ min: 1 }).withMessage('templateId debe ser un entero positivo'),
  body('channel').optional().isIn(Object.values(CHANNELS)).withMessage('El canal no es valido'),
  body('variables').optional().custom((value) => Array.isArray(value) || typeof value === 'object').withMessage('Las variables deben ser un arreglo u objeto')
];

const validateScheduleNotification = [
  ...validateSendNotification,
  body('scheduledAt').isISO8601().withMessage('scheduledAt debe ser una fecha valida')
];

const validateNotificationId = [
  param('id').isInt({ min: 1 }).withMessage('El ID de la notificacion no es valido')
];

const validateHistoryFilters = [
  query('recipient').optional().isString().trim(),
  query('status').optional().isString().trim(),
  query('channel').optional().isIn(Object.values(CHANNELS)).withMessage('El canal no es valido'),
  query('from').optional().isISO8601().withMessage('from debe ser una fecha valida'),
  query('to').optional().isISO8601().withMessage('to debe ser una fecha valida')
];

const validateCreateRule = [
  body('name').isString().trim().notEmpty().withMessage('El nombre de la regla es requerido'),
  body('triggerEvent').isString().trim().notEmpty().withMessage('El evento disparador es requerido'),
  body('conditions').optional().custom((value) => typeof value === 'object').withMessage('conditions debe ser un objeto'),
  body('templateId').optional().isInt({ min: 1 }).withMessage('templateId debe ser un entero positivo'),
  body('channel').isIn(Object.values(CHANNELS)).withMessage('El canal no es valido'),
  body('recipients').optional().isArray().withMessage('recipients debe ser un arreglo'),
  body('isActive').optional().isBoolean().withMessage('isActive debe ser true o false'),
  body('description').optional().isString().trim()
];

const validateRuleFilters = [
  query('active').optional().isBoolean().withMessage('active debe ser true o false')
];

const validateManageSubscription = [
  body('contactValue').isString().trim().notEmpty().withMessage('contactValue es requerido'),
  body('contactMethod').isIn(Object.values(CONTACT_METHODS)).withMessage('contactMethod no es valido'),
  body('notificationType').isString().trim().notEmpty().withMessage('notificationType es requerido'),
  body('action').isIn(Object.values(SUBSCRIPTION_ACTIONS)).withMessage('action no es valido'),
  body('metadata').optional().custom((value) => typeof value === 'object').withMessage('metadata debe ser un objeto')
];

const validateStatsFilters = [
  query('from').optional().isISO8601().withMessage('from debe ser una fecha valida'),
  query('to').optional().isISO8601().withMessage('to debe ser una fecha valida')
];

module.exports = {
  validate,
  validateCreateTemplate,
  validateListTemplates,
  validateSendNotification,
  validateBulkNotification,
  validateScheduleNotification,
  validateNotificationId,
  validateHistoryFilters,
  validateCreateRule,
  validateRuleFilters,
  validateManageSubscription,
  validateStatsFilters
};