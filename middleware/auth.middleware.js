import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import { USER_ROLES, VENDOR_STATUS } from '../config/constants.js';
import { verifyToken as verifyJWT, extractTokenFromHeader } from '../utils/token.js';

// Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      token = extractTokenFromHeader(authHeader);
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyJWT(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      message: 'Invalid token.',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware to check user roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user is a vendor
export const requireVendor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (req.user.role !== USER_ROLES.VENDOR) {
      return res.status(403).json({ 
        message: 'Vendor access required.',
        code: 'VENDOR_ACCESS_REQUIRED'
      });
    }

    // Find vendor profile
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) {
      return res.status(404).json({ 
        message: 'Vendor profile not found.',
        code: 'VENDOR_NOT_FOUND'
      });
    }

    // Check vendor status
    if (vendor.status !== VENDOR_STATUS.ACTIVE) {
      return res.status(403).json({ 
        message: 'Vendor account is not active.',
        code: 'VENDOR_NOT_ACTIVE',
        status: vendor.status
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('Vendor verification error:', error);
    return res.status(500).json({ 
      message: 'Error verifying vendor status.',
      code: 'VENDOR_VERIFICATION_ERROR'
    });
  }
};

// Middleware to check vendor ownership
export const requireVendorOwnership = (resourceField = 'vendor') => {
  return async (req, res, next) => {
    try {
      if (!req.vendor) {
        return res.status(403).json({ 
          message: 'Vendor authentication required.',
          code: 'VENDOR_AUTH_REQUIRED'
        });
      }

      // Get resource ID from params or body
      const resourceId = req.params.id || req.body[resourceField];
      
      if (!resourceId) {
        return res.status(400).json({ 
          message: 'Resource ID required.',
          code: 'RESOURCE_ID_REQUIRED'
        });
      }

      // Check if the resource belongs to the vendor
      // This will be implemented in specific controllers
      req.resourceId = resourceId;
      next();
    } catch (error) {
      console.error('Vendor ownership verification error:', error);
      return res.status(500).json({ 
        message: 'Error verifying vendor ownership.',
        code: 'OWNERSHIP_VERIFICATION_ERROR'
      });
    }
  };
};

// Middleware to check admin access
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPER_ADMIN) {
    return res.status(403).json({ 
      message: 'Admin access required.',
      code: 'ADMIN_ACCESS_REQUIRED'
    });
  }

  next();
};

// Middleware to check super admin access
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== USER_ROLES.SUPER_ADMIN) {
    return res.status(403).json({ 
      message: 'Super admin access required.',
      code: 'SUPER_ADMIN_ACCESS_REQUIRED'
    });
  }

  next();
};

// Middleware for optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      token = extractTokenFromHeader(authHeader);
    }

    if (token) {
      const decoded = verifyJWT(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
        
        // Also load vendor if user is a vendor
        if (user.role === USER_ROLES.VENDOR) {
          const vendor = await Vendor.findOne({ owner: user._id });
          if (vendor && vendor.status === VENDOR_STATUS.ACTIVE) {
            req.vendor = vendor;
          }
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth errors, just continue without user
    next();
  }
};

// Middleware to check specific permissions
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: `Permission '${permission}' required.`,
        code: 'PERMISSION_REQUIRED',
        required: permission,
        current: req.user.permissions || []
      });
    }

    next();
  };
};

// Middleware to check if user owns the resource
export const requireResourceOwnership = (resourceModel, resourceField = 'user') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required.',
          code: 'AUTH_REQUIRED'
        });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ 
          message: 'Resource ID required.',
          code: 'RESOURCE_ID_REQUIRED'
        });
      }

      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        return res.status(404).json({ 
          message: 'Resource not found.',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      // Check ownership
      const ownerId = resource[resourceField]?.toString();
      const userId = req.user._id.toString();

      if (ownerId !== userId) {
        // Allow admin access
        if (req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPER_ADMIN) {
          req.resource = resource;
          return next();
        }

        return res.status(403).json({ 
          message: 'Access denied. You do not own this resource.',
          code: 'RESOURCE_ACCESS_DENIED'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Resource ownership verification error:', error);
      return res.status(500).json({ 
        message: 'Error verifying resource ownership.',
        code: 'OWNERSHIP_VERIFICATION_ERROR'
      });
    }
  };
};
