import express from 'express';
import {
  getHotels,
  createHotel,
  getHotel,
  updateHotel,
  deleteHotel,
  getOwnerHotels,
  getHotelAnalytics,
  addHotelReview,
  searchHotels,
  getFeaturedHotels,
  getOwnerDashboard
} from '../controllers/hotel/hotelController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/search', searchHotels);
router.get('/:id', getHotel);

// Protected routes
router.use(protect);

// Hotel management (Hotel Owners only)
router.route('/')
  .post(authorize('vendor'), createHotel);

router.route('/:id')
  .put(authorize('vendor'), updateHotel)
  .delete(authorize('vendor'), deleteHotel);

router.post('/:id/reviews', addHotelReview);
router.get('/:id/analytics', authorize('vendor'), getHotelAnalytics);

// Owner routes
router.get('/owner/properties', authorize('vendor'), getOwnerHotels);
router.get('/owner/dashboard', authorize('vendor'), getOwnerDashboard);

// Room management routes (placeholder)
router.get('/:hotelId/rooms', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Room management functionality coming soon'
  });
});

// Booking management routes (placeholder)
router.get('/:hotelId/bookings', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Booking management functionality coming soon'
  });
});

export default router;

