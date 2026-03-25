'use strict';

const { Appointment, User, Notification } = require('../models');
const { Op } = require('sequelize');
const { sendAppointmentConfirmation } = require('../utils/email');
const api = require('../utils/apiResponse');

const INCLUDE = [
  { association: 'patient',  attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
  { association: 'provider', attributes: ['id', 'firstName', 'lastName', 'email'] },
];

// ── POST /api/appointments ────────────────────────────────────────────
exports.create = async (req, res, next) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.body.patientId;

    // Conflict check: provider already booked at that time
    const conflict = await Appointment.findOne({
      where: {
        providerId: req.body.providerId,
        scheduledAt: req.body.scheduledAt,
        status: { [Op.notIn]: ['cancelled', 'no_show'] },
      },
    });
    if (conflict) return api.conflict(res, 'Provider already has an appointment at that time');

    const appointment = await Appointment.create({ ...req.body, patientId });

    // Notify patient
    await Notification.create({
      userId: patientId,
      type: 'appointment_confirmed',
      title: 'Appointment Scheduled',
      message: `Your ${appointment.type.replace(/_/g, ' ')} appointment is scheduled for ${new Date(appointment.scheduledAt).toDateString()}.`,
      data: { appointmentId: appointment.id },
      priority: 'normal',
    });

    const patient = await User.findByPk(patientId);
    await sendAppointmentConfirmation(patient, appointment);

    const full = await Appointment.findByPk(appointment.id, { include: INCLUDE });
    return api.created(res, { appointment: full });
  } catch (err) { next(err); }
};

// ── GET /api/appointments ─────────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, from, to } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.user.role === 'patient')  where.patientId  = req.user.id;
    if (req.user.role === 'provider') where.providerId = req.user.id;
    if (status) where.status = status;
    if (type)   where.type   = type;
    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt[Op.gte] = new Date(from);
      if (to)   where.scheduledAt[Op.lte] = new Date(to);
    }

    const { rows, count } = await Appointment.findAndCountAll({
      where, limit: parseInt(limit), offset,
      include: INCLUDE,
      order: [['scheduledAt', 'ASC']],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── GET /api/appointments/:id ─────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id, { include: INCLUDE });
    if (!appt) return api.notFound(res, 'Appointment not found');

    if (req.user.role === 'patient' && appt.patientId !== req.user.id)   return api.forbidden(res);
    if (req.user.role === 'provider' && appt.providerId !== req.user.id) return api.forbidden(res);

    return api.success(res, { appointment: appt });
  } catch (err) { next(err); }
};

// ── PUT /api/appointments/:id ─────────────────────────────────────────
exports.update = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return api.notFound(res, 'Appointment not found');

    if (req.user.role === 'patient' && appt.patientId !== req.user.id) return api.forbidden(res);

    await appt.update(req.body);
    const updated = await Appointment.findByPk(appt.id, { include: INCLUDE });
    return api.success(res, { appointment: updated }, 'Appointment updated');
  } catch (err) { next(err); }
};

// ── PATCH /api/appointments/:id/status ───────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return api.notFound(res);

    const updates = { status };
    if (status === 'cancelled') {
      updates.cancelledBy = req.user.id;
      updates.cancelReason = cancelReason;
    }

    await appt.update(updates);

    // Notify the other party
    const notifyUserId = req.user.role === 'patient' ? appt.providerId : appt.patientId;
    await Notification.create({
      userId: notifyUserId,
      type: 'appointment_cancelled',
      title: `Appointment ${status}`,
      message: `An appointment on ${new Date(appt.scheduledAt).toDateString()} has been ${status}.`,
      data: { appointmentId: appt.id },
      priority: status === 'cancelled' ? 'high' : 'normal',
    });

    return api.success(res, { appointment: appt }, `Appointment ${status}`);
  } catch (err) { next(err); }
};

// ── DELETE /api/appointments/:id  (admin only) ─────────────────────
exports.delete = async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return api.notFound(res);
    await appt.destroy();
    return api.success(res, {}, 'Appointment deleted');
  } catch (err) { next(err); }
};
