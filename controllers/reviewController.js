const Review = require('../models/Review');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, hotel, rating } = req.query;
    const query = { isActive: true };

    if (hotel) query.hotel = hotel;
    if (rating) query.rating = rating;

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('hotel', 'name slug')
      .populate('booking', 'checkIn checkOut')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get reviews for a specific hotel
const getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ hotel: hotelId, isActive: true })
      .populate('user', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ hotel: hotelId, isActive: true });

    // Calculate average rating
    const mongoose = require('mongoose');
    const ratingStats = await Review.aggregate([
      { $match: { hotel: new mongoose.Types.ObjectId(hotelId), isActive: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        stats: ratingStats[0] || { averageRating: 0, totalReviews: 0 },
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create review
const createReview = async (req, res) => {
  try {
    const { hotel: hotelId, booking: bookingId } = req.body;

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // If booking is provided, verify it belongs to user
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking || booking.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Invalid booking reference'
        });
      }
    }

    // Check if user already reviewed this hotel
    const existingReview = await Review.findOne({
      user: req.user.id,
      hotel: hotelId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }

    const reviewData = {
      ...req.body,
      user: req.user.id,
      guestName: req.body.guestName || req.user.name,
      verified: bookingId ? true : false
    };

    const review = await Review.create(reviewData);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    // Soft delete
    await Review.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllReviews,
  getHotelReviews,
  createReview,
  updateReview,
  deleteReview
};
