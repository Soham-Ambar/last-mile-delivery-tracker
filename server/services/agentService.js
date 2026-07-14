const Agent = require('../models/Agent');
const Area = require('../models/Area');
const { hashPassword } = require('../utils/hash');
const httpStatus = require('../utils/httpStatus');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

async function verifyAreasExist(areaIds) {
  if (!areaIds || areaIds.length === 0) return;

  const areas = await Area.find({ _id: { $in: areaIds }, isActive: true });
  if (areas.length !== areaIds.length) {
    const error = new Error('One or more areas not found or inactive');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
}

async function checkDuplicateEmail(email, excludeId) {
  const filter = { email: email.toLowerCase() };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Agent.findOne(filter);
  if (existing) {
    const error = new Error('An agent with this email already exists');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }
}

async function checkDuplicatePhone(phone, excludeId) {
  const filter = { phone };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Agent.findOne(filter);
  if (existing) {
    const error = new Error('An agent with this phone already exists');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }
}

async function createAgent(data, userId) {
  await checkDuplicateEmail(data.email);
  await checkDuplicatePhone(data.phone);
  await verifyAreasExist(data.assignedAreas);

  const hashedPassword = await hashPassword(data.password);
  const agent = new Agent({
    ...data,
    password: hashedPassword,
    createdBy: userId,
  });

  const saved = await agent.save();
  const { password, ...agentData } = saved.toObject();
  return agentData;
}

async function getAllAgents(query = {}) {
  const { page, limit, skip, sort, paginate } = parsePagination(query);
  const filter = { isActive: true };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ];
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.vehicleType) {
    filter.vehicleType = query.vehicleType;
  }

  if (paginate) {
    const [items, total] = await Promise.all([
      Agent.find(filter).select('-password').populate('assignedAreas', 'name city').sort(sort).skip(skip).limit(limit),
      Agent.countDocuments(filter),
    ]);
    return paginatedResponse(items, total, page, limit);
  }

  return await Agent.find({ isActive: true })
    .select('-password')
    .populate('assignedAreas', 'name city')
    .sort('name');
}

async function getAgentById(agentId) {
  const agent = await Agent.findById(agentId)
    .select('-password')
    .populate('assignedAreas', 'name city');

  if (!agent || !agent.isActive) {
    const error = new Error('Agent not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return agent;
}

async function updateAgent(agentId, data) {
  const agent = await Agent.findById(agentId).select('+password');
  if (!agent || !agent.isActive) {
    const error = new Error('Agent not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  if (data.email && data.email.toLowerCase() !== agent.email) {
    await checkDuplicateEmail(data.email, agentId);
  }
  if (data.phone && data.phone !== agent.phone) {
    await checkDuplicatePhone(data.phone, agentId);
  }
  if (data.assignedAreas) {
    await verifyAreasExist(data.assignedAreas);
  }
  if (data.password) {
    data.password = await hashPassword(data.password);
  }

  Object.assign(agent, data);
  const saved = await agent.save();
  const { password, ...agentData } = saved.toObject();
  return agentData;
}

async function deleteAgent(agentId) {
  const agent = await Agent.findById(agentId);
  if (!agent || !agent.isActive) {
    const error = new Error('Agent not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  agent.isActive = false;
  await agent.save();
  return { id: agentId };
}

async function assignAreas(agentId, areaIds) {
  const agent = await Agent.findById(agentId).select('-password');
  if (!agent || !agent.isActive) {
    const error = new Error('Agent not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  await verifyAreasExist(areaIds);
  agent.assignedAreas = areaIds;
  const saved = await agent.save();
  return await Agent.findById(saved._id).select('-password').populate('assignedAreas', 'name city');
}

async function changeStatus(agentId, status) {
  const agent = await Agent.findById(agentId).select('-password');
  if (!agent || !agent.isActive) {
    const error = new Error('Agent not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  agent.status = status;
  const saved = await agent.save();
  return saved;
}

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  assignAreas,
  changeStatus,
};
