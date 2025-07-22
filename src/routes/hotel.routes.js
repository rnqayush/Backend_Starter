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

import {
  getRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom,
  checkAvailability,
  updateAvailability,
  updateHousekeeping,
  addRoomImages,
  deleteRoomImage,
  getOccupancyReport
} from '../controllers/hotel/roomController.js';

import {
  updateHotelContent,
  addHotelImages,
  updateHotelImage,
  deleteHotelImage,
  addHotelVideos,
  updateHotelVideo,
  deleteHotelVideo,
  updateAmenities,
  updatePolicies,
  getHotelContent
} from '../controllers/hotel/hotelContentController.js';

import {
  getHotelOffers,
  getAllHotelOffers,
  addHotelOffer,
  updateHotelOffer,
  deleteHotelOffer,
  toggleOfferStatus,
  getOfferAnalytics,
  validateOffer
} from '../controllers/hotel/hotelOffersController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHotels);
router.get('/featured', getFeaturedHotels);
router.get('/search', searchHotels);
router.get('/:id', getHotel);
router.get('/:id/content', getHotelContent);

// Protected routes
router.use(protect);

// ===== HOTEL MANAGEMENT =====
router.route('/')
  .post(authorize('vendor'), createHotel);

router.route('/:id')
  .put(authorize('vendor'), updateHotel)
  .delete(authorize('vendor'), deleteHotel);

router.post('/:id/reviews', addHotelReview);
router.get('/:id/analytics', authorize('vendor'), getHotelAnalytics);

// ===== HOTEL CONTENT MANAGEMENT =====
router.put('/:id/content', authorize('vendor'), updateHotelContent);
router.put('/:id/amenities', authorize('vendor'), updateAmenities);
router.put('/:id/policies', authorize('vendor'), updatePolicies);

// Hotel Images
router.route('/:id/images')
  .post(authorize('vendor'), addHotelImages);

router.route('/:id/images/:imageId')
  .put(authorize('vendor'), updateHotelImage)
  .delete(authorize('vendor'), deleteHotelImage);

// Hotel Videos
router.route('/:id/videos')
  .post(authorize('vendor'), addHotelVideos);

router.route('/:id/videos/:videoId')
  .put(authorize('vendor'), updateHotelVideo)
  .delete(authorize('vendor'), deleteHotelVideo);

// ===== ROOM MANAGEMENT =====
router.route('/:hotelId/rooms')
  .get(getRooms)
  .post(authorize('vendor'), createRoom);

router.route('/:hotelId/rooms/:id')
  .get(getRoom)
  .put(authorize('vendor'), updateRoom)
  .delete(authorize('vendor'), deleteRoom);

router.get('/:hotelId/rooms/availability', checkAvailability);
router.put('/:hotelId/rooms/:id/availability', authorize('vendor'), updateAvailability);
router.put('/:hotelId/rooms/:id/housekeeping', authorize('vendor'), updateHousekeeping);

// Room Images
router.route('/:hotelId/rooms/:id/images')
  .post(authorize('vendor'), addRoomImages);

router.delete('/:hotelId/rooms/:id/images/:imageId', authorize('vendor'), deleteRoomImage);

// Room Reports
router.get('/:hotelId/rooms/occupancy', authorize('vendor'), getOccupancyReport);

// ===== HOTEL OFFERS =====
router.get('/:id/offers', getHotelOffers);
router.get('/:id/offers/all', authorize('vendor'), getAllHotelOffers);

router.route('/:id/offers')
  .post(authorize('vendor'), addHotelOffer);

router.route('/:id/offers/:offerId')
  .put(authorize('vendor'), updateHotelOffer)
  .delete(authorize('vendor'), deleteHotelOffer);

router.put('/:id/offers/:offerId/toggle', authorize('vendor'), toggleOfferStatus);
router.get('/:id/offers/:offerId/analytics', authorize('vendor'), getOfferAnalytics);
router.post('/:id/offers/:offerId/validate', validateOffer);

// ===== OWNER DASHBOARD =====
router.get('/owner/properties', authorize('vendor'), getOwnerHotels);
router.get('/owner/dashboard', authorize('vendor'), getOwnerDashboard);

// Booking management routes (placeholder for future implementation)
router.get('/:hotelId/bookings', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Booking management functionality coming soon'
  });
});

export default router;
