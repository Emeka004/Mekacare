'use strict';

const { VitalSign, PregnancyProfile } = require('../models');
const { Op } = require('sequelize');
const api = require('../utils/apiResponse');

// BP normal ranges for pregnancy
const isAbnormalBP = (sys, dia) =>
  sys >= 140 || dia >= 90 || sys < 90 || dia < 60;

const checkAbnormal = (v) => {
  const flags = [];
  if (v.bloodPressureSystolic && v.bloodPressureDiastolic) {
    if (isAbnormalBP(v.bloodPressureSystolic, v.bloodPressureDiastolic)) flags.push('blood_pressure');
  }
  if (v.fetalHeartRate && (v.fetalHeartRate < 110 || v.fetalHeartRate > 160)) flags.push('fetal_heart_rate');
  if (v.oxygenSaturation && v.oxygenSaturation < 95) flags.push('oxygen_saturation');
  if (v.temperature && (v.temperature < 36 || v.temperature > 38)) flags.push('temperature');
  if (v.bloodGlucose && (v.bloodGlucose < 3.9 || v.bloodGlucose > 10)) flags.push('blood_glucose');
  return { isAbnormal: flags.length > 0, abnormalFlags: flags };
};

// ── POST /api/vitals ──────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;
    const { isAbnormal, abnormalFlags } = checkAbnormal(req.body);

    const vital = await VitalSign.create({
      ...req.body,
      patientId,
      recordedBy: req.user.id,
      isAbnormal,
      abnormalFlags,
    });

    return api.created(res, { vital, isAbnormal, abnormalFlags });
  } catch (err) { next(err); }
};

// ── GET /api/vitals ───────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, from, to, isAbnormal } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (req.user.role === 'patient') where.patientId = req.user.id;
    else if (req.query.patientId)    where.patientId = req.query.patientId;

    if (isAbnormal !== undefined) where.isAbnormal = isAbnormal === 'true';
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt[Op.gte] = new Date(from);
      if (to)   where.recordedAt[Op.lte] = new Date(to);
    }

    const { rows, count } = await VitalSign.findAndCountAll({
      where, limit: parseInt(limit), offset,
      order: [['recordedAt', 'DESC']],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── GET /api/vitals/latest ────────────────────────────────────────────
exports.getLatest = async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.query.patientId;
    const vital = await VitalSign.findOne({
      where: { patientId },
      order: [['recordedAt', 'DESC']],
    });
    if (!vital) return api.notFound(res, 'No vitals recorded yet');
    return api.success(res, { vital });
  } catch (err) { next(err); }
};

// ── GET /api/vitals/trends ─────────────────────────────────────────────
exports.getTrends = async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.query.patientId;
    const { weeks = 10 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(weeks) * 7);

    const vitals = await VitalSign.findAll({
      where: { patientId, recordedAt: { [Op.gte]: since } },
      order: [['recordedAt', 'ASC']],
      attributes: ['recordedAt', 'weight', 'bloodPressureSystolic', 'bloodPressureDiastolic',
        'fetalHeartRate', 'bloodGlucose', 'oxygenSaturation', 'gestationalWeekAtReading'],
    });

    return api.success(res, { trends: vitals, dataPoints: vitals.length });
  } catch (err) { next(err); }
};

// ── GET /api/vitals/:id ───────────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const vital = await VitalSign.findByPk(req.params.id);
    if (!vital) return api.notFound(res, 'Vital record not found');
    if (req.user.role === 'patient' && vital.patientId !== req.user.id) return api.forbidden(res);
    return api.success(res, { vital });
  } catch (err) { next(err); }
};

// ── PUT /api/vitals/:id  (provider / admin) ───────────────────────────
exports.update = async (req, res, next) => {
  try {
    const vital = await VitalSign.findByPk(req.params.id);
    if (!vital) return api.notFound(res);
    const { isAbnormal, abnormalFlags } = checkAbnormal({ ...vital.toJSON(), ...req.body });
    await vital.update({ ...req.body, isAbnormal, abnormalFlags });
    return api.success(res, { vital }, 'Vital updated');
  } catch (err) { next(err); }
};

// ── DELETE /api/vitals/:id  (admin) ──────────────────────────────────
exports.delete = async (req, res, next) => {
  try {
    const vital = await VitalSign.findByPk(req.params.id);
    if (!vital) return api.notFound(res);
    await vital.destroy();
    return api.success(res, {}, 'Vital record deleted');
  } catch (err) { next(err); }
};
