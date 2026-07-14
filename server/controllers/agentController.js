const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  assignAreas,
  changeStatus,
} = require('../services/agentService');
const createAgentSchema = require('../validators/agent/createAgentValidator');
const updateAgentSchema = require('../validators/agent/updateAgentValidator');
const {
  AGENT_CREATED,
  AGENT_LISTED,
  AGENT_FETCHED,
  AGENT_UPDATED,
  AGENT_DELETED,
  AGENT_STATUS_UPDATED,
  AGENT_AREAS_UPDATED,
} = require('../constants/messages');

const createAgentHandler = asyncHandler(async (req, res) => {
  const validation = createAgentSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const agent = await createAgent(validation.data, req.user.id);
    return successResponse(res, AGENT_CREATED, agent, httpStatus.CREATED);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const getAgentsHandler = asyncHandler(async (req, res) => {
  const agents = await getAllAgents(req.query);
  return successResponse(res, AGENT_LISTED, agents, httpStatus.OK);
});

const getAgentHandler = asyncHandler(async (req, res) => {
  try {
    const agent = await getAgentById(req.params.id);
    return successResponse(res, AGENT_FETCHED, agent, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const updateAgentHandler = asyncHandler(async (req, res) => {
  const validation = updateAgentSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const agent = await updateAgent(req.params.id, validation.data);
    return successResponse(res, AGENT_UPDATED, agent, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const deleteAgentHandler = asyncHandler(async (req, res) => {
  try {
    await deleteAgent(req.params.id);
    return successResponse(res, AGENT_DELETED, null, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const updateStatusHandler = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return errorResponse(res, 'Status is required', httpStatus.BAD_REQUEST);
  }

  const validStatuses = ['Available', 'Busy', 'Offline'];
  if (!validStatuses.includes(status)) {
    return errorResponse(res, 'Invalid status value', httpStatus.BAD_REQUEST);
  }

  try {
    const agent = await changeStatus(req.params.id, status);
    return successResponse(res, AGENT_STATUS_UPDATED, agent, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const updateAreasHandler = asyncHandler(async (req, res) => {
  const { assignedAreas } = req.body;
  if (!assignedAreas || !Array.isArray(assignedAreas)) {
    return errorResponse(res, 'assignedAreas array is required', httpStatus.BAD_REQUEST);
  }

  try {
    const agent = await assignAreas(req.params.id, assignedAreas);
    return successResponse(res, AGENT_AREAS_UPDATED, agent, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  createAgentHandler,
  getAgentsHandler,
  getAgentHandler,
  updateAgentHandler,
  deleteAgentHandler,
  updateStatusHandler,
  updateAreasHandler,
};
