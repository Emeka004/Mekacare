'use strict';

const { PregnancyProfile, User, VitalSign, Appointment } = require('../models');
const api = require('../utils/apiResponse');

// ── POST /api/pregnancy-profiles ─────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const userId = req.user.role === 'admin' ? req.body.userId : req.user.id;

    const existing = await PregnancyProfile.findOne({ where: { userId } });
    if (existing) return api.conflict(res, 'Pregnancy profile already exists for this user');

    const profile = await PregnancyProfile.create({ ...req.body, userId });
    return api.created(res, { profile });
  } catch (err) { next(err); }
};

// ── GET /api/pregnancy-profiles/me ───────────────────────────────────
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await PregnancyProfile.findOne({
      where: { userId: req.user.id },
      include: [{ association: 'primaryProvider', include: [{ association: 'providerProfile' }] }],
    });
    if (!profile) return api.notFound(res, 'No pregnancy profile found');
    return api.success(res, {
      profile,
      gestationalAge: profile.gestationalAge,
      trimester: profile.trimester,
    });
  } catch (err) { next(err); }
};

// ── GET /api/pregnancy-profiles/:id ──────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const profile = await PregnancyProfile.findByPk(req.params.id, {
      include: [
        { association: 'patient', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
        { association: 'primaryProvider', attributes: ['id', 'firstName', 'lastName'] },
      ],
    });
    if (!profile) return api.notFound(res, 'Profile not found');

    // Patients can only see their own
    if (req.user.role === 'patient' && profile.userId !== req.user.id) {
      return api.forbidden(res);
    }

    return api.success(res, {
      profile,
      gestationalAge: profile.gestationalAge,
      trimester: profile.trimester,
    });
  } catch (err) { next(err); }
};

// ── GET /api/pregnancy-profiles  (provider / admin) ──────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isHighRisk, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (isHighRisk !== undefined) where.isHighRisk = isHighRisk === 'true';
    if (status) where.status = status;

    // Providers see only their assigned patients
    if (req.user.role === 'provider') {
      where.primaryProviderId = req.user.id;
    }

    const { rows, count } = await PregnancyProfile.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: [{ association: 'patient', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── PUT /api/pregnancy-profiles/:id ──────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const profile = await PregnancyProfile.findByPk(req.params.id);
    if (!profile) return api.notFound(res, 'Profile not found');

    if (req.user.role === 'patient' && profile.userId !== req.user.id) {
      return api.forbidden(res);
    }

    await profile.update(req.body);
    return api.success(res, { profile, gestationalAge: profile.gestationalAge, trimester: profile.trimester }, 'Profile updated');
  } catch (err) { next(err); }
};

// ── GET /api/pregnancy-profiles/:id/summary ──────────────────────────
exports.getSummary = async (req, res, next) => {
  try {
    const profile = await PregnancyProfile.findByPk(req.params.id);
    if (!profile) return api.notFound(res);

    const [latestVitals, upcomingAppointments] = await Promise.all([
      VitalSign.findOne({ where: { patientId: profile.userId }, order: [['recordedAt', 'DESC']] }),
      Appointment.count({
        where: { patientId: profile.userId, status: 'scheduled', scheduledAt: { $gte: new Date() } },
      }),
    ]);

    return api.success(res, {
      profile,
      gestationalAge: profile.gestationalAge,
      trimester: profile.trimester,
      latestVitals,
      upcomingAppointments,
    });
  } catch (err) { next(err); }
};
