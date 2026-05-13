const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const { CHANNELS, PRIORITIES, NOTIFICATION_STATUSES } = require('../../../shared/constants/notifications.constants');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    trackingId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      field: 'tracking_id'
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'template_id'
    },
    ruleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'rule_id'
    },
    recipientName: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: 'recipient_name'
    },
    recipientEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'recipient_email'
    },
    recipientPhone: {
      type: DataTypes.STRING(40),
      allowNull: true,
      field: 'recipient_phone'
    },
    channel: {
      type: DataTypes.ENUM(...Object.values(CHANNELS)),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(PRIORITIES)),
      allowNull: false,
      defaultValue: PRIORITIES.NORMAL
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    variables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM(...Object.values(NOTIFICATION_STATUSES)),
      allowNull: false,
      defaultValue: NOTIFICATION_STATUSES.SENT
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'scheduled_at'
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'sent_at'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivered_at'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    }
  }, {
    tableName: 'notifications',
    schema: DB_SCHEMAS.NOTIFICATIONS,
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['tracking_id'], name: 'notifications_tracking_id_unique' },
      { fields: ['status'], name: 'notifications_status_idx' },
      { fields: ['channel'], name: 'notifications_channel_idx' },
      { fields: ['recipient_email'], name: 'notifications_recipient_email_idx' },
      { fields: ['recipient_phone'], name: 'notifications_recipient_phone_idx' },
      { fields: ['scheduled_at'], name: 'notifications_scheduled_at_idx' }
    ]
  });

  return Notification;
};