const mongoose = require('mongoose');

const VEHICLE_TYPES = ['Bike', 'Scooter', 'Car', 'Van'];
const AGENT_STATUSES = ['Available', 'Busy', 'Offline'];

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    assignedAreas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area',
      },
    ],
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: AGENT_STATUSES,
      default: 'Available',
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

agentSchema.index({ status: 1 });

module.exports = mongoose.model('Agent', agentSchema);
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
module.exports.AGENT_STATUSES = AGENT_STATUSES;
