/**
 * Error handling middleware for the multi-vendor backend
 */

import { RESPONSE_MESSAGES } from '../config/constants.js';

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
export const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));

  return new AppError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { errors }
  );
};

// MongoDB duplicate key error handler
export const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return new AppError(
    `${field} '${value}' already exists`,
    409,
    'DUPLICATE_ENTRY',
    { field, value }
  );
};

// MongoDB cast error handler
export const handleCastError = (error) => {
  return new AppError(
    `Invalid ${error.path}: ${error.value}`,
    400,
    'INVALID_ID',
    { field: error.path, value: error.value }
  );
};

// JWT error handler
export const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  return new AppError('Authentication failed', 401, 'AUTH_FAILED');
};

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: 'error',
    statusCode: err.statusCode,
    message: err.message,
    code: err.code,
    details: err.details,
    stack: err.stack,
    error: err
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.details
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      code: 'INTERNAL_ERROR'
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    
    if (error.code === 11000) {
      error = handleDuplicateKeyError(error);
    }
    
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error = handleJWTError(error);
    }

    sendErrorProd(error, res);
  }
};

// Async error wrapper
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Rate limiting error handler
export const rateLimitHandler = (req, res) => {
  res.status(429).json({
    status: 'error',
    statusCode: 429,
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: req.rateLimit?.resetTime
  });
};

// Validation middleware for request body
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new AppError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { errors }
      ));
    }

    req.body = value;
    next();
  };
};

// Validation middleware for query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new AppError(
        'Query validation failed',
        400,
        'QUERY_VALIDATION_ERROR',
        { errors }
      ));
    }

    req.query = value;
    next();
  };
};

// Validation middleware for URL parameters
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return next(new AppError(
        'Parameter validation failed',
        400,
        'PARAM_VALIDATION_ERROR',
        { errors }
      ));
    }

    req.params = value;
    next();
  };
};

export default {
  AppError,
  globalErrorHandler,
  catchAsync,
  notFound,
  rateLimitHandler,
  validateRequest,
  validateQuery,
  validateParams,
  handleValidationError,
  handleDuplicateKeyError,
  handleCastError,
  handleJWTError
};
