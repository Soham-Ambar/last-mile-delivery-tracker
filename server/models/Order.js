const mongoose = require('mongoose');

const PACKAGE_TYPES = ['Document', 'Electronics', 'Clothing', 'Food', 'Other'];
const PAYMENT_MODES = ['Prepaid', 'COD'];
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Assigned', 'PickedUp', 'InTransit', 'OutForDelivery', 'Failed', 'Delivered', 'Cancelled'];
const ORDER_TYPES = ['B2C', 'B2B'];

const deliveryHistoryEntrySchema = new mongoose.Schema(
  {
    attemptNumber: { type: Number, required: true },
    failedReason: { type: String, trim: true },
    failedAt: { type: Date },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
    rescheduledDate: { type: Date },
    completedAt: { type: Date },
  },
  { _id: false }
);

const priceBreakdownSchema = new mongoose.Schema(
  {
    baseRate: { type: Number, required: true },
    weightCharge: { type: Number, required: true },
    codCharge: { type: Number, default: 0 },
    minimumChargeApplied: { type: Boolean, default: false },
    estimatedDeliveryDays: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pickupName: { type: String, trim: true, required: true },
    pickupPhone: { type: String, trim: true, required: true },
    pickupAddress: { type: String, trim: true, required: true },
    pickupArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: true,
    },
    pickupZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    receiverName: { type: String, trim: true, required: true },
    receiverPhone: { type: String, trim: true, required: true },
    receiverAddress: { type: String, trim: true, required: true },
    deliveryArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      required: true,
    },
    deliveryZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    parcelType: {
      type: String,
      enum: PACKAGE_TYPES,
      required: true,
    },
    parcelWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    length: { type: Number, min: 0 },
    breadth: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    actualWeight: { type: Number, min: 0 },
    volumetricWeight: { type: Number, min: 0 },
    chargeableWeight: { type: Number, min: 0 },
    orderType: {
      type: String,
      enum: ORDER_TYPES,
      default: 'B2C',
    },
    paymentMode: {
      type: String,
      enum: PAYMENT_MODES,
      required: true,
    },
    priceBreakdown: { type: priceBreakdownSchema, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending',
    },
    deliveryAttempt: { type: Number, default: 0 },
    rescheduleCount: { type: Number, default: 0 },
    failedReason: { type: String, trim: true },
    rescheduledDate: { type: Date },
    lastFailedAt: { type: Date },
    deliveryHistory: [deliveryHistoryEntrySchema],
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },
    assignedAt: { type: Date },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.PACKAGE_TYPES = PACKAGE_TYPES;
module.exports.PAYMENT_MODES = PAYMENT_MODES;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.ORDER_TYPES = ORDER_TYPES;
