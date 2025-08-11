const Dealer = require('../models/Dealer');
const Vehicle = require('../models/Vehicle');
const User = require('../../auth/models/User');

// Get dealer data by slug (for frontend fetchAutomobileData)
const getDealerBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const dealer = await Dealer.findOne({ slug, status: 'active' })
      .populate('owner', 'name email')
      .lean();

    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found'
      });
    }

    // Get dealer's vehicles
    const vehicles = await Vehicle.find({ 
      dealer: dealer._id, 
      status: { $in: ['active', 'sold'] }
    })
    .sort({ featured: -1, createdAt: -1 })
    .lean();

    // Get unique categories
    const categories = [...new Set(vehicles.map(v => v.category).filter(Boolean))];

    // Structure response to match frontend expectations
    const response = {
      data: {
        vendor: {
          ...dealer,
          id: dealer.slug, // Frontend expects id field
          slug: dealer.slug
        },
        allCategories: categories,
        allVehicles: vehicles,
        vehicles: vehicles, // Alias for compatibility
        categories: categories, // Alias for compatibility
        promotions: vehicles.flatMap(v => v.promotions || []),
        customerReviews: [], // TODO: Implement reviews
        financing: dealer.services?.financing || {},
        pageSections: dealer.pageContent?.sections || []
      },
      meta: {
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        lastUpdated: dealer.updatedAt,
        isDataPersisted: dealer.isDataPersisted
      }
    };

    // Increment view count
    await Dealer.findByIdAndUpdate(dealer._id, {
      $inc: { 'analytics.totalViews': 1, 'analytics.monthlyViews': 1 }
    });

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error fetching dealer data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dealer data',
      error: error.message
    });
  }
};

// Save complete dealer data (for frontend saveCompleteData)
const saveCompleteData = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // Find dealer and verify ownership
    const dealer = await Dealer.findOne({ slug });
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found'
      });
    }

    if (dealer.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this dealer'
      });
    }

    // Update dealer data
    const updatedDealer = await Dealer.findByIdAndUpdate(
      dealer._id,
      {
        ...updateData,
        lastDataSync: new Date(),
        isDataPersisted: true
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Dealer data saved successfully',
      data: {
        ...updateData,
        lastSaved: updatedDealer.lastDataSync,
        isDataPersisted: true
      }
    });
  } catch (error) {
    console.error('Error saving dealer data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save dealer data',
      error: error.message
    });
  }
};

// Get all dealers (with filtering and pagination)
const getAllDealers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      city,
      state,
      brand,
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
    if (brand) filter['brands.name'] = new RegExp(brand, 'i');
    
    // Add text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [dealers, total] = await Promise.all([
      Dealer.find(filter)
        .populate('owner', 'name email')
        .select('-pageContent -policies') // Exclude heavy fields
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Dealer.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        dealers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + dealers.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dealers',
      error: error.message
    });
  }
};

// Create new dealer
const createDealer = async (req, res) => {
  try {
    const userId = req.user.id;
    const dealerData = req.body;

    // Check if user already has a dealer
    const existingDealer = await Dealer.findOne({ owner: userId });
    if (existingDealer) {
      return res.status(400).json({
        success: false,
        message: 'User already has a dealer account'
      });
    }

    // Create new dealer
    const dealer = new Dealer({
      ...dealerData,
      owner: userId,
      ownerInfo: {
        name: req.user.name,
        email: req.user.email,
        ...dealerData.ownerInfo
      }
    });

    await dealer.save();

    res.status(201).json({
      success: true,
      message: 'Dealer created successfully',
      data: dealer
    });
  } catch (error) {
    console.error('Error creating dealer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dealer',
      error: error.message
    });
  }
};

// Update dealer
const updateDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find dealer and verify ownership
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found'
      });
    }

    if (dealer.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this dealer'
      });
    }

    // Update dealer
    const updatedDealer = await Dealer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Dealer updated successfully',
      data: updatedDealer
    });
  } catch (error) {
    console.error('Error updating dealer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dealer',
      error: error.message
    });
  }
};

// Delete dealer
const deleteDealer = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find dealer and verify ownership
    const dealer = await Dealer.findById(id);
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found'
      });
    }

    if (dealer.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this dealer'
      });
    }

    // Soft delete by setting status to inactive
    await Dealer.findByIdAndUpdate(id, { status: 'inactive' });

    res.json({
      success: true,
      message: 'Dealer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dealer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete dealer',
      error: error.message
    });
  }
};

// Get dealer dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's dealer
    const dealer = await Dealer.findOne({ owner: userId });
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found'
      });
    }

    // Get vehicle stats
    const [
      totalVehicles,
      activeVehicles,
      soldVehicles,
      draftVehicles
    ] = await Promise.all([
      Vehicle.countDocuments({ dealer: dealer._id }),
      Vehicle.countDocuments({ dealer: dealer._id, status: 'active' }),
      Vehicle.countDocuments({ dealer: dealer._id, 'availability.status': 'sold' }),
      Vehicle.countDocuments({ dealer: dealer._id, status: 'draft' })
    ]);

    // Get recent activity stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentStats = await Vehicle.aggregate([
      {
        $match: {
          dealer: dealer._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalInquiries: { $sum: '$inquiries' },
          averagePrice: { $avg: '$price.msrp' }
        }
      }
    ]);

    const stats = recentStats[0] || { totalViews: 0, totalInquiries: 0, averagePrice: 0 };

    res.json({
      success: true,
      data: {
        dealer: {
          name: dealer.name,
          slug: dealer.slug,
          status: dealer.status,
          rating: dealer.rating,
          reviewCount: dealer.reviewCount,
          totalViews: dealer.analytics.totalViews,
          monthlyViews: dealer.analytics.monthlyViews
        },
        vehicles: {
          total: totalVehicles,
          active: activeVehicles,
          sold: soldVehicles,
          draft: draftVehicles
        },
        performance: {
          views: stats.totalViews,
          inquiries: stats.totalInquiries,
          averagePrice: stats.averagePrice,
          conversionRate: dealer.analytics.conversionRate
        },
        analytics: dealer.analytics
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
  getDealerBySlug,
  saveCompleteData,
  getAllDealers,
  createDealer,
  updateDealer,
  deleteDealer,
  getDashboardStats
};
