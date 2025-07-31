const Website = require('../models/Website');

/**
 * Tenant resolver middleware
 * Resolves tenant information from request (slug, subdomain, or header)
 * and attaches website context to the request
 */
const resolveTenant = async (req, res, next) => {
  try {
    let website = null;
    let tenantIdentifier = null;

    // Method 1: Extract from URL slug (/:slug/...)
    if (req.params.slug) {
      tenantIdentifier = req.params.slug;
      website = await Website.findOne({ 
        slug: tenantIdentifier, 
        status: 'active' 
      }).populate('owner', 'name email');
    }

    // Method 2: Extract from subdomain (subdomain.domain.com)
    if (!website && req.headers.host) {
      const host = req.headers.host;
      const subdomain = host.split('.')[0];
      
      // Skip if it's the main domain or common subdomains
      const skipSubdomains = ['www', 'api', 'admin', 'app', 'dashboard'];
      if (!skipSubdomains.includes(subdomain) && subdomain !== host) {
        website = await Website.findOne({ 
          slug: subdomain, 
          status: 'active' 
        }).populate('owner', 'name email');
      }
    }

    // Method 3: Extract from custom header (X-Tenant-Slug)
    if (!website && req.headers['x-tenant-slug']) {
      tenantIdentifier = req.headers['x-tenant-slug'];
      website = await Website.findOne({ 
        slug: tenantIdentifier, 
        status: 'active' 
      }).populate('owner', 'name email');
    }

    // Attach tenant information to request
    if (website) {
      req.tenant = {
        website,
        slug: website.slug,
        type: website.type,
        owner: website.owner,
        settings: website.settings,
        isActive: website.status === 'active'
      };
    } else {
      req.tenant = null;
    }

    next();
  } catch (error) {
    console.error('Tenant resolution error:', error.message);
    
    // Continue without tenant context - some routes don't require it
    req.tenant = null;
    next();
  }
};

/**
 * Require tenant middleware
 * Ensures that a valid tenant context exists
 */
const requireTenant = (req, res, next) => {
  if (!req.tenant || !req.tenant.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Website not found or inactive.'
    });
  }
  next();
};

/**
 * Tenant type validator middleware factory
 * Ensures the tenant is of a specific type
 * @param {...string} allowedTypes - Allowed website types
 * @returns {Function} Middleware function
 */
const requireTenantType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.tenant) {
      return res.status(404).json({
        success: false,
        message: 'Website context not found.'
      });
    }

    if (!allowedTypes.includes(req.tenant.type)) {
      return res.status(400).json({
        success: false,
        message: `This endpoint is only available for ${allowedTypes.join(', ')} websites.`
      });
    }

    next();
  };
};

/**
 * Tenant owner authorization middleware
 * Ensures the authenticated user owns the current tenant website
 */
const requireTenantOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!req.tenant) {
    return res.status(404).json({
      success: false,
      message: 'Website context not found.'
    });
  }

  // Check if user owns the website or is admin
  if (req.tenant.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You do not own this website.'
    });
  }

  next();
};

/**
 * Extract tenant slug from various sources
 * Utility function to get tenant identifier
 * @param {Object} req - Express request object
 * @returns {string|null} Tenant slug or null
 */
const extractTenantSlug = (req) => {
  // From URL parameter
  if (req.params.slug) {
    return req.params.slug;
  }

  // From subdomain
  if (req.headers.host) {
    const host = req.headers.host;
    const subdomain = host.split('.')[0];
    const skipSubdomains = ['www', 'api', 'admin', 'app', 'dashboard'];
    
    if (!skipSubdomains.includes(subdomain) && subdomain !== host) {
      return subdomain;
    }
  }

  // From header
  if (req.headers['x-tenant-slug']) {
    return req.headers['x-tenant-slug'];
  }

  return null;
};

module.exports = {
  resolveTenant,
  requireTenant,
  requireTenantType,
  requireTenantOwner,
  extractTenantSlug
};

