const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = require('./env');
const logger = require('../utils/logger');

async function connectDatabase() {
  if (!MONGO_URI) {
    logger.warn('MONGO_URI is not configured. Starting without a database connection.');
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: NODE_ENV !== 'production',
    });
    logger.info('MongoDB connected');
    return mongoose.connection;
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    return null;
  }
}

module.exports = { connectDatabase };
