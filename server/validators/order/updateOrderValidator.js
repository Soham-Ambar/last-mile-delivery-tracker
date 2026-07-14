const { z } = require('zod');

const updateOrderSchema = z.object({
  status: z.string().optional(),
  assignedAgent: z.string().optional(),
  notes: z.string().trim().optional(),
});

module.exports = updateOrderSchema;
