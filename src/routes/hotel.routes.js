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

// Import new controllers
import {
  getHotelContent,
  getHotelContentById,
  createHotelContent,
  updateHotelContent,
  deleteHotelContent,
  getContentByType,
  updateContentPriority,
  toggleContentStatus
} from '../controllers/hotel/hotelContentController.js';

import {
  getHotelOffers,
  getHotelOffersByHotel,
  getHotelOfferById,
  createHotelOffer,
  updateHotelOffer,
  deleteHotelOffer,
  getVendorOffers,
  toggleOfferStatus,
  getOfferAnalytics
} from '../controllers/hotel/hotelOfferController.js';

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
router.get('/vendor/my-hotels', authorize('vendor'), getOwnerHotels);
router.get('/vendor/stats', authorize('vendor'), getOwnerDashboard);

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

// Hotel Content Management Routes
router.get('/:hotelId/content', getHotelContent);
router.get('/:hotelId/content/:contentType', getContentByType);
router.post('/:hotelId/content', protect, authorize('vendor'), createHotelContent);

router.get('/content/:id', getHotelContentById);
router.put('/content/:id', protect, authorize('vendor'), updateHotelContent);
router.delete('/content/:id', protect, authorize('vendor'), deleteHotelContent);
router.patch('/content/:id/priority', protect, authorize('vendor'), updateContentPriority);
router.patch('/content/:id/status', protect, authorize('vendor'), toggleContentStatus);

// Hotel Offers Management Routes
router.get('/offers', getHotelOffers);
router.get('/offers/:id', getHotelOfferById);
router.get('/:hotelId/offers', getHotelOffersByHotel);
router.post('/:hotelId/offers', protect, authorize('vendor'), createHotelOffer);

router.put('/offers/:id', protect, authorize('vendor'), updateHotelOffer);
router.delete('/offers/:id', protect, authorize('vendor'), deleteHotelOffer);
router.patch('/offers/:id/status', protect, authorize('vendor'), toggleOfferStatus);
router.get('/offers/:id/analytics', protect, authorize('vendor'), getOfferAnalytics);

// Vendor Offers Route
router.get('/vendor/my-offers', protect, authorize('vendor'), getVendorOffers);

export default router;
