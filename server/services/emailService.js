const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@lastmiletracker.com';

let transporter = null;

function initTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn('SMTP not configured — email sending disabled');
    return false;
  }
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return true;
  } catch (err) {
    logger.warn('Failed to create SMTP transporter — email sending disabled', err.message);
    transporter = null;
    return false;
  }
}

function wrapBody(title, body) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden">
<tr><td style="padding:32px 32px 0">
<h1 style="margin:0;font-size:20px;color:#f1f5f9;font-weight:600">${title}</h1>
</td></tr>
<tr><td style="padding:24px 32px;color:#cbd5e1;font-size:14px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:0 32px 24px;border-top:1px solid #334155;padding-top:16px;font-size:12px;color:#64748b">
<p style="margin:0">Last Mile Delivery Tracker</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function buildTemplate(type, data) {
  const trackingId = data.trackingId || '';
  const customerName = data.customerName || 'Customer';
  const agentName = data.agentName || '';
  const status = data.status || '';
  const failedReason = data.failedReason || '';
  const newDate = data.newDate || '';
  const totalPrice = data.totalPrice || '';

  switch (type) {
    case 'OrderCreated':
      return {
        subject: `Order ${trackingId} — Created Successfully`,
        html: wrapBody('Order Created', `
          <p>Hi ${customerName},</p>
          <p>Your order <strong>${trackingId}</strong> has been placed successfully.</p>
          <p>Total: ₹${totalPrice}</p>
          <p>We will notify you once a delivery agent is assigned.</p>
        `),
      };
    case 'OrderAssigned':
      return {
        subject: `Order ${trackingId} — Agent Assigned`,
        html: wrapBody('Agent Assigned', `
          <p>Hi ${customerName},</p>
          <p>Your order <strong>${trackingId}</strong> has been assigned to <strong>${agentName}</strong>.</p>
          <p>They will pick up your parcel shortly.</p>
        `),
      };
    case 'OrderStatusChanged':
      return {
        subject: `Order ${trackingId} — Status Updated`,
        html: wrapBody('Status Update', `
          <p>Hi ${customerName},</p>
          <p>Your order <strong>${trackingId}</strong> status has been updated to <strong>${status}</strong>.</p>
        `),
      };
    case 'OrderFailed':
      return {
        subject: `Order ${trackingId} — Delivery Failed`,
        html: wrapBody('Delivery Failed', `
          <p>Hi ${customerName},</p>
          <p>The delivery for order <strong>${trackingId}</strong> has failed.</p>
          ${failedReason ? `<p>Reason: ${failedReason}</p>` : ''}
          <p>You can reschedule a new delivery date from your account.</p>
        `),
      };
    case 'OrderRescheduled':
      return {
        subject: `Order ${trackingId} — Rescheduled`,
        html: wrapBody('Order Rescheduled', `
          <p>Hi ${customerName},</p>
          <p>Your order <strong>${trackingId}</strong> has been rescheduled.</p>
          ${newDate ? `<p>New delivery date: ${newDate}</p>` : ''}
          <p>A new agent will be assigned shortly.</p>
        `),
      };
    case 'OrderDelivered':
      return {
        subject: `Order ${trackingId} — Delivered`,
        html: wrapBody('Order Delivered', `
          <p>Hi ${customerName},</p>
          <p>Your order <strong>${trackingId}</strong> has been delivered successfully.</p>
          <p>Thank you for using Last Mile Delivery Tracker!</p>
        `),
      };
    case 'OrderCancelled':
      return {
        subject: `Order ${trackingId} — Cancelled`,
        html: wrapBody('Order Cancelled', `
          <p>Hi ${customerName},</p>
          <p>Your order <strong>${trackingId}</strong> has been cancelled.</p>
          <p>If this was a mistake, please contact support.</p>
        `),
      };
    default:
      return {
        subject: 'Notification from Last Mile Delivery Tracker',
        html: wrapBody('Notification', `<p>${data.message || 'You have a new notification.'}</p>`),
      };
  }
}

async function sendEmail(to, type, data) {
  if (!transporter && !initTransporter()) {
    logger.warn(`Email skipped (SMTP not configured): ${type} -> ${to}`);
    return;
  }

  const { subject, html } = buildTemplate(type, data);

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent: ${subject} -> ${to}`);
  } catch (err) {
    logger.warn(`Email failed: ${subject} -> ${to} (${err.message})`);
  }
}

module.exports = { sendEmail };
