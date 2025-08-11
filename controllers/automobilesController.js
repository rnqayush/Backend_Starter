const Vehicle = require('../models/Vehicle');
const Business = require('../models/Business');
const { validationResult } = require('express-validator');

// Get all vehicles for a business
const getVehiclesByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      page = 1,
      limit = 10,
      search,
      minPrice,
      maxPrice,
      brand,
      category,
      fuelType,
      transmission,
      year,
    } = req.query;

    // Build filter
    const filter = { business: businessId, status: 'available' };

    if (search) {
      filter.$or = [
        { 'basicInfo.title': { $regex: search, $options: 'i' } },
        { 'basicInfo.brand': { $regex: search, $options: 'i' } },
        { 'basicInfo.model': { $regex: search, $options: 'i' } },
        { 'basicInfo.description': { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      filter['pricing.price'] = {};
      if (minPrice) filter['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.price'].$lte = Number(maxPrice);
    }

    if (brand) {
      filter['basicInfo.brand'] = { $regex: brand, $options: 'i' };
    }

    if (category) {
      filter['basicInfo.category'] = category;
    }

    if (fuelType) {
      filter['specifications.fuelType'] = fuelType;
    }

    if (transmission) {
      filter['specifications.transmission'] = transmission;
    }

    if (year) {
      filter['specifications.year'] = { $gte: Number(year) };
    }

    const vehicles = await Vehicle.find(filter)
      .populate('business', 'name slug type businessInfo')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vehicle.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message,
    });
  }
};

// Get single vehicle
const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      'business',
      'name slug type businessInfo branding'
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Increment view count
    vehicle.analytics.views += 1;
    vehicle.analytics.lastViewedAt = new Date();
    await vehicle.save();

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message,
    });
  }
};

// Create vehicle
const createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const business = await Business.findById(req.body.business);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check if user owns the business
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create vehicle for this business',
      });
    }

    const vehicle = new Vehicle({
      ...req.body,
      createdBy: req.user.id,
    });

    await vehicle.save();
    await vehicle.populate('business', 'name slug type');

    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message,
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('business');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Check if user owns the business
    if (
      vehicle.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this vehicle',
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('business', 'name slug type');

    res.json({
      success: true,
      data: updatedVehicle,
      message: 'Vehicle updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message,
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('business');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Check if user owns the business
    if (
      vehicle.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this vehicle',
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message,
    });
  }
};

// Search vehicles
const searchVehicles = async (req, res) => {
  try {
    const {
      location,
      brand,
      model,
      category,
      minPrice,
      maxPrice,
      fuelType,
      transmission,
      minYear,
      maxYear,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { status: 'available' };

    if (location) {
      const business = await Business.find({
        $or: [
          { 'businessInfo.address.city': { $regex: location, $options: 'i' } },
          { 'businessInfo.address.state': { $regex: location, $options: 'i' } },
        ],
      });
      const businessIds = business.map(b => b._id);
      filter.business = { $in: businessIds };
    }

    if (brand) {
      filter['basicInfo.brand'] = { $regex: brand, $options: 'i' };
    }

    if (model) {
      filter['basicInfo.model'] = { $regex: model, $options: 'i' };
    }

    if (category) {
      filter['basicInfo.category'] = category;
    }

    if (minPrice || maxPrice) {
      filter['pricing.price'] = {};
      if (minPrice) filter['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.price'].$lte = Number(maxPrice);
    }

    if (fuelType) {
      filter['specifications.fuelType'] = fuelType;
    }

    if (transmission) {
      filter['specifications.transmission'] = transmission;
    }

    if (minYear || maxYear) {
      filter['specifications.year'] = {};
      if (minYear) filter['specifications.year'].$gte = Number(minYear);
      if (maxYear) filter['specifications.year'].$lte = Number(maxYear);
    }

    const vehicles = await Vehicle.find(filter)
      .populate('business', 'name slug type businessInfo')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Vehicle.countDocuments(filter);

    res.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
        },
        filters: {
          location,
          brand,
          model,
          category,
          minPrice,
          maxPrice,
          fuelType,
          transmission,
          minYear,
          maxYear,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching vehicles',
      error: error.message,
    });
  }
};

// Get vehicle analytics
const getVehicleAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check if user owns the business
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this business',
      });
    }

    const totalVehicles = await Vehicle.countDocuments({
      business: businessId,
    });
    const availableVehicles = await Vehicle.countDocuments({
      business: businessId,
      status: 'available',
    });
    const soldVehicles = await Vehicle.countDocuments({
      business: businessId,
      status: 'sold',
    });

    const vehicles = await Vehicle.find({ business: businessId });
    const totalViews = vehicles.reduce(
      (sum, vehicle) => sum + vehicle.analytics.views,
      0
    );
    const totalInquiries = vehicles.reduce(
      (sum, vehicle) => sum + vehicle.analytics.inquiries,
      0
    );

    const analytics = {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      totalViews,
      totalInquiries,
      conversionRate:
        totalInquiries > 0
          ? ((soldVehicles / totalInquiries) * 100).toFixed(2)
          : 0,
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle analytics',
      error: error.message,
    });
  }
};

// Submit vehicle inquiry
const submitInquiry = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { name, email, phone, message } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Increment inquiry count
    vehicle.analytics.inquiries += 1;
    vehicle.analytics.lastInquiredAt = new Date();

    // Add inquiry to vehicle
    const inquiry = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      message,
      createdAt: new Date(),
      status: 'pending',
    };

    vehicle.inquiries.push(inquiry);
    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: { inquiryId: inquiry.id },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting inquiry',
      error: error.message,
    });
  }
};

module.exports = {
  getVehiclesByBusiness,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getVehicleAnalytics,
  submitInquiry,
};
