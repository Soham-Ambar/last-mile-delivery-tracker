const { z } = require('zod');

const createAreaSchema = z.object({
  name: z.string().trim().min(2, 'Area name must be at least 2 characters'),
  city: z.string().trim().min(2, 'City must be at least 2 characters'),
  state: z.string().trim().min(2, 'State must be at least 2 characters'),
  pincode: z.string().trim().min(5, 'Pincode must be at least 5 characters'),
  zone: z.string().min(1, 'Zone is required'),
});

module.exports = createAreaSchema;
