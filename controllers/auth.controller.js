const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/error.middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  
  res.status(HTTP_STATUS.CREATED).json(result);
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;
  
  const result = await authService.login(email, password, rememberMe);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfile(req.user._id, req.body);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Change user password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.refreshToken(refreshToken);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.user._id);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const filters = {
    role: req.query.role,
    status: req.query.status,
    search: req.query.search
  };

  const pagination = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10,
    sort: req.query.sort || 'createdAt',
    order: req.query.order || 'desc'
  };

  const result = await authService.getAllUsers(filters, pagination);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Get user by ID (Admin only)
 * @route   GET /api/auth/users/:userId
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const result = await authService.getProfile(req.params.userId);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/auth/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const result = await authService.createUser(req.body);
  
  res.status(HTTP_STATUS.CREATED).json(result);
});

/**
 * @desc    Update user (Admin only)
 * @route   PUT /api/auth/users/:userId
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const result = await authService.updateUser(req.params.userId, req.body);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Delete user (Admin only)
 * @route   DELETE /api/auth/users/:userId
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const result = await authService.deleteUser(req.params.userId);
  
  res.status(HTTP_STATUS.OK).json(result);
});

/**
 * @desc    Get current user's stats
 * @route   GET /api/auth/stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  // This would typically include user-specific statistics
  // For now, we'll return basic user info
  const result = await authService.getProfile(req.user._id);
  
  // Add some basic stats
  const stats = {
    user: result.data.user,
    accountAge: Math.floor((Date.now() - new Date(result.data.user.createdAt)) / (1000 * 60 * 60 * 24)),
    lastLogin: result.data.user.lastLogin,
    isEmailVerified: result.data.user.isEmailVerified
  };
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Check if email exists
 * @route   POST /api/auth/check-email
 * @access  Public
 */
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const User = require('../models/User.model');
  const existingUser = await User.findOne({ email });
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      exists: !!existingUser
    }
  });
});

/**
 * @desc    Validate token
 * @route   GET /api/auth/validate-token
 * @access  Private
 */
const validateToken = asyncHandler(async (req, res) => {
  // If we reach here, the token is valid (middleware already validated it)
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Token is valid',
    data: {
      user: req.user
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  checkEmail,
  validateToken
};
