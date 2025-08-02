/**
 * Booking Routes
 */

import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  getUserBookings,
  getVendorBookings,
  addReview
} from '../controllers/booking.controller.js';
import { 
  verifyToken, 
  requireVendor,
  requireAdmin 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

// Booking management
router.post('/', createBooking);
router.get('/', getAllBookings);
router.get('/my-bookings', getUserBookings);
router.get('/vendor-bookings', requireVendor, getVendorBookings);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);

// Booking actions
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/confirm', confirmBooking);
router.patch('/:id/checkin', checkInBooking);
router.patch('/:id/checkout', checkOutBooking);

// Reviews
router.post('/:id/review', addReview);

export default router;
