'use strict';

const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    async comparePassword(plain) {
      return bcrypt.compare(plain, this.password);
    }
    toJSON() {
      const val = { ...this.get() };
      delete val.password;
      delete val.passwordResetToken;
      delete val.passwordResetExpires;
      return val;
    }
    static associate(models) {
      User.hasOne(models.PregnancyProfile, { foreignKey: 'userId', as: 'pregnancyProfile' });
      User.hasOne(models.ProviderProfile,  { foreignKey: 'userId', as: 'providerProfile' });
      User.hasMany(models.Appointment,     { foreignKey: 'patientId', as: 'patientAppointments' });
      User.hasMany(models.Appointment,     { foreignKey: 'providerId', as: 'providerAppointments' });
      User.hasMany(models.RiskReport,      { foreignKey: 'patientId', as: 'riskReports' });
      User.hasMany(models.VitalSign,       { foreignKey: 'patientId', as: 'vitalSigns' });
      User.hasMany(models.Notification,    { foreignKey: 'userId', as: 'notifications' });
    }
  }

  User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    firstName: { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
    lastName:  { type: DataTypes.STRING(100), allowNull: false, validate: { notEmpty: true } },
    email:     { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password:  { type: DataTypes.STRING, allowNull: false, validate: { len: [8, 100] } },
    role: {
      type: DataTypes.ENUM('patient', 'provider', 'admin'),
      defaultValue: 'patient',
      allowNull: false,
    },
    phone:       { type: DataTypes.STRING(20) },
    dateOfBirth: { type: DataTypes.DATEONLY },
    avatar:      { type: DataTypes.STRING },
    isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
    isVerified:  { type: DataTypes.BOOLEAN, defaultValue: false },
    passwordResetToken:   { type: DataTypes.STRING },
    passwordResetExpires: { type: DataTypes.DATE },
    lastLoginAt: { type: DataTypes.DATE },
    refreshToken: { type: DataTypes.TEXT },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) user.password = await bcrypt.hash(user.password, 12);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12);
      },
    },
  });

  return User;
};
