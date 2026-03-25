'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models');
const { unauthorized } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'role', 'isActive', 'isVerified', 'firstName', 'lastName'],
    });

    if (!user)           return unauthorized(res, 'User not found');
    if (!user.isActive)  return unauthorized(res, 'Account is deactivated');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return unauthorized(res, 'Token expired');
    if (err.name === 'JsonWebTokenError')  return unauthorized(res, 'Invalid token');
    next(err);
  }
};

module.exports = authenticate;
