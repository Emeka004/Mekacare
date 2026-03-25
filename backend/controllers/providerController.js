'use strict';

const { ProviderProfile, User, Appointment, PregnancyProfile, RiskReport } = require('../models');
const { Op } = require('sequelize');
const api = require('../utils/apiResponse');

// ── POST /api/providers/profile ──────────────────────────────────────
exports.createProfile = async (req, res, next) => {
  try {
    const existing = await ProviderProfile.findOne({ where: { userId: req.user.id } });
    if (existing) return api.conflict(res, 'Provider profile already exists');

    const profile = await ProviderProfile.create({ ...req.body, userId: req.user.id });
    return api.created(res, { profile });
  } catch (err) { next(err); }
};

// ── GET /api/providers  (public search) ──────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, specialty, acceptingPatients, search } = req.query;
    const offset = (page - 1) * limit;
    const where = { isVerified: true };

    if (specialty) where.specialty = specialty;
    if (acceptingPatients !== undefined) where.acceptingPatients = acceptingPatients === 'true';

    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName:  { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await ProviderProfile.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: [{ association: 'user', where: userWhere, attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      order: [['rating', 'DESC']],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── GET /api/providers/:id ────────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findByPk(req.params.id, {
      include: [{ association: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar', 'email'] }],
    });
    if (!profile) return api.notFound(res, 'Provider not found');
    return api.success(res, { profile });
  } catch (err) { next(err); }
};

// ── PUT /api/providers/profile ────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) return api.notFound(res, 'Provider profile not found');
    await profile.update(req.body);
    return api.success(res, { profile }, 'Profile updated');
  } catch (err) { next(err); }
};

// ── GET /api/providers/dashboard ─────────────────────────────────────
exports.getDashboard = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay   = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalPatients,
      todayAppointments,
      pendingReports,
      highRiskPatients,
      upcomingAppointments,
      recentRiskReports,
    ] = await Promise.all([
      PregnancyProfile.count({ where: { primaryProviderId: providerId, status: 'active' } }),
      Appointment.count({ where: { providerId, scheduledAt: { [Op.between]: [startOfDay, endOfDay] } } }),
      RiskReport.count({ where: { reviewedBy: null }, include: [{
        association: 'patient',
        include: [{ association: 'pregnancyProfile', where: { primaryProviderId: providerId } }],
      }] }).catch(() => 0),
      PregnancyProfile.count({ where: { primaryProviderId: providerId, isHighRisk: true, status: 'active' } }),
      Appointment.findAll({
        where: { providerId, scheduledAt: { [Op.gte]: new Date() }, status: { [Op.in]: ['scheduled', 'confirmed'] } },
        include: [{ association: 'patient', attributes: ['id', 'firstName', 'lastName'] }],
        order: [['scheduledAt', 'ASC']],
        limit: 5,
      }),
      RiskReport.findAll({
        where: { status: { [Op.in]: ['open', 'escalated'] } },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ association: 'patient', attributes: ['id', 'firstName', 'lastName'] }],
      }),
    ]);

    return api.success(res, {
      stats: { totalPatients, todayAppointments, pendingReports, highRiskPatients },
      upcomingAppointments,
      recentRiskReports,
    });
  } catch (err) { next(err); }
};

// ── GET /api/providers/:id/patients ──────────────────────────────────
exports.getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isHighRisk } = req.query;
    const offset = (page - 1) * limit;
    const where = { primaryProviderId: req.user.id, status: 'active' };
    if (isHighRisk !== undefined) where.isHighRisk = isHighRisk === 'true';

    const { rows, count } = await PregnancyProfile.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: [{ association: 'patient', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};
