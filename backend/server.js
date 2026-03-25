'use strict';

require('dotenv').config();

const app    = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT) || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅  Database connection established');

    if (process.env.NODE_ENV === 'development') {
      // Sync only in development; use migrations in staging/production
      await sequelize.sync({ alter: false });
      logger.info('✅  Sequelize models synced');
    }

    app.listen(PORT, () => {
      logger.info(`🚀  Server running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📋  API docs: http://localhost:${PORT}/api`);
      logger.info(`❤️   Health:   http://localhost:${PORT}/health`);
    });
  } catch (err) {
    logger.error('❌  Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received – shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await sequelize.close();
  process.exit(0);
});

start();
