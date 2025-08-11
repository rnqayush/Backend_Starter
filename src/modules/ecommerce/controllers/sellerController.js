const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../../auth/models/User');

// Get seller dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get product stats
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      draftProducts
    ] = await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, status: 'active' }),
      Product.countDocuments({ seller: sellerId, status: 'out_of_stock' }),
      Product.countDocuments({ seller: sellerId, status: 'draft' })
    ]);

    // Get order stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orderStats = await Order.aggregate([
      {
        $match: {
          'items.seller': sellerId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.totalPrice' },
          averageOrderValue: { $avg: '$items.totalPrice' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({
      'items.seller': sellerId
    })
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

    // Get low stock products
    const lowStockProducts = await Product.find({
      seller: sellerId,
      status: 'active',
      'inventory.trackQuantity': true,
      $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
    })
    .select('name sku inventory')
    .limit(10)
    .lean();

    const stats = orderStats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts,
          draft: draftProducts
        },
        orders: {
          total: stats.totalOrders,
          revenue: stats.totalRevenue,
          averageValue: stats.averageOrderValue
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get seller profile
const getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.user.id)
      .select('-password -refreshToken')
      .lean();

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Get seller's product count and rating
    const [productCount, avgRating] = await Promise.all([
      Product.countDocuments({ seller: req.user.id, status: 'active' }),
      Product.aggregate([
        { $match: { seller: req.user.id, status: 'active' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating.average' },
            totalReviews: { $sum: '$rating.count' }
          }
        }
      ])
    ]);

    const rating = avgRating[0] || { averageRating: 0, totalReviews: 0 };

    res.json({
      success: true,
      data: {
        ...seller,
        stats: {
          productCount,
          averageRating: rating.averageRating,
          totalReviews: rating.totalReviews
        }
      }
    });
  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller profile',
      error: error.message
    });
  }
};

// Update seller profile
const updateSellerProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated here
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.refreshToken;

    const seller = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: seller
    });
  } catch (error) {
    console.error('Update seller profile error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Get sales report
const getSalesReport = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day' // day, week, month
    } = req.query;

    const sellerId = req.user.id;
    
    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    // Build group format based on groupBy parameter
    let groupFormat;
    switch (groupBy) {
      case 'week':
        groupFormat = { $dateToString: { format: "%Y-W%U", date: "$createdAt" } };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default: // day
        groupFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const matchStage = {
      'items.seller': sellerId,
      status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
    };

    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }

    const salesData = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: groupFormat,
          totalSales: { $sum: '$items.totalPrice' },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          averageOrderValue: { $avg: '$items.totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId } },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          productName: { $first: '$items.productSnapshot.name' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        topProducts,
        summary: {
          totalRevenue: salesData.reduce((sum, item) => sum + item.totalSales, 0),
          totalOrders: salesData.reduce((sum, item) => sum + item.totalOrders, 0),
          totalQuantity: salesData.reduce((sum, item) => sum + item.totalQuantity, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales report',
      error: error.message
    });
  }
};

// Get inventory alerts
const getInventoryAlerts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Get low stock products
    const lowStockProducts = await Product.find({
      seller: sellerId,
      status: 'active',
      'inventory.trackQuantity': true,
      $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
    })
    .select('name sku inventory images')
    .sort({ 'inventory.quantity': 1 })
    .lean();

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      seller: sellerId,
      status: 'active',
      'inventory.trackQuantity': true,
      'inventory.quantity': 0
    })
    .select('name sku inventory images')
    .lean();

    res.json({
      success: true,
      data: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        alerts: {
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length
        }
      }
    });
  } catch (error) {
    console.error('Get inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory alerts',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getSellerProfile,
  updateSellerProfile,
  getSalesReport,
  getInventoryAlerts
};

