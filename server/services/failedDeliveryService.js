const Order = require('../models/Order');
const Agent = require('../models/Agent');
const { addTrackingEvent } = require('./trackingService');
const { assignOrder } = require('./assignmentService');
const { notifyCustomer, notifyAgentByOrder, notifyAdmin } = require('./notificationService');
const httpStatus = require('../utils/httpStatus');

const FAILABLE_STATUSES = ['Assigned', 'PickedUp', 'InTransit', 'OutForDelivery'];

async function markAsFailed(orderId, failedReason, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (!FAILABLE_STATUSES.includes(order.status)) {
    const error = new Error('Order cannot be marked failed in its current status');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const currentAgentId = order.assignedAgent;

  order.status = 'Failed';
  order.failedReason = failedReason;
  order.lastFailedAt = new Date();
  order.deliveryAttempt = (order.deliveryAttempt || 0) + 1;

  const historyEntry = {
    attemptNumber: order.deliveryAttempt,
    failedReason,
    failedAt: order.lastFailedAt,
    agent: currentAgentId,
  };
  order.deliveryHistory.push(historyEntry);

  order.assignedAgent = undefined;
  order.assignedAt = undefined;

  await order.save();

  if (currentAgentId) {
    const agent = await Agent.findById(currentAgentId);
    if (agent) {
      agent.status = 'Available';
      await agent.save();
    }
  }

  await addTrackingEvent(order._id, 'Failed', userId);

  const populated = await Order.findById(order._id)
    .populate('assignedAgent', 'name phone')
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .populate('customer', 'name email');

  notifyCustomer(populated, 'OrderFailed', { failedReason });
  notifyAdmin('OrderFailed', { orderId: order._id, trackingId: order.trackingId, failedReason });

  return populated;
}

async function rescheduleOrder(orderId, newDate, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (['Delivered', 'Cancelled'].includes(order.status)) {
    const error = new Error('Cannot reschedule a delivered or cancelled order');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  if (order.status !== 'Failed') {
    const error = new Error('Cannot reschedule unless the order is in Failed status');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  if (order.customer.toString() !== userId) {
    const error = new Error('Not authorized to reschedule this order');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  order.rescheduleCount = (order.rescheduleCount || 0) + 1;
  order.rescheduledDate = new Date(newDate);
  order.status = 'Confirmed';

  const lastEntry = order.deliveryHistory[order.deliveryHistory.length - 1];
  if (lastEntry) {
    lastEntry.rescheduledDate = order.rescheduledDate;
  }

  await order.save();

  await addTrackingEvent(order._id, 'Rescheduled', userId);

  notifyCustomer(order, 'OrderRescheduled', { newDate: order.rescheduledDate ? order.rescheduledDate.toISOString().split('T')[0] : '' });

  await addTrackingEvent(order._id, 'Confirmed', userId);

  try {
    await assignOrder(order._id, userId);
    await addTrackingEvent(order._id, 'Reassigned', userId);
    return await Order.findById(order._id)
      .populate('assignedAgent', 'name phone')
      .populate('pickupArea', 'name')
      .populate('deliveryArea', 'name')
      .populate('customer', 'name email');
  } catch (err) {
    return await Order.findById(order._id)
      .populate('assignedAgent', 'name phone')
      .populate('pickupArea', 'name')
      .populate('deliveryArea', 'name')
      .populate('customer', 'name email');
  }
}

module.exports = {
  markAsFailed,
  rescheduleOrder,
};
