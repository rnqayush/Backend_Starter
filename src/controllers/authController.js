import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, businessType } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'User already exists', 400);
  }

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(20).toString('hex');
  const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'customer',
    businessType,
    emailVerificationToken,
    emailVerificationExpire,
    isEmailVerified: false,
  });

  // Send verification email
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message: `Please click on this link to verify your email: ${verificationUrl}`,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  sendSuccess(res, {
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessType: user.businessType,
      isEmailVerified: user.isEmailVerified,
    },
  }, 'User registered successfully. Please check your email for verification.', 201);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return sendError(res, 'Please provide an email and password', 400);
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    return sendError(res, 'Account has been deactivated', 401);
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  sendSuccess(res, {
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessType: user.businessType,
      isEmailVerified: user.isEmailVerified,
      lastLogin: user.lastLogin,
    },
  }, 'Login successful');
});

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return sendError(res, 'Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return sendError(res, 'Invalid refresh token', 401);
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    sendSuccess(res, {
      token: newToken,
      refreshToken: newRefreshToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    return sendError(res, 'Invalid refresh token', 401);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: `You are receiving this email because you requested a password reset. Please click on this link: ${resetUrl}`,
    });

    sendSuccess(res, null, 'Password reset email sent');
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    return sendError(res, 'Email could not be sent', 500);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const resetToken = req.params.resetToken;

  // Get hashed token
  const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 'Invalid or expired reset token', 400);
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  sendSuccess(res, {
    token,
    refreshToken,
  }, 'Password reset successful');
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return sendError(res, 'Invalid or expired verification token', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  sendSuccess(res, null, 'Email verified successfully');
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.isEmailVerified) {
    return sendError(res, 'Email is already verified', 400);
  }

  // Generate new verification token
  const emailVerificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = emailVerificationToken;
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  // Send verification email
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${emailVerificationToken}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message: `Please click on this link to verify your email: ${verificationUrl}`,
    });

    sendSuccess(res, null, 'Verification email sent');
  } catch (error) {
    return sendError(res, 'Email could not be sent', 500);
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      businessType: user.businessType,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  }, 'User profile retrieved successfully');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  // In a production environment, you would blacklist the token
  // For now, we'll just send a success response
  sendSuccess(res, null, 'Logout successful');
});

