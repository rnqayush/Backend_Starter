const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/responseHelper');

class AuthMiddleware {
  /**
   * Authenticate user using JWT token
   */
  async authenticate(req, res, next) {
    try {
      let token;

      // Get token from Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return errorResponse(res, 'Access token is required', 401);
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 'User not found', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        return errorResponse(res, 'Account is deactivated', 401);
      }

      // Check if user is deleted
      if (user.isDeleted) {
        return errorResponse(res, 'Account has been deleted', 401);
      }

      // Check if password was changed after token was issued
      if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
        return errorResponse(res, 'Password was changed recently. Please login again', 401);
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
      } else if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired', 401);
      }
      
      console.error('Authentication error:', error);
      return errorResponse(res, 'Authentication failed', 401);
    }
  }

  /**
   * Authorize user based on roles
   */
  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      if (!roles.includes(req.user.role)) {
        return errorResponse(res, 'Insufficient permissions', 403);
      }

      next();
    };
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission) {
    return (req, res, next) => {
      if (!req.user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const userPermissions = this.getUserPermissions(req.user.role);
      
      if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
        return errorResponse(res, 'Insufficient permissions', 403);
      }

      next();
    };
  }

  /**
   * Check if user owns the resource
   */
  checkOwnership(resourceField = 'userId') {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return errorResponse(res, 'Authentication required', 401);
        }

        // Admin can access any resource
        if (req.user.role === 'admin' || req.user.role === 'super_admin') {
          return next();
        }

        // Check if user owns the resource
        const resourceUserId = req.params[resourceField] || req.body[resourceField];
        
        if (resourceUserId && resourceUserId !== req.user._id.toString()) {
          return errorResponse(res, 'Access denied. You can only access your own resources', 403);
        }

        next();
      } catch (error) {
        console.error('Ownership check error:', error);
        return errorResponse(res, 'Authorization failed', 500);
      }
    };
  }

  /**
   * Require email verification
   */
  requireEmailVerification(req, res, next) {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!req.user.isEmailVerified) {
      return errorResponse(res, 'Email verification required', 403);
    }

    next();
  }

  /**
   * Require seller verification (for seller-specific actions)
   */
  requireSellerVerification(req, res, next) {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (req.user.role !== 'seller') {
      return errorResponse(res, 'Seller role required', 403);
    }

    if (!req.user.seller || !req.user.seller.verified) {
      return errorResponse(res, 'Seller verification required', 403);
    }

    next();
  }

  /**
   * Optional authentication (doesn't fail if no token)
   */
  async optionalAuth(req, res, next) {
    try {
      let token;

      // Get token from Authorization header
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(); // Continue without user
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);
      if (user && user.isActive && !user.isDeleted) {
        req.user = user;
      }

      next();
    } catch (error) {
      // Continue without user if token is invalid
      next();
    }
  }

  /**
   * Rate limiting for authentication endpoints
   */
  authRateLimit(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const attempts = new Map();

    return (req, res, next) => {
      const key = req.ip + ':' + (req.body.email || 'unknown');
      const now = Date.now();
      
      // Clean old attempts
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
        return errorResponse(res, `Too many attempts. Try again in ${timeLeft} minutes`, 429);
      }

      userAttempts.count++;
      next();
    };
  }

  /**
   * Get user permissions based on role
   */
  getUserPermissions(role) {
    const permissions = {
      customer: ['read:profile', 'update:profile', 'create:booking', 'create:order'],
      seller: ['read:profile', 'update:profile', 'manage:products', 'manage:orders', 'read:analytics'],
      hotel_owner: ['read:profile', 'update:profile', 'manage:hotel', 'manage:rooms', 'manage:bookings'],
      wedding_vendor: ['read:profile', 'update:profile', 'manage:services', 'manage:portfolio', 'manage:bookings'],
      auto_dealer: ['read:profile', 'update:profile', 'manage:vehicles', 'manage:inventory'],
      business_owner: ['read:profile', 'update:profile', 'manage:services', 'manage:appointments'],
      admin: ['*'], // All permissions
      super_admin: ['*'], // All permissions
    };

    return permissions[role] || permissions.customer;
  }
}

module.exports = new AuthMiddleware();
