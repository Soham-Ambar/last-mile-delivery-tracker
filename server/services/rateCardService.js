const RateCard = require('../models/RateCard');
const Zone = require('../models/Zone');
const httpStatus = require('../utils/httpStatus');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

async function verifyZoneExists(id) {
  const zone = await Zone.findById(id);
  if (!zone || !zone.isActive) {
    const error = new Error(`Zone not found or inactive`);
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }
}

async function checkDuplicate(sourceZone, destinationZone, excludeId) {
  const filter = { sourceZone, destinationZone, isActive: true };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const existing = await RateCard.findOne(filter);
  if (existing) {
    const error = new Error('A rate card already exists for this source and destination zone combination');
    error.statusCode = httpStatus.CONFLICT;
    throw error;
  }
}

function normalizePricing(data) {
  const d = { ...data };
  if (!d.pricing && d.baseRate !== undefined) {
    d.pricing = {
      b2b: {
        baseRate: d.baseRate,
        ratePerKg: d.ratePerKg,
        minimumCharge: d.minimumCharge,
        codCharge: d.codCharge,
      },
      b2c: {
        baseRate: d.baseRate,
        ratePerKg: d.ratePerKg,
        minimumCharge: d.minimumCharge,
        codCharge: d.codCharge,
      },
    };
  }
  delete d.baseRate;
  delete d.ratePerKg;
  delete d.minimumCharge;
  delete d.codCharge;
  return d;
}

async function createRateCard(data, userId) {
  await verifyZoneExists(data.sourceZone);
  await verifyZoneExists(data.destinationZone);
  await checkDuplicate(data.sourceZone, data.destinationZone);

  const normalized = normalizePricing(data);
  const rateCard = new RateCard({ ...normalized, createdBy: userId });
  return await rateCard.save();
}

async function getAllRateCards(query = {}) {
  const { page, limit, skip, sort, paginate } = parsePagination(query);
  const filter = { isActive: true };

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }
  if (query.sourceZone) filter.sourceZone = query.sourceZone;
  if (query.destinationZone) filter.destinationZone = query.destinationZone;

  if (paginate) {
    const [items, total] = await Promise.all([
      RateCard.find(filter).populate('sourceZone', 'name').populate('destinationZone', 'name').sort(sort).skip(skip).limit(limit),
      RateCard.countDocuments(filter),
    ]);
    return paginatedResponse(items, total, page, limit);
  }

  return await RateCard.find({ isActive: true })
    .populate('sourceZone', 'name')
    .populate('destinationZone', 'name')
    .sort('name');
}

async function getRateCardById(rateCardId) {
  const rateCard = await RateCard.findById(rateCardId)
    .populate('sourceZone', 'name')
    .populate('destinationZone', 'name');

  if (!rateCard || !rateCard.isActive) {
    const error = new Error('Rate card not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  return rateCard;
}

async function updateRateCard(rateCardId, data) {
  const rateCard = await RateCard.findById(rateCardId);
  if (!rateCard || !rateCard.isActive) {
    const error = new Error('Rate card not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  const sourceZone = data.sourceZone || rateCard.sourceZone.toString();
  const destinationZone = data.destinationZone || rateCard.destinationZone.toString();

  if (data.sourceZone) await verifyZoneExists(data.sourceZone);
  if (data.destinationZone) await verifyZoneExists(data.destinationZone);
  await checkDuplicate(sourceZone, destinationZone, rateCardId);

  const normalized = normalizePricing(data);
  Object.assign(rateCard, normalized);
  return await rateCard.save();
}

async function deleteRateCard(rateCardId) {
  const rateCard = await RateCard.findById(rateCardId);
  if (!rateCard || !rateCard.isActive) {
    const error = new Error('Rate card not found');
    error.statusCode = httpStatus.NOT_FOUND;
    throw error;
  }

  rateCard.isActive = false;
  return await rateCard.save();
}

module.exports = {
  createRateCard,
  getAllRateCards,
  getRateCardById,
  updateRateCard,
  deleteRateCard,
};
