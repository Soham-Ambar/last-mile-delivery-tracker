const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
} = require('../services/zoneService');
const createZoneSchema = require('../validators/zone/createZoneValidator');
const updateZoneSchema = require('../validators/zone/updateZoneValidator');
const {
  ZONE_CREATED,
  ZONE_LISTED,
  ZONE_FETCHED,
  ZONE_UPDATED,
  ZONE_DELETED,
} = require('../constants/messages');

const createZoneHandler = asyncHandler(async (req, res) => {
  const validation = createZoneSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  const zone = await createZone(validation.data, req.user.id);
  return successResponse(res, ZONE_CREATED, zone, httpStatus.CREATED);
});

const getZonesHandler = asyncHandler(async (req, res) => {
  const zones = await getAllZones(req.query);
  return successResponse(res, ZONE_LISTED, zones, httpStatus.OK);
});

const getZoneHandler = asyncHandler(async (req, res) => {
  const zone = await getZoneById(req.params.zoneId);
  return successResponse(res, ZONE_FETCHED, zone, httpStatus.OK);
});

const updateZoneHandler = asyncHandler(async (req, res) => {
  const validation = updateZoneSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  const zone = await updateZone(req.params.zoneId, validation.data);
  return successResponse(res, ZONE_UPDATED, zone, httpStatus.OK);
});

const deleteZoneHandler = asyncHandler(async (req, res) => {
  await deleteZone(req.params.zoneId);
  return successResponse(res, ZONE_DELETED, null, httpStatus.OK);
});

module.exports = {
  createZoneHandler,
  getZonesHandler,
  getZoneHandler,
  updateZoneHandler,
  deleteZoneHandler,
};
