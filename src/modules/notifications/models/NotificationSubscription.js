const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');
const { CONTACT_METHODS, NOTIFICATION_TYPES } = require('../../../shared/constants/notifications.constants');

module.exports = (sequelize) => {
  const NotificationSubscription = sequelize.define('NotificationSubscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contactValue: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'contact_value'
    },
    contactMethod: {
      type: DataTypes.ENUM(...Object.values(CONTACT_METHODS)),
      allowNull: false,
      field: 'contact_method'
    },
    notificationType: {
      type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES)),
      allowNull: false,
      field: 'notification_type'
    },
    isSubscribed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_subscribed'
    },
    subscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscribed_at'
    },
    unsubscribedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'unsubscribed_at'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    }
  }, {
    tableName: 'notification_subscriptions',
    schema: DB_SCHEMAS.NOTIFICATIONS,
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['contact_value', 'contact_method', 'notification_type'],
        name: 'notification_subscriptions_contact_unique'
      },
      { fields: ['contact_value'], name: 'notification_subscriptions_contact_value_idx' },
      { fields: ['is_subscribed'], name: 'notification_subscriptions_is_subscribed_idx' }
    ]
  });

  return NotificationSubscription;
};