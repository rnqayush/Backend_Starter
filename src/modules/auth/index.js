const express = require('express');
const authRoutes = require('./routes/auth');

const router = express.Router();

// Mount auth routes
router.use('/auth', authRoutes);

module.exports = {
  router,
  name: 'auth',
  version: '1.0.0',
  description: 'Authentication module for user registration, login, and authorization'
};

