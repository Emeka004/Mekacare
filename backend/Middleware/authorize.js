'use strict';

const { forbidden } = require('../utils/apiResponse');

/**
 * authorize(...roles)
 * Usage: router.get('/admin', authenticate, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return forbidden(res, 'Authentication required');
  if (!roles.includes(req.user.role)) {
    return forbidden(res, `Role '${req.user.role}' is not permitted to access this resource`);
  }
  next();
};

/**
 * authorizeOrOwn(role, ownerField)
 * Allows admins/providers OR the resource owner through.
 * ownerField: the field on req.params or req.body that holds the owner's userId.
 */
const authorizeOrOwn = (role, paramField = 'id') => (req, res, next) => {
  if (!req.user) return forbidden(res);
  const isPrivileged = req.user.role === role || req.user.role === 'admin';
  const isOwner = req.user.id === (req.params[paramField] || req.body[paramField]);
  if (isPrivileged || isOwner) return next();
  return forbidden(res, 'You can only access your own resources');
};

module.exports = { authorize, authorizeOrOwn };
