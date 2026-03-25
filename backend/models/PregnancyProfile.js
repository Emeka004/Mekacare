'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class PregnancyProfile extends Model {
    get gestationalAge() {
      if (!this.lastMenstrualPeriod) return null;
      const weeks = Math.floor((Date.now() - new Date(this.lastMenstrualPeriod)) / (7 * 24 * 60 * 60 * 1000));
      return weeks;
    }
    get trimester() {
      const weeks = this.gestationalAge;
      if (!weeks) return null;
      if (weeks <= 13) return 1;
      if (weeks <= 26) return 2;
      return 3;
    }
    static associate(models) {
      PregnancyProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'patient' });
      PregnancyProfile.belongsTo(models.User, { foreignKey: 'primaryProviderId', as: 'primaryProvider' });
    }
  }

  PregnancyProfile.init({
    id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:         { type: DataTypes.UUID, allowNull: false, unique: true },
    primaryProviderId: { type: DataTypes.UUID },
    lastMenstrualPeriod: { type: DataTypes.DATEONLY },
    estimatedDueDate:    { type: DataTypes.DATEONLY },
    gravidaPara:         { type: DataTypes.STRING(20) },        // e.g. "G2P1"
    bloodType:           { type: DataTypes.STRING(5) },
    prePregnancyWeight:  { type: DataTypes.FLOAT },
    currentWeight:       { type: DataTypes.FLOAT },
    height:              { type: DataTypes.FLOAT },
    isHighRisk:          { type: DataTypes.BOOLEAN, defaultValue: false },
    riskFactors:         { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    medicalHistory:      { type: DataTypes.JSONB, defaultValue: {} },
    allergies:           { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    medications:         { type: DataTypes.JSONB, defaultValue: [] },
    deliveryPlan:        { type: DataTypes.JSONB, defaultValue: {} },
    notes:               { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM('active', 'delivered', 'transferred', 'inactive'),
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'PregnancyProfile',
    tableName: 'pregnancy_profiles',
    timestamps: true,
  });

  return PregnancyProfile;
};
