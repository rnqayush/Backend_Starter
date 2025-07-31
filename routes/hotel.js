const express = require('express');
const { body, param, query } = require('express-validator');
const hotelController = require('../controllers/hotelController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Hotel Routes
 * Handles hotel management operations
 */

// Validation rules
const createHotelValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('totalRooms')
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1'),
  body('location.address.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('location.address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('location.address.state')
    .notEmpty()
    .withMessage('State is required'),
  body('location.address.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('contact.phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('contact.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('priceRange.min')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  body('priceRange.max')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .custom((value, { req }) => {
      if (value <= req.body.priceRange?.min) {
        throw new Error('Maximum price must be greater than minimum price');
      }
      return true;
    })
];

const updateHotelValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('totalRooms')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total rooms must be at least 1'),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),
  body('priceRange.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  body('priceRange.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
];

const amenityValidation = [
  body('name')
    .notEmpty()
    .withMessage('Amenity name is required'),
  body('category')
    .optional()
    .isIn(['general', 'room', 'dining', 'recreation', 'business', 'wellness'])
    .withMessage('Invalid amenity category')
];

// Public routes
/**
 * @route   GET /api/hotels
 * @desc    Get all hotels for a website
 * @access  Public
 */
router.get('/', hotelController.getHotels);

/**
 * @route   GET /api/hotels/search
 * @desc    Search hotels with filters
 * @access  Public
 */
router.get('/search', [
  query('checkIn').optional().isISO8601().withMessage('Invalid check-in date'),
  query('checkOut').optional().isISO8601().withMessage('Invalid check-out date'),
  query('guests').optional().isInt({ min: 1 }).withMessage('Guests must be at least 1'),
  query('starRating').optional().isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),
  query('priceMin').optional().isFloat({ min: 0 }).withMessage('Minimum price must be positive'),
  query('priceMax').optional().isFloat({ min: 0 }).withMessage('Maximum price must be positive')
], hotelController.searchHotels);

/**
 * @route   GET /api/hotels/nearby
 * @desc    Get nearby hotels
 * @access  Public
 */
router.get('/nearby', [
  query('latitude').notEmpty().isFloat().withMessage('Valid latitude is required'),
  query('longitude').notEmpty().isFloat().withMessage('Valid longitude is required'),
  query('maxDistance').optional().isInt({ min: 1 }).withMessage('Max distance must be positive')
], hotelController.getNearbyHotels);

/**
 * @route   GET /api/hotels/:id
 * @desc    Get hotel by ID
 * @access  Public
 */
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid hotel ID')
], hotelController.getHotelById);

// Protected routes (require authentication)
/**
 * @route   POST /api/hotels
 * @desc    Create a new hotel
 * @access  Private
 */
router.post('/', authenticate, createHotelValidation, hotelController.createHotel);

/**
 * @route   PUT /api/hotels/:id
 * @desc    Update hotel
 * @access  Private
 */
router.put('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid hotel ID'),
  ...updateHotelValidation
], hotelController.updateHotel);

/**
 * @route   DELETE /api/hotels/:id
 * @desc    Delete hotel
 * @access  Private
 */
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid hotel ID')
], hotelController.deleteHotel);

/**
 * @route   GET /api/hotels/:id/analytics
 * @desc    Get hotel analytics
 * @access  Private
 */
router.get('/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid hotel ID')
], hotelController.getHotelAnalytics);

/**
 * @route   POST /api/hotels/:id/amenities
 * @desc    Add hotel amenity
 * @access  Private
 */
router.post('/:id/amenities', authenticate, [
  param('id').isMongoId().withMessage('Invalid hotel ID'),
  ...amenityValidation
], hotelController.addAmenity);

/**
 * @route   DELETE /api/hotels/:id/amenities/:amenityId
 * @desc    Remove hotel amenity
 * @access  Private
 */
router.delete('/:id/amenities/:amenityId', authenticate, [
  param('id').isMongoId().withMessage('Invalid hotel ID'),
  param('amenityId').isMongoId().withMessage('Invalid amenity ID')
], hotelController.removeAmenity);

module.exports = router;

