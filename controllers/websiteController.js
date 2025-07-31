const Website = require('../models/Website');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Website Controller
 * Handles website creation, management, and configuration
 */
class WebsiteController {
  /**
   * Create a new website
   * @route POST /api/websites
   * @access Private
   */
  createWebsite = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { name, description, type, slug } = req.body;

    // Check if slug is already taken
    if (slug) {
      const existingWebsite = await Website.findOne({ slug });
      if (existingWebsite) {
        return next(new AppError('Website slug is already taken', 400, 'SLUG_TAKEN'));
      }
    }

    // Create website
    const website = await Website.create({
      name,
      description,
      type,
      slug,
      owner: req.user._id
    });

    // Populate owner information
    await website.populate('owner', 'name email');

    successResponse(res, { website }, 'Website created successfully', 201);
  });

  /**
   * Get all websites for the authenticated user
   * @route GET /api/websites
   * @access Private
   */
  getUserWebsites = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type;
    const status = req.query.status;
    const search = req.query.search;

    // Build query
    const query = { owner: req.user._id };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const websites = await Website.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Website.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = {
      page,
      limit,
      totalPages,
      totalItems
    };

    paginatedResponse(res, websites, pagination, 'Websites retrieved successfully');
  });

  /**
   * Get website by ID
   * @route GET /api/websites/:id
   * @access Private
   */
  getWebsiteById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const website = await Website.findById(id).populate('owner', 'name email');

    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Check if user owns the website or is admin
    if (website.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    successResponse(res, { website }, 'Website retrieved successfully');
  });

  /**
   * Get website by slug (public access)
   * @route GET /api/websites/slug/:slug
   * @access Public
   */
  getWebsiteBySlug = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;

    const website = await Website.findOne({ slug, status: 'active' })
      .populate('owner', 'name email');

    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Increment view count
    await website.incrementViews(true);

    successResponse(res, { website }, 'Website retrieved successfully');
  });

  /**
   * Update website
   * @route PUT /api/websites/:id
   * @access Private
   */
  updateWebsite = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const updates = req.body;

    // Find website
    const website = await Website.findById(id);
    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Check ownership
    if (website.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Check if slug is being updated and is unique
    if (updates.slug && updates.slug !== website.slug) {
      const existingWebsite = await Website.findOne({ slug: updates.slug });
      if (existingWebsite) {
        return next(new AppError('Website slug is already taken', 400, 'SLUG_TAKEN'));
      }
    }

    // Update website
    const updatedWebsite = await Website.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    successResponse(res, { website: updatedWebsite }, 'Website updated successfully');
  });

  /**
   * Delete website
   * @route DELETE /api/websites/:id
   * @access Private
   */
  deleteWebsite = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find website
    const website = await Website.findById(id);
    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Check ownership
    if (website.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Delete website
    await Website.findByIdAndDelete(id);

    successResponse(res, null, 'Website deleted successfully');
  });

  /**
   * Update website settings
   * @route PUT /api/websites/:id/settings
   * @access Private
   */
  updateWebsiteSettings = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { settings } = req.body;

    // Find website
    const website = await Website.findById(id);
    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Check ownership
    if (website.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Update settings
    website.settings = { ...website.settings, ...settings };
    await website.save();

    successResponse(res, { website }, 'Website settings updated successfully');
  });

  /**
   * Publish/unpublish website
   * @route PATCH /api/websites/:id/status
   * @access Private
   */
  updateWebsiteStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['draft', 'active', 'inactive', 'suspended'].includes(status)) {
      return next(new AppError('Invalid status', 400, 'INVALID_STATUS'));
    }

    // Find website
    const website = await Website.findById(id);
    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Check ownership (only admins can suspend websites)
    if (website.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    if (status === 'suspended' && req.user.role !== 'admin') {
      return next(new AppError('Only admins can suspend websites', 403, 'ADMIN_REQUIRED'));
    }

    // Update status
    website.status = status;
    await website.save();

    const statusMessage = {
      draft: 'Website saved as draft',
      active: 'Website published successfully',
      inactive: 'Website unpublished',
      suspended: 'Website suspended'
    };

    successResponse(res, { website }, statusMessage[status]);
  });

  /**
   * Get website analytics
   * @route GET /api/websites/:id/analytics
   * @access Private
   */
  getWebsiteAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // Find website
    const website = await Website.findById(id);
    if (!website) {
      return next(new AppError('Website not found', 404, 'WEBSITE_NOT_FOUND'));
    }

    // Check ownership
    if (website.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const analytics = {
      views: website.stats.views,
      uniqueVisitors: website.stats.uniqueVisitors,
      totalBookings: website.stats.totalBookings,
      totalRevenue: website.stats.totalRevenue,
      lastVisit: website.stats.lastVisit,
      createdAt: website.createdAt,
      publishedAt: website.publishedAt,
      status: website.status
    };

    successResponse(res, { analytics }, 'Website analytics retrieved successfully');
  });

  /**
   * Check slug availability
   * @route GET /api/websites/check-slug/:slug
   * @access Public
   */
  checkSlugAvailability = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return next(new AppError('Invalid slug format. Use only lowercase letters, numbers, and hyphens.', 400, 'INVALID_SLUG_FORMAT'));
    }

    if (slug.length < 3 || slug.length > 50) {
      return next(new AppError('Slug must be between 3 and 50 characters', 400, 'INVALID_SLUG_LENGTH'));
    }

    // Check if slug exists
    const existingWebsite = await Website.findOne({ slug });
    const isAvailable = !existingWebsite;

    successResponse(res, { 
      slug, 
      isAvailable,
      message: isAvailable ? 'Slug is available' : 'Slug is already taken'
    }, 'Slug availability checked');
  });
}

module.exports = new WebsiteController();

