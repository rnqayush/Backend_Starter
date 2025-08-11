const mongoose = require('mongoose');
const Vehicle = require('../../models/Vehicle');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class VehicleController {
  // Get all vehicles with filtering and pagination
  async getAllVehicles(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        make,
        model,
        year,
        category,
        condition,
        minPrice,
        maxPrice,
        maxMileage,
        city,
        state,
        featured,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query;

      // Build filter query
      const filter = { status: 'available' };

      if (make) filter.make = new RegExp(make, 'i');
      if (model) filter.model = new RegExp(model, 'i');
      if (year) filter.year = parseInt(year);
      if (category) filter.category = category;
      if (condition) filter.condition = condition;
      if (city) filter['location.city'] = new RegExp(city, 'i');
      if (state) filter['location.state'] = new RegExp(state, 'i');
      if (featured === 'true') filter['marketing.featured'] = true;

      // Price filtering
      if (minPrice || maxPrice) {
        filter['pricing.listPrice'] = {};
        if (minPrice) filter['pricing.listPrice'].$gte = parseFloat(minPrice);
        if (maxPrice) filter['pricing.listPrice'].$lte = parseFloat(maxPrice);
      }

      // Mileage filtering
      if (maxMileage) {
        filter['history.mileage'] = { $lte: parseInt(maxMileage) };
      }

      // Search functionality
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      if (search) {
        sort.score = { $meta: 'textScore' };
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const vehicles = await Vehicle.find(filter)
        .populate('dealerId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Vehicle.countDocuments(filter);

      return successResponse(res, 'Vehicles retrieved successfully', {
        vehicles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        filters: {
          make, model, year, category, condition,
          minPrice, maxPrice, maxMileage, city, state, featured, search,
        },
      });
    } catch (error) {
      console.error('Get vehicles error:', error);
      return errorResponse(res, 'Failed to retrieve vehicles', 500);
    }
  }

  // Get single vehicle by ID or slug
  async getVehicleById(req, res) {
    try {
      const { id } = req.params;
      
      // Try to find by ID first, then by slug
      let vehicle = await Vehicle.findById(id)
        .populate('dealerId', 'name email phone avatar');
      
      if (!vehicle) {
        vehicle = await Vehicle.findOne({ slug: id, status: 'available' })
          .populate('dealerId', 'name email phone avatar');
      }

      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      // Increment view count
      await vehicle.incrementView();

      // Get similar vehicles
      const similarVehicles = await Vehicle.find({
        make: vehicle.make,
        model: vehicle.model,
        _id: { $ne: vehicle._id },
        status: 'available',
      })
        .limit(6)
        .select('title year make model pricing images location slug');

      return successResponse(res, 'Vehicle retrieved successfully', {
        vehicle,
        similarVehicles,
      });
    } catch (error) {
      console.error('Get vehicle error:', error);
      return errorResponse(res, 'Failed to retrieve vehicle', 500);
    }
  }

  // Create new vehicle listing (dealers only)
  async createVehicle(req, res) {
    try {
      const vehicleData = {
        ...req.body,
        dealerId: req.user.id,
        dealershipName: req.user.name || 'Auto Dealer',
      };

      const vehicle = new Vehicle(vehicleData);
      await vehicle.save();

      return successResponse(res, 'Vehicle listed successfully', { vehicle }, 201);
    } catch (error) {
      console.error('Create vehicle error:', error);
      if (error.code === 11000) {
        if (error.keyPattern.vin) {
          return errorResponse(res, 'Vehicle with this VIN already exists', 400);
        }
        return errorResponse(res, 'Duplicate vehicle listing', 400);
      }
      return errorResponse(res, error.message || 'Failed to create vehicle listing', 500);
    }
  }

  // Update vehicle (dealer only)
  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if vehicle exists and user owns it
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      if (vehicle.dealerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. You can only update your own listings', 403);
      }

      // Track price changes
      if (updateData.pricing && updateData.pricing.listPrice !== vehicle.pricing.listPrice) {
        if (!vehicle.pricing.priceHistory) {
          vehicle.pricing.priceHistory = [];
        }
        vehicle.pricing.priceHistory.push({
          price: vehicle.pricing.listPrice,
          date: new Date(),
          reason: 'Price update',
        });
      }

      updateData.lastModified = new Date();

      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('dealerId', 'name email phone');

      return successResponse(res, 'Vehicle updated successfully', { vehicle: updatedVehicle });
    } catch (error) {
      console.error('Update vehicle error:', error);
      return errorResponse(res, error.message || 'Failed to update vehicle', 500);
    }
  }

  // Delete vehicle (dealer only)
  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;

      // Check if vehicle exists and user owns it
      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      if (vehicle.dealerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. You can only delete your own listings', 403);
      }

      // Soft delete - mark as inactive instead of removing
      vehicle.status = 'inactive';
      vehicle.lastModified = new Date();
      await vehicle.save();

      return successResponse(res, 'Vehicle listing deleted successfully');
    } catch (error) {
      console.error('Delete vehicle error:', error);
      return errorResponse(res, 'Failed to delete vehicle listing', 500);
    }
  }

  // Get vehicles by dealer (dealer dashboard)
  async getMyVehicles(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        make,
        model,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query;

      const filter = { dealerId: req.user.id };

      if (status) filter.status = status;
      if (make) filter.make = new RegExp(make, 'i');
      if (model) filter.model = new RegExp(model, 'i');

      if (search) {
        filter.$or = [
          { title: new RegExp(search, 'i') },
          { 'identification.vin': new RegExp(search, 'i') },
          { 'identification.stockNumber': new RegExp(search, 'i') },
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const vehicles = await Vehicle.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Vehicle.countDocuments(filter);

      // Get summary statistics
      const stats = await this.getDealerVehicleStats(req.user.id);

      return successResponse(res, 'Your vehicles retrieved successfully', {
        vehicles,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Get my vehicles error:', error);
      return errorResponse(res, 'Failed to retrieve your vehicles', 500);
    }
  }

  // Update vehicle status
  async updateVehicleStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      if (vehicle.dealerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied', 403);
      }

      await vehicle.updateStatus(status, notes);

      return successResponse(res, 'Vehicle status updated successfully', {
        vehicle: {
          id: vehicle._id,
          title: vehicle.title,
          status: vehicle.status,
          availability: vehicle.availability,
        },
      });
    } catch (error) {
      console.error('Update vehicle status error:', error);
      return errorResponse(res, 'Failed to update vehicle status', 500);
    }
  }

  // Search vehicles
  async searchVehicles(req, res) {
    try {
      const {
        q: searchTerm,
        make,
        model,
        year,
        category,
        condition,
        minPrice,
        maxPrice,
        maxMileage,
        city,
        state,
        page = 1,
        limit = 12,
      } = req.query;

      const filters = {
        make, model, year, category, condition,
        minPrice, maxPrice, maxMileage, city, state,
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let vehicles;
      let total;

      if (searchTerm) {
        // Text search
        const searchFilter = {
          $text: { $search: searchTerm },
          status: 'available',
          ...filters,
        };

        vehicles = await Vehicle.find(searchFilter, { score: { $meta: 'textScore' } })
          .populate('dealerId', 'name email')
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(parseInt(limit));

        total = await Vehicle.countDocuments(searchFilter);
      } else {
        // Filter-based search
        vehicles = await Vehicle.searchVehicles(filters)
          .populate('dealerId', 'name email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));

        total = await Vehicle.countDocuments({ status: 'available', ...filters });
      }

      return successResponse(res, 'Vehicle search completed', {
        vehicles,
        searchTerm,
        filters,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Search vehicles error:', error);
      return errorResponse(res, 'Vehicle search failed', 500);
    }
  }

  // Get featured vehicles
  async getFeaturedVehicles(req, res) {
    try {
      const { limit = 8 } = req.query;

      const vehicles = await Vehicle.getFeaturedVehicles(parseInt(limit))
        .populate('dealerId', 'name email');

      return successResponse(res, 'Featured vehicles retrieved successfully', { vehicles });
    } catch (error) {
      console.error('Get featured vehicles error:', error);
      return errorResponse(res, 'Failed to retrieve featured vehicles', 500);
    }
  }

  // Get recent listings
  async getRecentListings(req, res) {
    try {
      const { limit = 8 } = req.query;

      const vehicles = await Vehicle.getRecentListings(parseInt(limit))
        .populate('dealerId', 'name email');

      return successResponse(res, 'Recent listings retrieved successfully', { vehicles });
    } catch (error) {
      console.error('Get recent listings error:', error);
      return errorResponse(res, 'Failed to retrieve recent listings', 500);
    }
  }

  // Get popular makes
  async getPopularMakes(req, res) {
    try {
      const makes = await Vehicle.getPopularMakes();

      return successResponse(res, 'Popular makes retrieved successfully', { makes });
    } catch (error) {
      console.error('Get popular makes error:', error);
      return errorResponse(res, 'Failed to retrieve popular makes', 500);
    }
  }

  // Get dealer dashboard statistics
  async getDealerDashboard(req, res) {
    try {
      const dealerId = req.user.id;

      const [
        vehicleStats,
        recentInquiries,
        topPerformingVehicles,
        inventoryByCategory
      ] = await Promise.all([
        this.getDealerVehicleStats(dealerId),
        this.getRecentInquiries(dealerId),
        this.getTopPerformingVehicles(dealerId),
        this.getInventoryByCategory(dealerId)
      ]);

      return successResponse(res, 'Dealer dashboard data retrieved successfully', {
        vehicleStats,
        recentInquiries,
        topPerformingVehicles,
        inventoryByCategory,
      });
    } catch (error) {
      console.error('Get dealer dashboard error:', error);
      return errorResponse(res, 'Failed to retrieve dashboard data', 500);
    }
  }

  // Submit vehicle inquiry
  async submitInquiry(req, res) {
    try {
      const { id } = req.params;
      const { message, contactInfo } = req.body;

      const vehicle = await Vehicle.findById(id);
      if (!vehicle) {
        return errorResponse(res, 'Vehicle not found', 404);
      }

      if (vehicle.status !== 'available') {
        return errorResponse(res, 'Vehicle is not available for inquiry', 400);
      }

      // Increment inquiry count
      await vehicle.addInquiry();

      // TODO: Send notification to dealer
      // TODO: Save inquiry to database

      return successResponse(res, 'Inquiry submitted successfully', {
        message: 'Your inquiry has been sent to the dealer. They will contact you soon.',
      });
    } catch (error) {
      console.error('Submit inquiry error:', error);
      return errorResponse(res, 'Failed to submit inquiry', 500);
    }
  }

  // Helper methods
  async getDealerVehicleStats(dealerId) {
    const stats = await Vehicle.getDealerStats(dealerId);
    return stats[0] || {
      totalVehicles: 0,
      availableVehicles: 0,
      soldVehicles: 0,
      totalViews: 0,
      totalInquiries: 0,
      averagePrice: 0,
      totalInventoryValue: 0,
    };
  }

  async getRecentInquiries(dealerId) {
    // TODO: Implement inquiry tracking
    return [];
  }

  async getTopPerformingVehicles(dealerId) {
    return await Vehicle.find({
      dealerId,
      status: 'available',
      'inquiries.totalViews': { $gt: 0 }
    })
      .select('title year make model pricing inquiries images')
      .sort({ 'inquiries.totalViews': -1, 'inquiries.totalInquiries': -1 })
      .limit(5);
  }

  async getInventoryByCategory(dealerId) {
    return await Vehicle.aggregate([
      { $match: { dealerId: mongoose.Types.ObjectId(dealerId), status: 'available' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.listPrice' },
          totalValue: { $sum: '$pricing.listPrice' },
        }
      },
      { $sort: { count: -1 } }
    ]);
  }
}

module.exports = new VehicleController();
