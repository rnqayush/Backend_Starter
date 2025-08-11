const express = require('express');

const router = express.Router();

// Import routes
const vehicleRoutes = require('./routes/vehicles');
const dealerRoutes = require('./routes/dealers');

// Use routes
router.use('/vehicles', vehicleRoutes);
router.use('/dealers', dealerRoutes);

// Module info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Automobiles module is working!',
    module: 'automobiles',
    version: '1.0.0',
    endpoints: {
      vehicles: '/api/automobiles/vehicles',
      dealers: '/api/automobiles/dealers'
    }
  });
});

module.exports = {
  router,
  name: 'automobiles',
  version: '1.0.0',
  description: 'Automobile module for vehicle management, dealer operations, and inventory'
};
