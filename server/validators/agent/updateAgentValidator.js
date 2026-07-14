const { z } = require('zod');
const { VEHICLE_TYPES, AGENT_STATUSES } = require('../../models/Agent');

const updateAgentSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().trim().min(8, 'Phone must be at least 8 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  assignedAreas: z.array(z.string().min(1)).optional(),
  vehicleType: z.enum(VEHICLE_TYPES, { message: 'Invalid vehicle type' }).optional(),
  status: z.enum(AGENT_STATUSES).optional(),
  isActive: z.boolean().optional(),
});

module.exports = updateAgentSchema;
