import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json(
      formatResponse(false, 'Please provide email and password', null)
    );
  }

  // Find admin user and include password for comparison
  const user = await User.findOne({ 
    email, 
    role: 'admin', 
    isActive: true 
  }).select('+password');
  
  if (!user) {
    return res.status(401).json(
      formatResponse(false, 'Invalid admin credentials', null)
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json(
      formatResponse(false, 'Invalid admin credentials', null)
    );
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = user.generateToken();

  // Remove password from response
  user.password = undefined;

  res.status(200).json(
    formatResponse(true, 'Admin login successful', {
      user,
      token,
    })
  );
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = asyncHandler(async (req, res) => {
  // Get vendor statistics
  const totalVendors = await Vendor.countDocuments();
  const pendingVendors = await Vendor.countDocuments({ status: 'pending' });
  const approvedVendors = await Vendor.countDocuments({ status: 'approved' });
  const rejectedVendors = await Vendor.countDocuments({ status: 'rejected' });
  const suspendedVendors = await Vendor.countDocuments({ status: 'suspended' });

  // Get user statistics
  const totalUsers = await User.countDocuments();
  const customerCount = await User.countDocuments({ role: 'customer' });
  const vendorCount = await User.countDocuments({ role: 'vendor' });
  const adminCount = await User.countDocuments({ role: 'admin' });

  // Get category-wise vendor distribution
  const categoryStats = await Vendor.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);

  // Recent vendor registrations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentVendors = await Vendor.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  const stats = {
    vendors: {
      total: totalVendors,
      pending: pendingVendors,
      approved: approvedVendors,
      rejected: rejectedVendors,
      suspended: suspendedVendors,
      recent: recentVendors,
    },
    users: {
      total: totalUsers,
      customers: customerCount,
      vendors: vendorCount,
      admins: adminCount,
    },
    categories: categoryStats,
  };

  res.status(200).json(
    formatResponse(true, 'Admin dashboard data retrieved successfully', stats)
  );
});

// @desc    Get all vendors with filters
// @route   GET /api/admin/vendors
// @access  Private (Admin)
export const getAllVendors = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    category, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
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

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const vendors = await Vendor.find(filter)
    .populate('user', 'name email createdAt lastLogin')
    .populate('approvedBy', 'name email')
    .sort(sort)
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
      filters: {
        status,
        category,
        search,
        sortBy,
        sortOrder,
      },
    })
  );
});

// @desc    Approve vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private (Admin)
export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor not found', null)
    );
  }

  if (vendor.status === 'approved') {
    return res.status(400).json(
      formatResponse(false, 'Vendor is already approved', null)
    );
  }

  await vendor.approve(req.user.id);
  await vendor.populate(['user', 'approvedBy']);

  res.status(200).json(
    formatResponse(true, 'Vendor approved successfully', vendor)
  );
});

// @desc    Reject vendor
// @route   PUT /api/admin/vendors/:id/reject
// @access  Private (Admin)
export const rejectVendor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json(
      formatResponse(false, 'Rejection reason is required', null)
    );
  }

  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor not found', null)
    );
  }

  await vendor.reject(reason);
  await vendor.populate('user');

  res.status(200).json(
    formatResponse(true, 'Vendor rejected successfully', vendor)
  );
});

// @desc    Suspend vendor
// @route   PUT /api/admin/vendors/:id/suspend
// @access  Private (Admin)
export const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor not found', null)
    );
  }

  if (vendor.status === 'suspended') {
    return res.status(400).json(
      formatResponse(false, 'Vendor is already suspended', null)
    );
  }

  await vendor.suspend();
  await vendor.populate('user');

  res.status(200).json(
    formatResponse(true, 'Vendor suspended successfully', vendor)
  );
});

// @desc    Delete vendor
// @route   DELETE /api/admin/vendors/:id
// @access  Private (Admin)
export const deleteVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor not found', null)
    );
  }

  // Soft delete vendor
  await vendor.softDelete();

  // Also deactivate the associated user
  const user = await User.findById(vendor.userId);
  if (user) {
    await user.softDelete();
  }

  res.status(200).json(
    formatResponse(true, 'Vendor deleted successfully', null)
  );
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    role, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;
  
  // Build filter
  const filter = {};
  if (role) filter.role = role;
  
  // Search in name or email
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .select('-password');

  const total = await User.countDocuments(filter);

  res.status(200).json(
    formatResponse(true, 'Users retrieved successfully', {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
      filters: {
        role,
        search,
        sortBy,
        sortOrder,
      },
    })
  );
});

