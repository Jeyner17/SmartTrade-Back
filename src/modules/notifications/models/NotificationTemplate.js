const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const { CHANNELS } = require('../../../shared/constants/notifications.constants');

module.exports = (sequelize) => {
  const NotificationTemplate = sequelize.define('NotificationTemplate', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM(...Object.values(CHANNELS)),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    channel: {
      type: DataTypes.ENUM(...Object.values(CHANNELS)),
      allowNull: false
    },
    variables: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'notification_templates',
    schema: DB_SCHEMAS.NOTIFICATIONS,
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['name'], name: 'notification_templates_name_unique' },
      { fields: ['type'], name: 'notification_templates_type_idx' },
      { fields: ['is_active'], name: 'notification_templates_is_active_idx' }
    ]
  });

  return NotificationTemplate;
};