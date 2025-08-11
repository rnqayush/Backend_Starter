const Vehicle = require('../models/Vehicle');
const Dealer = require('../models/Dealer');

// Get vehicle details by ID (for frontend fetchVehicleDetails)
const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { vendorSlug } = req.query;

    // Find vehicle and populate dealer info
    const vehicle = await Vehicle.findById(vehicleId)
      .populate('dealer', 'name slug businessInfo rating')
      .lean();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Verify vehicle belongs to the specified dealer if vendorSlug provided
    if (vendorSlug && vehicle.dealer.slug !== vendorSlug) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found for this dealer'
      });
    }

    // Increment view count
    await Vehicle.findByIdAndUpdate(vehicleId, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle details',
      error: error.message
    });
  }
};

// Get all vehicles with filtering and pagination
const getAllVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      make,
      model,
      year,
      category,
      condition,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      dealer,
      city,
      state,
      featured,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = { status: 'active', 'availability.status': 'available' };
    
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (year) filter.year = parseInt(year);
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (featured === 'true') filter.featured = true;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter['price.msrp'] = {};
      if (minPrice) filter['price.msrp'].$gte = parseInt(minPrice);
      if (maxPrice) filter['price.msrp'].$lte = parseInt(maxPrice);
    }

    // Dealer filter
    if (dealer) {
      const dealerDoc = await Dealer.findOne({ slug: dealer });
      if (dealerDoc) {
        filter.dealer = dealerDoc._id;
      }
    }

    // Location filter (requires dealer population)
    let locationFilter = {};
    if (city) locationFilter['dealer.businessInfo.address.city'] = new RegExp(city, 'i');
    if (state) locationFilter['dealer.businessInfo.address.state'] = new RegExp(state, 'i');
    
    // Add text search if provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build aggregation pipeline for location filtering
    let pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'dealers',
          localField: 'dealer',
          foreignField: '_id',
          as: 'dealer'
        }
      },
      { $unwind: '$dealer' }
    ];

    // Add location filter if needed
    if (Object.keys(locationFilter).length > 0) {
      pipeline.push({ $match: locationFilter });
    }

    // Add sorting, pagination, and projection
    pipeline.push(
      { $sort: this.parseSortString(sort) },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          make: 1,
          model: 1,
          year: 1,
          category: 1,
          condition: 1,
          price: 1,
          mileage: 1,
          images: 1,
          features: 1,
          availability: 1,
          status: 1,
          featured: 1,
          views: 1,
          slug: 1,
          title: 1,
          description: 1,
          highlights: 1,
          createdAt: 1,
          updatedAt: 1,
          'dealer.name': 1,
          'dealer.slug': 1,
          'dealer.businessInfo.logo': 1,
          'dealer.businessInfo.address.city': 1,
          'dealer.businessInfo.address.state': 1,
          'dealer.rating': 1
        }
      }
    );

    // Execute aggregation
    const [vehicles, totalCount] = await Promise.all([
      Vehicle.aggregate(pipeline),
      Vehicle.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'dealers',
            localField: 'dealer',
            foreignField: '_id',
            as: 'dealer'
          }
        },
        { $unwind: '$dealer' },
        ...(Object.keys(locationFilter).length > 0 ? [{ $match: locationFilter }] : []),
        { $count: 'total' }
      ])
    ]);

    const total = totalCount[0]?.total || 0;

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + vehicles.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

// Helper function to parse sort string
function parseSortString(sortStr) {
  const sortObj = {};
  const parts = sortStr.split(',');
  
  parts.forEach(part => {
    const trimmed = part.trim();
    if (trimmed.startsWith('-')) {
      sortObj[trimmed.substring(1)] = -1;
    } else {
      sortObj[trimmed] = 1;
    }
  });
  
  return sortObj;
}

// Create new vehicle
const createVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleData = req.body;

    // Find user's dealer
    const dealer = await Dealer.findOne({ owner: userId });
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer account not found. Please create a dealer account first.'
      });
    }

    // Create new vehicle
    const vehicle = new Vehicle({
      ...vehicleData,
      dealer: dealer._id
    });

    await vehicle.save();

    // Populate dealer info for response
    await vehicle.populate('dealer', 'name slug businessInfo.logo');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find vehicle and verify ownership through dealer
    const vehicle = await Vehicle.findById(id).populate('dealer');
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.dealer.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle'
      });
    }

    // Update vehicle
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('dealer', 'name slug businessInfo.logo');

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updatedVehicle
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find vehicle and verify ownership through dealer
    const vehicle = await Vehicle.findById(id).populate('dealer');
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    if (vehicle.dealer.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vehicle'
      });
    }

    // Soft delete by setting status to inactive
    await Vehicle.findByIdAndUpdate(id, { status: 'inactive' });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
};

// Get vehicles by dealer
const getVehiclesByDealer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, category, condition } = req.query;

    // Find user's dealer
    const dealer = await Dealer.findOne({ owner: userId });
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer account not found'
      });
    }

    // Build filter
    const filter = { dealer: dealer._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Vehicle.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + vehicles.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dealer vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
};

// Record vehicle inquiry
const recordInquiry = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { type = 'general', message, contactInfo } = req.body;

    // Find vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Increment inquiry count
    await Vehicle.findByIdAndUpdate(vehicleId, { $inc: { inquiries: 1 } });

    // TODO: Implement inquiry tracking/notification system
    // This could involve creating an Inquiry model and sending notifications

    res.json({
      success: true,
      message: 'Inquiry recorded successfully',
      data: {
        vehicleId,
        type,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error recording inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record inquiry',
      error: error.message
    });
  }
};

// Get vehicle statistics
const getVehicleStats = async (req, res) => {
  try {
    const { dealerSlug } = req.params;

    // Find dealer
    const dealer = await Dealer.findOne({ slug: dealerSlug });
    if (!dealer) {
      return res.status(404).json({
        success: false,
        message: 'Dealer not found'
      });
    }

    // Get vehicle statistics
    const stats = await Vehicle.aggregate([
      { $match: { dealer: dealer._id } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          activeVehicles: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          soldVehicles: {
            $sum: { $cond: [{ $eq: ['$availability.status', 'sold'] }, 1, 0] }
          },
          averagePrice: { $avg: '$price.msrp' },
          totalViews: { $sum: '$views' },
          totalInquiries: { $sum: '$inquiries' },
          categories: { $addToSet: '$category' },
          makes: { $addToSet: '$make' }
        }
      }
    ]);

    const result = stats[0] || {
      totalVehicles: 0,
      activeVehicles: 0,
      soldVehicles: 0,
      averagePrice: 0,
      totalViews: 0,
      totalInquiries: 0,
      categories: [],
      makes: []
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle statistics',
      error: error.message
    });
  }
};

module.exports = {
  getVehicleById,
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByDealer,
  recordInquiry,
  getVehicleStats
};
