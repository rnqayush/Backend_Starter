const WeddingVendor = require('../models/WeddingVendor');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Wedding Vendor Controller
 * Handles wedding vendor management operations
 */
class WeddingVendorController {
  /**
   * Create a new wedding vendor
   * @route POST /api/wedding-vendors
   * @access Private
   */
  createVendor = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const vendorData = { ...req.body, website: req.website._id };
    const vendor = await WeddingVendor.create(vendorData);
    await vendor.populate('website', 'name slug');

    successResponse(res, { vendor }, 'Wedding vendor created successfully', 201);
  });

  /**
   * Get all wedding vendors for a website
   * @route GET /api/wedding-vendors
   * @access Public
   */
  getVendors = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const status = req.query.status || 'active';
    const verified = req.query.verified;
    const featured = req.query.featured;
    const location = req.query.location;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = { website: req.website._id, status };
    
    if (category) query.category = category;
    if (verified === 'true') query.isVerified = true;
    if (featured === 'true') query.isFeatured = true;
    if (location) query['location.serviceAreas'] = { $in: [location] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const vendors = await WeddingVendor.find(query)
      .populate('website', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalItems = await WeddingVendor.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, vendors, pagination, 'Wedding vendors retrieved successfully');
  });

  /**
   * Get vendor by ID or slug
   * @route GET /api/wedding-vendors/:identifier
   * @access Public
   */
  getVendor = asyncHandler(async (req, res, next) => {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let vendor = await WeddingVendor.findById(identifier).populate('website', 'name slug');
    
    if (!vendor) {
      vendor = await WeddingVendor.findOne({ 
        'seo.slug': identifier, 
        website: req.website._id 
      }).populate('website', 'name slug');
    }

    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    // Increment view count
    await vendor.incrementViews();

    // Get similar vendors in the same category
    const similarVendors = await WeddingVendor.find({
      category: vendor.category,
      _id: { $ne: vendor._id },
      status: 'active',
      website: req.website._id
    }).limit(4);

    successResponse(res, { vendor, similarVendors }, 'Wedding vendor retrieved successfully');
  });

  /**
   * Update wedding vendor
   * @route PUT /api/wedding-vendors/:id
   * @access Private
   */
  updateVendor = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const vendor = await WeddingVendor.findById(id);

    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    if (vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const updatedVendor = await WeddingVendor.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('website', 'name slug');

    successResponse(res, { vendor: updatedVendor }, 'Wedding vendor updated successfully');
  });

  /**
   * Delete wedding vendor
   * @route DELETE /api/wedding-vendors/:id
   * @access Private
   */
  deleteVendor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const vendor = await WeddingVendor.findById(id);

    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    if (vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await WeddingVendor.findByIdAndDelete(id);
    successResponse(res, null, 'Wedding vendor deleted successfully');
  });

  /**
   * Search wedding vendors
   * @route GET /api/wedding-vendors/search
   * @access Public
   */
  searchVendors = asyncHandler(async (req, res, next) => {
    const {
      category,
      location,
      minRating,
      maxPrice,
      verified,
      serviceAreas,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      category,
      location,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      verified: verified === 'true'
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const vendors = await WeddingVendor.searchVendors(req.website._id, filters);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedVendors = vendors.slice(skip, skip + parseInt(limit));
    const totalItems = vendors.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const pagination = { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalPages, 
      totalItems 
    };

    paginatedResponse(res, paginatedVendors, pagination, 'Wedding vendors found');
  });

  /**
   * Get vendors by category
   * @route GET /api/wedding-vendors/category/:category
   * @access Public
   */
  getVendorsByCategory = asyncHandler(async (req, res, next) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;
    const vendors = await WeddingVendor.findByCategory(req.website._id, category)
      .populate('website', 'name slug')
      .sort({ 'stats.averageRating': -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await WeddingVendor.countDocuments({ 
      website: req.website._id, 
      category, 
      status: 'active' 
    });
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, vendors, pagination, 'Vendors by category retrieved successfully');
  });

  /**
   * Get featured vendors
   * @route GET /api/wedding-vendors/featured
   * @access Public
   */
  getFeaturedVendors = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const vendors = await WeddingVendor.getFeaturedVendors(req.website._id, limit);
    successResponse(res, { vendors }, 'Featured vendors retrieved successfully');
  });

  /**
   * Get top rated vendors
   * @route GET /api/wedding-vendors/top-rated
   * @access Public
   */
  getTopRatedVendors = asyncHandler(async (req, res, next) => {
    const category = req.query.category;
    const limit = parseInt(req.query.limit) || 10;
    
    const vendors = await WeddingVendor.getTopRatedVendors(req.website._id, category, limit);
    successResponse(res, { vendors }, 'Top rated vendors retrieved successfully');
  });

  /**
   * Get nearby vendors
   * @route GET /api/wedding-vendors/nearby
   * @access Public
   */
  getNearbyVendors = asyncHandler(async (req, res, next) => {
    const { latitude, longitude, maxDistance = 50000 } = req.query;

    if (!latitude || !longitude) {
      return next(new AppError('Latitude and longitude are required', 400, 'COORDINATES_REQUIRED'));
    }

    const vendors = await WeddingVendor.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(maxDistance)
    );

    successResponse(res, { vendors }, 'Nearby vendors found');
  });

  /**
   * Add vendor testimonial
   * @route POST /api/wedding-vendors/:id/testimonials
   * @access Private
   */
  addTestimonial = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { clientName, rating, review, weddingDate } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400, 'INVALID_RATING'));
    }

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    if (vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await vendor.addTestimonial(clientName, rating, review, weddingDate ? new Date(weddingDate) : null);
    successResponse(res, { vendor }, 'Testimonial added successfully');
  });

  /**
   * Record vendor inquiry
   * @route POST /api/wedding-vendors/:id/inquire
   * @access Public
   */
  recordInquiry = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { message, contactInfo } = req.body;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    await vendor.recordInquiry();
    
    // Here you would typically send an email to the vendor
    // and store the inquiry in a separate inquiries collection
    
    successResponse(res, null, 'Inquiry sent successfully');
  });

  /**
   * Record vendor booking
   * @route POST /api/wedding-vendors/:id/book
   * @access Private
   */
  recordBooking = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { revenue } = req.body;

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    if (vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await vendor.recordBooking(revenue);
    successResponse(res, { vendor }, 'Booking recorded successfully');
  });

  /**
   * Check vendor availability
   * @route GET /api/wedding-vendors/:id/availability
   * @access Public
   */
  checkAvailability = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return next(new AppError('Date is required', 400, 'DATE_REQUIRED'));
    }

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    const eventDate = new Date(date);
    const isAvailable = vendor.checkAvailability(eventDate);

    successResponse(res, { 
      available: isAvailable,
      date: eventDate,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        category: vendor.category
      }
    }, 'Availability checked successfully');
  });

  /**
   * Get vendor analytics
   * @route GET /api/wedding-vendors/:id/analytics
   * @access Private
   */
  getVendorAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const vendor = await WeddingVendor.findById(id);

    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    if (vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const analytics = {
      totalBookings: vendor.stats.totalBookings,
      completedEvents: vendor.stats.completedEvents,
      totalRevenue: vendor.stats.totalRevenue,
      averageRating: vendor.stats.averageRating,
      totalReviews: vendor.stats.totalReviews,
      profileViews: vendor.stats.profileViews,
      inquiries: vendor.stats.inquiries,
      responseRate: vendor.stats.responseRate,
      responseTime: vendor.stats.responseTime,
      lastBooking: vendor.stats.lastBooking
    };

    successResponse(res, { analytics }, 'Vendor analytics retrieved successfully');
  });

  /**
   * Update vendor status
   * @route PATCH /api/wedding-vendors/:id/status
   * @access Private
   */
  updateVendorStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'pending-approval', 'suspended'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid vendor status', 400, 'INVALID_STATUS'));
    }

    const vendor = await WeddingVendor.findById(id);
    if (!vendor) {
      return next(new AppError('Wedding vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }

    if (vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    vendor.status = status;
    await vendor.save();

    successResponse(res, { vendor }, 'Vendor status updated successfully');
  });

  /**
   * Bulk update vendors
   * @route PATCH /api/wedding-vendors/bulk
   * @access Private
   */
  bulkUpdateVendors = asyncHandler(async (req, res, next) => {
    const { vendorIds, updates } = req.body;

    if (!vendorIds || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return next(new AppError('Vendor IDs array is required', 400, 'INVALID_VENDOR_IDS'));
    }

    // Verify all vendors belong to the website
    const vendors = await WeddingVendor.find({
      _id: { $in: vendorIds },
      website: req.website._id
    });

    if (vendors.length !== vendorIds.length) {
      return next(new AppError('Some vendors not found or access denied', 403, 'ACCESS_DENIED'));
    }

    const result = await WeddingVendor.updateMany(
      { _id: { $in: vendorIds }, website: req.website._id },
      updates,
      { runValidators: true }
    );

    successResponse(res, { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount 
    }, 'Vendors updated successfully');
  });
}

module.exports = new WeddingVendorController();

