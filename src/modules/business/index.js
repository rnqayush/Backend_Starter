const express = require('express');

const router = express.Router();

// TODO: Add business routes when implemented
// router.use('/companies', companyRoutes);
// router.use('/services', serviceRoutes);
// router.use('/appointments', appointmentRoutes);

module.exports = {
  router,
  name: 'business',
  version: '1.0.0',
  description: 'Business module for company management, services, and appointments'
};

