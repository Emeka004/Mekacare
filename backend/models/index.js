'use strict';

const { Sequelize } = require('sequelize');
const config = require('../database');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

// ── Import models ──────────────────────────────────────────────────────
const User              = require('./User')(sequelize);
const PregnancyProfile  = require('./PregnancyProfile')(sequelize);
const ProviderProfile   = require('./ProviderProfile')(sequelize);
const Appointment       = require('./Appointment')(sequelize);
const RiskReport        = require('./RiskReport')(sequelize);
const VitalSign         = require('./VitalSign')(sequelize);
const EducationContent  = require('./EducationContent')(sequelize);
const Notification      = require('./Notification')(sequelize);

const models = {
  User, PregnancyProfile, ProviderProfile,
  Appointment, RiskReport, VitalSign,
  EducationContent, Notification,
};

// ── Run associations ───────────────────────────────────────────────────
Object.values(models)
  .filter((m) => typeof m.associate === 'function')
  .forEach((m) => m.associate(models));

module.exports = { sequelize, Sequelize, ...models };
