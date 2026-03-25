'use strict';

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'pregnancy_health_db',
    host:     process.env.DB_HOST || '127.0.0.1',
    port:     parseInt(process.env.DB_PORT) || 5432,
    dialect:  'postgres',
    logging:  false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME_TEST || 'pregnancy_health_test',
    host:     process.env.DB_HOST || '127.0.0.1',
    dialect:  'postgres',
    logging:  false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    dialect:  'postgres',
    logging:  false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    pool: { max: 20, min: 5, acquire: 60000, idle: 30000 },
  },
};
