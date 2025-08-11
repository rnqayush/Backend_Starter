const Business = require('../models/Business');
const Hotel = require('../models/Hotel');
const Product = require('../models/Product');
const Vehicle = require('../models/Vehicle');
const Service = require('../models/Service');

// @desc    Get business by slug
// @route   GET /api/business/:slug
// @access  Public
const getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const business = await Business.findOne({
      slug,
      'settings.isPublished': true,
    }).populate('owner', 'name email avatar');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Increment view count
    await business.incrementViews();

    // Get business-specific data based on type
    let businessData = { business };

    switch (business.type) {
      case 'hotel':
        const hotels = await Hotel.find({ business: business._id });
        businessData.hotels = hotels;
        break;

      case 'ecommerce':
        const products = await Product.find({
          business: business._id,
          status: 'published',
        }).populate('category');
        businessData.products = products;
        break;

      case 'automobile':
        const vehicles = await Vehicle.find({
          business: business._id,
          'availability.status': { $ne: 'sold' },
        }).populate('category');
        businessData.vehicles = vehicles;
        break;

      case 'wedding':
      case 'business':
        const services = await Service.find({
          business: business._id,
          active: true,
        });
        businessData.services = services;
        break;
    }

    res.json({
      success: true,
      data: businessData,
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create new business
// @route   POST /api/business
// @access  Private
const createBusiness = async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      owner: req.user.id,
    };

    const business = await Business.create(businessData);

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: { business },
    });
  } catch (error) {
    console.error('Create business error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Business name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during business creation',
    });
  }
};

// @desc    Update business
// @route   PUT /api/business/:id
// @access  Private
const updateBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check ownership
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this business',
      });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Business updated successfully',
      data: { business: updatedBusiness },
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during business update',
    });
  }
};

// @desc    Get user businesses
// @route   GET /api/business/my-businesses
// @access  Private
const getMyBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find({ owner: req.user.id });

    res.json({
      success: true,
      data: { businesses },
    });
  } catch (error) {
    console.error('Get my businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete business
// @route   DELETE /api/business/:id
// @access  Private
const deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check ownership
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this business',
      });
    }

    await Business.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during business deletion',
    });
  }
};

// @desc    Get business analytics
// @route   GET /api/business/:id/analytics
// @access  Private
const getBusinessAnalytics = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check ownership
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics',
      });
    }

    // Get detailed analytics based on business type
    let analytics = {
      overview: business.analytics,
      businessType: business.type,
    };

    // Add business-specific analytics
    switch (business.type) {
      case 'ecommerce':
        const totalProducts = await Product.countDocuments({
          business: business._id,
        });
        const publishedProducts = await Product.countDocuments({
          business: business._id,
          status: 'published',
        });

        analytics.products = {
          total: totalProducts,
          published: publishedProducts,
          draft: totalProducts - publishedProducts,
        };
        break;

      case 'automobile':
        const totalVehicles = await Vehicle.countDocuments({
          business: business._id,
        });
        const availableVehicles = await Vehicle.countDocuments({
          business: business._id,
          'availability.status': 'available',
        });

        analytics.vehicles = {
          total: totalVehicles,
          available: availableVehicles,
          sold: totalVehicles - availableVehicles,
        };
        break;

      case 'hotel':
        const totalRooms = await Hotel.aggregate([
          { $match: { business: business._id } },
          { $unwind: '$rooms' },
          { $count: 'totalRooms' },
        ]);

        analytics.rooms = {
          total: totalRooms[0]?.totalRooms || 0,
        };
        break;
    }

    res.json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getBusinessBySlug,
  createBusiness,
  updateBusiness,
  getMyBusinesses,
  deleteBusiness,
  getBusinessAnalytics,
};
