const express = require('express');
const Hotel = require('../models/Hotel');
const { protect, authorize, authorizeBusinessAccess } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true })
      .populate('business', 'name slug address contact')
      .select('-reviews');

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('business', 'name slug address contact socialMedia businessHours');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private (Business Owner)
router.post('/', protect, authorize('business_owner', 'admin'), async (req, res) => {
  try {
    req.body.business = req.body.businessId || req.user.businesses[0];
    
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Business Owner)
router.put('/:id', protect, async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.business.toString() !== req.user.businesses[0].toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this hotel'
      });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Business Owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.business.toString() !== req.user.businesses[0].toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hotel'
      });
    }

    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

