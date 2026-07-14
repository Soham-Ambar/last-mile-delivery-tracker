const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    baseRate: { type: Number, required: true, min: 0 },
    ratePerKg: { type: Number, required: true, min: 0 },
    minimumCharge: { type: Number, required: true, min: 0 },
    codCharge: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const rateCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    sourceZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    destinationZone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Zone',
      required: true,
    },
    pricing: {
      b2b: { type: pricingSchema },
      b2c: { type: pricingSchema },
    },
    baseRate: { type: Number, min: 0 },
    ratePerKg: { type: Number, min: 0 },
    minimumCharge: { type: Number, min: 0 },
    codCharge: { type: Number, min: 0 },
    estimatedDeliveryDays: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

rateCardSchema.index({ sourceZone: 1, destinationZone: 1, isActive: 1 });

module.exports = mongoose.model('RateCard', rateCardSchema);
