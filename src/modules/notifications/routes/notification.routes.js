const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const {
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
} = require('../validators/notification.validator');
const { authMiddleware } = require('../../../middlewares/auth.middleware');
const { requirePermission } = require('../../../middlewares/permission.middleware');
const { asyncHandler } = require('../../../middlewares/error.middleware');
const { MODULES, ACTIONS } = require('../../../shared/constants/auth.constants');

router.use(authMiddleware);

router.post(
  '/templates',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.CREATE),
  validateCreateTemplate,
  validate,
  asyncHandler(notificationController.createTemplate)
);

router.get(
  '/templates',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.VIEW),
  validateListTemplates,
  validate,
  asyncHandler(notificationController.listTemplates)
);

router.post(
  '/send',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.CREATE),
  validateSendNotification,
  validate,
  asyncHandler(notificationController.sendNotification)
);

router.post(
  '/send/bulk',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.CREATE),
  validateBulkNotification,
  validate,
  asyncHandler(notificationController.sendBulkNotification)
);

router.post(
  '/schedule',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.CREATE),
  validateScheduleNotification,
  validate,
  asyncHandler(notificationController.scheduleNotification)
);

router.get(
  '/history',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.VIEW),
  validateHistoryFilters,
  validate,
  asyncHandler(notificationController.listNotifications)
);

router.get(
  '/:id/status',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.VIEW),
  validateNotificationId,
  validate,
  asyncHandler(notificationController.getNotificationStatus)
);

router.post(
  '/rules',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.CREATE),
  validateCreateRule,
  validate,
  asyncHandler(notificationController.createRule)
);

router.get(
  '/rules',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.VIEW),
  validateRuleFilters,
  validate,
  asyncHandler(notificationController.listRules)
);

router.post(
  '/subscriptions',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.EDIT),
  validateManageSubscription,
  validate,
  asyncHandler(notificationController.manageSubscription)
);

router.get(
  '/stats',
  requirePermission(MODULES.NOTIFICATIONS, ACTIONS.VIEW),
  validateStatsFilters,
  validate,
  asyncHandler(notificationController.getStats)
);

module.exports = router;