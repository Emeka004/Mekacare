'use strict';

const logger = require('../utils/logger');
const { error } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return error(res, 'Validation error', 422, messages);
  }

  // Sequelize FK constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return error(res, 'Referenced resource does not exist', 400);
  }

  // JWT errors that slipped through
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return error(res, 'Invalid or expired token', 401);
  }

  // Multer / file too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    return error(res, 'File too large', 413);
  }

  // Default 500
  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred'
    : err.message || 'Internal server error';

  return error(res, message, statusCode);
};

module.exports = errorHandler;
