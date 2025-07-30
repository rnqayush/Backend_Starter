const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin
const authorizeOwnerOrAdmin = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Allow if user is admin or super_admin
      if (['admin', 'super_admin'].includes(req.user.role)) {
        return next();
      }

      // Allow if user owns the resource
      if (resource.owner && resource.owner.toString() === req.user._id.toString()) {
        return next();
      }

      // Allow if user created the resource
      if (resource.createdBy && resource.createdBy.toString() === req.user._id.toString()) {
        return next();
      }

      // Allow if user is associated with the business
      if (resource.business && req.user.businesses && req.user.businesses.includes(resource.business)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authorization'
      });
    }
  };
};

// Check if user has business access
const authorizeBusinessAccess = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    
    // Allow if user is admin or super_admin
    if (['admin', 'super_admin'].includes(req.user.role)) {
      return next();
    }

    // Check if user has access to this business
    if (req.user.businesses && req.user.businesses.includes(businessId)) {
      return next();
    }

    // Check if user is the owner of the business
    const Business = require('../models/Business');
    const business = await Business.findById(businessId);
    
    if (business && business.owner.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this business'
    });
  } catch (error) {
    console.error('Business authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during business authorization'
    });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Invalid token in optional auth:', error.message);
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  authorizeOwnerOrAdmin,
  authorizeBusinessAccess,
  optionalAuth
};

