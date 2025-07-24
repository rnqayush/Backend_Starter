import express from 'express';
import { formatResponse } from '../utils/responseFormatter.js';
import { config } from '../config/config.js';

const router = express.Router();

// @desc    Test API endpoint
// @route   GET /api/test/ping
// @access  Public
router.get('/ping', (req, res) => {
  res.status(200).json(
    formatResponse(true, 'API working', {
      message: 'Multivendor Backend API is running successfully!',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '1.0.0',
    })
  );
});

// @desc    Health check endpoint
// @route   GET /api/test/health
// @access  Public
router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };

  res.status(200).json(
    formatResponse(true, 'Health check passed', healthCheck)
  );
});

// @desc    Database connection test
// @route   GET /api/test/db
// @access  Public
router.get('/db', async (req, res) => {
  try {
    const mongoose = await import('mongoose');
    const connectionState = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbStatus = {
      status: states[connectionState],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections),
    };

    if (connectionState === 1) {
      res.status(200).json(
        formatResponse(true, 'Database connection is healthy', dbStatus)
      );
    } else {
      res.status(503).json(
        formatResponse(false, 'Database connection issue', dbStatus)
      );
    }
  } catch (error) {
    res.status(500).json(
      formatResponse(false, 'Database connection test failed', {
        error: error.message,
      })
    );
  }
});

export default router;

