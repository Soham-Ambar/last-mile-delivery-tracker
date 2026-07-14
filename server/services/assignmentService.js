const Order = require('../models/Order');
const Agent = require('../models/Agent');
const Area = require('../models/Area');
const { addTrackingEvent } = require('./trackingService');
const { notifyCustomer, notifyAgentByOrder } = require('./notificationService');
const httpStatus = require('../utils/httpStatus');

function getActiveOrderStatuses() {
  return ['Assigned', 'Confirmed', 'PickedUp', 'InTransit', 'OutForDelivery'];
}

async function findBestAgent(order) {
  const deliveryAreaId = order.deliveryArea;

  const deliveryArea = await Area.findById(deliveryAreaId);
  if (!deliveryArea) {
    const error = new Error('Delivery area not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const deliveryZoneId = deliveryArea.zone;

  const areasInZone = await Area.find({ zone: deliveryZoneId, isActive: true }).select('_id');
  const areaIdsInZone = areasInZone.map((a) => a._id);

  let eligible = await Agent.find({
    isActive: true,
    status: 'Available',
    assignedAreas: deliveryAreaId,
  });

  if (eligible.length === 0) {
    eligible = await Agent.find({
      isActive: true,
      status: 'Available',
      assignedAreas: { $in: areaIdsInZone },
    });
  }

  if (eligible.length === 0) {
    const error = new Error('No available agent found for this delivery area');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const counts = await Promise.all(
    eligible.map(async (agent) => {
      const cnt = await Order.countDocuments({
        assignedAgent: agent._id,
        status: { $in: getActiveOrderStatuses() },
        isActive: true,
      });
      return { agent, count: cnt };
    })
  );

  counts.sort((a, b) => {
    if (a.count !== b.count) return a.count - b.count;
    return a.agent.createdAt - b.agent.createdAt;
  });

  return counts[0].agent;
}

async function assignOrder(orderId, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (['Delivered', 'Cancelled'].includes(order.status)) {
    const error = new Error('Cannot assign order in its current status');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  if (order.assignedAgent) {
    const error = new Error('Order is already assigned to an agent');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const agent = await findBestAgent(order);

  order.assignedAgent = agent._id;
  order.status = 'Assigned';
  order.assignedAt = new Date();
  await order.save();

  await addTrackingEvent(order._id, 'Assigned', userId);

  const populated = await Order.findById(order._id)
    .populate('assignedAgent', 'name phone')
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .populate('customer', 'name email');

  notifyCustomer(populated, 'OrderAssigned');
  notifyAgentByOrder(populated, 'OrderAssigned');

  return populated;
}

async function reassignOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (['Delivered', 'Cancelled'].includes(order.status)) {
    const error = new Error('Cannot reassign order in its current status');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  if (order.assignedAgent) {
    const currentAgent = await Agent.findById(order.assignedAgent);
    if (currentAgent) {
      currentAgent.status = 'Available';
      await currentAgent.save();
    }
  }

  const agent = await findBestAgent(order);

  order.assignedAgent = agent._id;
  order.status = 'Assigned';
  order.assignedAt = new Date();
  await order.save();

  return await Order.findById(order._id)
    .populate('assignedAgent', 'name phone')
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .populate('customer', 'name email');
}

async function manualAssignOrder(orderId, agentId, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (['Delivered', 'Cancelled'].includes(order.status)) {
    const error = new Error('Cannot assign order in its current status');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  if (order.assignedAgent) {
    const error = new Error('Order is already assigned to an agent');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const agent = await Agent.findById(agentId);
  if (!agent || !agent.isActive) {
    const error = new Error('Agent not found or inactive');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  order.assignedAgent = agent._id;
  order.status = 'Assigned';
  order.assignedAt = new Date();
  await order.save();

  await addTrackingEvent(order._id, 'Assigned', userId);

  const populated = await Order.findById(order._id)
    .populate('assignedAgent', 'name phone')
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .populate('customer', 'name email');

  notifyCustomer(populated, 'OrderAssigned');
  notifyAgentByOrder(populated, 'OrderAssigned');

  return populated;
}

async function unassignOrder(orderId, userId) {
  const order = await Order.findById(orderId);
  if (!order || !order.isActive) {
    const error = new Error('Order not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (!order.assignedAgent) {
    const error = new Error('Order has no assigned agent');
    error.statusCode = httpStatus.BAD_REQUEST;
    throw error;
  }

  const agentId = order.assignedAgent;

  order.assignedAgent = undefined;
  order.assignedAt = undefined;
  order.status = 'Confirmed';
  await order.save();

  const agent = await Agent.findById(agentId);
  if (agent) {
    agent.status = 'Available';
    await agent.save();
  }

  await addTrackingEvent(order._id, 'Confirmed', userId);

  const populated = await Order.findById(order._id)
    .populate('pickupArea', 'name')
    .populate('deliveryArea', 'name')
    .populate('customer', 'name email');

  notifyCustomer(populated, 'OrderUnassigned');

  return populated;
}

module.exports = {
  findBestAgent,
  assignOrder,
  reassignOrder,
  manualAssignOrder,
  unassignOrder,
};
