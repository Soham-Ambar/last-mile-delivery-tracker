const mongoose = require('mongoose');

const TRACKING_STATUSES = [
  'Pending', 'Confirmed', 'Assigned', 'PickedUp',
  'InTransit', 'OutForDelivery', 'Failed', 'Rescheduled',
  'Reassigned', 'Delivered', 'Cancelled',
];

const trackingEventSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    status: {
      type: String,
      enum: TRACKING_STATUSES,
      required: true,
    },
    message: { type: String, trim: true },
    location: { type: String, trim: true },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

trackingEventSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('TrackingEvent', trackingEventSchema);
module.exports.TRACKING_STATUSES = TRACKING_STATUSES;
