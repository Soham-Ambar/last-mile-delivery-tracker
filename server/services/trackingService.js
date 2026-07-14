const TrackingEvent = require('../models/TrackingEvent');
const Order = require('../models/Order');
const httpStatus = require('../utils/httpStatus');

const STATUS_MESSAGES = {
  Pending: 'Order has been placed',
  Confirmed: 'Order has been confirmed',
  Assigned: 'Delivery agent has been assigned',
  PickedUp: 'Parcel has been picked up',
  InTransit: 'Parcel is in transit',
  OutForDelivery: 'Parcel is out for delivery',
  Failed: 'Delivery attempt failed',
  Rescheduled: 'Delivery has been rescheduled',
  Reassigned: 'Delivery agent has been reassigned',
  Delivered: 'Parcel has been delivered successfully',
  Cancelled: 'Order has been cancelled',
};

async function addTrackingEvent(orderId, status, userId, location) {
  const message = STATUS_MESSAGES[status] || `Status changed to ${status}`;

  const event = new TrackingEvent({
    order: orderId,
    status,
    message,
    location,
    updatedBy: userId,
  });

  return await event.save();
}

async function getTimeline(orderId) {
  return await TrackingEvent.find({ order: orderId })
    .sort('createdAt');
}

async function latestStatus(orderId) {
  const event = await TrackingEvent.findOne({ order: orderId })
    .sort('-createdAt')
    .lean();
  return event ? event.status : null;
}

module.exports = {
  addTrackingEvent,
  getTimeline,
  latestStatus,
};
