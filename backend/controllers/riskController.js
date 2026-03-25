'use strict';

const { RiskReport, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendRiskAlert } = require('../utils/email');
const api = require('../utils/apiResponse');

const INCLUDE = [
  { association: 'patient',  attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
  { association: 'reporter', attributes: ['id', 'firstName', 'lastName', 'role'] },
  { association: 'reviewer', attributes: ['id', 'firstName', 'lastName'] },
];

// ── POST /api/risks ───────────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;

    const report = await RiskReport.create({
      ...req.body,
      patientId,
      reportedBy: req.user.id,
    });

    // Notify all providers + admin for high/critical
    if (['high', 'critical'].includes(report.severity)) {
      const patient = await User.findByPk(patientId);
      await sendRiskAlert(patient, report);

      await Notification.create({
        userId: patientId,
        type: 'risk_alert',
        title: `⚠️ Risk Report Filed – ${report.severity.toUpperCase()}`,
        message: report.title,
        data: { reportId: report.id },
        priority: report.severity === 'critical' ? 'urgent' : 'high',
      });
    }

    const full = await RiskReport.findByPk(report.id, { include: INCLUDE });
    return api.created(res, { report: full });
  } catch (err) { next(err); }
};

// ── GET /api/risks ────────────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, severity, status, category } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.user.role === 'patient') where.patientId = req.user.id;
    if (severity) where.severity = severity;
    if (status)   where.status   = status;
    if (category) where.category = category;

    const { rows, count } = await RiskReport.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: INCLUDE,
      order: [
        [{ raw: `CASE WHEN severity='critical' THEN 1 WHEN severity='high' THEN 2 WHEN severity='moderate' THEN 3 ELSE 4 END` }],
        ['createdAt', 'DESC'],
      ],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── GET /api/risks/:id ────────────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const report = await RiskReport.findByPk(req.params.id, { include: INCLUDE });
    if (!report) return api.notFound(res, 'Risk report not found');

    if (req.user.role === 'patient' && report.patientId !== req.user.id) return api.forbidden(res);

    return api.success(res, { report });
  } catch (err) { next(err); }
};

// ── PUT /api/risks/:id ────────────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const report = await RiskReport.findByPk(req.params.id);
    if (!report) return api.notFound(res);

    if (req.user.role === 'patient' && report.patientId !== req.user.id) return api.forbidden(res);

    await report.update(req.body);
    return api.success(res, { report }, 'Report updated');
  } catch (err) { next(err); }
};

// ── PATCH /api/risks/:id/review  (provider / admin) ──────────────────
exports.review = async (req, res, next) => {
  try {
    const { status, actionTaken, resolution } = req.body;
    const report = await RiskReport.findByPk(req.params.id);
    if (!report) return api.notFound(res);

    const updates = { status, reviewedBy: req.user.id };
    if (actionTaken) updates.actionTaken = actionTaken;
    if (resolution)  updates.resolution  = resolution;
    if (status === 'resolved') updates.resolvedAt = new Date();

    await report.update(updates);

    await Notification.create({
      userId: report.patientId,
      type: 'risk_alert',
      title: `Risk Report ${status}`,
      message: `Your risk report "${report.title}" has been reviewed and marked as ${status}.`,
      data: { reportId: report.id },
      priority: 'normal',
    });

    return api.success(res, { report }, 'Report reviewed');
  } catch (err) { next(err); }
};

// ── DELETE /api/risks/:id  (admin) ────────────────────────────────────
exports.delete = async (req, res, next) => {
  try {
    const report = await RiskReport.findByPk(req.params.id);
    if (!report) return api.notFound(res);
    await report.destroy();
    return api.success(res, {}, 'Report deleted');
  } catch (err) { next(err); }
};
