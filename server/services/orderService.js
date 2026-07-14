const Order = require('../models/Order');
const Area = require('../models/Area');
const { calculateDeliveryPrice } = require('./pricingService');
const { addTrackingEvent } = require('./trackingService');
const { notifyCustomer, notifyAgentByOrder, notifyAdmin } = require('./notificationService');
const httpStatus = require('../utils/httpStatus');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

let counter = -1;

async function initCounter() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `LMD-${today}-`;
  const last = await Order.findOne({ trackingId: new RegExp(`^${prefix}`) })
    .sort({ trackingId: -1 })
    .select('trackingId')
    .lean();
  if (last) {
    const seq = parseInt(last.trackingId.slice(-6), 10);
    counter = seq;
  } else {
    counter = 0;
  }
}

async function generateTrackingId() {
  if (counter === -1) await initCounter();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  counter = (counter + 1) % 1000000;
  const seq = String(counter).padStart(6, '0');
  return `LMD-${dateStr}-${seq}`;
}

async function resetCounter() {
  counter = -1;
}

async function getAreaWithZone(areaId) {
  const area = await Area.findById(areaId).populate('zone', '_id name');
  if (!area || !area.isActive) {
    const error = new Error('Area not found or inactive');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  return area;
}

async function createOrder(data, userId) {
  const pickupArea = await getAreaWithZone(data.pickupArea);
  const deliveryArea = await getAreaWithZone(data.deliveryArea);

  const orderType = data.orderType || 'B2C';

  let pricing;
  try {
    pricing = await calculateDeliveryPrice({
      sourceZone: pickupArea.zone._id,
      destinationZone: deliveryArea.zone._id,
      weight: data.parcelWeight,
      length: data.length,
      breadth: data.breadth,
      height: data.height,
      paymentMode: data.paymentMode,
      orderType,
    });
  } catch (error) {
    if (error.statusCode === 404) {
      throw error;
    }
    throw error;
  }

  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    const trackingId = await generateTrackingId();

    const order = new Order({
      trackingId,
      customer: userId,
      pickupName: data.pickupName,
      pickupPhone: data.pickupPhone,
      pickupAddress: data.pickupAddress,
      pickupArea: data.pickupArea,
      pickupZone: pickupArea.zone._id,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      receiverAddress: data.receiverAddress,
      deliveryArea: data.deliveryArea,
      deliveryZone: deliveryArea.zone._id,
      parcelType: data.parcelType,
      parcelWeight: data.parcelWeight,
      length: data.length,
      breadth: data.breadth,
      height: data.height,
      actualWeight: pricing.actualWeight,
      volumetricWeight: pricing.volumetricWeight,
      chargeableWeight: pricing.chargeableWeight,
      orderType,
      paymentMode: data.paymentMode,
      priceBreakdown: {
        baseRate: pricing.baseRate,
        weightCharge: pricing.weightCharge,
        codCharge: pricing.codCharge,
        minimumChargeApplied: pricing.minimumChargeApplied,
        estimatedDeliveryDays: pricing.estimatedDeliveryDays,
        totalPrice: pricing.totalPrice,
      },
      totalPrice: pricing.totalPrice,
      notes: data.notes,
    });

    try {
      const saved = await order.save();
      await addTrackingEvent(saved._id, 'Pending', userId);
      notifyCustomer(saved, 'OrderCreated');
      notifyAdmin('OrderCreated', { orderId: saved._id, trackingId: saved.trackingId });
      return saved;
    } catch (err) {
      lastError = err;
      if (err.code !== 11000) throw err;
    }
  }
  throw lastError;
}

async function getCustomerOrders(userId) {
  return await Order.find({ customer: userId, isActive: true })
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .sort('-createdAt');
}

async function getOrderById(orderId, userId, userRole) {
  const order = await Order.findById(orderId)
    .populate('pickupArea', 'name city')
    .populate('deliveryArea', 'name city')
    .populate('customer', 'name email')
    .populate('assignedAgent', 'name phone');

  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (userRole !== 'admin' && order.customer._id.toString() !== userId) {
    const error = new Error('Not authorized to view this order');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  return order;
}

async function getAllOrders(query = {}) {
  const { page, limit, skip, sort, paginate } = parsePagination(query);
  const filter = { isActive: true };

  if (query.search) {
    filter.$or = [
      { trackingId: { $regex: query.search, $options: 'i' } },
      { pickupName: { $regex: query.search, $options: 'i' } },
      { receiverName: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.status) filter.status = query.status;
  if (query.customer) filter.customer = query.customer;
  if (query.assignedAgent) filter.assignedAgent = query.assignedAgent;

  if (paginate) {
    const [items, total] = await Promise.all([
      Order.find(filter)
        .populate('pickupArea', 'name')
        .populate('deliveryArea', 'name')
        .populate('customer', 'name email')
        .populate('assignedAgent', 'name phone')
        .sort(sort).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return paginatedResponse(items, total, page, limit);
  }

  return await Order.find({ isActive: true })
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .populate('customer', 'name email')
    .populate('assignedAgent', 'name phone')
    .sort('-createdAt');
}

async function updateOrder(orderId, data, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const prevStatus = order.status;
  Object.assign(order, data);
  const saved = await order.save();

  if (data.status && data.status !== prevStatus) {
    await addTrackingEvent(saved._id, data.status, userId);
    notifyCustomer(saved, 'OrderStatusChanged', { status: data.status });
    notifyAgentByOrder(saved, 'OrderStatusChanged');
    if (data.status === 'Delivered') {
      notifyCustomer(saved, 'OrderDelivered');
    }
  }

  return saved;
}

async function cancelOrder(orderId, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (order.customer.toString() !== userId) {
    const error = new Error('Not authorized to cancel this order');
    error.statusCode = httpStatus.FORBIDDEN;
    throw error;
  }

  if (!['Pending', 'Confirmed'].includes(order.status)) {
    const error = new Error('Order cannot be cancelled in its current status');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  order.status = 'Cancelled';
  const saved = await order.save();
  await addTrackingEvent(saved._id, 'Cancelled', userId);
  notifyCustomer(saved, 'OrderCancelled');
  notifyAdmin('OrderCancelled', { orderId: saved._id, trackingId: saved.trackingId });
  return saved;
}

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAllOrders,
  updateOrder,
  cancelOrder,
  resetCounter,
};
