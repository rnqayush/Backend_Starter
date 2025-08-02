/**
 * Review Controller - Handle review operations
 */

import Review from '../models/Review.js';
import { RESPONSE_MESSAGES, PAGINATION } from '../config/constants.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const {
      reviewType,
      targetId,
      targetModel,
      businessCategory,
      rating,
      title,
      comment,
      images
    } = req.body;

    // Create review with reviewer information from authenticated user
    const reviewData = {
      reviewType,
      targetId,
      targetModel,
      businessCategory,
      reviewer: req.user.id,
      reviewerName: req.user.name,
      rating,
      title,
      comment,
      images: images || [],
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        source: 'web'
      }
    };

    const review = new Review(reviewData);
    await review.save();

    // Populate reviewer information
    await review.populate('reviewer', 'name avatar');

    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: 'Review created successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to create review',
      errors: error.errors
    });
  }
};

// Get reviews for a specific target (vendor, product, etc.)
export const getReviewsByTarget = async (req, res) => {
  try {
    const { targetId, targetModel } = req.params;
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'approved'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {
      targetId,
      targetModel,
      status
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate('reviewer', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalReviews = await Review.countDocuments(query);

    // Get average rating and distribution
    const ratingStats = await Review.getAverageRating(targetId, targetModel);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNextPage: skip + reviews.length < totalReviews,
          hasPrevPage: parseInt(page) > 1
        },
        stats: ratingStats
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to retrieve reviews'
    });
  }
};

// Get review statistics for a target
export const getReviewStats = async (req, res) => {
  try {
    const { targetId, targetModel } = req.params;

    const stats = await Review.getAverageRating(targetId, targetModel);
    const recentReviews = await Review.getRecentReviews(targetId, targetModel, 5);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Review statistics retrieved successfully',
      data: {
        stats,
        recentReviews
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to retrieve review statistics'
    });
  }
};

// Get reviews by user
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      businessCategory,
      status
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { reviewer: userId };

    if (businessCategory) {
      query.businessCategory = businessCategory;
    }

    if (status) {
      query.status = status;
    }

    // Get reviews
    const reviews = await Review.find(query)
      .populate('targetId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments(query);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'User reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          hasNextPage: skip + reviews.length < totalReviews,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to retrieve user reviews'
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, images } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Not authorized to update this review'
      });
    }

    // Update allowed fields
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (images !== undefined) review.images = images;

    // Reset status to pending if content changed
    if (rating !== undefined || title !== undefined || comment !== undefined) {
      review.status = 'pending';
    }

    await review.save();
    await review.populate('reviewer', 'name avatar');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Review updated successfully',
      data: {
        review
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update review'
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to delete review'
    });
  }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Review not found'
      });
    }

    await review.markHelpful(req.user.id);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Review marked as helpful',
      data: {
        helpfulVotes: review.helpfulVotes,
        totalVotes: review.totalVotes
      }
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to mark review as helpful'
    });
  }
};

// Mark review as unhelpful
export const markUnhelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Review not found'
      });
    }

    await review.markUnhelpful(req.user.id);

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Review marked as unhelpful',
      data: {
        unhelpfulVotes: review.unhelpfulVotes,
        totalVotes: review.totalVotes
      }
    });
  } catch (error) {
    console.error('Mark unhelpful error:', error);
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: 'Failed to mark review as unhelpful'
    });
  }
};

// Add vendor response to review
export const addVendorResponse = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Review not found'
      });
    }

    // Check if user is the vendor or admin
    // This would need to be enhanced based on your vendor-user relationship
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Not authorized to respond to this review'
      });
    }

    review.vendorResponse = {
      message,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };

    await review.save();
    await review.populate('vendorResponse.respondedBy', 'name');

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: 'Vendor response added successfully',
      data: {
        vendorResponse: review.vendorResponse
      }
    });
  } catch (error) {
    console.error('Add vendor response error:', error);
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to add vendor response'
    });
  }
};

// Admin: Moderate review (approve/reject)
export const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, moderationNotes } = req.body;

    // Check admin role
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Not authorized to moderate reviews'
      });
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Review not found'
      });
    }

    review.status = status;
    review.moderationNotes = moderationNotes;
    review.moderatedBy = req.user.id;
    review.moderatedAt = new Date();

    await review.save();

    res.status(200).json({
      status: 'success',
      statusCode: 200,
      message: `Review ${status} successfully`,
      data: {
        review: {
          id: review._id,
          status: review.status,
          moderationNotes: review.moderationNotes,
          moderatedAt: review.moderatedAt
        }
      }
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to moderate review'
    });
  }
};

export default {
  createReview,
  getReviewsByTarget,
  getReviewStats,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful,
  markUnhelpful,
  addVendorResponse,
  moderateReview
};
