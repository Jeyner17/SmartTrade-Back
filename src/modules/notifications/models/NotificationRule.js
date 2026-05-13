const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const { CHANNELS } = require('../../../shared/constants/notifications.constants');

module.exports = (sequelize) => {
  const NotificationRule = sequelize.define('NotificationRule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(140),
      allowNull: false
    },
    triggerEvent: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: 'trigger_event'
    },
    conditions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'template_id'
    },
    channel: {
      type: DataTypes.ENUM(...Object.values(CHANNELS)),
      allowNull: false
    },
    recipients: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    },
    lastTriggeredAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_triggered_at'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'notification_rules',
    schema: DB_SCHEMAS.NOTIFICATIONS,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['trigger_event'], name: 'notification_rules_trigger_event_idx' },
      { fields: ['is_active'], name: 'notification_rules_is_active_idx' },
      { fields: ['template_id'], name: 'notification_rules_template_id_idx' }
    ]
  });

  return NotificationRule;
};