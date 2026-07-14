const { z } = require('zod');
const { PACKAGE_TYPES, PAYMENT_MODES, ORDER_TYPES } = require('../../models/Order');

const createOrderSchema = z.object({
  pickupName: z.string().trim().min(2, 'Pickup name must be at least 2 characters'),
  pickupPhone: z.string().trim().min(8, 'Pickup phone must be at least 8 characters'),
  pickupAddress: z.string().trim().min(5, 'Pickup address must be at least 5 characters'),
  pickupArea: z.string().min(1, 'Pickup area is required'),
  receiverName: z.string().trim().min(2, 'Receiver name must be at least 2 characters'),
  receiverPhone: z.string().trim().min(8, 'Receiver phone must be at least 8 characters'),
  receiverAddress: z.string().trim().min(5, 'Receiver address must be at least 5 characters'),
  deliveryArea: z.string().min(1, 'Delivery area is required'),
  parcelType: z.enum(PACKAGE_TYPES, { message: 'Invalid parcel type' }),
  parcelWeight: z.number().min(0.1, 'Parcel weight must be greater than 0'),
  length: z.number().min(0).optional(),
  breadth: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  orderType: z.enum(ORDER_TYPES, { message: 'Invalid order type' }).optional().default('B2C'),
  paymentMode: z.enum(PAYMENT_MODES, { message: 'Invalid payment mode' }),
  notes: z.string().trim().optional(),
});

module.exports = createOrderSchema;
