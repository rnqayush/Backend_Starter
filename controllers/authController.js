const crypto = require('crypto');
const User = require('../models/User');
const jwtUtils = require('../utils/jwt');
const { asyncHandler, AppError, successResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Authentication Controller
 * Handles user registration, login, password reset, and email verification
 */
class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  register = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return next(new AppError('User already exists with this email', 400, 'USER_EXISTS'));
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Generate JWT tokens
    const tokens = jwtUtils.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    // Remove password from response
    user.password = undefined;

    successResponse(res, {
      user,
      tokens,
      message: 'Registration successful. Please check your email to verify your account.'
    }, 'User registered successfully', 201);
  });

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  login = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Check if account is locked
    if (user.isLocked) {
      return next(new AppError('Account is temporarily locked due to too many failed login attempts', 423, 'ACCOUNT_LOCKED'));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated. Please contact support.', 401, 'ACCOUNT_DEACTIVATED'));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT tokens
    const tokens = jwtUtils.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Remove password from response
    user.password = undefined;

    successResponse(res, {
      user,
      tokens
    }, 'Login successful');
  });

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   * @access Public
   */
  refreshToken = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN'));
    }

    try {
      // Verify refresh token
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
      }

      // Generate new token pair
      const tokens = jwtUtils.generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      successResponse(res, { tokens }, 'Token refreshed successfully');
    } catch (error) {
      return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    }
  });

  /**
   * Logout user
   * @route POST /api/auth/logout
   * @access Private
   */
  logout = asyncHandler(async (req, res, next) => {
    // In a more complex setup, you might want to blacklist the token
    // For now, we'll just send a success response
    successResponse(res, null, 'Logout successful');
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   * @access Private
   */
  getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).populate('websites');
    successResponse(res, { user }, 'User profile retrieved successfully');
  });

  /**
   * Update user profile
   * @route PUT /api/auth/me
   * @access Private
   */
  updateProfile = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const allowedFields = ['name', 'phone', 'bio', 'preferences'];
    const updates = {};

    // Only allow specific fields to be updated
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    successResponse(res, { user }, 'Profile updated successfully');
  });

  /**
   * Change password
   * @route PUT /api/auth/change-password
   * @access Private
   */
  changePassword = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return next(new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    successResponse(res, null, 'Password changed successfully');
  });

  /**
   * Forgot password
   * @route POST /api/auth/forgot-password
   * @access Public
   */
  forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return next(new AppError('No user found with this email address', 404, 'USER_NOT_FOUND'));
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    successResponse(res, null, 'Password reset email sent');
  });

  /**
   * Reset password
   * @route POST /api/auth/reset-password/:token
   * @access Public
   */
  resetPassword = asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN'));
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new JWT tokens
    const tokens = jwtUtils.generateTokenPair({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    successResponse(res, { tokens }, 'Password reset successful');
  });

  /**
   * Verify email
   * @route GET /api/auth/verify-email/:token
   * @access Public
   */
  verifyEmail = asyncHandler(async (req, res, next) => {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid verification token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN'));
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    successResponse(res, null, 'Email verified successfully');
  });

  /**
   * Resend verification email
   * @route POST /api/auth/resend-verification
   * @access Private
   */
  resendVerification = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return next(new AppError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED'));
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    successResponse(res, null, 'Verification email sent');
  });
}

module.exports = new AuthController();

