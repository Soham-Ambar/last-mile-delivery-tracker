const { z } = require('zod');
const { VEHICLE_TYPES, AGENT_STATUSES } = require('../../models/Agent');

const createAgentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim().min(8, 'Phone must be at least 8 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  assignedAreas: z.array(z.string().min(1)).optional().default([]),
  vehicleType: z.enum(VEHICLE_TYPES, { message: 'Invalid vehicle type' }),
  status: z.enum(AGENT_STATUSES).optional(),
});

module.exports = createAgentSchema;
