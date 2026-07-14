const Area = require('../models/Area');
const httpStatus = require('../utils/httpStatus');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

async function createArea(data, userId) {
  const area = new Area({ ...data, createdBy: userId });
  return await area.save();
}

async function getAllAreas(query = {}) {
  const { page, limit, skip, sort, paginate } = parsePagination(query);
  const filter = { isActive: true };

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  if (query.zone) {
    filter.zone = query.zone;
  }

  if (paginate) {
    const [items, total] = await Promise.all([
      Area.find(filter).populate('zone', 'name').sort(sort).skip(skip).limit(limit),
      Area.countDocuments(filter),
    ]);
    return paginatedResponse(items, total, page, limit);
  }

  return await Area.find({ isActive: true }).populate('zone', 'name').sort('name');
}

async function getAreaById(areaId) {
  const area = await Area.findById(areaId).populate('zone', 'name');
  if (!area || !area.isActive) {
    const error = new Error('Area not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  return area;
}

async function updateArea(areaId, data) {
  const area = await Area.findById(areaId);
  if (!area || !area.isActive) {
    const error = new Error('Area not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  Object.assign(area, data);
  return await area.save();
}

async function deleteArea(areaId) {
  const area = await Area.findById(areaId);
  if (!area || !area.isActive) {
    const error = new Error('Area not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
  area.isActive = false;
  return await area.save();
}

async function getActiveAreas() {
  return await Area.find({ isActive: true })
    .populate('zone', 'name')
    .sort({ name: 1 });
}

module.exports = {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
  getActiveAreas,
};
