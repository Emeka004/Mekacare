'use strict';

const { User, PregnancyProfile, ProviderProfile } = require('../models');
const { Op } = require('sequelize');
const api = require('../utils/apiResponse');

// ── GET /api/users  (admin) ──────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role)     where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName:  { [Op.iLike]: `%${search}%` } },
        { email:     { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] },
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── GET /api/users/:id ───────────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        { association: 'pregnancyProfile' },
        { association: 'providerProfile' },
      ],
      attributes: { exclude: ['password', 'refreshToken', 'passwordResetToken', 'passwordResetExpires'] },
    });
    if (!user) return api.notFound(res, 'User not found');
    return api.success(res, { user });
  } catch (err) { next(err); }
};

// ── PUT /api/users/:id  (self or admin) ──────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return api.notFound(res, 'User not found');

    // Non-admins cannot change role or isActive
    const { role, isActive, password, ...safe } = req.body;
    const updates = req.user.role === 'admin' ? req.body : safe;

    await user.update(updates);
    return api.success(res, { user }, 'Profile updated');
  } catch (err) { next(err); }
};

// ── PUT /api/users/:id/password ──────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return api.notFound(res);

    const valid = await user.comparePassword(currentPassword);
    if (!valid) return api.badRequest(res, 'Current password is incorrect');

    await user.update({ password: newPassword });
    return api.success(res, {}, 'Password changed successfully');
  } catch (err) { next(err); }
};

// ── DELETE /api/users/:id  (admin) ───────────────────────────────────
exports.deactivate = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return api.notFound(res, 'User not found');
    await user.update({ isActive: false });
    return api.success(res, {}, 'User deactivated');
  } catch (err) { next(err); }
};

// ── GET /api/users/:id/stats  (admin / provider) ─────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, patients, providers, activePatients] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'patient' } }),
      User.count({ where: { role: 'provider' } }),
      User.count({ where: { role: 'patient', isActive: true } }),
    ]);
    return api.success(res, { totalUsers, patients, providers, activePatients });
  } catch (err) { next(err); }
};
