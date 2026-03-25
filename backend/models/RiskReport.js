'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class RiskReport extends Model {
    static associate(models) {
      RiskReport.belongsTo(models.User, { foreignKey: 'patientId',  as: 'patient' });
      RiskReport.belongsTo(models.User, { foreignKey: 'reportedBy', as: 'reporter' });
      RiskReport.belongsTo(models.User, { foreignKey: 'reviewedBy', as: 'reviewer' });
    }
  }

  RiskReport.init({
    id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId:  { type: DataTypes.UUID, allowNull: false },
    reportedBy: { type: DataTypes.UUID, allowNull: false },
    reviewedBy: { type: DataTypes.UUID },
    category: {
      type: DataTypes.ENUM('bleeding', 'hypertension', 'gestational_diabetes', 'preeclampsia', 'preterm_labor', 'infection', 'fetal_movement', 'other'),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('low', 'moderate', 'high', 'critical'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'under_review', 'resolved', 'escalated'),
      defaultValue: 'open',
    },
    title:       { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    symptoms:    { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    vitalsAtReport: { type: DataTypes.JSONB },
    actionTaken: { type: DataTypes.TEXT },
    resolution:  { type: DataTypes.TEXT },
    resolvedAt:  { type: DataTypes.DATE },
    attachments: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    requiresEmergency: { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    sequelize,
    modelName: 'RiskReport',
    tableName: 'risk_reports',
    timestamps: true,
  });

  return RiskReport;
};
