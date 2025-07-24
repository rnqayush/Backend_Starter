import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Register as vendor
// @route   POST /api/vendor/register
// @access  Public
export const registerVendor = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    businessName,
    category,
    description,
    phone,
    address,
    website,
    businessLicense,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json(
      formatResponse(false, 'User already exists with this email', null)
    );
  }

  // Create user with vendor role
  const user = await User.create({
    name,
    email,
    password,
    role: 'vendor',
  });

  // Create vendor profile
  const vendor = await Vendor.create({
    userId: user._id,
    businessName,
    category,
    description,
    contactInfo: {
      phone,
      address,
      website,
    },
    businessLicense,
  });

  // Populate user data
  await vendor.populate('user');

  // Generate token
  const token = user.generateToken();

  res.status(201).json(
    formatResponse(true, 'Vendor registered successfully. Awaiting approval.', {
      vendor,
      token,
    })
  );
});

// @desc    Login vendor
// @route   POST /api/vendor/login
// @access  Public
export const loginVendor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json(
      formatResponse(false, 'Please provide email and password', null)
    );
  }

  // Find user and include password for comparison
  const user = await User.findOne({ 
    email, 
    role: 'vendor', 
    isActive: true 
  }).select('+password');
  
  if (!user) {
    return res.status(401).json(
      formatResponse(false, 'Invalid vendor credentials', null)
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json(
      formatResponse(false, 'Invalid vendor credentials', null)
    );
  }

  // Get vendor profile
  const vendor = await Vendor.findOne({ userId: user._id }).populate('user');
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateToken();

  res.status(200).json(
    formatResponse(true, 'Vendor login successful', {
      vendor,
      token,
    })
  );
});

// @desc    Get current vendor profile
// @route   GET /api/vendor/profile
// @access  Private (Vendor)
export const getVendorProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id }).populate('user');

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  res.status(200).json(
    formatResponse(true, 'Vendor profile retrieved successfully', vendor)
  );
});

// @desc    Update vendor profile
// @route   PUT /api/vendor/profile
// @access  Private (Vendor)
export const updateVendorProfile = asyncHandler(async (req, res) => {
  const {
    businessName,
    description,
    phone,
    address,
    website,
    businessLicense,
  } = req.body;

  const vendor = await Vendor.findOne({ userId: req.user.id });

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  // Update vendor fields
  if (businessName) vendor.businessName = businessName;
  if (description) vendor.description = description;
  if (phone) vendor.contactInfo.phone = phone;
  if (address) vendor.contactInfo.address = { ...vendor.contactInfo.address, ...address };
  if (website) vendor.contactInfo.website = website;
  if (businessLicense) vendor.businessLicense = { ...vendor.businessLicense, ...businessLicense };

  await vendor.save();
  await vendor.populate('user');

  res.status(200).json(
    formatResponse(true, 'Vendor profile updated successfully', vendor)
  );
});

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/dashboard
// @access  Private (Vendor)
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  // TODO: Add category-specific stats based on vendor.category
  const stats = {
    profile: {
      status: vendor.status,
      rating: vendor.rating,
      category: vendor.category,
    },
    // Placeholder for category-specific data
    categoryData: {
      totalItems: 0,
      activeItems: 0,
      // Will be populated based on category
    },
  };

  res.status(200).json(
    formatResponse(true, 'Vendor dashboard data retrieved successfully', stats)
  );
});

// @desc    Get all vendors (for admin)
// @route   GET /api/vendor/all
// @access  Private (Admin)
export const getAllVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category, search } = req.query;
  
  // Build filter
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  
  // Search in business name or user name/email
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
      role: 'vendor',
    }).select('_id');
    
    const userIds = users.map(user => user._id);
    
    filter.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { userId: { $in: userIds } },
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const vendors = await Vendor.find(filter)
    .populate('user', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Vendor.countDocuments(filter);

  res.status(200).json(
    formatResponse(true, 'Vendors retrieved successfully', {
      vendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Get vendor by ID
// @route   GET /api/vendor/:id
// @access  Public
export const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
    .populate('user', 'name email')
    .populate('approvedBy', 'name email');

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor not found', null)
    );
  }

  res.status(200).json(
    formatResponse(true, 'Vendor retrieved successfully', vendor)
  );
});

