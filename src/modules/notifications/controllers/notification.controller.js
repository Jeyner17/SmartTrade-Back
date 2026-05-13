const notificationService = require('../services/notification.service');
const ApiResponse = require('../../../utils/response');
const logger = require('../../../utils/logger');

const ERROR = notificationService.ERROR;

class NotificationController {
  async createTemplate(req, res) {
    try {
      const template = await notificationService.createTemplate(req.body, req.user?.id || null);
      return ApiResponse.created(res, template, 'Plantilla creada exitosamente');
    } catch (error) {
      logger.error('Error en createTemplate:', error);

      if (error.message === ERROR.INVALID_CHANNEL) {
        return ApiResponse.validationError(res, [{ message: error.message }], error.message);
      }

      return ApiResponse.error(res, 'Error al crear la plantilla');
    }
  }

  async listTemplates(req, res) {
    try {
      const templates = await notificationService.listTemplates(req.query);
      return ApiResponse.success(res, templates, 'Plantillas obtenidas exitosamente');
    } catch (error) {
      logger.error('Error en listTemplates:', error);
      return ApiResponse.error(res, 'Error al obtener las plantillas');
    }
  }

  async sendNotification(req, res) {
    try {
      const notification = await notificationService.sendNotification(req.body, req.user?.id || null);
      return ApiResponse.created(res, notification, 'Notificacion enviada exitosamente');
    } catch (error) {
      logger.error('Error en sendNotification:', error);

      if ([ERROR.TEMPLATE_NOT_FOUND, ERROR.NOTIFICATION_NOT_FOUND].includes(error.message)) {
        return ApiResponse.notFound(res, error.message);
      }

      if ([ERROR.INVALID_CHANNEL, ERROR.INVALID_RECIPIENT, ERROR.INVALID_MESSAGE].includes(error.message)) {
        return ApiResponse.validationError(res, [{ message: error.message }], error.message);
      }

      return ApiResponse.error(res, 'Error al enviar la notificacion');
    }
  }

  async sendBulkNotification(req, res) {
    try {
      const summary = await notificationService.sendBulkNotification(req.body, req.user?.id || null);
      return ApiResponse.success(res, summary, 'Notificaciones enviadas exitosamente');
    } catch (error) {
      logger.error('Error en sendBulkNotification:', error);

      if (error.message === ERROR.TEMPLATE_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if ([ERROR.INVALID_CHANNEL, ERROR.INVALID_RECIPIENT, ERROR.INVALID_MESSAGE].includes(error.message)) {
        return ApiResponse.validationError(res, [{ message: error.message }], error.message);
      }

      return ApiResponse.error(res, 'Error al enviar notificaciones masivas');
    }
  }

  async scheduleNotification(req, res) {
    try {
      const notification = await notificationService.scheduleNotification(req.body, req.user?.id || null);
      return ApiResponse.created(res, notification, 'Notificacion programada exitosamente');
    } catch (error) {
      logger.error('Error en scheduleNotification:', error);

      if (error.message === ERROR.TEMPLATE_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      if ([ERROR.INVALID_CHANNEL, ERROR.INVALID_RECIPIENT, ERROR.INVALID_MESSAGE, ERROR.INVALID_SCHEDULE].includes(error.message)) {
        return ApiResponse.validationError(res, [{ message: error.message }], error.message);
      }

      return ApiResponse.error(res, 'Error al programar la notificacion');
    }
  }

  async listNotifications(req, res) {
    try {
      const notifications = await notificationService.listNotifications(req.query);
      return ApiResponse.success(res, notifications, 'Historial de notificaciones obtenido exitosamente');
    } catch (error) {
      logger.error('Error en listNotifications:', error);
      return ApiResponse.error(res, 'Error al obtener el historial de notificaciones');
    }
  }

  async getNotificationStatus(req, res) {
    try {
      const notification = await notificationService.getNotificationStatus(req.params.id);
      return ApiResponse.success(res, notification, 'Estado de notificacion obtenido exitosamente');
    } catch (error) {
      logger.error('Error en getNotificationStatus:', error);

      if (error.message === ERROR.NOTIFICATION_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al obtener el estado de la notificacion');
    }
  }

  async createRule(req, res) {
    try {
      const rule = await notificationService.createRule(req.body, req.user?.id || null);
      return ApiResponse.created(res, rule, 'Regla creada exitosamente');
    } catch (error) {
      logger.error('Error en createRule:', error);

      if (error.message === ERROR.TEMPLATE_NOT_FOUND) {
        return ApiResponse.notFound(res, error.message);
      }

      return ApiResponse.error(res, 'Error al crear la regla');
    }
  }

  async listRules(req, res) {
    try {
      const rules = await notificationService.listRules(req.query);
      return ApiResponse.success(res, rules, 'Reglas obtenidas exitosamente');
    } catch (error) {
      logger.error('Error en listRules:', error);
      return ApiResponse.error(res, 'Error al obtener las reglas');
    }
  }

  async manageSubscription(req, res) {
    try {
      const subscription = await notificationService.manageSubscription(req.body);
      return ApiResponse.success(res, subscription, 'Suscripcion actualizada exitosamente');
    } catch (error) {
      logger.error('Error en manageSubscription:', error);
      return ApiResponse.validationError(res, [{ message: error.message }], error.message);
    }
  }

  async getStats(req, res) {
    try {
      const stats = await notificationService.getStats(req.query);
      return ApiResponse.success(res, stats, 'Estadisticas obtenidas exitosamente');
    } catch (error) {
      logger.error('Error en getStats:', error);
      return ApiResponse.error(res, 'Error al obtener las estadisticas');
    }
  }
}

module.exports = new NotificationController();