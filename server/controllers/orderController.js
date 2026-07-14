const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  createOrder,
  getCustomerOrders,
  getOrderById,
  getAllOrders,
  updateOrder,
  cancelOrder,
} = require('../services/orderService');
const {
  assignOrder,
  manualAssignOrder,
  unassignOrder,
} = require('../services/assignmentService');
const { markAsFailed, rescheduleOrder } = require('../services/failedDeliveryService');
const createOrderSchema = require('../validators/order/createOrderValidator');
const adminCreateOrderSchema = require('../validators/order/adminCreateOrderValidator');
const updateOrderSchema = require('../validators/order/updateOrderValidator');
const markFailedSchema = require('../validators/order/markFailedValidator');
const rescheduleSchema = require('../validators/order/rescheduleValidator');
const {
  ORDER_CREATED,
  ORDER_LISTED,
  ORDER_FETCHED,
  ORDER_UPDATED,
  ORDER_CANCELLED,
  ORDER_ASSIGNED,
  ORDER_AUTO_ASSIGNED,
  ORDER_UNASSIGNED,
  ORDER_FAILED,
  ORDER_RESCHEDULED,
} = require('../constants/messages');

const createOrderHandler = asyncHandler(async (req, res) => {
  const validation = createOrderSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const order = await createOrder(validation.data, req.user.id);
    return successResponse(res, ORDER_CREATED, order, httpStatus.CREATED);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const getMyOrdersHandler = asyncHandler(async (req, res) => {
  const orders = await getCustomerOrders(req.user.id);
  return successResponse(res, ORDER_LISTED, orders, httpStatus.OK);
});

const getOrderHandler = asyncHandler(async (req, res) => {
  try {
    const order = await getOrderById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, ORDER_FETCHED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const getAllOrdersHandler = asyncHandler(async (req, res) => {
  const orders = await getAllOrders(req.query);
  return successResponse(res, ORDER_LISTED, orders, httpStatus.OK);
});

const updateOrderHandler = asyncHandler(async (req, res) => {
  const validation = updateOrderSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const order = await updateOrder(req.params.id, validation.data, req.user.id);
    return successResponse(res, ORDER_UPDATED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const cancelOrderHandler = asyncHandler(async (req, res) => {
  try {
    const order = await cancelOrder(req.params.id, req.user.id);
    return successResponse(res, ORDER_CANCELLED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const adminCreateOrderHandler = asyncHandler(async (req, res) => {
  const validation = adminCreateOrderSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const order = await createOrder(validation.data, validation.data.customerId);
    return successResponse(res, ORDER_CREATED, order, httpStatus.CREATED);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const assignOrderHandler = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  if (!agentId) {
    return errorResponse(res, 'agentId is required', httpStatus.BAD_REQUEST);
  }

  try {
    const order = await manualAssignOrder(req.params.id, agentId, req.user.id);
    return successResponse(res, ORDER_ASSIGNED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const autoAssignOrderHandler = asyncHandler(async (req, res) => {
  try {
    const order = await assignOrder(req.params.id, req.user.id);
    return successResponse(res, ORDER_AUTO_ASSIGNED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const unassignOrderHandler = asyncHandler(async (req, res) => {
  try {
    const order = await unassignOrder(req.params.id, req.user.id);
    return successResponse(res, ORDER_UNASSIGNED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const markFailedHandler = asyncHandler(async (req, res) => {
  const validation = markFailedSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const order = await markAsFailed(req.params.id, validation.data.failedReason, req.user.id);
    return successResponse(res, ORDER_FAILED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const rescheduleHandler = asyncHandler(async (req, res) => {
  const validation = rescheduleSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const order = await rescheduleOrder(req.params.id, validation.data.newDate, req.user.id);
    return successResponse(res, ORDER_RESCHEDULED, order, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  createOrderHandler,
  adminCreateOrderHandler,
  getMyOrdersHandler,
  getOrderHandler,
  getAllOrdersHandler,
  updateOrderHandler,
  cancelOrderHandler,
  assignOrderHandler,
  autoAssignOrderHandler,
  unassignOrderHandler,
  markFailedHandler,
  rescheduleHandler,
};
