const { z } = require('zod');

const updateAreaSchema = z.object({
  name: z.string().trim().min(2, 'Area name must be at least 2 characters').optional(),
  city: z.string().trim().min(2, 'City must be at least 2 characters').optional(),
  state: z.string().trim().min(2, 'State must be at least 2 characters').optional(),
  pincode: z.string().trim().min(5, 'Pincode must be at least 5 characters').optional(),
  zone: z.string().min(1, 'Zone is required').optional(),
  isActive: z.boolean().optional(),
});

module.exports = updateAreaSchema;
