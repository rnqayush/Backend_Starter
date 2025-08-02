const { verifyToken, extractTokenFromHeader } = require('../utils/token');
const User = require('../models/User.model');
const { HTTP_STATUS, MESSAGES, USER_ROLES, USER_STATUS } = require('../config/constants');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.USER_NOT_FOUND,
        error: 'User not found'
      });
    }

    // Check if user account is active
    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
        error: 'Account is not active'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
        error: 'Account is temporarily locked'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: MESSAGES.INVALID_TOKEN,
      error: error.message
    });
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param {...String} roles - Required roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = authorize(USER_ROLES.ADMIN);

/**
 * Middleware to check if user is vendor
 */
const requireVendor = authorize(USER_ROLES.VENDOR);

/**
 * Middleware to check if user is customer
 */
const requireCustomer = authorize(USER_ROLES.CUSTOMER);

/**
 * Middleware to check if user is vendor or admin
 */
const requireVendorOrAdmin = authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN);

/**
 * Middleware to check if user is customer or admin
 */
const requireCustomerOrAdmin = authorize(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN);

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    
    if (!user || user.status !== USER_STATUS.ACTIVE || user.isLocked) {
      req.user = null;
      return next();
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 * @param {String} userIdField - Field name containing user ID in request params/body
 */
const requireOwnershipOrAdmin = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'Authentication required'
      });
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    // Admin can access any resource
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // User can only access their own resources
    if (req.user._id.toString() !== resourceUserId) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
        error: 'You can only access your own resources'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user can access vendor resources
 */
const requireVendorAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.UNAUTHORIZED,
        error: 'Authentication required'
      });
    }

    // Admin can access any vendor resource
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // Only vendors can access vendor resources
    if (req.user.role !== USER_ROLES.VENDOR) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: MESSAGES.FORBIDDEN,
        error: 'Vendor access required'
      });
    }

    // Check if vendor ID in params matches user's vendor profile
    const vendorId = req.params.vendorId;
    if (vendorId) {
      const Vendor = require('../models/Vendor.model');
      const vendor = await Vendor.findById(vendorId);
      
      if (!vendor || vendor.user.toString() !== req.user._id.toString()) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: MESSAGES.FORBIDDEN,
          error: 'You can only access your own vendor resources'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.INTERNAL_ERROR,
      error: error.message
    });
  }
};

/**
 * Middleware to rate limit login attempts
 */
const rateLimitAuth = (req, res, next) => {
  // This would typically use Redis or similar for production
  // For now, we'll rely on the user model's built-in login attempt tracking
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireVendor,
  requireCustomer,
  requireVendorOrAdmin,
  requireCustomerOrAdmin,
  optionalAuth,
  requireOwnershipOrAdmin,
  requireVendorAccess,
  rateLimitAuth
};
