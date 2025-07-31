const express = require('express');
const { body, param } = require('express-validator');
const websiteController = require('../controllers/websiteController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Website Routes
 * Handles website creation, management, and configuration
 */

// Validation rules
const createWebsiteValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Website name must be between 2 and 100 characters'),
  body('type')
    .isIn(['hotel', 'ecommerce', 'wedding', 'automobile', 'business'])
    .withMessage('Invalid website type'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 50 })
    .withMessage('Slug must be between 3 and 50 characters')
];

const updateWebsiteValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Website name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('slug')
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
    .isLength({ min: 3, max: 50 })
    .withMessage('Slug must be between 3 and 50 characters')
];

const statusUpdateValidation = [
  body('status')
    .isIn(['draft', 'active', 'inactive', 'suspended'])
    .withMessage('Invalid status. Must be one of: draft, active, inactive, suspended')
];

const slugValidation = [
  param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Invalid slug format')
    .isLength({ min: 3, max: 50 })
    .withMessage('Slug must be between 3 and 50 characters')
];

// Public routes
/**
 * @route   GET /api/websites/slug/:slug
 * @desc    Get website by slug (public access)
 * @access  Public
 */
router.get('/slug/:slug', slugValidation, websiteController.getWebsiteBySlug);

/**
 * @route   GET /api/websites/check-slug/:slug
 * @desc    Check if slug is available
 * @access  Public
 */
router.get('/check-slug/:slug', slugValidation, websiteController.checkSlugAvailability);

// Protected routes (require authentication)
/**
 * @route   POST /api/websites
 * @desc    Create a new website
 * @access  Private
 */
router.post('/', authenticate, createWebsiteValidation, websiteController.createWebsite);

/**
 * @route   GET /api/websites
 * @desc    Get all websites for authenticated user
 * @access  Private
 */
router.get('/', authenticate, websiteController.getUserWebsites);

/**
 * @route   GET /api/websites/:id
 * @desc    Get website by ID
 * @access  Private
 */
router.get('/:id', authenticate, websiteController.getWebsiteById);

/**
 * @route   PUT /api/websites/:id
 * @desc    Update website
 * @access  Private
 */
router.put('/:id', authenticate, updateWebsiteValidation, websiteController.updateWebsite);

/**
 * @route   DELETE /api/websites/:id
 * @desc    Delete website
 * @access  Private
 */
router.delete('/:id', authenticate, websiteController.deleteWebsite);

/**
 * @route   PUT /api/websites/:id/settings
 * @desc    Update website settings
 * @access  Private
 */
router.put('/:id/settings', authenticate, websiteController.updateWebsiteSettings);

/**
 * @route   PATCH /api/websites/:id/status
 * @desc    Update website status (publish/unpublish)
 * @access  Private
 */
router.patch('/:id/status', authenticate, statusUpdateValidation, websiteController.updateWebsiteStatus);

/**
 * @route   GET /api/websites/:id/analytics
 * @desc    Get website analytics
 * @access  Private
 */
router.get('/:id/analytics', authenticate, websiteController.getWebsiteAnalytics);

module.exports = router;

