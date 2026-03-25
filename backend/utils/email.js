'use strict';

const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const base = (title, body) => `
<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f5f5f5;padding:20px">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
  <div style="background:#e91e8c;padding:24px;color:#fff"><h2 style="margin:0">🤰 ${title}</h2></div>
  <div style="padding:24px">${body}</div>
  <div style="background:#f0f0f0;padding:16px;text-align:center;color:#888;font-size:12px">
    Pregnancy Health Platform · <a href="${process.env.CLIENT_URL}">Visit Portal</a>
  </div>
</div></body></html>`;

const send = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to, subject, html,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
  }
};

const sendWelcome = (user) =>
  send(user.email, 'Welcome to Pregnancy Health!',
    base('Welcome!', `<p>Hi ${user.firstName},</p><p>Your account has been created successfully. We're here to support your pregnancy journey every step of the way.</p><a href="${process.env.CLIENT_URL}/dashboard" style="background:#e91e8c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none">Go to Dashboard</a>`));

const sendPasswordReset = (user, token) =>
  send(user.email, 'Reset Your Password',
    base('Password Reset', `<p>Hi ${user.firstName},</p><p>Click below to reset your password. This link expires in 1 hour.</p><a href="${process.env.CLIENT_URL}/reset-password?token=${token}" style="background:#e91e8c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none">Reset Password</a>`));

const sendAppointmentConfirmation = (user, appointment) =>
  send(user.email, 'Appointment Confirmed',
    base('Appointment Confirmed', `<p>Hi ${user.firstName},</p><p>Your appointment on <strong>${new Date(appointment.scheduledAt).toDateString()}</strong> has been confirmed.</p><p>Type: ${appointment.type}</p>`));

const sendRiskAlert = (user, report) =>
  send(user.email, '⚠️ Risk Alert – Action Required',
    base('Risk Alert', `<p>Hi ${user.firstName},</p><p>A new risk report with severity <strong>${report.severity}</strong> has been filed. Please contact your provider or visit the emergency room if needed.</p><a href="${process.env.CLIENT_URL}/reports" style="background:#e91e8c;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none">View Report</a>`));

module.exports = { sendWelcome, sendPasswordReset, sendAppointmentConfirmation, sendRiskAlert };
