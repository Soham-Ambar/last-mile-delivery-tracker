const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const { getDashboardData } = require('../services/analyticsService');

const getDashboardHandler = asyncHandler(async (req, res) => {
  const { range, startDate, endDate } = req.query;
  const data = await getDashboardData(range, startDate, endDate);
  return successResponse(res, 'Dashboard data fetched', data, httpStatus.OK);
});

module.exports = { getDashboardHandler };