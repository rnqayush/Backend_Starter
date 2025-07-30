const Vehicle = require('../models/Vehicle');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

class VehicleController extends BaseController {
  constructor() {
    super(Vehicle, 'Vehicle');
    this.searchFields = ['make', 'model', 'description', 'features'];
    this.populateFields = ['business'];
  }

  /**
   * Get vehicles with advanced filtering
   */
  getVehicles = asyncHandler(async (req, res) => {
    const {
      make,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      bodyType,
      condition,
      mileage,
      page = 1,
      limit = 12,
      sortBy = '-createdAt'
    } = req.query;

    let query = { status: 'available', isActive: true };

    // Make and model filters
    if (make) query.make = { $regex: make, $options: 'i' };
    if (model) query.model = { $regex: model, $options: 'i' };

    // Year range
    if (minYear || maxYear) {
      query.year = {};
      if (minYear) query.year.$gte = parseInt(minYear);
      if (maxYear) query.year.$lte = parseInt(maxYear);
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Other filters
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (bodyType) query.bodyType = bodyType;
    if (condition) query.condition = condition;
    if (mileage) query.mileage = { $lte: parseInt(mileage) };

    const total = await Vehicle.countDocuments(query);
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find(query)
      .populate('business', 'name slug contact')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, vehicles, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Vehicles retrieved successfully');
  });

  /**
   * Get vehicle by VIN
   */
  getByVin = asyncHandler(async (req, res) => {
    const { vin } = req.params;

    const vehicle = await Vehicle.findOne({ vin })
      .populate('business', 'name slug contact');

    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    return ResponseHandler.success(res, vehicle, 'Vehicle retrieved successfully');
  });

  /**
   * Get featured vehicles
   */
  getFeaturedVehicles = asyncHandler(async (req, res) => {
    const { limit = 8 } = req.query;

    const vehicles = await Vehicle.find({
      featured: true,
      status: 'available',
      isActive: true
    })
      .populate('business', 'name slug')
      .sort('-createdAt')
      .limit(parseInt(limit));

    return ResponseHandler.success(res, vehicles, 'Featured vehicles retrieved successfully');
  });

  /**
   * Update vehicle status
   */
  updateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    await this.checkOwnership(vehicle, req.user);

    const validStatuses = ['available', 'sold', 'reserved', 'inactive'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    vehicle.status = status;
    if (status === 'sold') {
      vehicle.soldAt = new Date();
    }

    await vehicle.save();

    return ResponseHandler.updated(res, vehicle, 'Vehicle status updated successfully');
  });

  /**
   * Get vehicle analytics
   */
  getVehicleAnalytics = asyncHandler(async (req, res) => {
    const { businessId } = req.params;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const analytics = await Vehicle.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          availableVehicles: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
          },
          soldVehicles: {
            $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    // Get popular makes
    const popularMakes = await Vehicle.aggregate([
      { $match: { business: businessId } },
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const result = {
      summary: analytics[0] || {
        totalVehicles: 0,
        availableVehicles: 0,
        soldVehicles: 0,
        averagePrice: 0,
        totalValue: 0
      },
      popularMakes
    };

    return ResponseHandler.success(res, result, 'Vehicle analytics retrieved successfully');
  });
}

module.exports = new VehicleController();

