const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  createArea,
  getAllAreas,
  getAreaById,
  updateArea,
  deleteArea,
  getActiveAreas,
} = require('../services/areaService');
const createAreaSchema = require('../validators/area/createAreaValidator');
const updateAreaSchema = require('../validators/area/updateAreaValidator');
const {
  AREA_CREATED,
  AREA_LISTED,
  AREA_FETCHED,
  AREA_UPDATED,
  AREA_DELETED,
} = require('../constants/messages');

const createAreaHandler = asyncHandler(async (req, res) => {
  const validation = createAreaSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  const area = await createArea(validation.data, req.user.id);
  return successResponse(res, AREA_CREATED, area, httpStatus.CREATED);
});

const getAreasHandler = asyncHandler(async (req, res) => {
  const areas = await getAllAreas(req.query);
  return successResponse(res, AREA_LISTED, areas, httpStatus.OK);
});

const getAreaHandler = asyncHandler(async (req, res) => {
  const area = await getAreaById(req.params.areaId);
  return successResponse(res, AREA_FETCHED, area, httpStatus.OK);
});

const updateAreaHandler = asyncHandler(async (req, res) => {
  const validation = updateAreaSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  const area = await updateArea(req.params.areaId, validation.data);
  return successResponse(res, AREA_UPDATED, area, httpStatus.OK);
});

const deleteAreaHandler = asyncHandler(async (req, res) => {
  await deleteArea(req.params.areaId);
  return successResponse(res, AREA_DELETED, null, httpStatus.OK);
});

const getActiveAreasHandler = asyncHandler(async (_req, res) => {
  const areas = await getActiveAreas();
  return successResponse(res, 'Active areas fetched', areas, httpStatus.OK);
});

module.exports = {
  createAreaHandler,
  getAreasHandler,
  getAreaHandler,
  updateAreaHandler,
  deleteAreaHandler,
  getActiveAreasHandler,
};
