const express = require('express');
const {
  getAllReviews,
  getHotelReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', getAllReviews);

// @route   GET /api/reviews/hotel/:hotelId
// @desc    Get reviews for specific hotel
// @access  Public
router.get('/hotel/:hotelId', getHotelReviews);

// @route   POST /api/reviews
// @desc    Create review
// @access  Private
router.post('/', auth, createReview);

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private
router.put('/:id', auth, updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', auth, deleteReview);

module.exports = router;

