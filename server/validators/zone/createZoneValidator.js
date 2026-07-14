const { z } = require('zod');

const createZoneSchema = z.object({
  name: z.string().trim().min(3, 'Zone name must be at least 3 characters'),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

module.exports = createZoneSchema;
