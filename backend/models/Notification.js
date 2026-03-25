'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'recipient' });
    }
  }

  Notification.init({
    id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    type: {
      type: DataTypes.ENUM('appointment_reminder', 'appointment_confirmed', 'appointment_cancelled',
        'risk_alert', 'vital_alert', 'message', 'education_content', 'system', 'lab_result'),
      allowNull: false,
    },
    title:     { type: DataTypes.STRING(200), allowNull: false },
    message:   { type: DataTypes.TEXT, allowNull: false },
    data:      { type: DataTypes.JSONB, defaultValue: {} },     // reference IDs etc.
    isRead:    { type: DataTypes.BOOLEAN, defaultValue: false },
    readAt:    { type: DataTypes.DATE },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
    },
    channel: {
      type: DataTypes.ARRAY(DataTypes.ENUM('in_app', 'email', 'sms')),
      defaultValue: ['in_app'],
    },
    expiresAt: { type: DataTypes.DATE },
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
  });

  return Notification;
};
