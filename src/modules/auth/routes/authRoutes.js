const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authRateLimit } = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateForgotPassword,
  validatePasswordReset,
  validateEmailVerification,
  validateRoleSwitch,
  validateAccountDeletion,
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit(), validateLogin, authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password/:token', validatePasswordReset, authController.resetPassword);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', validateEmailVerification, authController.verifyEmail);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, authController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticate, validatePasswordChange, authController.changePassword);

/**
 * @route   POST /api/auth/switch-role
 * @desc    Switch user role
 * @access  Private
 */
router.post('/switch-role', authenticate, validateRoleSwitch, authController.switchRole);

/**
 * @route   GET /api/auth/permissions
 * @desc    Get user permissions
 * @access  Private
 */
router.get('/permissions', authenticate, authController.getPermissions);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', authenticate, validateAccountDeletion, authController.deleteAccount);

module.exports = router;

