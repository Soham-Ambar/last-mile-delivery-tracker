const { NODE_ENV } = require('../config/env');
const httpStatus = require('../utils/httpStatus');
const logger = require('../utils/logger');

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  logger.error(message, { statusCode, stack: err.stack });

  res.status(statusCode).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Internal Server Error' : message,
    errors: NODE_ENV === 'production' ? null : err.stack,
  });
}

module.exports = errorHandler;
