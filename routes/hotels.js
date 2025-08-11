const express = require('express');
const router = express.Router();
const {
  getHotelsByBusiness,
  getHotelById,
  createHotel,
  updateHotel,
  addRoom,
  updateRoom,
  deleteRoom,
  searchHotels,
  getHotelBookings,
} = require('../controllers/hotelController');
const { authenticate } = require('../middleware/auth');
const {
  validateHotel,
  validateRoom,
  validateObjectId,
  validatePagination,
} = require('../middleware/validation');

// @route   GET /api/hotels/search
router.get('/search', validatePagination, searchHotels);

// @route   GET /api/hotels/business/:businessId
router.get(
  '/business/:businessId',
  validateObjectId('businessId'),
  getHotelsByBusiness
);

// @route   GET /api/hotels/:id
router.get('/:id', validateObjectId('id'), getHotelById);

// @route   POST /api/hotels
router.post('/', authenticate, validateHotel, createHotel);

// @route   PUT /api/hotels/:id
router.put('/:id', authenticate, validateObjectId('id'), updateHotel);

// @route   GET /api/hotels/:id/bookings
router.get(
  '/:id/bookings',
  authenticate,
  validateObjectId('id'),
  getHotelBookings
);

// @route   POST /api/hotels/:id/rooms
router.post(
  '/:id/rooms',
  authenticate,
  validateObjectId('id'),
  validateRoom,
  addRoom
);

// @route   PUT /api/hotels/:hotelId/rooms/:roomId
router.put(
  '/:hotelId/rooms/:roomId',
  authenticate,
  validateObjectId('hotelId'),
  validateObjectId('roomId'),
  updateRoom
);

// @route   DELETE /api/hotels/:hotelId/rooms/:roomId
router.delete(
  '/:hotelId/rooms/:roomId',
  authenticate,
  validateObjectId('hotelId'),
  validateObjectId('roomId'),
  deleteRoom
);

module.exports = router;
