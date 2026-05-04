const { DataTypes } = require('sequelize');
const { DB_SCHEMAS } = require('../../../shared/constants/schemas');

const SCHEMA = DB_SCHEMAS.CREDITS;

module.exports = (sequelize) => {
  const CreditReminder = sequelize.define('CreditReminder', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    creditId: { type: DataTypes.INTEGER, allowNull: false, field: 'credit_id' },
    daysBeforeDue: { type: DataTypes.INTEGER, allowNull: false, field: 'days_before_due' },
    scheduledFor: { type: DataTypes.DATE, allowNull: false, field: 'scheduled_for' },
    status: {
      type: DataTypes.ENUM('PENDING', 'SENT', 'CANCELED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    channel: {
      type: DataTypes.ENUM('WHATSAPP', 'EMAIL', 'SMS', 'SYSTEM'),
      allowNull: false,
      defaultValue: 'SYSTEM'
    },
    metadata: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: 'credit_reminders',
    schema: SCHEMA,
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['credit_id'], name: 'credit_reminders_credit_id_idx' },
      { fields: ['status', 'scheduled_for'], name: 'credit_reminders_status_schedule_idx' }
    ]
  });

  return CreditReminder;
};
