const crypto = require('crypto');
const { Op } = require('sequelize');
const db = require('../../../database');
const logger = require('../../../utils/logger');
const {
  CHANNELS,
  PRIORITIES,
  NOTIFICATION_STATUSES,
  CONTACT_METHODS,
  SUBSCRIPTION_ACTIONS,
  NOTIFICATION_TYPES
} = require('../../../shared/constants/notifications.constants');

const {
  NotificationTemplate,
  Notification,
  NotificationRule,
  NotificationSubscription
} = db;

const ERROR = {
  TEMPLATE_NOT_FOUND: 'Plantilla no encontrada',
  NOTIFICATION_NOT_FOUND: 'Notificacion no encontrada',
  RULE_NOT_FOUND: 'Regla no encontrada',
  INVALID_CHANNEL: 'Canal no valido',
  INVALID_RECIPIENT: 'Destinatario no valido',
  INVALID_MESSAGE: 'Debe enviar una plantilla o un mensaje personalizado valido',
  INVALID_SCHEDULE: 'La fecha programada debe ser futura',
  INVALID_SUBSCRIPTION: 'Suscripcion no valida'
};

const normalizeEnum = (value, fallback = null) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim().toUpperCase();
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const buildTrackingId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(6).toString('hex');
  return `NTF-${timestamp}-${randomPart}`.toUpperCase();
};

const getNestedValue = (source, path) => {
  if (!path) {
    return undefined;
  }

  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    return current[key];
  }, source);
};

const renderText = (templateText, variables = {}) => {
  if (!templateText) {
    return templateText;
  }

  return String(templateText).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    const value = getNestedValue(variables, key);
    return value === undefined || value === null ? '' : String(value);
  });
};

const normalizeRecipient = (recipient) => {
  if (typeof recipient === 'string') {
    if (recipient.includes('@')) {
      return {
        email: recipient,
        phone: null,
        name: null
      };
    }

    return {
      email: null,
      phone: recipient,
      name: null
    };
  }

  if (!isPlainObject(recipient)) {
    throw new Error(ERROR.INVALID_RECIPIENT);
  }

  const email = recipient.email || recipient.recipientEmail || null;
  const phone = recipient.phone || recipient.recipientPhone || null;

  if (!email && !phone) {
    throw new Error(ERROR.INVALID_RECIPIENT);
  }

  return {
    email,
    phone,
    name: recipient.name || recipient.recipientName || null
  };
};

const resolveTemplateMessage = async (payload) => {
  const variables = payload.variables && isPlainObject(payload.variables) ? payload.variables : {};

  if (payload.templateId) {
    const template = await NotificationTemplate.findByPk(payload.templateId);

    if (!template) {
      throw new Error(ERROR.TEMPLATE_NOT_FOUND);
    }

    const subject = renderText(template.subject, variables);
    const body = renderText(template.body, variables);
    const channel = normalizeEnum(payload.channel, template.channel);

    return {
      template,
      channel,
      subject,
      body,
      variables: {
        ...(isPlainObject(template.variables) ? template.variables : {}),
        ...variables
      }
    };
  }

  const subject = payload.message?.subject || payload.subject;
  const body = payload.message?.body || payload.body;
  const channel = normalizeEnum(payload.channel, CHANNELS.EMAIL);

  if (!subject || !body) {
    throw new Error(ERROR.INVALID_MESSAGE);
  }

  return {
    template: null,
    channel,
    subject,
    body,
    variables
  };
};

class NotificationService {
  async createTemplate(data, userId = null) {
    const channel = normalizeEnum(data.channel || data.type);

    if (!Object.values(CHANNELS).includes(channel)) {
      throw new Error(ERROR.INVALID_CHANNEL);
    }

    const template = await NotificationTemplate.create({
      name: data.name.trim(),
      type: normalizeEnum(data.type, channel),
      subject: data.subject.trim(),
      body: data.body.trim(),
      channel,
      variables: Array.isArray(data.variables) || isPlainObject(data.variables) ? data.variables : [],
      description: data.description || null,
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdBy: userId
    });

    return template;
  }

  async listTemplates(filters = {}) {
    const where = {};

    if (filters.type) {
      where.type = normalizeEnum(filters.type);
    }

    return await NotificationTemplate.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });
  }

  async sendNotification(payload, userId = null) {
    const recipient = normalizeRecipient(payload.recipient || payload);
    const message = await resolveTemplateMessage(payload);
    const priority = normalizeEnum(payload.priority, PRIORITIES.NORMAL);

    if (!Object.values(CHANNELS).includes(message.channel)) {
      throw new Error(ERROR.INVALID_CHANNEL);
    }

    const trackingId = buildTrackingId();
    const sentAt = new Date();
    const deliveredAt = message.channel === CHANNELS.PUSH ? null : sentAt;
    const status = message.channel === CHANNELS.PUSH ? NOTIFICATION_STATUSES.SENT : NOTIFICATION_STATUSES.DELIVERED;

    const notification = await Notification.create({
      trackingId,
      templateId: message.template ? message.template.id : null,
      ruleId: payload.ruleId || null,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      recipientPhone: recipient.phone,
      channel: message.channel,
      priority: Object.values(PRIORITIES).includes(priority) ? priority : PRIORITIES.NORMAL,
      subject: renderText(message.subject, message.variables),
      body: renderText(message.body, message.variables),
      variables: message.variables,
      status,
      sentAt,
      deliveredAt,
      readAt: payload.readAt || null,
      metadata: payload.metadata || {},
      createdBy: userId
    });

    logger.info('Notification sent', {
      trackingId,
      notificationId: notification.id,
      channel: message.channel
    });

    return notification;
  }

  async sendBulkNotification(payload, userId = null) {
    const recipients = Array.isArray(payload.recipients) ? payload.recipients : [];

    if (recipients.length === 0) {
      throw new Error(ERROR.INVALID_RECIPIENT);
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const recipientItem of recipients) {
      try {
        const notification = await this.sendNotification({
          ...payload,
          recipient: recipientItem
        }, userId);

        successful += 1;
        results.push({
          recipient: recipientItem,
          notificationId: notification.id,
          trackingId: notification.trackingId,
          status: notification.status
        });
      } catch (error) {
        failed += 1;
        results.push({
          recipient: recipientItem,
          error: error.message
        });
      }
    }

    return {
      total: recipients.length,
      successful,
      failed,
      results
    };
  }

  async scheduleNotification(payload, userId = null) {
    const scheduledAt = new Date(payload.scheduledAt);

    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      throw new Error(ERROR.INVALID_SCHEDULE);
    }

    const recipient = normalizeRecipient(payload.recipient || payload);
    const message = await resolveTemplateMessage(payload);

    const notification = await Notification.create({
      trackingId: buildTrackingId(),
      templateId: message.template ? message.template.id : null,
      ruleId: payload.ruleId || null,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      recipientPhone: recipient.phone,
      channel: message.channel,
      priority: normalizeEnum(payload.priority, PRIORITIES.NORMAL),
      subject: renderText(message.subject, message.variables),
      body: renderText(message.body, message.variables),
      variables: message.variables,
      status: NOTIFICATION_STATUSES.SCHEDULED,
      scheduledAt,
      metadata: payload.metadata || {},
      createdBy: userId
    });

    return notification;
  }

  async listNotifications(filters = {}) {
    const where = {};

    if (filters.recipient) {
      where[Op.or] = [
        { recipientName: { [Op.iLike]: `%${filters.recipient}%` } },
        { recipientEmail: { [Op.iLike]: `%${filters.recipient}%` } },
        { recipientPhone: { [Op.iLike]: `%${filters.recipient}%` } }
      ];
    }

    if (filters.status) {
      where.status = normalizeEnum(filters.status, filters.status);
    }

    if (filters.channel) {
      where.channel = normalizeEnum(filters.channel);
    }

    if (filters.from || filters.to) {
      where.createdAt = {};

      if (filters.from) {
        where.createdAt[Op.gte] = new Date(filters.from);
      }

      if (filters.to) {
        where.createdAt[Op.lte] = new Date(filters.to);
      }
    }

    return await Notification.findAll({
      where,
      include: [
        { model: NotificationTemplate, as: 'template', required: false },
        { model: NotificationRule, as: 'rule', required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async getNotificationStatus(notificationId) {
    const notification = await Notification.findByPk(notificationId, {
      include: [
        { model: NotificationTemplate, as: 'template', required: false },
        { model: NotificationRule, as: 'rule', required: false }
      ]
    });

    if (!notification) {
      throw new Error(ERROR.NOTIFICATION_NOT_FOUND);
    }

    return notification;
  }

  async createRule(data, userId = null) {
    const template = data.templateId ? await NotificationTemplate.findByPk(data.templateId) : null;

    if (data.templateId && !template) {
      throw new Error(ERROR.TEMPLATE_NOT_FOUND);
    }

    const rule = await NotificationRule.create({
      name: data.name.trim(),
      triggerEvent: data.triggerEvent.trim(),
      conditions: isPlainObject(data.conditions) ? data.conditions : {},
      templateId: template ? template.id : null,
      channel: normalizeEnum(data.channel),
      recipients: Array.isArray(data.recipients) ? data.recipients : [],
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      description: data.description || null,
      metadata: data.metadata || {},
      createdBy: userId
    });

    return rule;
  }

  async listRules(filters = {}) {
    const where = {};

    if (filters.active !== undefined) {
      where.isActive = filters.active === true || filters.active === 'true';
    }

    return await NotificationRule.findAll({
      where,
      include: [
        { model: NotificationTemplate, as: 'template', required: false }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  async manageSubscription(data) {
    const action = normalizeEnum(data.action);
    const contactMethod = normalizeEnum(data.contactMethod);
    const notificationType = normalizeEnum(data.notificationType, data.notificationType);

    if (!Object.values(CONTACT_METHODS).includes(contactMethod)) {
      throw new Error(ERROR.INVALID_SUBSCRIPTION);
    }

    if (!Object.values(SUBSCRIPTION_ACTIONS).includes(action)) {
      throw new Error(ERROR.INVALID_SUBSCRIPTION);
    }

    const subscribed = action === SUBSCRIPTION_ACTIONS.SUBSCRIBE;

    const [subscription, created] = await NotificationSubscription.findOrCreate({
      where: {
        contactValue: data.contactValue.trim(),
        contactMethod,
        notificationType: Object.values(NOTIFICATION_TYPES).includes(notificationType) ? notificationType : NOTIFICATION_TYPES.CUSTOM
      },
      defaults: {
        contactValue: data.contactValue.trim(),
        contactMethod,
        notificationType: Object.values(NOTIFICATION_TYPES).includes(notificationType) ? notificationType : NOTIFICATION_TYPES.CUSTOM,
        isSubscribed: subscribed,
        subscribedAt: subscribed ? new Date() : null,
        unsubscribedAt: subscribed ? null : new Date(),
        metadata: data.metadata || {}
      }
    });

    if (!created) {
      await subscription.update({
        isSubscribed: subscribed,
        subscribedAt: subscribed ? new Date() : subscription.subscribedAt,
        unsubscribedAt: subscribed ? null : new Date(),
        metadata: data.metadata || subscription.metadata || {}
      });
    }

    return subscription;
  }

  async getStats(filters = {}) {
    const where = {};

    if (filters.from || filters.to) {
      where.createdAt = {};

      if (filters.from) {
        where.createdAt[Op.gte] = new Date(filters.from);
      }

      if (filters.to) {
        where.createdAt[Op.lte] = new Date(filters.to);
      }
    }

    const grouped = await Notification.findAll({
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'total']],
      where,
      group: ['status'],
      raw: true
    });

    const totalsByStatus = grouped.reduce((acc, row) => {
      acc[row.status] = Number(row.total);
      return acc;
    }, {});

    const totalSent = Object.values(totalsByStatus).reduce((sum, value) => sum + value, 0);
    const delivered = (totalsByStatus[NOTIFICATION_STATUSES.DELIVERED] || 0) + (totalsByStatus[NOTIFICATION_STATUSES.READ] || 0);
    const read = totalsByStatus[NOTIFICATION_STATUSES.READ] || 0;
    const failed = totalsByStatus[NOTIFICATION_STATUSES.FAILED] || 0;

    return {
      totalSent,
      delivered,
      read,
      failed,
      scheduled: totalsByStatus[NOTIFICATION_STATUSES.SCHEDULED] || 0,
      openRate: delivered > 0 ? Number(((read / delivered) * 100).toFixed(2)) : 0,
      byStatus: totalsByStatus
    };
  }
}

const notificationService = new NotificationService();

notificationService.ERROR = ERROR;

module.exports = notificationService;