'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.User, { foreignKey: 'patientId',  as: 'patient' });
      Appointment.belongsTo(models.User, { foreignKey: 'providerId', as: 'provider' });
    }
  }

  Appointment.init({
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:   { type: DataTypes.UUID, allowNull: false },
    providerId:  { type: DataTypes.UUID, allowNull: false },
    scheduledAt: { type: DataTypes.DATE, allowNull: false },
    duration:    { type: DataTypes.INTEGER, defaultValue: 30 },   // minutes
    type: {
      type: DataTypes.ENUM('prenatal_checkup', 'ultrasound', 'blood_test', 'consultation', 'emergency', 'postpartum', 'virtual'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
      defaultValue: 'scheduled',
    },
    location:    { type: DataTypes.STRING(300) },
    isVirtual:   { type: DataTypes.BOOLEAN, defaultValue: false },
    meetingLink: { type: DataTypes.STRING },
    reason:      { type: DataTypes.TEXT },
    notes:       { type: DataTypes.TEXT },
    diagnosis:   { type: DataTypes.TEXT },
    prescription:{ type: DataTypes.JSONB, defaultValue: [] },
    followUpDate:{ type: DataTypes.DATEONLY },
    cancelledBy: { type: DataTypes.UUID },
    cancelReason:{ type: DataTypes.TEXT },
    reminderSent:{ type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
  });

  return Appointment;
};
