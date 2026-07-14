const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const { calculateDeliveryPrice } = require('../services/pricingService');
const pricingEstimateSchema = require('../validators/pricingEstimateValidator');

const pricingEstimateHandler = asyncHandler(async (req, res) => {
  const validation = pricingEstimateSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const pricing = await calculateDeliveryPrice(validation.data);
    return successResponse(res, 'Price estimated successfully', pricing, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  pricingEstimateHandler,
};
