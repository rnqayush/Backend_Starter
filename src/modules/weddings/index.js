const express = require('express');

const router = express.Router();

// TODO: Add wedding routes when implemented
// router.use('/venues', venueRoutes);
// router.use('/vendors', vendorRoutes);
// router.use('/events', eventRoutes);

module.exports = {
  router,
  name: 'weddings',
  version: '1.0.0',
  description: 'Wedding module for venue management, vendor services, and event planning'
};

