const Hotel = require('../models/Hotel');
const Product = require('../models/Product');
const Vehicle = require('../models/Vehicle');
const WeddingVendor = require('../models/WeddingVendor');
const Business = require('../models/Business');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, ForbiddenError } = require('../utils/customErrors');

class AnalyticsController {
  /**
   * Get platform-wide analytics (Admin only)
   */
  getPlatformAnalytics = asyncHandler(async (req, res) => {
    // Check admin access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      throw new ForbiddenError('Access denied. Admin privileges required.');
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get overall platform statistics
    const [
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalOrders,
      recentUsers,
      recentBusinesses
    ] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments({ status: 'active' }),
      Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Order.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Business.countDocuments({ createdAt: { $gte: start, $lte: end } })
    ]);

    // Get revenue statistics
    const revenueStats = await this.getPlatformRevenue(start, end);

    // Get business type distribution
    const businessTypeDistribution = await Business.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get user growth trends
    const userGrowthTrends = await User.aggregate([
      {
        $match: { createdAt: { $gte: start, $lte: end } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const analytics = {
      overview: {
        totalUsers,
        totalBusinesses,
        totalBookings,
        totalOrders,
        recentUsers,
        recentBusinesses
      },
      revenue: revenueStats,
      businessTypeDistribution,
      userGrowthTrends,
      period: { start, end }
    };

    return ResponseHandler.success(res, analytics, 'Platform analytics retrieved successfully');
  });

  /**
   * Get business analytics dashboard
   */
  getBusinessDashboard = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Check access
    const business = await Business.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get analytics based on business type
    let analytics = {
      business: {
        id: business._id,
        name: business.name,
        type: business.type,
        status: business.status
      },
      period: { start, end }
    };

    switch (business.type) {
      case 'hotel':
        analytics.hotel = await this.getHotelAnalytics(businessId, start, end);
        break;
      case 'ecommerce':
        analytics.ecommerce = await this.getEcommerceAnalytics(businessId, start, end);
        break;
      case 'wedding':
        analytics.wedding = await this.getWeddingAnalytics(businessId, start, end);
        break;
      case 'automobile':
        analytics.automobile = await this.getAutomobileAnalytics(businessId, start, end);
        break;
      case 'business':
        analytics.website = await this.getWebsiteAnalytics(businessId, start, end);
        break;
    }

    return ResponseHandler.success(res, analytics, 'Business dashboard analytics retrieved successfully');
  });

  /**
   * Get hotel analytics
   */
  getHotelAnalytics = async (businessId, start, end) => {
    const hotels = await Hotel.find({ business: businessId });
    const hotelIds = hotels.map(h => h._id);

    // Booking statistics
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
          averageBookingValue: { $avg: '$totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Occupancy rate calculation
    const totalRooms = hotels.reduce((sum, hotel) => {
      return sum + hotel.rooms.reduce((roomSum, room) => roomSum + room.quantity, 0);
    }, 0);

    const occupancyData = await this.calculateOccupancyRate(hotelIds, start, end, totalRooms);

    // Popular room types
    const popularRoomTypes = await Booking.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['confirmed', 'checked-in', 'checked-out'] }
        }
      },
      { $unwind: '$roomDetails' },
      {
        $group: {
          _id: '$roomDetails.roomType',
          bookings: { $sum: 1 },
          revenue: { $sum: '$roomDetails.totalPrice' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    // Daily booking trends
    const dailyTrends = await Booking.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return {
      overview: {
        totalHotels: hotels.length,
        totalRooms,
        ...bookingStats[0]
      },
      occupancyRate: occupancyData.occupancyRate,
      popularRoomTypes,
      dailyTrends
    };
  };

  /**
   * Get ecommerce analytics
   */
  getEcommerceAnalytics = async (businessId, start, end) => {
    const products = await Product.find({ business: businessId });

    // Order statistics
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
          averageOrderValue: { $avg: '$pricing.total' },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Inventory status
    const inventoryStats = await Product.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          inStockProducts: {
            $sum: { $cond: [{ $gt: ['$inventory.quantity', 0] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$inventory.quantity', 0] }, 1, 0] }
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$inventory.quantity', 0] },
                    { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    return {
      overview: {
        totalProducts: products.length,
        ...orderStats[0]
      },
      topProducts,
      inventory: inventoryStats[0]
    };
  };

  /**
   * Get wedding analytics
   */
  getWeddingAnalytics = async (businessId, start, end) => {
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

    // Popular services
    const popularServices = await Booking.aggregate([
      {
        $match: {
          business: businessId,
          bookingType: 'wedding',
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

    return {
      overview: {
        totalVendors: vendors.length,
        ...bookingStats[0]
      },
      popularServices
    };
  };

  /**
   * Get automobile analytics
   */
  getAutomobileAnalytics = async (businessId, start, end) => {
    const vehicles = await Vehicle.find({ business: businessId });

    const vehicleStats = {
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(v => v.status === 'available').length,
      soldVehicles: vehicles.filter(v => v.status === 'sold').length,
      reservedVehicles: vehicles.filter(v => v.status === 'reserved').length
    };

    // Popular makes
    const popularMakes = await Vehicle.aggregate([
      { $match: { business: businessId } },
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Price distribution
    const priceDistribution = await Vehicle.aggregate([
      { $match: { business: businessId, status: 'available' } },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 10000, 25000, 50000, 100000, 500000],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    return {
      overview: vehicleStats,
      popularMakes,
      priceDistribution
    };
  };

  /**
   * Get website analytics
   */
  getWebsiteAnalytics = async (businessId, start, end) => {
    const Blog = require('../models/Blog');
    
    const blogs = await Blog.find({ business: businessId });
    
    const blogStats = {
      totalBlogs: blogs.length,
      publishedBlogs: blogs.filter(b => b.status === 'published').length,
      draftBlogs: blogs.filter(b => b.status === 'draft').length,
      totalViews: blogs.reduce((sum, blog) => sum + (blog.views || 0), 0)
    };

    // Most viewed blogs
    const topBlogs = blogs
      .filter(b => b.status === 'published')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(blog => ({
        title: blog.title,
        slug: blog.slug,
        views: blog.views || 0,
        publishedAt: blog.publishedAt
      }));

    return {
      overview: blogStats,
      topBlogs
    };
  };

  /**
   * Get revenue comparison
   */
  getRevenueComparison = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { period = 'month' } = req.query; // month, quarter, year

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const business = await Business.findById(businessId);
    if (!business) {
      throw new NotFoundError('Business not found');
    }

    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    switch (period) {
      case 'month':
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        currentStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
        currentEnd = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        previousStart = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        previousEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
        break;
      case 'year':
        currentStart = new Date(now.getFullYear(), 0, 1);
        currentEnd = new Date(now.getFullYear(), 11, 31);
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    // Get revenue for both periods
    const [currentRevenue, previousRevenue] = await Promise.all([
      this.getBusinessRevenue(businessId, business.type, currentStart, currentEnd),
      this.getBusinessRevenue(businessId, business.type, previousStart, previousEnd)
    ]);

    const comparison = {
      current: {
        period: { start: currentStart, end: currentEnd },
        revenue: currentRevenue
      },
      previous: {
        period: { start: previousStart, end: previousEnd },
        revenue: previousRevenue
      },
      growth: {
        amount: currentRevenue - previousRevenue,
        percentage: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
      }
    };

    return ResponseHandler.success(res, comparison, 'Revenue comparison retrieved successfully');
  });

  /**
   * Helper methods
   */
  getPlatformRevenue = async (start, end) => {
    const [bookingRevenue, orderRevenue] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'checked-out', 'completed'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    return {
      bookings: bookingRevenue[0]?.total || 0,
      orders: orderRevenue[0]?.total || 0,
      total: (bookingRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0)
    };
  };

  getBusinessRevenue = async (businessId, businessType, start, end) => {
    let revenue = 0;

    if (['hotel', 'wedding'].includes(businessType)) {
      const bookingRevenue = await Booking.aggregate([
        {
          $match: {
            business: businessId,
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'checked-out', 'completed'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      revenue = bookingRevenue[0]?.total || 0;
    } else if (businessType === 'ecommerce') {
      const orderRevenue = await Order.aggregate([
        {
          $match: {
            business: businessId,
            createdAt: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      revenue = orderRevenue[0]?.total || 0;
    }

    return revenue;
  };

  calculateOccupancyRate = async (hotelIds, start, end, totalRooms) => {
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalRoomNights = totalRooms * totalDays;

    const occupiedRoomNights = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
          'dates.checkIn': { $gte: start },
          'dates.checkOut': { $lte: end }
        }
      },
      {
        $project: {
          nights: {
            $divide: [
              { $subtract: ['$dates.checkOut', '$dates.checkIn'] },
              1000 * 60 * 60 * 24
            ]
          },
          roomsBooked: { $size: '$roomDetails' }
        }
      },
      {
        $group: {
          _id: null,
          totalOccupiedNights: { $sum: { $multiply: ['$nights', '$roomsBooked'] } }
        }
      }
    ]);

    const occupancyRate = totalRoomNights > 0 
      ? ((occupiedRoomNights[0]?.totalOccupiedNights || 0) / totalRoomNights) * 100 
      : 0;

    return { occupancyRate: Math.round(occupancyRate * 100) / 100 };
  };
}

module.exports = new AnalyticsController();

