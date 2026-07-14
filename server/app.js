const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { CLIENT_URL, NODE_ENV } = require('./config/env');
const { successResponse } = require('./utils/apiResponse');
const httpStatus = require('./utils/httpStatus');
const errorHandler = require('./middleware/errorHandler');
const sanitize = require('./middleware/sanitize');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const zoneRoutes = require('./routes/zoneRoutes');
const areaRoutes = require('./routes/areaRoutes');
const rateCardRoutes = require('./routes/rateCardRoutes');
const agentRoutes = require('./routes/agentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(sanitize);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 200 : 1000,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

app.get('/api/v1/health', (_req, res) => {
  successResponse(res, 'Server is healthy', { status: 'ok' }, httpStatus.OK);
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/zones', zoneRoutes);
app.use('/api/v1/areas', areaRoutes);
app.use('/api/v1/rate-cards', rateCardRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.use((req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = httpStatus.NOT_FOUND;
  next(error);
});

app.use(errorHandler);

logger.info('Application initialized');

module.exports = app;
