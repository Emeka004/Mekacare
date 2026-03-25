'use strict';

const crypto = require('crypto');
const { User } = require('../models');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { sendWelcome, sendPasswordReset } = require('../utils/email');
const api = require('../utils/apiResponse');

// ── POST /api/auth/register ──────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return api.conflict(res, 'Email already registered');

    const user = await User.create({ firstName, lastName, email, password, role: role || 'patient', phone });
    const tokens = generateTokenPair(user);

    await user.update({ refreshToken: tokens.refreshToken, lastLoginAt: new Date() });
    await sendWelcome(user);

    return api.created(res, { user, ...tokens }, 'Registration successful');
  } catch (err) { next(err); }
};

// ── POST /api/auth/login ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return api.unauthorized(res, 'Invalid email or password');
    if (!user.isActive) return api.unauthorized(res, 'Account is deactivated');

    const valid = await user.comparePassword(password);
    if (!valid) return api.unauthorized(res, 'Invalid email or password');

    const tokens = generateTokenPair(user);
    await user.update({ refreshToken: tokens.refreshToken, lastLoginAt: new Date() });

    return api.success(res, { user, ...tokens }, 'Login successful');
  } catch (err) { next(err); }
};

// ── POST /api/auth/refresh ───────────────────────────────────────────
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return api.badRequest(res, 'Refresh token required');

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return api.unauthorized(res, 'Invalid refresh token');
    }

    const tokens = generateTokenPair(user);
    await user.update({ refreshToken: tokens.refreshToken });

    return api.success(res, tokens, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError') return api.unauthorized(res, 'Refresh token expired, please log in again');
    next(err);
  }
};

// ── POST /api/auth/logout ────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    await req.user.update({ refreshToken: null });
    return api.success(res, {}, 'Logged out successfully');
  } catch (err) { next(err); }
};

// ── POST /api/auth/forgot-password ──────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    // Always return 200 to prevent email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await user.update({
        passwordResetToken: crypto.createHash('sha256').update(token).digest('hex'),
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
      await sendPasswordReset(user, token);
    }

    return api.success(res, {}, 'If that email is registered you will receive a reset link shortly');
  } catch (err) { next(err); }
};

// ── POST /api/auth/reset-password ───────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user || new Date(user.passwordResetExpires) < new Date()) {
      return api.badRequest(res, 'Token is invalid or has expired');
    }

    await user.update({
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null,
    });

    return api.success(res, {}, 'Password reset successful. Please log in.');
  } catch (err) { next(err); }
};

// ── GET /api/auth/me ─────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { association: 'pregnancyProfile' },
        { association: 'providerProfile' },
      ],
    });
    return api.success(res, { user });
  } catch (err) { next(err); }
};
