/**
 * Review Validation - Validate review data
 */

import { body, param, query } from 'express-validator';
import { BUSINESS_CATEGORIES } from '../config/constants.js';

// Validate review creation
export const validateReview = [
  body('reviewType')
    .isIn(['vendor', 'product', 'hotel', 'booking', 'order'])
    .withMessage('Invalid review type'),

  body('targetId')
    .isMongoId()
    .withMessage('Invalid target ID'),

  body('targetModel')
    .isIn(['Vendor', 'Product', 'Hotel', 'Booking', 'Order'])
    .withMessage('Invalid target model'),

  body('businessCategory')
    .isIn(Object.values(BUSINESS_CATEGORIES))
    .withMessage('Invalid business category'),

  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('comment')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),

  body('images.*.url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL'),

  body('images.*.caption')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Image caption cannot exceed 200 characters')
];

// Validate review update
export const validateReviewUpdate = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),

  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),

  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),

  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

// Validate vendor response
export const validateVendorResponse = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Response message must be between 10 and 1000 characters')
];

// Validate review moderation
export const validateReviewModeration = [
  param('reviewId')
    .isMongoId()
    .withMessage('Invalid review ID'),

  body('status')
    .isIn(['pending', 'approved', 'rejected', 'hidden'])
    .withMessage('Invalid review status'),

  body('moderationNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Moderation notes cannot exceed 500 characters')
];

// Validate review query parameters
export const validateReviewQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating filter must be between 1 and 5'),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'helpfulVotes'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'hidden'])
    .withMessage('Invalid status filter'),

  query('businessCategory')
    .optional()
    .isIn(Object.values(BUSINESS_CATEGORIES))
    .withMessage('Invalid business category filter')
];

export default {
  validateReview,
  validateReviewUpdate,
  validateVendorResponse,
  validateReviewModeration,
  validateReviewQuery
};
