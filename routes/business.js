const express = require('express');
const { body, param, query } = require('express-validator');
const businessServiceController = require('../controllers/businessServiceController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Business Routes
 * Handles business service management
 */

// Service validation rules
const createServiceValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('description.short')
    .notEmpty()
    .isLength({ max: 300 })
    .withMessage('Short description is required and cannot exceed 300 characters'),
  body('category')
    .isIn([
      'consulting', 'design', 'development', 'marketing', 'legal', 'accounting',
      'healthcare', 'education', 'fitness', 'beauty', 'cleaning', 'maintenance',
      'photography', 'videography', 'writing', 'translation', 'coaching',
      'therapy', 'real-estate', 'insurance', 'financial', 'other'
    ])
    .withMessage('Invalid service category'),
  body('details.deliveryMethod')
    .isIn(['in-person', 'remote', 'hybrid', 'on-site'])
    .withMessage('Invalid delivery method'),
  body('pricing.model')
    .isIn(['fixed', 'hourly', 'daily', 'weekly', 'monthly', 'project-based', 'tiered'])
    .withMessage('Invalid pricing model'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number')
];

const updateServiceValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number')
];

// =============================================================================
// SERVICE ROUTES
// =============================================================================

/**
 * @route   GET /api/business/services
 * @desc    Get all business services
 * @access  Public
 */
router.get('/services', businessServiceController.getServices);

/**
 * @route   GET /api/business/services/search
 * @desc    Search business services
 * @access  Public
 */
router.get('/services/search', businessServiceController.searchServices);

/**
 * @route   GET /api/business/services/popular
 * @desc    Get popular services
 * @access  Public
 */
router.get('/services/popular', businessServiceController.getPopularServices);

/**
 * @route   GET /api/business/services/featured
 * @desc    Get featured services
 * @access  Public
 */
router.get('/services/featured', businessServiceController.getFeaturedServices);

/**
 * @route   GET /api/business/services/top-rated
 * @desc    Get top rated services
 * @access  Public
 */
router.get('/services/top-rated', businessServiceController.getTopRatedServices);

/**
 * @route   GET /api/business/services/category/:category
 * @desc    Get services by category
 * @access  Public
 */
router.get('/services/category/:category', businessServiceController.getServicesByCategory);

/**
 * @route   GET /api/business/services/:identifier
 * @desc    Get service by ID or slug
 * @access  Public
 */
router.get('/services/:identifier', businessServiceController.getService);

/**
 * @route   GET /api/business/services/:id/offers
 * @desc    Get active offers for service
 * @access  Public
 */
router.get('/services/:id/offers', [
  param('id').isMongoId().withMessage('Invalid service ID')
], businessServiceController.getActiveOffers);

/**
 * @route   GET /api/business/services/:id/availability
 * @desc    Check service availability
 * @access  Public
 */
router.get('/services/:id/availability', [
  param('id').isMongoId().withMessage('Invalid service ID'),
  query('date').isISO8601().withMessage('Valid date is required')
], businessServiceController.checkAvailability);

/**
 * @route   GET /api/business/services/:id/analytics
 * @desc    Get service analytics
 * @access  Private
 */
router.get('/services/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID')
], businessServiceController.getServiceAnalytics);

/**
 * @route   POST /api/business/services
 * @desc    Create a new business service
 * @access  Private
 */
router.post('/services', authenticate, createServiceValidation, businessServiceController.createService);

/**
 * @route   PUT /api/business/services/:id
 * @desc    Update business service
 * @access  Private
 */
router.put('/services/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  ...updateServiceValidation
], businessServiceController.updateService);

/**
 * @route   DELETE /api/business/services/:id
 * @desc    Delete business service
 * @access  Private
 */
router.delete('/services/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID')
], businessServiceController.deleteService);

/**
 * @route   POST /api/business/services/:id/calculate-price
 * @desc    Calculate service price
 * @access  Public
 */
router.post('/services/:id/calculate-price', [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('addOns').optional().isArray().withMessage('Add-ons must be an array')
], businessServiceController.calculatePrice);

/**
 * @route   POST /api/business/services/:id/reviews
 * @desc    Add service review
 * @access  Private
 */
router.post('/services/:id/reviews', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').notEmpty().withMessage('Review is required')
], businessServiceController.addReview);

/**
 * @route   POST /api/business/services/:id/inquire
 * @desc    Record service inquiry
 * @access  Public
 */
router.post('/services/:id/inquire', [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('message').notEmpty().withMessage('Message is required'),
  body('contactInfo.name').notEmpty().withMessage('Name is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required')
], businessServiceController.recordInquiry);

/**
 * @route   POST /api/business/services/:id/book
 * @desc    Record service booking
 * @access  Private
 */
router.post('/services/:id/book', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('revenue').optional().isFloat({ min: 0 }).withMessage('Revenue must be positive')
], businessServiceController.recordBooking);

/**
 * @route   POST /api/business/services/:id/complete
 * @desc    Record service completion
 * @access  Private
 */
router.post('/services/:id/complete', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('revenue').optional().isFloat({ min: 0 }).withMessage('Revenue must be positive'),
  body('isRepeatClient').optional().isBoolean().withMessage('Repeat client must be boolean')
], businessServiceController.recordCompletion);

/**
 * @route   POST /api/business/services/:id/referral
 * @desc    Record referral
 * @access  Private
 */
router.post('/services/:id/referral', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID')
], businessServiceController.recordReferral);

/**
 * @route   POST /api/business/services/:id/team
 * @desc    Add team member
 * @access  Private
 */
router.post('/services/:id/team', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('name').notEmpty().withMessage('Team member name is required'),
  body('role').notEmpty().withMessage('Team member role is required')
], businessServiceController.addTeamMember);

/**
 * @route   POST /api/business/services/:id/faq
 * @desc    Add FAQ
 * @access  Private
 */
router.post('/services/:id/faq', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('question').notEmpty().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], businessServiceController.addFAQ);

/**
 * @route   PATCH /api/business/services/:id/status
 * @desc    Update service status
 * @access  Private
 */
router.patch('/services/:id/status', authenticate, [
  param('id').isMongoId().withMessage('Invalid service ID'),
  body('status').isIn(['active', 'inactive', 'coming-soon', 'discontinued'])
    .withMessage('Invalid service status')
], businessServiceController.updateServiceStatus);

/**
 * @route   PATCH /api/business/services/bulk
 * @desc    Bulk update services
 * @access  Private
 */
router.patch('/services/bulk', authenticate, [
  body('serviceIds').isArray({ min: 1 }).withMessage('Service IDs array is required')
], businessServiceController.bulkUpdateServices);

module.exports = router;

