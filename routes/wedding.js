const express = require('express');
const { body, param, query } = require('express-validator');
const weddingVendorController = require('../controllers/weddingVendorController');
const weddingEventController = require('../controllers/weddingEventController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Wedding Routes
 * Handles wedding vendor and event management
 */

// Vendor validation rules
const createVendorValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Vendor name must be between 2 and 100 characters'),
  body('category')
    .isIn([
      'photographer', 'videographer', 'florist', 'caterer', 'venue', 
      'dj', 'band', 'decorator', 'makeup-artist', 'hair-stylist',
      'wedding-planner', 'officiant', 'transportation', 'baker',
      'jeweler', 'dress-designer', 'suit-tailor', 'invitation-designer',
      'lighting', 'security', 'other'
    ])
    .withMessage('Invalid vendor category'),
  body('contact.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('contact.phone')
    .notEmpty()
    .withMessage('Phone number is required'),
  body('location.address.city')
    .notEmpty()
    .withMessage('City is required'),
  body('location.address.state')
    .notEmpty()
    .withMessage('State is required'),
  body('location.address.country')
    .notEmpty()
    .withMessage('Country is required')
];

// Event validation rules
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Event title must be between 2 and 200 characters'),
  body('couple.bride.firstName')
    .notEmpty()
    .withMessage('Bride first name is required'),
  body('couple.bride.lastName')
    .notEmpty()
    .withMessage('Bride last name is required'),
  body('couple.groom.firstName')
    .notEmpty()
    .withMessage('Groom first name is required'),
  body('couple.groom.lastName')
    .notEmpty()
    .withMessage('Groom last name is required'),
  body('eventDetails.weddingDate')
    .isISO8601()
    .withMessage('Valid wedding date is required'),
  body('eventDetails.guestCount')
    .isInt({ min: 1 })
    .withMessage('Guest count must be at least 1')
];

// =============================================================================
// VENDOR ROUTES
// =============================================================================

/**
 * @route   GET /api/wedding/vendors
 * @desc    Get all wedding vendors
 * @access  Public
 */
router.get('/vendors', weddingVendorController.getVendors);

/**
 * @route   GET /api/wedding/vendors/search
 * @desc    Search wedding vendors
 * @access  Public
 */
router.get('/vendors/search', weddingVendorController.searchVendors);

/**
 * @route   GET /api/wedding/vendors/featured
 * @desc    Get featured vendors
 * @access  Public
 */
router.get('/vendors/featured', weddingVendorController.getFeaturedVendors);

/**
 * @route   GET /api/wedding/vendors/top-rated
 * @desc    Get top rated vendors
 * @access  Public
 */
router.get('/vendors/top-rated', weddingVendorController.getTopRatedVendors);

/**
 * @route   GET /api/wedding/vendors/nearby
 * @desc    Get nearby vendors
 * @access  Public
 */
router.get('/vendors/nearby', [
  query('latitude').notEmpty().isFloat().withMessage('Valid latitude is required'),
  query('longitude').notEmpty().isFloat().withMessage('Valid longitude is required'),
  query('maxDistance').optional().isInt({ min: 1 }).withMessage('Max distance must be positive')
], weddingVendorController.getNearbyVendors);

/**
 * @route   GET /api/wedding/vendors/category/:category
 * @desc    Get vendors by category
 * @access  Public
 */
router.get('/vendors/category/:category', weddingVendorController.getVendorsByCategory);

/**
 * @route   GET /api/wedding/vendors/:identifier
 * @desc    Get vendor by ID or slug
 * @access  Public
 */
router.get('/vendors/:identifier', weddingVendorController.getVendor);

/**
 * @route   GET /api/wedding/vendors/:id/availability
 * @desc    Check vendor availability
 * @access  Public
 */
router.get('/vendors/:id/availability', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  query('date').isISO8601().withMessage('Valid date is required')
], weddingVendorController.checkAvailability);

/**
 * @route   POST /api/wedding/vendors
 * @desc    Create a new wedding vendor
 * @access  Private
 */
router.post('/vendors', authenticate, createVendorValidation, weddingVendorController.createVendor);

/**
 * @route   PUT /api/wedding/vendors/:id
 * @desc    Update wedding vendor
 * @access  Private
 */
router.put('/vendors/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  ...createVendorValidation
], weddingVendorController.updateVendor);

/**
 * @route   DELETE /api/wedding/vendors/:id
 * @desc    Delete wedding vendor
 * @access  Private
 */
router.delete('/vendors/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid vendor ID')
], weddingVendorController.deleteVendor);

/**
 * @route   POST /api/wedding/vendors/:id/testimonials
 * @desc    Add vendor testimonial
 * @access  Private
 */
router.post('/vendors/:id/testimonials', authenticate, [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').notEmpty().withMessage('Review is required')
], weddingVendorController.addTestimonial);

/**
 * @route   POST /api/wedding/vendors/:id/inquire
 * @desc    Record vendor inquiry
 * @access  Public
 */
router.post('/vendors/:id/inquire', [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('message').notEmpty().withMessage('Message is required'),
  body('contactInfo.name').notEmpty().withMessage('Name is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required')
], weddingVendorController.recordInquiry);

/**
 * @route   POST /api/wedding/vendors/:id/book
 * @desc    Record vendor booking
 * @access  Private
 */
router.post('/vendors/:id/book', authenticate, [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('revenue').optional().isFloat({ min: 0 }).withMessage('Revenue must be positive')
], weddingVendorController.recordBooking);

/**
 * @route   GET /api/wedding/vendors/:id/analytics
 * @desc    Get vendor analytics
 * @access  Private
 */
router.get('/vendors/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid vendor ID')
], weddingVendorController.getVendorAnalytics);

/**
 * @route   PATCH /api/wedding/vendors/:id/status
 * @desc    Update vendor status
 * @access  Private
 */
router.patch('/vendors/:id/status', authenticate, [
  param('id').isMongoId().withMessage('Invalid vendor ID'),
  body('status').isIn(['active', 'inactive', 'pending-approval', 'suspended'])
    .withMessage('Invalid vendor status')
], weddingVendorController.updateVendorStatus);

/**
 * @route   PATCH /api/wedding/vendors/bulk
 * @desc    Bulk update vendors
 * @access  Private
 */
router.patch('/vendors/bulk', authenticate, [
  body('vendorIds').isArray({ min: 1 }).withMessage('Vendor IDs array is required')
], weddingVendorController.bulkUpdateVendors);

// =============================================================================
// EVENT ROUTES
// =============================================================================

/**
 * @route   GET /api/wedding/events
 * @desc    Get all wedding events
 * @access  Private
 */
router.get('/events', authenticate, weddingEventController.getEvents);

/**
 * @route   GET /api/wedding/events/upcoming
 * @desc    Get upcoming events
 * @access  Private
 */
router.get('/events/upcoming', authenticate, weddingEventController.getUpcomingEvents);

/**
 * @route   GET /api/wedding/events/date-range
 * @desc    Get events by date range
 * @access  Private
 */
router.get('/events/date-range', authenticate, [
  query('startDate').isISO8601().withMessage('Valid start date is required'),
  query('endDate').isISO8601().withMessage('Valid end date is required')
], weddingEventController.getEventsByDateRange);

/**
 * @route   GET /api/wedding/events/search/couple
 * @desc    Search events by couple
 * @access  Private
 */
router.get('/events/search/couple', authenticate, [
  query('email').isEmail().withMessage('Valid email is required')
], weddingEventController.searchByCouple);

/**
 * @route   GET /api/wedding/events/:id
 * @desc    Get wedding event by ID
 * @access  Private
 */
router.get('/events/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID')
], weddingEventController.getEvent);

/**
 * @route   GET /api/wedding/events/:id/budget
 * @desc    Get event budget summary
 * @access  Private
 */
router.get('/events/:id/budget', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID')
], weddingEventController.getBudgetSummary);

/**
 * @route   GET /api/wedding/events/:id/progress
 * @desc    Get event progress
 * @access  Private
 */
router.get('/events/:id/progress', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID')
], weddingEventController.getEventProgress);

/**
 * @route   GET /api/wedding/events/:id/analytics
 * @desc    Get event analytics
 * @access  Private
 */
router.get('/events/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID')
], weddingEventController.getEventAnalytics);

/**
 * @route   POST /api/wedding/events
 * @desc    Create a new wedding event
 * @access  Private
 */
router.post('/events', authenticate, createEventValidation, weddingEventController.createEvent);

/**
 * @route   PUT /api/wedding/events/:id
 * @desc    Update wedding event
 * @access  Private
 */
router.put('/events/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  ...createEventValidation
], weddingEventController.updateEvent);

/**
 * @route   DELETE /api/wedding/events/:id
 * @desc    Delete wedding event
 * @access  Private
 */
router.delete('/events/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID')
], weddingEventController.deleteEvent);

/**
 * @route   POST /api/wedding/events/:id/vendors
 * @desc    Add vendor to event
 * @access  Private
 */
router.post('/events/:id/vendors', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('vendorId').isMongoId().withMessage('Valid vendor ID is required'),
  body('category').notEmpty().withMessage('Category is required')
], weddingEventController.addVendor);

/**
 * @route   PATCH /api/wedding/events/:id/vendors/:vendorId
 * @desc    Update vendor status in event
 * @access  Private
 */
router.patch('/events/:id/vendors/:vendorId', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  param('vendorId').isMongoId().withMessage('Invalid vendor ID'),
  body('status').isIn(['inquired', 'quoted', 'booked', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Invalid vendor status')
], weddingEventController.updateVendorStatus);

/**
 * @route   POST /api/wedding/events/:id/guests
 * @desc    Add guest to event
 * @access  Private
 */
router.post('/events/:id/guests', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('name').notEmpty().withMessage('Guest name is required')
], weddingEventController.addGuest);

/**
 * @route   PATCH /api/wedding/events/:id/guests/:guestId/rsvp
 * @desc    Update RSVP status
 * @access  Private
 */
router.patch('/events/:id/guests/:guestId/rsvp', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  param('guestId').isMongoId().withMessage('Invalid guest ID'),
  body('status').isIn(['pending', 'attending', 'not-attending', 'maybe'])
    .withMessage('Invalid RSVP status')
], weddingEventController.updateRSVP);

/**
 * @route   POST /api/wedding/events/:id/tasks
 * @desc    Add task to event
 * @access  Private
 */
router.post('/events/:id/tasks', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('title').notEmpty().withMessage('Task title is required')
], weddingEventController.addTask);

/**
 * @route   PATCH /api/wedding/events/:id/tasks/:taskId/complete
 * @desc    Complete task
 * @access  Private
 */
router.patch('/events/:id/tasks/:taskId/complete', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  param('taskId').isMongoId().withMessage('Invalid task ID')
], weddingEventController.completeTask);

/**
 * @route   POST /api/wedding/events/:id/timeline
 * @desc    Add timeline event
 * @access  Private
 */
router.post('/events/:id/timeline', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('time').notEmpty().withMessage('Time is required'),
  body('event').notEmpty().withMessage('Event description is required')
], weddingEventController.addTimelineEvent);

/**
 * @route   POST /api/wedding/events/:id/communications
 * @desc    Log communication
 * @access  Private
 */
router.post('/events/:id/communications', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('type').isIn(['email', 'phone', 'meeting', 'text']).withMessage('Invalid communication type'),
  body('with').notEmpty().withMessage('Communication recipient is required'),
  body('notes').notEmpty().withMessage('Communication notes are required')
], weddingEventController.logCommunication);

/**
 * @route   PATCH /api/wedding/events/:id/status
 * @desc    Update event status
 * @access  Private
 */
router.patch('/events/:id/status', authenticate, [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('status').isIn(['planning', 'confirmed', 'in-progress', 'completed', 'cancelled', 'postponed'])
    .withMessage('Invalid event status')
], weddingEventController.updateEventStatus);

module.exports = router;

