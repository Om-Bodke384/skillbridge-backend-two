const mongoose = require('mongoose');
const logger   = require('../utils/logger');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not defined in .env');

  const options = {
    maxPoolSize:              10,   // keep 10 connections open = reuse, no wait
    minPoolSize:               2,   // always keep 2 ready
    serverSelectionTimeoutMS: 5000, // fail fast if Atlas unreachable
    socketTimeoutMS:         30000,
    connectTimeoutMS:         5000,
    heartbeatFrequencyMS:    10000,
  };

  mongoose.connection.on('connected',    () => logger.info('✅ MongoDB Atlas connected'));
  mongoose.connection.on('error',   (err) => logger.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));

  await mongoose.connect(mongoUri, options);
};

module.exports = { connectDB };
