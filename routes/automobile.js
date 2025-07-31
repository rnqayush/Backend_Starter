const express = require('express');
const { body, param, query } = require('express-validator');
const vehicleController = require('../controllers/vehicleController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Automobile Routes
 * Handles vehicle inventory and automotive service management
 */

// Vehicle validation rules
const createVehicleValidation = [
  body('make')
    .notEmpty()
    .withMessage('Vehicle make is required'),
  body('model')
    .notEmpty()
    .withMessage('Vehicle model is required'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Valid year is required'),
  body('details.bodyType')
    .isIn(['sedan', 'suv', 'truck', 'coupe', 'convertible', 'wagon', 'hatchback', 'van', 'motorcycle', 'other'])
    .withMessage('Invalid body type'),
  body('details.transmission')
    .isIn(['manual', 'automatic', 'cvt', 'semi-automatic'])
    .withMessage('Invalid transmission type'),
  body('details.fuelType')
    .isIn(['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'hydrogen'])
    .withMessage('Invalid fuel type'),
  body('details.drivetrain')
    .isIn(['fwd', 'rwd', 'awd', '4wd'])
    .withMessage('Invalid drivetrain'),
  body('condition')
    .isIn(['new', 'used', 'certified-pre-owned', 'salvage', 'rebuilt'])
    .withMessage('Invalid condition'),
  body('pricing.listPrice')
    .isFloat({ min: 0 })
    .withMessage('List price must be a positive number'),
  body('details.color.exterior')
    .notEmpty()
    .withMessage('Exterior color is required')
];

const updateVehicleValidation = [
  body('make')
    .optional()
    .notEmpty()
    .withMessage('Vehicle make cannot be empty'),
  body('model')
    .optional()
    .notEmpty()
    .withMessage('Vehicle model cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Valid year is required'),
  body('pricing.listPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('List price must be a positive number')
];

// =============================================================================
// VEHICLE ROUTES
// =============================================================================

/**
 * @route   GET /api/automobile/vehicles
 * @desc    Get all vehicles
 * @access  Public
 */
router.get('/vehicles', vehicleController.getVehicles);

/**
 * @route   GET /api/automobile/vehicles/search
 * @desc    Search vehicles
 * @access  Public
 */
router.get('/vehicles/search', vehicleController.searchVehicles);

/**
 * @route   GET /api/automobile/vehicles/featured
 * @desc    Get featured vehicles
 * @access  Public
 */
router.get('/vehicles/featured', vehicleController.getFeaturedVehicles);

/**
 * @route   GET /api/automobile/vehicles/recent
 * @desc    Get recently added vehicles
 * @access  Public
 */
router.get('/vehicles/recent', vehicleController.getRecentVehicles);

/**
 * @route   GET /api/automobile/vehicles/price-range
 * @desc    Get vehicles by price range
 * @access  Public
 */
router.get('/vehicles/price-range', [
  query('minPrice').isFloat({ min: 0 }).withMessage('Min price must be positive'),
  query('maxPrice').isFloat({ min: 0 }).withMessage('Max price must be positive')
], vehicleController.getVehiclesByPriceRange);

/**
 * @route   GET /api/automobile/vehicles/inventory/summary
 * @desc    Get inventory summary
 * @access  Private
 */
router.get('/vehicles/inventory/summary', authenticate, vehicleController.getInventorySummary);

/**
 * @route   GET /api/automobile/vehicles/:identifier
 * @desc    Get vehicle by ID or slug
 * @access  Public
 */
router.get('/vehicles/:identifier', vehicleController.getVehicle);

/**
 * @route   GET /api/automobile/vehicles/:id/offers
 * @desc    Get active offers for vehicle
 * @access  Public
 */
router.get('/vehicles/:id/offers', [
  param('id').isMongoId().withMessage('Invalid vehicle ID')
], vehicleController.getActiveOffers);

/**
 * @route   GET /api/automobile/vehicles/:id/analytics
 * @desc    Get vehicle analytics
 * @access  Private
 */
router.get('/vehicles/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid vehicle ID')
], vehicleController.getVehicleAnalytics);

/**
 * @route   POST /api/automobile/vehicles
 * @desc    Create a new vehicle
 * @access  Private
 */
router.post('/vehicles', authenticate, createVehicleValidation, vehicleController.createVehicle);

/**
 * @route   PUT /api/automobile/vehicles/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.put('/vehicles/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  ...updateVehicleValidation
], vehicleController.updateVehicle);

/**
 * @route   DELETE /api/automobile/vehicles/:id
 * @desc    Delete vehicle
 * @access  Private
 */
router.delete('/vehicles/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid vehicle ID')
], vehicleController.deleteVehicle);

/**
 * @route   POST /api/automobile/vehicles/:id/inquire
 * @desc    Record vehicle inquiry
 * @access  Public
 */
router.post('/vehicles/:id/inquire', [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('customerInfo.name').notEmpty().withMessage('Customer name is required'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('message').notEmpty().withMessage('Message is required')
], vehicleController.recordInquiry);

/**
 * @route   POST /api/automobile/vehicles/:id/test-drive
 * @desc    Record test drive request
 * @access  Public
 */
router.post('/vehicles/:id/test-drive', [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('customerInfo.name').notEmpty().withMessage('Customer name is required'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('preferredDate').isISO8601().withMessage('Valid preferred date is required')
], vehicleController.recordTestDrive);

/**
 * @route   POST /api/automobile/vehicles/:id/favorite
 * @desc    Add to favorites
 * @access  Public
 */
router.post('/vehicles/:id/favorite', [
  param('id').isMongoId().withMessage('Invalid vehicle ID')
], vehicleController.addToFavorites);

/**
 * @route   PATCH /api/automobile/vehicles/:id/status
 * @desc    Update vehicle status
 * @access  Private
 */
router.patch('/vehicles/:id/status', authenticate, [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('status').isIn(['available', 'sold', 'pending', 'reserved', 'in-service', 'unavailable'])
    .withMessage('Invalid vehicle status')
], vehicleController.updateVehicleStatus);

/**
 * @route   POST /api/automobile/vehicles/:id/service-records
 * @desc    Add service record
 * @access  Private
 */
router.post('/vehicles/:id/service-records', authenticate, [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('date').isISO8601().withMessage('Valid service date is required'),
  body('mileage').isInt({ min: 0 }).withMessage('Valid mileage is required'),
  body('service').notEmpty().withMessage('Service description is required')
], vehicleController.addServiceRecord);

/**
 * @route   POST /api/automobile/vehicles/:id/inspections
 * @desc    Add inspection record
 * @access  Private
 */
router.post('/vehicles/:id/inspections', authenticate, [
  param('id').isMongoId().withMessage('Invalid vehicle ID'),
  body('date').isISO8601().withMessage('Valid inspection date is required'),
  body('type').notEmpty().withMessage('Inspection type is required'),
  body('result').isIn(['pass', 'fail', 'conditional']).withMessage('Invalid inspection result')
], vehicleController.addInspection);

/**
 * @route   PATCH /api/automobile/vehicles/bulk
 * @desc    Bulk update vehicles
 * @access  Private
 */
router.patch('/vehicles/bulk', authenticate, [
  body('vehicleIds').isArray({ min: 1 }).withMessage('Vehicle IDs array is required')
], vehicleController.bulkUpdateVehicles);

module.exports = router;

