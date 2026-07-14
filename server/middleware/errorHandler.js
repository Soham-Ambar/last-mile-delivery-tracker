const { NODE_ENV } = require('../config/env');
const httpStatus = require('../utils/httpStatus');
const logger = require('../utils/logger');

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.expose || statusCode < 500 ? err.message : 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error(err.message, { statusCode, stack: err.stack });
  } else {
    logger.warn(err.message, { statusCode });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV !== 'production' && { errors: err.stack }),
  });
}

module.exports = errorHandler;
