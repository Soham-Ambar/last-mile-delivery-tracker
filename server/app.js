const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { CLIENT_URL } = require('./config/env');
const { successResponse } = require('./utils/apiResponse');
const httpStatus = require('./utils/httpStatus');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/v1/health', (_req, res) => {
  successResponse(res, 'Server is healthy', { status: 'ok' }, httpStatus.OK);
});

app.use('/api/v1/auth', authRoutes);

app.use((req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = httpStatus.NOT_FOUND;
  next(error);
});

app.use(errorHandler);

logger.info('Application initialized');

module.exports = app;
