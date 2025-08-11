const jwt = require('jsonwebtoken');
const User = require('../../../models/User');
const responseHelper = require('../../../utils/responseHelper');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return responseHelper.error(res, 'Access token is required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return responseHelper.error(res, 'User not found', 401);
    }

    // Check if user is deleted
    if (user.isDeleted) {
      return responseHelper.error(res, 'Account has been deleted', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return responseHelper.error(res, 'Account is deactivated', 401);
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
      return responseHelper.error(res, 'Password was changed. Please login again', 401);
    }

    // Add user to request object
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences,
      profile: user.profile,
      seller: user.seller,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return responseHelper.error(res, 'Invalid token', 401);
    }
    
    if (error.name === 'TokenExpiredError') {
      return responseHelper.error(res, 'Token has expired', 401);
    }

    return responseHelper.error(res, 'Authentication failed', 401);
  }
};

/**
 * Middleware to authorize user roles
 * @param {...String} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return responseHelper.error(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return responseHelper.error(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 * @param {String} resourceIdParam - Parameter name for resource ID
 * @param {String} userIdField - Field name for user ID in resource
 * @returns {Function} Express middleware function
 */
const checkOwnership = (resourceIdParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return responseHelper.error(res, 'Authentication required', 401);
      }

      // Admin can access all resources
      if (req.user.role === 'admin' || req.user.role === 'super_admin') {
        return next();
      }

      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // If resource ID matches user ID, allow access
      if (resourceId === userId.toString()) {
        return next();
      }

      // For other resources, you might need to check database
      // This is a basic implementation - extend as needed
      return responseHelper.error(res, 'Access denied', 403);
    } catch (error) {
      console.error('Ownership check error:', error);
      return responseHelper.error(res, 'Authorization failed', 500);
    }
  };
};

/**
 * Middleware to check if user is verified
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return responseHelper.error(res, 'Authentication required', 401);
  }

  if (!req.user.isEmailVerified) {
    return responseHelper.error(res, 'Email verification required', 403);
  }

  next();
};

/**
 * Middleware to check if user is active seller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireActiveSeller = (req, res, next) => {
  if (!req.user) {
    return responseHelper.error(res, 'Authentication required', 401);
  }

  if (req.user.role !== 'seller' && req.user.role !== 'admin') {
    return responseHelper.error(res, 'Seller access required', 403);
  }

  if (req.user.role === 'seller' && (!req.user.seller || !req.user.seller.verified)) {
    return responseHelper.error(res, 'Seller verification required', 403);
  }

  next();
};

/**
 * Optional authentication middleware
 * Adds user to request if token is valid, but doesn't require it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without user
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && !user.isDeleted && user.isActive) {
        req.user = {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          preferences: user.preferences,
          profile: user.profile,
          seller: user.seller,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        };
      }
    } catch (tokenError) {
      // Invalid token, continue without user
      console.log('Optional auth - invalid token:', tokenError.message);
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Middleware to rate limit authentication attempts
 * @param {Number} maxAttempts - Maximum attempts allowed
 * @param {Number} windowMs - Time window in milliseconds
 * @returns {Function} Express middleware function
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + req.body.email;
    const now = Date.now();
    
    // Clean old entries
    for (const [k, v] of attempts.entries()) {
      if (now - v.firstAttempt > windowMs) {
        attempts.delete(k);
      }
    }

    const userAttempts = attempts.get(key);
    
    if (!userAttempts) {
      attempts.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (userAttempts.count >= maxAttempts) {
      const timeLeft = Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000 / 60);
      return responseHelper.error(
        res, 
        `Too many login attempts. Try again in ${timeLeft} minutes.`, 
        429
      );
    }

    userAttempts.count++;
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
  requireVerification,
  requireActiveSeller,
  optionalAuth,
  authRateLimit,
};

