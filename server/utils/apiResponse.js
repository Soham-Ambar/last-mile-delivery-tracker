const httpStatus = require('./httpStatus');

function successResponse(res, message, data = null, statusCode = httpStatus.OK) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message, statusCode = httpStatus.INTERNAL_SERVER_ERROR, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
