'use strict';

const { Notification } = require('../models');
const { Op } = require('sequelize');
const api = require('../utils/apiResponse');

// ── GET /api/notifications ────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, isRead, type, priority } = req.query;
    const offset = (page - 1) * limit;
    const where = { userId: req.user.id };

    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (type)     where.type     = type;
    if (priority) where.priority = priority;

    // Exclude expired
    where[Op.or] = [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }];

    const { rows, count } = await Notification.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await Notification.count({ where: { userId: req.user.id, isRead: false } });

    return api.success(res, { notifications: rows, unreadCount, total: count });
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/:id/read ─────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return api.notFound(res);
    await notif.update({ isRead: true, readAt: new Date() });
    return api.success(res, { notification: notif }, 'Marked as read');
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/read-all ────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    return api.success(res, {}, 'All notifications marked as read');
  } catch (err) { next(err); }
};

// ── DELETE /api/notifications/:id ─────────────────────────────────────
exports.delete = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notif) return api.notFound(res);
    await notif.destroy();
    return api.success(res, {}, 'Notification deleted');
  } catch (err) { next(err); }
};

// ── DELETE /api/notifications  (clear all read) ───────────────────────
exports.clearRead = async (req, res, next) => {
  try {
    const deleted = await Notification.destroy({ where: { userId: req.user.id, isRead: true } });
    return api.success(res, { deleted }, 'Read notifications cleared');
  } catch (err) { next(err); }
};

// ── POST /api/notifications/broadcast  (admin) ────────────────────────
exports.broadcast = async (req, res, next) => {
  try {
    const { User } = require('../models');
    const { title, message, type = 'system', priority = 'normal', roleTarget } = req.body;

    const where = { isActive: true };
    if (roleTarget) where.role = roleTarget;

    const users = await User.findAll({ where, attributes: ['id'] });
    const notifications = users.map((u) => ({
      userId: u.id, title, message, type, priority,
      data: { broadcastedBy: req.user.id },
    }));

    await Notification.bulkCreate(notifications);
    return api.created(res, { sent: notifications.length }, 'Broadcast sent');
  } catch (err) { next(err); }
};
