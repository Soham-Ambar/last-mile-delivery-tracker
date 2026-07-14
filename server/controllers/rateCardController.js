const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const httpStatus = require('../utils/httpStatus');
const {
  createRateCard,
  getAllRateCards,
  getRateCardById,
  updateRateCard,
  deleteRateCard,
} = require('../services/rateCardService');
const createRateCardSchema = require('../validators/rateCard/createRateCardValidator');
const updateRateCardSchema = require('../validators/rateCard/updateRateCardValidator');
const {
  RATE_CARD_CREATED,
  RATE_CARD_LISTED,
  RATE_CARD_FETCHED,
  RATE_CARD_UPDATED,
  RATE_CARD_DELETED,
} = require('../constants/messages');

const createRateCardHandler = asyncHandler(async (req, res) => {
  const validation = createRateCardSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const rateCard = await createRateCard(validation.data, req.user.id);
    return successResponse(res, RATE_CARD_CREATED, rateCard, httpStatus.CREATED);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const getRateCardsHandler = asyncHandler(async (req, res) => {
  const rateCards = await getAllRateCards(req.query);
  return successResponse(res, RATE_CARD_LISTED, rateCards, httpStatus.OK);
});

const getRateCardHandler = asyncHandler(async (req, res) => {
  try {
    const rateCard = await getRateCardById(req.params.id);
    return successResponse(res, RATE_CARD_FETCHED, rateCard, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const updateRateCardHandler = asyncHandler(async (req, res) => {
  const validation = updateRateCardSchema.safeParse(req.body);
  if (!validation.success) {
    const errs = validation.error.issues || validation.error.errors || [];
    return errorResponse(res, errs[0]?.message || 'Validation failed', httpStatus.BAD_REQUEST, errs);
  }

  try {
    const rateCard = await updateRateCard(req.params.id, validation.data);
    return successResponse(res, RATE_CARD_UPDATED, rateCard, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

const deleteRateCardHandler = asyncHandler(async (req, res) => {
  try {
    await deleteRateCard(req.params.id);
    return successResponse(res, RATE_CARD_DELETED, null, httpStatus.OK);
  } catch (error) {
    return errorResponse(res, error.message, error.statusCode || httpStatus.INTERNAL_SERVER_ERROR);
  }
});

module.exports = {
  createRateCardHandler,
  getRateCardsHandler,
  getRateCardHandler,
  updateRateCardHandler,
  deleteRateCardHandler,
};
