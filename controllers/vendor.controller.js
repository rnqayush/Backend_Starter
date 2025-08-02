/**
 * Vendor Controller - Handle vendor-related operations
 */

import Vendor from '../models/Vendor.js';
import User from '../models/User.js';
import { catchAsync } from '../middleware/error.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { VENDOR_STATUS, BUSINESS_CATEGORIES, RESPONSE_MESSAGES, PAGINATION } from '../config/constants.js';
import { generateVendorSlug, generateUniqueSlug } from '../utils/generateSlug.js';

// Create a new vendor
export const createVendor = catchAsync(async (req, res, next) => {
  const {
    name,
    category,
    description,
    tagline,
    email,
    phone,
    address,
    businessHours,
    socialMedia,
    theme,
    licenseNumber,
    taxId,
    gstNumber,
    establishedYear
  } = req.body;

  // Check if user already has a vendor profile
  const existingVendor = await Vendor.findOne({ owner: req.user._id });
  if (existingVendor) {
    return next(new AppError('User already has a vendor profile', 400, 'VENDOR_EXISTS'));
  }

  // Generate unique slug
  const baseSlug = generateVendorSlug(name, category, address?.city);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (slug) => await Vendor.findOne({ slug })
  );

  // Create vendor
  const vendor = await Vendor.create({
    name,
    slug,
    category,
    owner: req.user._id,
    description,
    tagline,
    email,
    phone,
    address,
    businessHours,
    socialMedia,
    theme,
    licenseNumber,
    taxId,
    gstNumber,
    establishedYear,
    status: VENDOR_STATUS.PENDING
  });

  // Update user role to vendor
  await User.findByIdAndUpdate(req.user._id, { role: 'vendor' });

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    message: RESPONSE_MESSAGES.CREATED,
    data: {
      vendor: vendor.toPublicJSON()
    }
  });
});

// Get all vendors with filtering and pagination
export const getAllVendors = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    city,
    state,
    status,
    featured,
    verified,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (category) query.category = category;
  if (city) query['address.city'] = new RegExp(city, 'i');
  if (state) query['address.state'] = new RegExp(state, 'i');
  if (status) query.status = status;
  if (featured !== undefined) query.isFeatured = featured === 'true';
  if (verified !== undefined) query.isVerified = verified === 'true';

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } }
    ];
  }

  // Only show active vendors for public access
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    query.status = VENDOR_STATUS.ACTIVE;
  }

  // Pagination
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const vendors = await Vendor.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-owner -licenseNumber -taxId -gstNumber -analytics');

  const total = await Vendor.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get vendor by ID or slug
export const getVendor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Try to find by ID first, then by slug
  let vendor = await Vendor.findById(id);
  if (!vendor) {
    vendor = await Vendor.findOne({ slug: id });
  }

  if (!vendor) {
    return next(new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND'));
  }

  // Check if vendor is active (unless admin or owner)
  if (vendor.status !== VENDOR_STATUS.ACTIVE) {
    if (!req.user || 
        (req.user.role !== 'admin' && 
         req.user.role !== 'super_admin' && 
         vendor.owner.toString() !== req.user._id.toString())) {
      return next(new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND'));
    }
  }

  // Increment views if not owner
  if (!req.user || vendor.owner.toString() !== req.user._id.toString()) {
    await vendor.incrementViews();
  }

  // Populate owner info for admin/owner
  if (req.user && 
      (req.user.role === 'admin' || 
       req.user.role === 'super_admin' || 
       vendor.owner.toString() === req.user._id.toString())) {
    await vendor.populate('owner', 'name email');
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      vendor: req.user && vendor.owner.toString() === req.user._id.toString() 
        ? vendor 
        : vendor.toPublicJSON()
    }
  });
});

// Update vendor
export const updateVendor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find vendor
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    return next(new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND'));
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    if (vendor.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }
  }

  // Prevent updating certain fields
  delete updates.owner;
  delete updates.slug;
  delete updates.analytics;
  delete updates.createdAt;
  delete updates.updatedAt;

  // If name or category is being updated, regenerate slug
  if (updates.name || updates.category) {
    const name = updates.name || vendor.name;
    const category = updates.category || vendor.category;
    const city = updates.address?.city || vendor.address?.city;
    
    const baseSlug = generateVendorSlug(name, category, city);
    const newSlug = await generateUniqueSlug(
      baseSlug,
      async (slug) => await Vendor.findOne({ slug, _id: { $ne: vendor._id } })
    );
    updates.slug = newSlug;
  }

  // Update vendor
  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.UPDATED,
    data: {
      vendor: updatedVendor
    }
  });
});

// Delete vendor
export const deleteVendor = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find vendor
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    return next(new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND'));
  }

  // Check ownership (unless admin)
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    if (vendor.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }
  }

  // Soft delete by setting status to inactive
  await Vendor.findByIdAndUpdate(id, { 
    status: VENDOR_STATUS.SUSPENDED,
    isActive: false 
  });

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.DELETED,
    data: null
  });
});

// Get vendor dashboard data
export const getVendorDashboard = catchAsync(async (req, res, next) => {
  const vendor = await Vendor.findOne({ owner: req.user._id });
  if (!vendor) {
    return next(new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND'));
  }

  // Get dashboard statistics
  const stats = {
    totalViews: vendor.analytics.totalViews,
    monthlyViews: vendor.analytics.monthlyViews,
    totalBookings: vendor.analytics.totalBookings,
    rating: vendor.rating,
    reviewCount: vendor.reviewCount,
    status: vendor.status,
    isVerified: vendor.isVerified,
    isFeatured: vendor.isFeatured
  };

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      vendor,
      stats
    }
  });
});

// Update vendor status (admin only)
export const updateVendorStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!Object.values(VENDOR_STATUS).includes(status)) {
    return next(new AppError('Invalid status', 400, 'INVALID_STATUS'));
  }

  const vendor = await Vendor.findByIdAndUpdate(
    id,
    { 
      status,
      ...(status === VENDOR_STATUS.ACTIVE && { isVerified: true })
    },
    { new: true, runValidators: true }
  );

  if (!vendor) {
    return next(new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND'));
  }

  // TODO: Send notification to vendor about status change

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.UPDATED,
    data: {
      vendor,
      statusChange: {
        newStatus: status,
        reason,
        updatedBy: req.user._id,
        updatedAt: new Date()
      }
    }
  });
});

// Get vendors by category
export const getVendorsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    city,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  if (!Object.values(BUSINESS_CATEGORIES).includes(category)) {
    return next(new AppError('Invalid category', 400, 'INVALID_CATEGORY'));
  }

  const query = { 
    category, 
    status: VENDOR_STATUS.ACTIVE 
  };

  if (city) {
    query['address.city'] = new RegExp(city, 'i');
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const vendors = await Vendor.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-owner -licenseNumber -taxId -gstNumber -analytics');

  const total = await Vendor.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      vendors,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get featured vendors
export const getFeaturedVendors = catchAsync(async (req, res, next) => {
  const {
    limit = 10,
    category
  } = req.query;

  const query = { 
    isFeatured: true, 
    status: VENDOR_STATUS.ACTIVE 
  };

  if (category) {
    query.category = category;
  }

  const vendors = await Vendor.find(query)
    .sort({ rating: -1, reviewCount: -1 })
    .limit(parseInt(limit))
    .select('-owner -licenseNumber -taxId -gstNumber -analytics');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      vendors
    }
  });
});

// Search vendors
export const searchVendors = catchAsync(async (req, res, next) => {
  const {
    q: searchTerm,
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    city,
    sortBy = 'relevance'
  } = req.query;

  if (!searchTerm) {
    return next(new AppError('Search term is required', 400, 'SEARCH_TERM_REQUIRED'));
  }

  const query = {
    status: VENDOR_STATUS.ACTIVE,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tagline: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (category) query.category = category;
  if (city) query['address.city'] = new RegExp(city, 'i');

  const skip = (page - 1) * limit;
  
  let sortOptions = { rating: -1, reviewCount: -1 };
  if (sortBy === 'name') sortOptions = { name: 1 };
  if (sortBy === 'newest') sortOptions = { createdAt: -1 };

  const vendors = await Vendor.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-owner -licenseNumber -taxId -gstNumber -analytics');

  const total = await Vendor.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      vendors,
      searchTerm,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export default {
  createVendor,
  getAllVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  getVendorDashboard,
  updateVendorStatus,
  getVendorsByCategory,
  getFeaturedVendors,
  searchVendors
};
