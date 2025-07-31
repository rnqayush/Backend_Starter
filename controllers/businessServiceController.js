const BusinessService = require('../models/BusinessService');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Business Service Controller
 * Handles business service management operations
 */
class BusinessServiceController {
  /**
   * Create a new business service
   * @route POST /api/business-services
   * @access Private
   */
  createService = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const serviceData = { ...req.body, website: req.website._id };
    const service = await BusinessService.create(serviceData);
    await service.populate('website', 'name slug');

    successResponse(res, { service }, 'Business service created successfully', 201);
  });

  /**
   * Get all business services for a website
   * @route GET /api/business-services
   * @access Public
   */
  getServices = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const status = req.query.status || 'active';
    const featured = req.query.featured;
    const popular = req.query.popular;
    const deliveryMethod = req.query.deliveryMethod;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = { website: req.website._id, status };
    
    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (popular === 'true') query.isPopular = true;
    if (deliveryMethod) query['details.deliveryMethod'] = deliveryMethod;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'description.short': { $regex: search, $options: 'i' } },
        { 'description.long': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const services = await BusinessService.find(query)
      .populate('website', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalItems = await BusinessService.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, services, pagination, 'Business services retrieved successfully');
  });

  /**
   * Get service by ID or slug
   * @route GET /api/business-services/:identifier
   * @access Public
   */
  getService = asyncHandler(async (req, res, next) => {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let service = await BusinessService.findById(identifier).populate('website', 'name slug');
    
    if (!service) {
      service = await BusinessService.findOne({ 
        'seo.slug': identifier, 
        website: req.website._id 
      }).populate('website', 'name slug');
    }

    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    // Get related services in the same category
    const relatedServices = await BusinessService.find({
      category: service.category,
      _id: { $ne: service._id },
      status: 'active',
      website: req.website._id
    }).limit(4);

    successResponse(res, { service, relatedServices }, 'Business service retrieved successfully');
  });

  /**
   * Update business service
   * @route PUT /api/business-services/:id
   * @access Private
   */
  updateService = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const service = await BusinessService.findById(id);

    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const updatedService = await BusinessService.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('website', 'name slug');

    successResponse(res, { service: updatedService }, 'Business service updated successfully');
  });

  /**
   * Delete business service
   * @route DELETE /api/business-services/:id
   * @access Private
   */
  deleteService = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const service = await BusinessService.findById(id);

    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await BusinessService.findByIdAndDelete(id);
    successResponse(res, null, 'Business service deleted successfully');
  });

  /**
   * Search business services
   * @route GET /api/business-services/search
   * @access Public
   */
  searchServices = asyncHandler(async (req, res, next) => {
    const {
      category,
      maxPrice,
      minRating,
      deliveryMethod,
      location,
      tags,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      category,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      deliveryMethod,
      location,
      tags: tags ? tags.split(',') : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const services = await BusinessService.searchServices(req.website._id, filters);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedServices = services.slice(skip, skip + parseInt(limit));
    const totalItems = services.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const pagination = { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalPages, 
      totalItems 
    };

    paginatedResponse(res, paginatedServices, pagination, 'Business services found');
  });

  /**
   * Get services by category
   * @route GET /api/business-services/category/:category
   * @access Public
   */
  getServicesByCategory = asyncHandler(async (req, res, next) => {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;
    const services = await BusinessService.findByCategory(req.website._id, category)
      .populate('website', 'name slug')
      .sort({ 'reviews.averageRating': -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await BusinessService.countDocuments({ 
      website: req.website._id, 
      category, 
      status: 'active' 
    });
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, services, pagination, 'Services by category retrieved successfully');
  });

  /**
   * Get popular services
   * @route GET /api/business-services/popular
   * @access Public
   */
  getPopularServices = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const services = await BusinessService.getPopularServices(req.website._id, limit);
    successResponse(res, { services }, 'Popular services retrieved successfully');
  });

  /**
   * Get featured services
   * @route GET /api/business-services/featured
   * @access Public
   */
  getFeaturedServices = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const services = await BusinessService.getFeaturedServices(req.website._id, limit);
    successResponse(res, { services }, 'Featured services retrieved successfully');
  });

  /**
   * Get top rated services
   * @route GET /api/business-services/top-rated
   * @access Public
   */
  getTopRatedServices = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const services = await BusinessService.getTopRatedServices(req.website._id, limit);
    successResponse(res, { services }, 'Top rated services retrieved successfully');
  });

  /**
   * Calculate service price
   * @route POST /api/business-services/:id/calculate-price
   * @access Public
   */
  calculatePrice = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { tierName, addOns } = req.body;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    const calculatedPrice = service.calculatePrice(tierName, addOns || []);
    
    successResponse(res, { 
      basePrice: service.pricing.basePrice,
      tierPrice: tierName ? service.pricing.tiers.find(t => t.name === tierName)?.price : null,
      addOnsPrice: addOns ? addOns.reduce((total, addOnName) => {
        const addOn = service.pricing.addOns.find(a => a.name === addOnName);
        return total + (addOn ? addOn.price : 0);
      }, 0) : 0,
      totalPrice: calculatedPrice,
      currency: service.pricing.currency
    }, 'Price calculated successfully');
  });

  /**
   * Check service availability
   * @route GET /api/business-services/:id/availability
   * @access Public
   */
  checkAvailability = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { date, timeSlot } = req.query;

    if (!date) {
      return next(new AppError('Date is required', 400, 'DATE_REQUIRED'));
    }

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    const requestedDate = new Date(date);
    const isAvailable = service.checkAvailability(requestedDate, timeSlot);

    successResponse(res, { 
      available: isAvailable,
      date: requestedDate,
      timeSlot,
      service: {
        id: service._id,
        name: service.name,
        category: service.category
      }
    }, 'Availability checked successfully');
  });

  /**
   * Add service review
   * @route POST /api/business-services/:id/reviews
   * @access Private
   */
  addReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { clientName, rating, review, serviceDate, clientTitle, clientCompany } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400, 'INVALID_RATING'));
    }

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    await service.addReview(
      clientName, 
      rating, 
      review, 
      serviceDate ? new Date(serviceDate) : null,
      clientTitle,
      clientCompany
    );

    successResponse(res, { service }, 'Review added successfully');
  });

  /**
   * Record service inquiry
   * @route POST /api/business-services/:id/inquire
   * @access Public
   */
  recordInquiry = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { message, contactInfo } = req.body;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    await service.recordInquiry();
    
    // Here you would typically send an email to the business
    // and store the inquiry in a separate inquiries collection
    
    successResponse(res, null, 'Inquiry sent successfully');
  });

  /**
   * Record service booking
   * @route POST /api/business-services/:id/book
   * @access Private
   */
  recordBooking = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { revenue } = req.body;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await service.recordBooking(revenue);
    successResponse(res, { service }, 'Booking recorded successfully');
  });

  /**
   * Record service completion
   * @route POST /api/business-services/:id/complete
   * @access Private
   */
  recordCompletion = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { revenue, isRepeatClient } = req.body;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await service.recordCompletion(revenue, isRepeatClient);
    successResponse(res, { service }, 'Service completion recorded successfully');
  });

  /**
   * Record referral
   * @route POST /api/business-services/:id/referral
   * @access Private
   */
  recordReferral = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await service.recordReferral();
    successResponse(res, { service }, 'Referral recorded successfully');
  });

  /**
   * Add team member
   * @route POST /api/business-services/:id/team
   * @access Private
   */
  addTeamMember = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const memberInfo = req.body;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await service.addTeamMember(memberInfo);
    successResponse(res, { service }, 'Team member added successfully');
  });

  /**
   * Add FAQ
   * @route POST /api/business-services/:id/faq
   * @access Private
   */
  addFAQ = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await service.addFAQ(question, answer, category);
    successResponse(res, { service }, 'FAQ added successfully');
  });

  /**
   * Get active offers for service
   * @route GET /api/business-services/:id/offers
   * @access Public
   */
  getActiveOffers = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const service = await BusinessService.findById(id);

    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    const activeOffers = service.getActiveOffers();
    successResponse(res, { offers: activeOffers }, 'Active offers retrieved successfully');
  });

  /**
   * Get service analytics
   * @route GET /api/business-services/:id/analytics
   * @access Private
   */
  getServiceAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const service = await BusinessService.findById(id);

    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const analytics = {
      totalBookings: service.analytics.totalBookings,
      completedProjects: service.analytics.completedProjects,
      totalRevenue: service.analytics.totalRevenue,
      averageProjectValue: service.analytics.averageProjectValue,
      clientRetentionRate: service.analytics.clientRetentionRate,
      inquiries: service.analytics.inquiries,
      conversionRate: service.analytics.conversionRate,
      averageRating: service.analytics.averageRating,
      repeatClients: service.analytics.repeatClients,
      referrals: service.analytics.referrals,
      lastBooked: service.analytics.lastBooked
    };

    successResponse(res, { analytics }, 'Service analytics retrieved successfully');
  });

  /**
   * Update service status
   * @route PATCH /api/business-services/:id/status
   * @access Private
   */
  updateServiceStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'coming-soon', 'discontinued'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid service status', 400, 'INVALID_STATUS'));
    }

    const service = await BusinessService.findById(id);
    if (!service) {
      return next(new AppError('Business service not found', 404, 'SERVICE_NOT_FOUND'));
    }

    if (service.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    service.status = status;
    await service.save();

    successResponse(res, { service }, 'Service status updated successfully');
  });

  /**
   * Bulk update services
   * @route PATCH /api/business-services/bulk
   * @access Private
   */
  bulkUpdateServices = asyncHandler(async (req, res, next) => {
    const { serviceIds, updates } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return next(new AppError('Service IDs array is required', 400, 'INVALID_SERVICE_IDS'));
    }

    // Verify all services belong to the website
    const services = await BusinessService.find({
      _id: { $in: serviceIds },
      website: req.website._id
    });

    if (services.length !== serviceIds.length) {
      return next(new AppError('Some services not found or access denied', 403, 'ACCESS_DENIED'));
    }

    const result = await BusinessService.updateMany(
      { _id: { $in: serviceIds }, website: req.website._id },
      updates,
      { runValidators: true }
    );

    successResponse(res, { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount 
    }, 'Services updated successfully');
  });
}

module.exports = new BusinessServiceController();

