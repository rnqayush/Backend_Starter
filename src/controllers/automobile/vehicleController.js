import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Vehicle from '../../models/automobile/Vehicle.js';
import Enquiry from '../../models/automobile/Enquiry.js';
import { createSlug } from '../../utils/slugify.js';

// @desc    Get all vehicles with filters
// @route   GET /api/automobiles/vehicles
// @access  Public
export const getVehicles = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build filter object
  const filters = {
    status: 'published'
  };

  // Apply filters from query parameters
  if (req.query.make) filters.make = new RegExp(req.query.make, 'i');
  if (req.query.model) filters.model = new RegExp(req.query.model, 'i');
  if (req.query.bodyType) filters.bodyType = req.query.bodyType;
  if (req.query.fuelType) filters.fuelType = req.query.fuelType;
  if (req.query.transmission) filters.transmission = req.query.transmission;
  if (req.query.condition) filters.condition = req.query.condition;
  if (req.query.city) filters['location.city'] = new RegExp(req.query.city, 'i');

  // Price range filter
  if (req.query.priceMin || req.query.priceMax) {
    filters['price.current'] = {};
    if (req.query.priceMin) filters['price.current'].$gte = parseInt(req.query.priceMin);
    if (req.query.priceMax) filters['price.current'].$lte = parseInt(req.query.priceMax);
  }

  // Year range filter
  if (req.query.yearMin || req.query.yearMax) {
    filters.year = {};
    if (req.query.yearMin) filters.year.$gte = parseInt(req.query.yearMin);
    if (req.query.yearMax) filters.year.$lte = parseInt(req.query.yearMax);
  }

  // Sort options
  let sortBy = { createdAt: -1 };
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'price-low':
        sortBy = { 'price.current': 1 };
        break;
      case 'price-high':
        sortBy = { 'price.current': -1 };
        break;
      case 'year-new':
        sortBy = { year: -1 };
        break;
      case 'year-old':
        sortBy = { year: 1 };
        break;
      case 'popular':
        sortBy = { 'analytics.views': -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }
  }

  const vehicles = await Vehicle.find(filters)
    .populate('dealer', 'name businessInfo')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await Vehicle.countDocuments(filters);

  sendSuccess(res, {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: req.query
  }, 'Vehicles retrieved successfully');
});

// @desc    Create new vehicle
// @route   POST /api/automobiles/vehicles
// @access  Private (Dealer only)
export const createVehicle = asyncHandler(async (req, res, next) => {
  // Check if user is a dealer
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can create vehicle listings', 403);
  }

  const vehicleData = {
    ...req.body,
    dealer: req.user.id
  };

  // Generate slug if not provided
  if (!vehicleData.slug) {
    vehicleData.slug = createSlug(`${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`);
  }

  // Set dealer information from user profile
  if (req.user.businessInfo) {
    vehicleData.dealership = {
      name: req.user.businessInfo.name,
      address: req.user.businessInfo.address,
      contact: {
        phone: req.user.businessInfo.phone,
        email: req.user.businessInfo.email,
        website: req.user.businessInfo.website
      }
    };
  }

  const vehicle = await Vehicle.create(vehicleData);

  sendSuccess(res, {
    vehicle
  }, 'Vehicle created successfully', 201);
});

// @desc    Get single vehicle
// @route   GET /api/automobiles/vehicles/:id
// @access  Public
export const getVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('dealer', 'name businessInfo rating')
    .populate('competitors', 'make model year price images');

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Increment view count
  await vehicle.incrementViews();

  // Get similar vehicles
  const similarVehicles = await Vehicle.find({
    _id: { $ne: vehicle._id },
    make: vehicle.make,
    bodyType: vehicle.bodyType,
    status: 'published'
  })
    .limit(5)
    .select('make model year price images location');

  sendSuccess(res, {
    vehicle,
    similarVehicles
  }, 'Vehicle retrieved successfully');
});

// @desc    Update vehicle
// @route   PUT /api/automobiles/vehicles/:id
// @access  Private (Dealer only)
export const updateVehicle = asyncHandler(async (req, res, next) => {
  let vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Check if user owns this vehicle or is admin
  if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this vehicle', 403);
  }

  vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, {
    vehicle
  }, 'Vehicle updated successfully');
});

// @desc    Delete vehicle
// @route   DELETE /api/automobiles/vehicles/:id
// @access  Private (Dealer only)
export const deleteVehicle = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Check if user owns this vehicle or is admin
  if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this vehicle', 403);
  }

  await Vehicle.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Vehicle deleted successfully');
});

// @desc    Add vehicle images
// @route   POST /api/automobiles/vehicles/:id/images
// @access  Private (Dealer only)
export const addVehicleImages = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Check if user owns this vehicle
  if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vehicle', 403);
  }

  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return sendError(res, 'Images array is required', 400);
  }

  // Add images to vehicle
  vehicle.images.push(...images);
  await vehicle.save();

  sendSuccess(res, {
    vehicle: {
      id: vehicle._id,
      images: vehicle.images
    }
  }, 'Images added successfully');
});

// @desc    Delete vehicle image
// @route   DELETE /api/automobiles/vehicles/:id/images/:imageId
// @access  Private (Dealer only)
export const deleteVehicleImage = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Check if user owns this vehicle
  if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vehicle', 403);
  }

  // Remove image from array
  vehicle.images = vehicle.images.filter(img => img._id.toString() !== req.params.imageId);
  await vehicle.save();

  sendSuccess(res, {
    vehicle: {
      id: vehicle._id,
      images: vehicle.images
    }
  }, 'Image deleted successfully');
});

// @desc    Get vehicle analytics
// @route   GET /api/automobiles/vehicles/:id/analytics
// @access  Private (Dealer only)
export const getVehicleAnalytics = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Check if user owns this vehicle
  if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view analytics for this vehicle', 403);
  }

  // Get enquiries for this vehicle
  const enquiries = await Enquiry.find({ vehicle: req.params.id });
  const enquiryStats = await Enquiry.aggregate([
    { $match: { vehicle: mongoose.Types.ObjectId(req.params.id) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  sendSuccess(res, {
    analytics: vehicle.analytics,
    enquiries: {
      total: enquiries.length,
      breakdown: enquiryStats
    },
    performance: {
      viewToEnquiryRate: vehicle.analytics.views > 0 ? 
        ((vehicle.analytics.enquiries / vehicle.analytics.views) * 100).toFixed(2) : 0,
      enquiryToTestDriveRate: vehicle.analytics.enquiries > 0 ? 
        ((vehicle.analytics.testDrives / vehicle.analytics.enquiries) * 100).toFixed(2) : 0
    }
  }, 'Vehicle analytics retrieved successfully');
});

// @desc    Calculate EMI for vehicle
// @route   POST /api/automobiles/vehicles/:id/calculate-emi
// @access  Public
export const calculateEMI = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  const { downPayment = 0, loanTenure = 60, interestRate = 8.5 } = req.body;

  const emiDetails = vehicle.calculateEMI(downPayment, loanTenure, interestRate);

  sendSuccess(res, {
    vehicle: {
      id: vehicle._id,
      name: vehicle.fullName,
      price: vehicle.price.current
    },
    emiDetails
  }, 'EMI calculated successfully');
});

// @desc    Compare vehicles
// @route   POST /api/automobiles/vehicles/compare
// @access  Public
export const compareVehicles = asyncHandler(async (req, res, next) => {
  const { vehicleIds } = req.body;

  if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length < 2) {
    return sendError(res, 'At least 2 vehicle IDs are required for comparison', 400);
  }

  if (vehicleIds.length > 4) {
    return sendError(res, 'Maximum 4 vehicles can be compared at once', 400);
  }

  const vehicles = await Vehicle.find({
    _id: { $in: vehicleIds },
    status: 'published'
  }).populate('dealer', 'name businessInfo');

  if (vehicles.length !== vehicleIds.length) {
    return sendError(res, 'Some vehicles not found', 404);
  }

  // Prepare comparison data
  const comparison = {
    vehicles: vehicles.map(vehicle => ({
      id: vehicle._id,
      name: vehicle.fullName,
      price: vehicle.price,
      specifications: vehicle.specifications,
      features: vehicle.features,
      mileage: vehicle.mileage,
      images: vehicle.images.slice(0, 1), // Only primary image
      dealer: vehicle.dealer
    })),
    commonFeatures: [],
    uniqueFeatures: {}
  };

  sendSuccess(res, comparison, 'Vehicle comparison data retrieved successfully');
});

// @desc    Get popular vehicles
// @route   GET /api/automobiles/vehicles/popular
// @access  Public
export const getPopularVehicles = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category; // 'budget', 'mid-range', 'premium', 'luxury'

  let query = { status: 'published' };

  if (category) {
    switch (category) {
      case 'budget':
        query['price.current'] = { $lt: 500000 };
        break;
      case 'mid-range':
        query['price.current'] = { $gte: 500000, $lt: 1500000 };
        break;
      case 'premium':
        query['price.current'] = { $gte: 1500000, $lt: 3000000 };
        break;
      case 'luxury':
        query['price.current'] = { $gte: 3000000 };
        break;
    }
  }

  const vehicles = await Vehicle.find(query)
    .populate('dealer', 'name businessInfo')
    .sort({ 'analytics.views': -1, 'analytics.enquiries': -1 })
    .limit(limit)
    .select('make model year price images location analytics rating');

  sendSuccess(res, {
    vehicles,
    category: category || 'all'
  }, 'Popular vehicles retrieved successfully');
});

// @desc    Search vehicles
// @route   GET /api/automobiles/vehicles/search
// @access  Public
export const searchVehicles = asyncHandler(async (req, res, next) => {
  const { q, ...filters } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = { status: 'published' };

  // Text search
  if (q) {
    query.$or = [
      { make: new RegExp(q, 'i') },
      { model: new RegExp(q, 'i') },
      { 'features.safety': new RegExp(q, 'i') },
      { 'features.comfort': new RegExp(q, 'i') },
      { tags: new RegExp(q, 'i') }
    ];
  }

  // Apply additional filters
  const searchQuery = Vehicle.searchVehicles(filters);
  if (q) {
    searchQuery.where(query);
  }

  const vehicles = await searchQuery
    .populate('dealer', 'name businessInfo')
    .sort({ 'analytics.views': -1 })
    .skip(skip)
    .limit(limit);

  const total = await Vehicle.countDocuments(query);

  sendSuccess(res, {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    searchQuery: q,
    filters
  }, 'Vehicle search completed successfully');
});
