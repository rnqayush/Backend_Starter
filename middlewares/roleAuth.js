import { formatResponse } from '../utils/responseFormatter.js';

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        formatResponse(false, 'Access denied. Please login first.', null)
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        formatResponse(
          false, 
          `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`, 
          null
        )
      );
    }

    next();
  };
};

// Check if user is admin
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      formatResponse(false, 'Access denied. Please login first.', null)
    );
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json(
      formatResponse(false, 'Access denied. Admin privileges required.', null)
    );
  }

  next();
};

// Check if user is vendor
export const isVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      formatResponse(false, 'Access denied. Please login first.', null)
    );
  }

  if (req.user.role !== 'vendor') {
    return res.status(403).json(
      formatResponse(false, 'Access denied. Vendor privileges required.', null)
    );
  }

  next();
};

// Check if user is customer
export const isCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      formatResponse(false, 'Access denied. Please login first.', null)
    );
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json(
      formatResponse(false, 'Access denied. Customer privileges required.', null)
    );
  }

  next();
};

// Check if user is vendor or admin
export const isVendorOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(
      formatResponse(false, 'Access denied. Please login first.', null)
    );
  }

  if (!['vendor', 'admin'].includes(req.user.role)) {
    return res.status(403).json(
      formatResponse(false, 'Access denied. Vendor or Admin privileges required.', null)
    );
  }

  next();
};

// Check resource ownership (for vendors accessing their own data)
export const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json(
          formatResponse(false, 'Resource not found', null)
        );
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if vendor owns the resource
      if (req.user.role === 'vendor' && resource.vendorId && resource.vendorId.toString() === req.user.id) {
        return next();
      }

      return res.status(403).json(
        formatResponse(false, 'Access denied. You can only access your own resources.', null)
      );
    } catch (error) {
      return res.status(500).json(
        formatResponse(false, 'Error checking resource ownership', null)
      );
    }
  };
};

