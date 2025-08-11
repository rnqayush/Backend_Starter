const express = require('express');
const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking
} = require('../controllers/bookingController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private
router.get('/', auth, getAllBookings);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, getBooking);

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private
router.post('/', auth, createBooking);

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
router.put('/:id', auth, updateBooking);

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
router.delete('/:id', auth, cancelBooking);

module.exports = router;

