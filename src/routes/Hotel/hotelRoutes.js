const express = require('express');
const hotelController = require('../../controllers/Hotel/hotelController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', hotelController.getAllHotels);
router.get('/search', hotelController.searchHotels);
router.get('/:id', hotelController.getHotelById);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

// Hotel owner routes
router.get('/owner/my-hotels', authMiddleware.authorize('hotel_owner', 'admin'), hotelController.getMyHotels);
router.post('/', authMiddleware.authorize('hotel_owner', 'admin'), hotelController.createHotel);
router.put('/:id', authMiddleware.authorize('hotel_owner', 'admin'), hotelController.updateHotel);
router.delete('/:id', authMiddleware.authorize('hotel_owner', 'admin'), hotelController.deleteHotel);
router.get('/:id/dashboard', authMiddleware.authorize('hotel_owner', 'admin'), hotelController.getHotelDashboard);

module.exports = router;
