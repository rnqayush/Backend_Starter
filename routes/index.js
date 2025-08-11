const express = require('express');
const authRoutes = require('./auth');
const hotelRoutes = require('./hotels');
const roomRoutes = require('./rooms');
const bookingRoutes = require('./bookings');
const reviewRoutes = require('./reviews');

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel Management API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

