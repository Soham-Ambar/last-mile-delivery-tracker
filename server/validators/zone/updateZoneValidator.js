const { z } = require('zod');

const updateZoneSchema = z.object({
  name: z.string().trim().min(3, 'Zone name must be at least 3 characters').optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

module.exports = updateZoneSchema;
