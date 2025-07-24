import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json(
      formatResponse(false, 'User already exists with this email', null)
    );
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer',
  });

  // Generate token
  const token = user.generateToken();

  res.status(201).json(
    formatResponse(true, 'User registered successfully', {
      user,
      token,
    })
  );
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json(
      formatResponse(false, 'Please provide email and password', null)
    );
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email, isActive: true }).select('+password');
  
  if (!user) {
    return res.status(401).json(
      formatResponse(false, 'Invalid credentials', null)
    );
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json(
      formatResponse(false, 'Invalid credentials', null)
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
    formatResponse(true, 'Login successful', {
      user,
      token,
    })
  );
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json(
      formatResponse(false, 'User not found', null)
    );
  }

  res.status(200).json(
    formatResponse(true, 'User profile retrieved successfully', user)
  );
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== req.user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json(
        formatResponse(false, 'Email already exists', null)
      );
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: name || req.user.name,
      email: email || req.user.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(
    formatResponse(true, 'Profile updated successfully', user)
  );
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json(
      formatResponse(false, 'Please provide current and new password', null)
    );
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json(
      formatResponse(false, 'Current password is incorrect', null)
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json(
    formatResponse(true, 'Password changed successfully', null)
  );
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json(
    formatResponse(true, 'Logout successful', null)
  );
});

