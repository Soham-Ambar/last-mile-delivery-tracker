const { z } = require('zod');
const { ORDER_TYPES } = require('../models/Order');

const pricingEstimateSchema = z.object({
  sourceZone: z.string().min(1, 'Source zone is required'),
  destinationZone: z.string().min(1, 'Destination zone is required'),
  weight: z.number().min(0.1, 'Weight must be greater than 0'),
  length: z.number().min(0).optional(),
  breadth: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  paymentMode: z.enum(['Prepaid', 'COD'], { message: 'Invalid payment mode' }),
  orderType: z.enum(ORDER_TYPES, { message: 'Invalid order type' }).optional().default('B2C'),
});

module.exports = pricingEstimateSchema;
