'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ProviderProfile extends Model {
    static associate(models) {
      ProviderProfile.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  ProviderProfile.init({
    id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId:      { type: DataTypes.UUID, allowNull: false, unique: true },
    licenseNumber: { type: DataTypes.STRING(50), allowNull: false },
    specialty: {
      type: DataTypes.ENUM('obstetrician', 'gynecologist', 'midwife', 'perinatologist', 'nurse_practitioner', 'general_practitioner'),
      allowNull: false,
    },
    yearsOfExperience: { type: DataTypes.INTEGER },
    hospital:          { type: DataTypes.STRING(200) },
    clinicAddress:     { type: DataTypes.TEXT },
    bio:               { type: DataTypes.TEXT },
    education:         { type: DataTypes.JSONB, defaultValue: [] },
    certifications:    { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    languages:         { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: ['English'] },
    consultationFee:   { type: DataTypes.DECIMAL(10, 2) },
    acceptingPatients: { type: DataTypes.BOOLEAN, defaultValue: true },
    rating:            { type: DataTypes.FLOAT, defaultValue: 0 },
    reviewCount:       { type: DataTypes.INTEGER, defaultValue: 0 },
    availableSlots:    { type: DataTypes.JSONB, defaultValue: {} },  // { "Monday": ["09:00","10:00"] }
    isVerified:        { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    sequelize,
    modelName: 'ProviderProfile',
    tableName: 'provider_profiles',
    timestamps: true,
  });

  return ProviderProfile;
};
