const { z } = require('zod');

const pricingFields = {
  baseRate: z.number().min(0, 'Base rate must be >= 0'),
  ratePerKg: z.number().min(0, 'Rate per kg must be >= 0'),
  minimumCharge: z.number().min(0, 'Minimum charge must be >= 0'),
  codCharge: z.number().min(0, 'COD charge must be >= 0'),
};

const createRateCardSchema = z
  .object({
    name: z.string().trim().min(3, 'Rate card name must be at least 3 characters'),
    sourceZone: z.string().min(1, 'Source zone is required'),
    destinationZone: z.string().min(1, 'Destination zone is required'),
    pricing: z
      .object({
        b2b: z.object(pricingFields).optional(),
        b2c: z.object(pricingFields).optional(),
      })
      .optional(),
    baseRate: z.number().min(0, 'Base rate must be >= 0').optional(),
    ratePerKg: z.number().min(0, 'Rate per kg must be >= 0').optional(),
    minimumCharge: z.number().min(0, 'Minimum charge must be >= 0').optional(),
    codCharge: z.number().min(0, 'COD charge must be >= 0').optional(),
    estimatedDeliveryDays: z.number().int().min(1, 'Estimated delivery days must be >= 1'),
  })
  .refine((data) => data.sourceZone !== data.destinationZone, {
    message: 'Source zone and destination zone cannot be the same',
    path: ['destinationZone'],
  });

module.exports = createRateCardSchema;
