const express = require('express');
const {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');
const { auth, adminAuth } = require('../../../shared/middleware/auth');

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels
// @access  Public
router.get('/', getAllHotels);

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID or slug
// @access  Public
router.get('/:id', getHotel);

// @route   POST /api/hotels
// @desc    Create hotel
// @access  Private (Hotel Owner/Admin)
router.post('/', auth, createHotel);

// @route   PUT /api/hotels/:id
// @desc    Update hotel
// @access  Private (Owner/Admin)
router.put('/:id', auth, updateHotel);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel
// @access  Private (Owner/Admin)
router.delete('/:id', auth, deleteHotel);

module.exports = router;
