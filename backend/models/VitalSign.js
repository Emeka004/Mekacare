'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class VitalSign extends Model {
    static associate(models) {
      VitalSign.belongsTo(models.User, { foreignKey: 'patientId',  as: 'patient' });
      VitalSign.belongsTo(models.User, { foreignKey: 'recordedBy', as: 'recorder' });
    }
  }

  VitalSign.init({
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:  { type: DataTypes.UUID, allowNull: false },
    recordedBy: { type: DataTypes.UUID },
    recordedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    weight:     { type: DataTypes.FLOAT },           // kg
    bloodPressureSystolic:  { type: DataTypes.INTEGER },
    bloodPressureDiastolic: { type: DataTypes.INTEGER },
    heartRate:   { type: DataTypes.INTEGER },        // bpm
    temperature: { type: DataTypes.FLOAT },          // °C
    fetalHeartRate: { type: DataTypes.INTEGER },     // bpm
    bloodGlucose:   { type: DataTypes.FLOAT },       // mmol/L
    oxygenSaturation: { type: DataTypes.FLOAT },     // %
    fundalHeight:    { type: DataTypes.FLOAT },      // cm
    urineProtein: {
      type: DataTypes.ENUM('negative', 'trace', '1+', '2+', '3+', '4+'),
    },
    hemoglobin:  { type: DataTypes.FLOAT },          // g/dL
    gestationalWeekAtReading: { type: DataTypes.INTEGER },
    notes:       { type: DataTypes.TEXT },
    isAbnormal:  { type: DataTypes.BOOLEAN, defaultValue: false },
    abnormalFlags: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  }, {
    sequelize,
    modelName: 'VitalSign',
    tableName: 'vital_signs',
    timestamps: true,
  });

  return VitalSign;
};
