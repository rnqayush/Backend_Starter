const { HTTP_STATUS, MESSAGES } = require('../config/constants');

/**
 * Middleware to validate request data using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      allowUnknown: false, // Don't allow unknown fields
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, ''))
        .join(', ');

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: errorMessage,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
          value: detail.context.value
        }))
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate request body
 * @param {Object} schema - Joi validation schema
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * Validate request params
 * @param {Object} schema - Joi validation schema
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Validate request query
 * @param {Object} schema - Joi validation schema
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate multiple request properties
 * @param {Object} schemas - Object containing schemas for different properties
 * @example
 * validateMultiple({
 *   body: userCreateSchema,
 *   params: userParamsSchema,
 *   query: paginationSchema
 * })
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each specified property
    Object.keys(schemas).forEach(property => {
      const schema = schemas[property];
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          property,
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
          value: detail.context.value
        })));
      } else {
        // Replace with validated data
        req[property] = value;
      }
    });

    if (errors.length > 0) {
      const errorMessage = errors.map(err => `${err.property}.${err.field}: ${err.message}`).join(', ');

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: errorMessage,
        details: errors
      });
    }

    next();
  };
};

/**
 * Validate file upload
 * @param {Object} options - File validation options
 */
const validateFile = (options = {}) => {
  const {
    required = false,
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    fieldName = 'file'
  } = options;

  return (req, res, next) => {
    const file = req.file || req.files?.[fieldName];

    // Check if file is required
    if (required && !file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: `${fieldName} is required`
      });
    }

    // If no file and not required, continue
    if (!file) {
      return next();
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: `File type must be one of: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10, sort, order = 'desc' } = req.query;

  // Validate page
  const pageNum = parseInt(page);
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      error: 'Page must be a positive integer'
    });
  }

  // Validate limit
  const limitNum = parseInt(limit);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      error: 'Limit must be between 1 and 100'
    });
  }

  // Validate sort order
  if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      error: 'Order must be either "asc" or "desc"'
    });
  }

  // Add validated pagination to request
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
    sort: sort || 'createdAt',
    order: order.toLowerCase()
  };

  next();
};

/**
 * Validate MongoDB ObjectId
 * @param {String} paramName - Name of the parameter to validate
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: `${paramName} is required`
      });
    }

    // Check if it's a valid MongoDB ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.VALIDATION_ERROR,
        error: `Invalid ${paramName} format`
      });
    }

    next();
  };
};

/**
 * Sanitize input to prevent XSS attacks
 */
const sanitizeInput = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Basic XSS prevention - remove script tags and javascript: protocols
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      Object.keys(value).forEach(key => {
        sanitized[key] = sanitizeValue(value[key]);
      });
      return sanitized;
    }
    return value;
  };

  // Sanitize body, query, and params
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);

  next();
};

module.exports = {
  validate,
  validateBody,
  validateParams,
  validateQuery,
  validateMultiple,
  validateFile,
  validatePagination,
  validateObjectId,
  sanitizeInput
};
