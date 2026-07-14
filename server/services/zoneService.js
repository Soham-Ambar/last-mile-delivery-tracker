const Zone = require('../models/Zone');
const httpStatus = require('../utils/httpStatus');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

async function createZone(data, userId) {
  const zone = new Zone({ ...data, createdBy: userId });
  return await zone.save();
}

async function getAllZones(query = {}) {
  const { page, limit, skip, sort, paginate } = parsePagination(query);
  const filter = { isActive: true };

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  if (paginate) {
    const [items, total] = await Promise.all([
      Zone.find(filter).sort(sort).skip(skip).limit(limit),
      Zone.countDocuments(filter),
    ]);
    return paginatedResponse(items, total, page, limit);
  }

  return await Zone.find(filter).sort('name');
}

async function getZoneById(zoneId) {
  const zone = await Zone.findById(zoneId);
  if (!zone || !zone.isActive) {
    const error = new Error('Zone not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  return zone;
}

async function updateZone(zoneId, data) {
  const zone = await Zone.findById(zoneId);
  if (!zone || !zone.isActive) {
    const error = new Error('Zone not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  Object.assign(zone, data);
  return await zone.save();
}

async function deleteZone(zoneId) {
  const zone = await Zone.findById(zoneId);
  if (!zone || !zone.isActive) {
    const error = new Error('Zone not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  zone.isActive = false;
  return await zone.save();
}

module.exports = {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
};
