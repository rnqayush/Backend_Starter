const WeddingVendor = require('../models/WeddingVendor');
const Booking = require('../models/Booking');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

class WeddingController extends BaseController {
  constructor() {
    super(WeddingVendor, 'WeddingVendor');
    this.searchFields = ['businessName', 'description', 'specialties', 'location.city'];
    this.populateFields = ['business'];
  }

  /**
   * Get wedding vendors with filtering
   */
  getVendors = asyncHandler(async (req, res) => {
    const {
      category,
      city,
      state,
      minPrice,
      maxPrice,
      rating,
      availability,
      page = 1,
      limit = 12,
      sortBy = '-createdAt'
    } = req.query;

    let query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Location filters
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    // Price range filter (based on minimum service price)
    if (minPrice || maxPrice) {
      query['services.basePrice'] = {};
      if (minPrice) query['services.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['services.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    const total = await WeddingVendor.countDocuments(query);
    const skip = (page - 1) * limit;

    let vendors = await WeddingVendor.find(query)
      .populate('business', 'name slug contact')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by availability if date provided
    if (availability) {
      const availabilityDate = new Date(availability);
      const availableVendors = [];

      for (const vendor of vendors) {
        const conflictingBookings = await Booking.find({
          weddingVendor: vendor._id,
          'eventDetails.eventDate': availabilityDate,
          status: { $in: ['confirmed', 'in-progress'] }
        });

        if (conflictingBookings.length === 0) {
          availableVendors.push(vendor);
        }
      }

      vendors = availableVendors;
    }

    return ResponseHandler.paginated(res, vendors, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: vendors.length
    }, 'Wedding vendors retrieved successfully');
  });

  /**
   * Get vendor by category
   */
  getByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 12, city, state } = req.query;

    let query = {
      category: { $regex: category, $options: 'i' },
      isActive: true
    };

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (state) query['location.state'] = { $regex: state, $options: 'i' };

    const total = await WeddingVendor.countDocuments(query);
    const skip = (page - 1) * limit;

    const vendors = await WeddingVendor.find(query)
      .populate('business', 'name slug')
      .sort('-rating.average')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, vendors, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, `${category} vendors retrieved successfully`);
  });

  /**
   * Check vendor availability
   */
  checkAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { eventDate } = req.query;

    if (!eventDate) {
      throw new BadRequestError('Event date is required');
    }

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    const eventDateTime = new Date(eventDate);
    
    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      weddingVendor: id,
      'eventDetails.eventDate': eventDateTime,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    const isAvailable = conflictingBookings.length === 0;

    return ResponseHandler.success(res, {
      available: isAvailable,
      eventDate: eventDateTime,
      vendor: {
        id: vendor._id,
        businessName: vendor.businessName,
        category: vendor.category
      }
    }, 'Availability check completed');
  });

  /**
   * Add service to vendor
   */
  addService = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const serviceData = req.body;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    await this.checkOwnership(vendor, req.user);

    vendor.services.push(serviceData);
    await vendor.save();

    const newService = vendor.services[vendor.services.length - 1];
    return ResponseHandler.created(res, newService, 'Service added successfully');
  });

  /**
   * Update service
   */
  updateService = asyncHandler(async (req, res) => {
    const { id, serviceId } = req.params;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    await this.checkOwnership(vendor, req.user);

    const serviceIndex = vendor.services.findIndex(
      service => service._id.toString() === serviceId
    );

    if (serviceIndex === -1) {
      throw new NotFoundError('Service not found');
    }

    Object.assign(vendor.services[serviceIndex], req.body);
    await vendor.save();

    return ResponseHandler.updated(res, vendor.services[serviceIndex], 'Service updated successfully');
  });

  /**
   * Delete service
   */
  deleteService = asyncHandler(async (req, res) => {
    const { id, serviceId } = req.params;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    await this.checkOwnership(vendor, req.user);

    const serviceIndex = vendor.services.findIndex(
      service => service._id.toString() === serviceId
    );

    if (serviceIndex === -1) {
      throw new NotFoundError('Service not found');
    }

    // Check if service has active bookings
    const activeBookings = await Booking.find({
      weddingVendor: id,
      'serviceDetails.serviceId': serviceId,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    if (activeBookings.length > 0) {
      throw new BadRequestError('Cannot delete service with active bookings');
    }

    vendor.services.splice(serviceIndex, 1);
    await vendor.save();

    return ResponseHandler.deleted(res, 'Service deleted successfully');
  });

  /**
   * Get vendor bookings
   */
  getVendorBookings = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    await this.checkOwnership(vendor, req.user);

    let query = { weddingVendor: id };

    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Booking.countDocuments(query);
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, bookings, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Vendor bookings retrieved successfully');
  });

  /**
   * Get vendor analytics
   */
  getVendorAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    await this.checkOwnership(vendor, req.user);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const bookingStats = await Booking.aggregate([
      {
        $match: {
          weddingVendor: vendor._id,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageBookingValue: { $avg: '$totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get popular services
    const popularServices = await Booking.aggregate([
      {
        $match: {
          weddingVendor: vendor._id,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$serviceDetails.serviceName',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    const analytics = {
      bookingStats: bookingStats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        confirmedBookings: 0,
        completedBookings: 0
      },
      popularServices,
      totalServices: vendor.services.length,
      rating: vendor.rating,
      period: { start, end }
    };

    return ResponseHandler.success(res, analytics, 'Vendor analytics retrieved successfully');
  });

  /**
   * Get wedding categories
   */
  getCategories = asyncHandler(async (req, res) => {
    const categories = await WeddingVendor.distinct('category');
    
    return ResponseHandler.success(res, categories, 'Wedding categories retrieved successfully');
  });
}

module.exports = new WeddingController();

