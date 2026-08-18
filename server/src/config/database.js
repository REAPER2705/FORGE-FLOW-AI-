// MongoDB Database Configuration
// Connects to MongoDB using Mongoose

import mongoose from 'mongoose';
import config from './env.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected successfully');
    console.log(`  URI: ${config.mongodbUri}`);
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection failed');
    console.error(`  Error: ${error.message}`);
    console.warn('  Application will continue without database. Some features may be unavailable.');
    return false;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ MongoDB disconnection error:', error.message);
  }
};

export default connectDatabase;
