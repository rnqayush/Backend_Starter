const Vehicle = require('../models/Vehicle');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Vehicle Controller
 * Handles vehicle inventory management operations
 */
class VehicleController {
  /**
   * Create a new vehicle
   * @route POST /api/vehicles
   * @access Private
   */
  createVehicle = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const vehicleData = { ...req.body, website: req.website._id };
    const vehicle = await Vehicle.create(vehicleData);
    await vehicle.populate('website', 'name slug');

    successResponse(res, { vehicle }, 'Vehicle created successfully', 201);
  });

  /**
   * Get all vehicles for a website
   * @route GET /api/vehicles
   * @access Public
   */
  getVehicles = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'available';
    const make = req.query.make;
    const bodyType = req.query.bodyType;
    const fuelType = req.query.fuelType;
    const condition = req.query.condition;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = { website: req.website._id, status };
    
    if (make) query.make = new RegExp(make, 'i');
    if (bodyType) query['details.bodyType'] = bodyType;
    if (fuelType) query['details.fuelType'] = fuelType;
    if (condition) query.condition = condition;
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { stockNumber: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const vehicles = await Vehicle.find(query)
      .populate('website', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalItems = await Vehicle.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, vehicles, pagination, 'Vehicles retrieved successfully');
  });

  /**
   * Get vehicle by ID or slug
   * @route GET /api/vehicles/:identifier
   * @access Public
   */
  getVehicle = asyncHandler(async (req, res, next) => {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let vehicle = await Vehicle.findById(identifier).populate('website', 'name slug');
    
    if (!vehicle) {
      vehicle = await Vehicle.findOne({ 
        'seo.slug': identifier, 
        website: req.website._id 
      }).populate('website', 'name slug');
    }

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    // Increment view count
    await vehicle.incrementViews();

    // Get similar vehicles
    const similarVehicles = await Vehicle.find({
      make: vehicle.make,
      'details.bodyType': vehicle.details.bodyType,
      _id: { $ne: vehicle._id },
      status: 'available',
      website: req.website._id
    }).limit(4);

    successResponse(res, { vehicle, similarVehicles }, 'Vehicle retrieved successfully');
  });

  /**
   * Update vehicle
   * @route PUT /api/vehicles/:id
   * @access Private
   */
  updateVehicle = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (vehicle.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('website', 'name slug');

    successResponse(res, { vehicle: updatedVehicle }, 'Vehicle updated successfully');
  });

  /**
   * Delete vehicle
   * @route DELETE /api/vehicles/:id
   * @access Private
   */
  deleteVehicle = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (vehicle.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await Vehicle.findByIdAndDelete(id);
    successResponse(res, null, 'Vehicle deleted successfully');
  });

  /**
   * Search vehicles
   * @route GET /api/vehicles/search
   * @access Public
   */
  searchVehicles = asyncHandler(async (req, res, next) => {
    const {
      make,
      model,
      yearMin,
      yearMax,
      priceMin,
      priceMax,
      mileageMax,
      bodyType,
      fuelType,
      condition,
      transmission,
      drivetrain,
      categories,
      tags,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      make,
      model,
      yearMin: yearMin ? parseInt(yearMin) : undefined,
      yearMax: yearMax ? parseInt(yearMax) : undefined,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      mileageMax: mileageMax ? parseInt(mileageMax) : undefined,
      bodyType,
      fuelType,
      condition,
      transmission,
      drivetrain,
      categories: categories ? categories.split(',') : undefined,
      tags: tags ? tags.split(',') : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const vehicles = await Vehicle.searchVehicles(req.website._id, filters);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedVehicles = vehicles.slice(skip, skip + parseInt(limit));
    const totalItems = vehicles.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const pagination = { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalPages, 
      totalItems 
    };

    paginatedResponse(res, paginatedVehicles, pagination, 'Vehicles found');
  });

  /**
   * Get featured vehicles
   * @route GET /api/vehicles/featured
   * @access Public
   */
  getFeaturedVehicles = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const vehicles = await Vehicle.getFeaturedVehicles(req.website._id, limit);
    successResponse(res, { vehicles }, 'Featured vehicles retrieved successfully');
  });

  /**
   * Get recently added vehicles
   * @route GET /api/vehicles/recent
   * @access Public
   */
  getRecentVehicles = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const vehicles = await Vehicle.getRecentlyAdded(req.website._id, limit);
    successResponse(res, { vehicles }, 'Recent vehicles retrieved successfully');
  });

  /**
   * Get vehicles by price range
   * @route GET /api/vehicles/price-range
   * @access Public
   */
  getVehiclesByPriceRange = asyncHandler(async (req, res, next) => {
    const { minPrice, maxPrice } = req.query;

    if (!minPrice || !maxPrice) {
      return next(new AppError('Min price and max price are required', 400, 'PRICE_RANGE_REQUIRED'));
    }

    const vehicles = await Vehicle.getByPriceRange(
      req.website._id,
      parseFloat(minPrice),
      parseFloat(maxPrice)
    );

    successResponse(res, { vehicles }, 'Vehicles by price range retrieved successfully');
  });

  /**
   * Record vehicle inquiry
   * @route POST /api/vehicles/:id/inquire
   * @access Public
   */
  recordInquiry = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { customerInfo, message } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    await vehicle.recordInquiry();
    
    // Here you would typically send an email to the dealer
    // and store the inquiry in a separate inquiries collection
    
    successResponse(res, null, 'Inquiry sent successfully');
  });

  /**
   * Record test drive request
   * @route POST /api/vehicles/:id/test-drive
   * @access Public
   */
  recordTestDrive = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { customerInfo, preferredDate, preferredTime } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (!vehicle.availability.testDrive) {
      return next(new AppError('Test drives not available for this vehicle', 400, 'TEST_DRIVE_NOT_AVAILABLE'));
    }

    await vehicle.recordTestDrive();
    
    // Here you would typically schedule the test drive
    // and send confirmation emails
    
    successResponse(res, null, 'Test drive scheduled successfully');
  });

  /**
   * Add to favorites
   * @route POST /api/vehicles/:id/favorite
   * @access Public
   */
  addToFavorites = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    await vehicle.addToFavorites();
    successResponse(res, null, 'Vehicle added to favorites');
  });

  /**
   * Update vehicle status
   * @route PATCH /api/vehicles/:id/status
   * @access Private
   */
  updateVehicleStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'sold', 'pending', 'reserved', 'in-service', 'unavailable'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid vehicle status', 400, 'INVALID_STATUS'));
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (vehicle.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await vehicle.updateStatus(status);
    successResponse(res, { vehicle }, 'Vehicle status updated successfully');
  });

  /**
   * Add service record
   * @route POST /api/vehicles/:id/service-records
   * @access Private
   */
  addServiceRecord = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const serviceInfo = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (vehicle.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await vehicle.addServiceRecord(serviceInfo);
    successResponse(res, { vehicle }, 'Service record added successfully');
  });

  /**
   * Add inspection record
   * @route POST /api/vehicles/:id/inspections
   * @access Private
   */
  addInspection = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const inspectionInfo = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (vehicle.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await vehicle.addInspection(inspectionInfo);
    successResponse(res, { vehicle }, 'Inspection record added successfully');
  });

  /**
   * Get vehicle analytics
   * @route GET /api/vehicles/:id/analytics
   * @access Private
   */
  getVehicleAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    if (vehicle.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const analytics = {
      views: vehicle.analytics.views,
      inquiries: vehicle.analytics.inquiries,
      testDrives: vehicle.analytics.testDrives,
      favorites: vehicle.analytics.favorites,
      daysOnLot: vehicle.analytics.daysOnLot,
      lastViewed: vehicle.analytics.lastViewed,
      currentPrice: vehicle.currentPrice,
      savings: vehicle.savings,
      fuelEconomy: vehicle.fuelEconomy
    };

    successResponse(res, { analytics }, 'Vehicle analytics retrieved successfully');
  });

  /**
   * Get active offers for vehicle
   * @route GET /api/vehicles/:id/offers
   * @access Public
   */
  getActiveOffers = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND'));
    }

    const activeOffers = vehicle.getActiveOffers();
    successResponse(res, { offers: activeOffers }, 'Active offers retrieved successfully');
  });

  /**
   * Bulk update vehicles
   * @route PATCH /api/vehicles/bulk
   * @access Private
   */
  bulkUpdateVehicles = asyncHandler(async (req, res, next) => {
    const { vehicleIds, updates } = req.body;

    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return next(new AppError('Vehicle IDs array is required', 400, 'INVALID_VEHICLE_IDS'));
    }

    // Verify all vehicles belong to the website
    const vehicles = await Vehicle.find({
      _id: { $in: vehicleIds },
      website: req.website._id
    });

    if (vehicles.length !== vehicleIds.length) {
      return next(new AppError('Some vehicles not found or access denied', 403, 'ACCESS_DENIED'));
    }

    const result = await Vehicle.updateMany(
      { _id: { $in: vehicleIds }, website: req.website._id },
      updates,
      { runValidators: true }
    );

    successResponse(res, { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount 
    }, 'Vehicles updated successfully');
  });

  /**
   * Get inventory summary
   * @route GET /api/vehicles/inventory/summary
   * @access Private
   */
  getInventorySummary = asyncHandler(async (req, res, next) => {
    const totalVehicles = await Vehicle.countDocuments({ website: req.website._id });
    const availableVehicles = await Vehicle.countDocuments({ 
      website: req.website._id, 
      status: 'available' 
    });
    const soldVehicles = await Vehicle.countDocuments({ 
      website: req.website._id, 
      status: 'sold' 
    });
    const pendingVehicles = await Vehicle.countDocuments({ 
      website: req.website._id, 
      status: 'pending' 
    });

    // Get vehicles by condition
    const conditionBreakdown = await Vehicle.aggregate([
      { $match: { website: req.website._id } },
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);

    // Get vehicles by body type
    const bodyTypeBreakdown = await Vehicle.aggregate([
      { $match: { website: req.website._id } },
      { $group: { _id: '$details.bodyType', count: { $sum: 1 } } }
    ]);

    const summary = {
      total: totalVehicles,
      available: availableVehicles,
      sold: soldVehicles,
      pending: pendingVehicles,
      conditionBreakdown,
      bodyTypeBreakdown
    };

    successResponse(res, { summary }, 'Inventory summary retrieved successfully');
  });
}

module.exports = new VehicleController();

