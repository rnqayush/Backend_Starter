import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessType: user.businessType,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      preferences: user.preferences,
      socialProfiles: user.socialProfiles,
      businessInfo: user.businessInfo,
      subscription: user.subscription,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  }, 'Profile retrieved successfully');
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const {
    name,
    phone,
    address,
    socialProfiles,
    businessInfo,
    preferences
  } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Update basic info
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = { ...user.address, ...address };
  if (socialProfiles) user.socialProfiles = { ...user.socialProfiles, ...socialProfiles };
  if (preferences) user.preferences = { ...user.preferences, ...preferences };

  // Update business info for vendors
  if (user.role === 'vendor' && businessInfo) {
    user.businessInfo = { ...user.businessInfo, ...businessInfo };
  }

  await user.save();

  sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      socialProfiles: user.socialProfiles,
      businessInfo: user.businessInfo,
      preferences: user.preferences
    }
  }, 'Profile updated successfully');
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res, next) => {
  // This will be implemented when file upload system is ready
  sendError(res, 'Avatar upload not implemented yet', 501);
});

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
export const deleteAvatar = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  user.avatar = null;
  await user.save();

  sendSuccess(res, null, 'Avatar deleted successfully');
});

// @desc    Get user preferences
// @route   GET /api/users/preferences
// @access  Private
export const getPreferences = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, {
    preferences: user.preferences,
    notificationSettings: user.notificationSettings
  }, 'Preferences retrieved successfully');
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res, next) => {
  const { preferences, notificationSettings } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  if (notificationSettings) {
    user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };
  }

  await user.save();

  sendSuccess(res, {
    preferences: user.preferences,
    notificationSettings: user.notificationSettings
  }, 'Preferences updated successfully');
});

// @desc    Change password
// @route   POST /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Please provide current and new password', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return sendError(res, 'Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'Password changed successfully');
});

// @desc    Switch user role (for multi-role users)
// @route   POST /api/users/switch-role
// @access  Private
export const switchRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['customer', 'vendor'].includes(role)) {
    return sendError(res, 'Invalid role specified', 400);
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // For now, we'll just update the role
  // In a more complex system, you might have role permissions
  user.role = role;
  await user.save();

  sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessType: user.businessType
    }
  }, `Role switched to ${role} successfully`);
});

// @desc    Get user roles (available roles for user)
// @route   GET /api/users/roles
// @access  Private
export const getUserRoles = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // For now, return available roles based on current role
  let availableRoles = ['customer'];
  
  if (user.businessType) {
    availableRoles.push('vendor');
  }

  sendSuccess(res, {
    currentRole: user.role,
    availableRoles,
    businessType: user.businessType
  }, 'User roles retrieved successfully');
});

// @desc    Update user role permissions
// @route   PUT /api/users/roles/:roleId
// @access  Private
export const updateRolePermissions = asyncHandler(async (req, res, next) => {
  // This would be implemented for more complex role management
  sendError(res, 'Role permissions management not implemented yet', 501);
});

// @desc    Get user analytics
// @route   GET /api/users/analytics
// @access  Private
export const getUserAnalytics = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, {
    analytics: user.analytics,
    subscription: user.subscription,
    accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
    lastActivity: user.analytics.lastActivity
  }, 'User analytics retrieved successfully');
});

// @desc    Deactivate user account
// @route   POST /api/users/deactivate
// @access  Private
export const deactivateAccount = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  user.isActive = false;
  user.deactivatedAt = new Date();
  user.deactivationReason = reason;

  await user.save();

  sendSuccess(res, null, 'Account deactivated successfully');
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return sendError(res, 'Please provide your password to confirm account deletion', 400);
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Verify password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendError(res, 'Incorrect password', 400);
  }

  // In a production app, you might want to soft delete or anonymize data
  await User.findByIdAndDelete(req.user.id);

  sendSuccess(res, null, 'Account deleted successfully');
});

