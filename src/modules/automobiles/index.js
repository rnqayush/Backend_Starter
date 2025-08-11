const express = require('express');

const router = express.Router();

// TODO: Add automobile routes when implemented
// router.use('/vehicles', vehicleRoutes);
// router.use('/rentals', rentalRoutes);
// router.use('/maintenance', maintenanceRoutes);

module.exports = {
  router,
  name: 'automobiles',
  version: '1.0.0',
  description: 'Automobile module for vehicle management, rentals, and maintenance'
};

