const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');
const User = require('../../auth/models/User');

// Get vendor data by slug (for frontend fetchEcommerceData)
const getVendorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const vendor = await Vendor.findOne({ slug, status: 'active' })
      .populate('owner', 'name email')
      .lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get vendor's products with categories
    const products = await Product.find({ 
      seller: vendor.owner._id, 
      status: { $in: ['active', 'out_of_stock'] }
    })
    .populate('category', 'name slug')
    .sort({ featured: -1, createdAt: -1 })
    .lean();

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Structure response to match frontend expectations
    const response = {
      vendor: {
        ...vendor,
        id: vendor.slug // Frontend expects id field
      },
      data: {
        allCategories: categories,
        allProducts: products,
        products: products, // Alias for compatibility
        categories: categories, // Alias for compatibility
        promotions: vendor.promotions || [],
        customerReviews: [], // TODO: Implement reviews
        financing: vendor.financing || {},
        pageSections: vendor.pageContent?.sections || []
      },
      meta: {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.status === 'active').length,
        lastUpdated: vendor.updatedAt,
        isDataPersisted: vendor.isDataPersisted
      }
    };

    // Increment view count
    await Vendor.findByIdAndUpdate(vendor._id, {
      $inc: { 'analytics.totalViews': 1, 'analytics.monthlyViews': 1 }
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching vendor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor data',
      error: error.message
    });
  }
};

// Save complete vendor data (for frontend saveEcommerceData)
const saveCompleteData = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Find vendor and verify ownership
    const vendor = await Vendor.findOne({ slug });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vendor'
      });
    }

    // Update vendor data
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendor._id,
      {
        ...updateData,
        lastDataSync: new Date(),
        isDataPersisted: true
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vendor data saved successfully',
      data: {
        ...updateData,
        lastSaved: updatedVendor.lastDataSync,
        isDataPersisted: true
      }
    });
  } catch (error) {
    console.error('Error saving vendor data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save vendor data',
      error: error.message
    });
  }
};

// Publish changes (for frontend publishChanges)
const publishChanges = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // Find vendor and verify ownership
    const vendor = await Vendor.findOne({ slug });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to publish this vendor'
      });
    }

    // Update vendor status and publish timestamp
    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendor._id,
      {
        status: 'active',
        lastDataSync: new Date(),
        isDataPersisted: true
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Changes published successfully',
      data: {
        lastPublished: updatedVendor.lastDataSync,
        isDataPersisted: true,
        status: updatedVendor.status
      }
    });
  } catch (error) {
    console.error('Error publishing changes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish changes',
      error: error.message
    });
  }
};

// Get all vendors (with filtering and pagination)
const getAllVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      state,
      featured,
      search,
      sort = '-rating'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };
    
    if (category) filter.category = category;
    if (city) filter['businessInfo.address.city'] = new RegExp(city, 'i');
    if (state) filter['businessInfo.address.state'] = new RegExp(state, 'i');
    if (featured === 'true') filter.featured = true;
    
    // Add text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .populate('owner', 'name email')
        .select('-pageContent -policies') // Exclude heavy fields
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Vendor.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + vendors.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
};

// Create new vendor
const createVendor = async (req, res) => {
  try {
    const userId = req.user.id;
    const vendorData = req.body;

    // Check if user already has a vendor
    const existingVendor = await Vendor.findOne({ owner: userId });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'User already has a vendor account'
      });
    }

    // Create new vendor
    const vendor = new Vendor({
      ...vendorData,
      owner: userId,
      ownerInfo: {
        name: req.user.name,
        email: req.user.email,
        ...vendorData.ownerInfo
      }
    });

    await vendor.save();

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendor
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vendor',
      error: error.message
    });
  }
};

// Update vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find vendor and verify ownership
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vendor'
      });
    }

    // Update vendor
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vendor updated successfully',
      data: updatedVendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor',
      error: error.message
    });
  }
};

// Delete vendor
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find vendor and verify ownership
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    if (vendor.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vendor'
      });
    }

    // Soft delete by setting status to inactive
    await Vendor.findByIdAndUpdate(id, { status: 'inactive' });

    res.json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vendor',
      error: error.message
    });
  }
};

// Get vendor dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's vendor
    const vendor = await Vendor.findOne({ owner: userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Get product stats
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      draftProducts
    ] = await Promise.all([
      Product.countDocuments({ seller: userId }),
      Product.countDocuments({ seller: userId, status: 'active' }),
      Product.countDocuments({ seller: userId, status: 'out_of_stock' }),
      Product.countDocuments({ seller: userId, status: 'draft' })
    ]);

    // Get order stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orderStats = await Order.aggregate([
      {
        $match: {
          'items.seller': userId,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.seller': userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$items.totalPrice' },
          averageOrderValue: { $avg: '$items.totalPrice' }
        }
      }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };

    res.json({
      success: true,
      data: {
        vendor: {
          name: vendor.name,
          slug: vendor.slug,
          status: vendor.status,
          rating: vendor.rating,
          reviewCount: vendor.reviewCount,
          totalViews: vendor.analytics.totalViews,
          monthlyViews: vendor.analytics.monthlyViews
        },
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
        analytics: vendor.analytics
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

module.exports = {
  getVendorBySlug,
  saveCompleteData,
  publishChanges,
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getDashboardStats
};
