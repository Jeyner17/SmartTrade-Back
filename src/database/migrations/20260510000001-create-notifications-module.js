'use strict';

const { CHANNELS, PRIORITIES, NOTIFICATION_STATUSES, CONTACT_METHODS, NOTIFICATION_TYPES } = require('../../shared/constants/notifications.constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE SCHEMA IF NOT EXISTS notifications;');

    await queryInterface.createTable('notification_templates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.ENUM(...Object.values(CHANNELS)),
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      channel: {
        type: Sequelize.ENUM(...Object.values(CHANNELS)),
        allowNull: false
      },
      variables: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'notifications'
    });

    await queryInterface.createTable('notification_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(140),
        allowNull: false
      },
      trigger_event: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      conditions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      channel: {
        type: Sequelize.ENUM(...Object.values(CHANNELS)),
        allowNull: false
      },
      recipients: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: []
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_triggered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'notifications'
    });

    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tracking_id: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true
      },
      template_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rule_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      recipient_name: {
        type: Sequelize.STRING(160),
        allowNull: true
      },
      recipient_email: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      recipient_phone: {
        type: Sequelize.STRING(40),
        allowNull: true
      },
      channel: {
        type: Sequelize.ENUM(...Object.values(CHANNELS)),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM(...Object.values(PRIORITIES)),
        allowNull: false,
        defaultValue: PRIORITIES.NORMAL
      },
      subject: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      variables: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM(...Object.values(NOTIFICATION_STATUSES)),
        allowNull: false,
        defaultValue: NOTIFICATION_STATUSES.SENT
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'notifications'
    });

    await queryInterface.createTable('notification_subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      contact_value: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      contact_method: {
        type: Sequelize.ENUM(...Object.values(CONTACT_METHODS)),
        allowNull: false
      },
      notification_type: {
        type: Sequelize.ENUM(...Object.values(NOTIFICATION_TYPES)),
        allowNull: false
      },
      is_subscribed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      subscribed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      unsubscribed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, {
      schema: 'notifications'
    });

    await queryInterface.addIndex({ tableName: 'notification_templates', schema: 'notifications' }, ['name'], {
      unique: true,
      name: 'notification_templates_name_unique'
    });

    await queryInterface.addIndex({ tableName: 'notifications', schema: 'notifications' }, ['tracking_id'], {
      unique: true,
      name: 'notifications_tracking_id_unique'
    });

    await queryInterface.addIndex({ tableName: 'notification_subscriptions', schema: 'notifications' }, ['contact_value', 'contact_method', 'notification_type'], {
      unique: true,
      name: 'notification_subscriptions_contact_unique'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable({ tableName: 'notification_subscriptions', schema: 'notifications' });
    await queryInterface.dropTable({ tableName: 'notifications', schema: 'notifications' });
    await queryInterface.dropTable({ tableName: 'notification_rules', schema: 'notifications' });
    await queryInterface.dropTable({ tableName: 'notification_templates', schema: 'notifications' });
  }
};