/**
 * Hotel Routes
 */

import express from 'express';
import {
  createHotel,
  getAllHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  getHotelsByCity,
  addRoom,
  updateRoom,
  deleteRoom,
  getFeaturedHotels,
  searchHotels
} from '../controllers/hotel.controller.js';
import { 
  verifyToken, 
  requireVendor,
  optionalAuth 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllHotels);
router.get('/featured', getFeaturedHotels);
router.get('/search', searchHotels);
router.get('/city/:city', getHotelsByCity);
router.get('/:id', optionalAuth, getHotel);

// Protected routes - require authentication
router.use(verifyToken);

// Hotel management (vendor only)
router.post('/', requireVendor, createHotel);
router.put('/:id', updateHotel);
router.delete('/:id', deleteHotel);

// Room management
router.post('/:id/rooms', addRoom);
router.put('/:id/rooms/:roomId', updateRoom);
router.delete('/:id/rooms/:roomId', deleteRoom);

export default router;
