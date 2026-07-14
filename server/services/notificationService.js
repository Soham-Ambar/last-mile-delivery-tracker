const Notification = require('../models/Notification');
const User = require('../models/User');
const Agent = require('../models/Agent');
const { sendEmail } = require('./emailService');

const TITLE_MAP = {
  OrderCreated: 'Order Created',
  OrderAssigned: 'Agent Assigned',
  OrderStatusChanged: 'Status Updated',
  OrderCancelled: 'Order Cancelled',
  OrderFailed: 'Delivery Failed',
  OrderRescheduled: 'Order Rescheduled',
  OrderDelivered: 'Order Delivered',
  System: 'System Notification',
};

const MESSAGE_MAP = {
  OrderCreated: (data) => `Order ${data.trackingId} has been placed successfully.`,
  OrderAssigned: (data) => `Order ${data.trackingId} has been assigned to ${data.agentName || 'an agent'}.`,
  OrderStatusChanged: (data) => `Order ${data.trackingId} status updated to ${data.status}.`,
  OrderCancelled: (data) => `Order ${data.trackingId} has been cancelled.`,
  OrderFailed: (data) => `Order ${data.trackingId} delivery failed${data.failedReason ? ': ' + data.failedReason : ''}.`,
  OrderRescheduled: (data) => `Order ${data.trackingId} has been rescheduled${data.newDate ? ' to ' + data.newDate : ''}.`,
  OrderDelivered: (data) => `Order ${data.trackingId} has been delivered successfully.`,
  System: (data) => data.message || 'System notification.',
};

async function createNotification({ recipient, order, type, data }) {
  const title = TITLE_MAP[type] || 'Notification';
  const message = MESSAGE_MAP[type] ? MESSAGE_MAP[type](data) : data.message || '';

  const notification = new Notification({
    recipient,
    order,
    title,
    message,
    type,
    metadata: data,
  });

  return await notification.save();
}

async function notifyCustomer(order, type, extraData) {
  if (!order || !order.customer) return;

  const customerId = order.customer._id || order.customer;
  const trackingId = order.trackingId;

  const customer = await User.findById(customerId);
  if (!customer) return;

  const data = { ...extraData, trackingId, totalPrice: order.totalPrice, customerName: customer.name };

  await createNotification({ recipient: customerId, order: order._id, type, data });
  await sendEmail(customer.email, type, data);
}

async function notifyAgentByOrder(order, type) {
  if (!order || !order.assignedAgent) return;

  const agent = await Agent.findById(order.assignedAgent);
  if (!agent) return;

  const trackingId = order.trackingId;
  const data = { trackingId, agentName: agent.name, customerName: agent.name };

  await sendEmail(agent.email, type, data);
}

async function notifyAdmin(type, data) {
  const admins = await User.find({ role: 'admin', isActive: true }).lean();
  if (!admins.length) return;

  const adminData = { ...data, message: data.message || MESSAGE_MAP[type]?.(data) || '' };

  await Promise.all(
    admins.map((admin) =>
      createNotification({ recipient: admin._id, order: data.orderId, type, data: adminData })
    )
  );

  await Promise.all(
    admins.map((admin) => sendEmail(admin.email, type, adminData))
  );
}

async function getNotifications(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('order', 'trackingId status')
      .lean(),
    Notification.countDocuments({ recipient: userId }),
  ]);

  return { notifications, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
}

async function deleteNotification(notificationId, userId) {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });
  return notification;
}

async function getUnreadCount(userId) {
  return await Notification.countDocuments({ recipient: userId, isRead: false });
}

module.exports = {
  createNotification,
  notifyCustomer,
  notifyAgentByOrder,
  notifyAdmin,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
