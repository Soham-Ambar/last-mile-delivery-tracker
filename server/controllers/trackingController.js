const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const { getTimeline } = require('../services/trackingService');
const { getOrderById } = require('../services/orderService');

const getTrackingTimelineHandler = asyncHandler(async (req, res) => {
  try {
    const order = await getOrderById(req.params.id, req.user.id, req.user.role);
    const timeline = await getTimeline(order._id);
    return successResponse(res, 'Tracking timeline fetched successfully', timeline, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  getTrackingTimelineHandler,
};
