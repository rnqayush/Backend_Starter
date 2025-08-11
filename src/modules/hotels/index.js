const express = require('express');
const hotelRoutes = require('./routes/hotels');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');

const router = express.Router();

// Mount hotel-related routes
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);

module.exports = {
  router,
  name: 'hotels',
  version: '1.0.0',
  description: 'Hotel management module with rooms, bookings, and reviews functionality'
};

