const Business = require('../models/Business');
const User = require('../models/User');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/customErrors');

class BusinessController extends BaseController {
  constructor() {
    super(Business, 'Business');
    this.searchFields = ['name', 'description', 'address.city', 'address.state'];
    this.populateFields = ['owner'];
  }

  /**
   * Create new business
   */
  createBusiness = asyncHandler(async (req, res) => {
    const {
      name,
      slug,
      description,
      type,
      address,
      contact,
      socialMedia,
      businessHours,
      settings
    } = req.body;

    // Check if slug is unique
    const existingBusiness = await Business.findOne({ slug });
    if (existingBusiness) {
      throw new ConflictError('Business slug already exists');
    }

    // Create business
    const business = await Business.create({
      name,
      slug,
      description,
      type,
      address,
      contact,
      socialMedia,
      businessHours,
      settings,
      owner: req.user.id,
      status: 'active'
    });

    // Add business to user's businesses array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { businesses: business._id }
    });

    await business.populate('owner', 'name email');

    return ResponseHandler.created(res, business, 'Business created successfully');
  });

  /**
   * Get business by slug
   */
  getBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const business = await Business.findOne({ slug, isActive: true })
      .populate('owner', 'name email');

    if (!business) {
      throw new NotFoundError('Business not found');
    }

    // Increment view count
    business.analytics.views = (business.analytics.views || 0) + 1;
    await business.save();

    return ResponseHandler.success(res, business, 'Business retrieved successfully');
  });

  /**
   * Get businesses by type
   */
  getByType = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const {
      city,
      state,
      featured,
      page = 1,
      limit = 12,
      sortBy = '-createdAt'
    } = req.query;

    let query = { type, status: 'active', isActive: true };

    // Location filters
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    const total = await Business.countDocuments(query);
    const skip = (page - 1) * limit;

    const businesses = await Business.find(query)
      .populate('owner', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, businesses, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, `${type} businesses retrieved successfully`);
  });

  /**
   * Get user's businesses
   */
  getUserBusinesses = asyncHandler(async (req, res) => {
    const businesses = await Business.find({ owner: req.user.id })
      .sort('-createdAt');

    return ResponseHandler.success(res, businesses, 'User businesses retrieved successfully');
  });

  /**
   * Update business settings
   */
  updateSettings = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { settings } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    await this.checkOwnership(business, req.user);

    business.settings = { ...business.settings, ...settings };
    await business.save();

    return ResponseHandler.updated(res, business, 'Business settings updated successfully');
  });

  /**
   * Update business theme
   */
  updateTheme = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { theme } = req.body;

    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    await this.checkOwnership(business, req.user);

    business.theme = { ...business.theme, ...theme };
    await business.save();

    return ResponseHandler.updated(res, business, 'Business theme updated successfully');
  });

  /**
   * Get business analytics
   */
  getBusinessAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    await this.checkOwnership(business, req.user);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get analytics based on business type
    let analytics = {
      views: business.analytics.views || 0,
      period: { start, end }
    };

    // Type-specific analytics
    switch (business.type) {
      case 'hotel':
        analytics.hotel = await this.getHotelAnalytics(id, start, end);
        break;
      case 'ecommerce':
        analytics.ecommerce = await this.getEcommerceAnalytics(id, start, end);
        break;
      case 'wedding':
        analytics.wedding = await this.getWeddingAnalytics(id, start, end);
        break;
      case 'automobile':
        analytics.automobile = await this.getAutomobileAnalytics(id, start, end);
        break;
      case 'business':
        analytics.website = await this.getWebsiteAnalytics(id, start, end);
        break;
    }

    return ResponseHandler.success(res, analytics, 'Business analytics retrieved successfully');
  });

  /**
   * Get hotel-specific analytics
   */
  getHotelAnalytics = async (businessId, start, end) => {
    const Hotel = require('../models/Hotel');
    const Booking = require('../models/Booking');

    const hotels = await Hotel.find({ business: businessId });
    const hotelIds = hotels.map(h => h._id);

    const bookingStats = await Booking.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    return {
      totalHotels: hotels.length,
      bookingStats: bookingStats[0] || { totalBookings: 0, totalRevenue: 0, averageBookingValue: 0 }
    };
  };

  /**
   * Get ecommerce-specific analytics
   */
  getEcommerceAnalytics = async (businessId, start, end) => {
    const Product = require('../models/Product');
    const Order = require('../models/Order');

    const products = await Product.find({ business: businessId });
    
    const orderStats = await Order.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    return {
      totalProducts: products.length,
      orderStats: orderStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }
    };
  };

  /**
   * Get wedding-specific analytics
   */
  getWeddingAnalytics = async (businessId, start, end) => {
    const WeddingVendor = require('../models/WeddingVendor');
    const Booking = require('../models/Booking');

    const vendors = await WeddingVendor.find({ business: businessId });
    
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          business: businessId,
          bookingType: 'wedding',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    return {
      totalVendors: vendors.length,
      bookingStats: bookingStats[0] || { totalBookings: 0, totalRevenue: 0 }
    };
  };

  /**
   * Get automobile-specific analytics
   */
  getAutomobileAnalytics = async (businessId, start, end) => {
    const Vehicle = require('../models/Vehicle');

    const vehicles = await Vehicle.find({ business: businessId });
    const activeListings = vehicles.filter(v => v.status === 'available').length;
    const soldVehicles = vehicles.filter(v => v.status === 'sold').length;

    return {
      totalVehicles: vehicles.length,
      activeListings,
      soldVehicles
    };
  };

  /**
   * Get website-specific analytics
   */
  getWebsiteAnalytics = async (businessId, start, end) => {
    const Blog = require('../models/Blog');

    const blogs = await Blog.find({ business: businessId });
    const publishedBlogs = blogs.filter(b => b.status === 'published').length;

    return {
      totalBlogs: blogs.length,
      publishedBlogs
    };
  };

  /**
   * Toggle business status
   */
  toggleStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    await this.checkOwnership(business, req.user);

    business.status = business.status === 'active' ? 'inactive' : 'active';
    await business.save();

    return ResponseHandler.updated(res, business, `Business ${business.status === 'active' ? 'activated' : 'deactivated'} successfully`);
  });

  /**
   * Get business dashboard data
   */
  getDashboard = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const business = await Business.findById(id);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    await this.checkOwnership(business, req.user);

    // Get recent activity based on business type
    let recentActivity = [];
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    switch (business.type) {
      case 'hotel':
        const Booking = require('../models/Booking');
        recentActivity = await Booking.find({
          business: id,
          createdAt: { $gte: last7Days }
        })
          .populate('customer', 'name')
          .sort('-createdAt')
          .limit(10);
        break;

      case 'ecommerce':
        const Order = require('../models/Order');
        recentActivity = await Order.find({
          business: id,
          createdAt: { $gte: last7Days }
        })
          .populate('customer', 'name')
          .sort('-createdAt')
          .limit(10);
        break;

      // Add other business types as needed
    }

    // Get quick stats
    const quickStats = await this.getQuickStats(business);

    const dashboard = {
      business,
      quickStats,
      recentActivity
    };

    return ResponseHandler.success(res, dashboard, 'Business dashboard data retrieved successfully');
  });

  /**
   * Get quick statistics for dashboard
   */
  getQuickStats = async (business) => {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let stats = {};

    switch (business.type) {
      case 'hotel':
        const Booking = require('../models/Booking');
        const bookingCount = await Booking.countDocuments({
          business: business._id,
          createdAt: { $gte: last30Days }
        });
        stats = { bookings: bookingCount };
        break;

      case 'ecommerce':
        const Order = require('../models/Order');
        const orderCount = await Order.countDocuments({
          business: business._id,
          createdAt: { $gte: last30Days }
        });
        stats = { orders: orderCount };
        break;

      // Add other business types
    }

    return stats;
  };

  /**
   * Search businesses
   */
  searchBusinesses = asyncHandler(async (req, res) => {
    const {
      query,
      type,
      city,
      state,
      page = 1,
      limit = 12
    } = req.query;

    let searchQuery = {
      status: 'active',
      isActive: true
    };

    // Text search
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } }
      ];
    }

    // Type filter
    if (type) {
      searchQuery.type = type;
    }

    // Location filters
    if (city) {
      searchQuery['address.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      searchQuery['address.state'] = { $regex: state, $options: 'i' };
    }

    const total = await Business.countDocuments(searchQuery);
    const skip = (page - 1) * limit;

    const businesses = await Business.find(searchQuery)
      .populate('owner', 'name')
      .sort('-featured -createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, businesses, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Businesses search results retrieved successfully');
  });
}

module.exports = new BusinessController();

