const jwtUtils = require('../utils/jwt');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT tokens and attaches user information to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwtUtils.verifyAccessToken(token);
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

/**
 * Authorization middleware factory
 * Creates middleware to check user roles
 * @param {...string} roles - Required roles
 * @returns {Function} Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Website owner authorization middleware
 * Checks if user owns the website they're trying to access
 */
const authorizeWebsiteOwner = async (req, res, next) => {
  try {
    const { websiteId } = req.params;
    const userId = req.user._id;

    // Import Website model here to avoid circular dependency
    const Website = require('../models/Website');
    
    const website = await Website.findById(websiteId);
    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found.'
      });
    }

    // Check if user owns the website or is admin
    if (website.owner.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not own this website.'
      });
    }

    // Attach website to request for use in controllers
    req.website = website;
    next();
  } catch (error) {
    console.error('Website authorization error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = jwtUtils.verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Website context middleware
 * Sets req.website from tenant context for backward compatibility
 */
const setWebsiteContext = (req, res, next) => {
  if (req.tenant && req.tenant.website) {
    req.website = req.tenant.website;
  }
  next();
};

/**
 * Require website context middleware
 * Ensures that a website context exists (from tenant)
 */
const requireWebsiteContext = (req, res, next) => {
  // Check if tenant exists and has a website
  if (!req.tenant || !req.tenant.website) {
    return res.status(400).json({
      success: false,
      message: 'Website context required. Please provide website identifier via header (X-Tenant-Slug) or subdomain.',
      errorCode: 'MISSING_WEBSITE_CONTEXT',
      details: {
        tenant: !!req.tenant,
        website: !!(req.tenant && req.tenant.website),
        availableMethods: [
          'Add X-Tenant-Slug header with your website slug',
          'Use subdomain: your-slug.yourdomain.com',
          'Use URL parameter: /your-slug/api/...'
        ]
      }
    });
  }
  
  // Set website context for backward compatibility
  req.website = req.tenant.website;
  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeWebsiteOwner,
  optionalAuth,
  setWebsiteContext,
  requireWebsiteContext
};
