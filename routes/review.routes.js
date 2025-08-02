/**
 * Review Routes - Handle review-related endpoints
 */

import express from 'express';
import {
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
} from '../controllers/review.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateReview } from '../validators/review.validator.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/target/:targetModel/:targetId', getReviewsByTarget);
router.get('/target/:targetModel/:targetId/stats', getReviewStats);

// Protected routes (authentication required)
router.use(authenticateToken);

// Create a new review
router.post('/', validateReview, createReview);

// Get user's reviews
router.get('/user/:userId?', getUserReviews);

// Update a review
router.put('/:reviewId', updateReview);

// Delete a review
router.delete('/:reviewId', deleteReview);

// Mark review as helpful/unhelpful
router.post('/:reviewId/helpful', markHelpful);
router.post('/:reviewId/unhelpful', markUnhelpful);

// Vendor response to review
router.post('/:reviewId/response', addVendorResponse);

// Admin moderation
router.patch('/:reviewId/moderate', moderateReview);

export default router;
