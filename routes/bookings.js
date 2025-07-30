const express = require('express');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all bookings for user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('business', 'name')
      .populate('hotel', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    req.body.customer = req.user.id;
    
    const booking = await Booking.create(req.body);

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('business', 'name contact')
      .populate('hotel', 'name')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is business owner
    if (booking.customer._id.toString() !== req.user.id && !req.user.businesses.includes(booking.business._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

