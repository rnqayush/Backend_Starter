const { HTTP_STATUS, MESSAGES } = require('../config/constants');

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: HTTP_STATUS.NOT_FOUND
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = {
      message,
      statusCode: HTTP_STATUS.CONFLICT
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: HTTP_STATUS.BAD_REQUEST
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: HTTP_STATUS.UNAUTHORIZED
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: HTTP_STATUS.UNAUTHORIZED
    };
  }

  // Joi validation errors
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join(', ');
    error = {
      message,
      statusCode: HTTP_STATUS.BAD_REQUEST
    };
  }

  // Custom application errors
  if (err.isOperational) {
    error = {
      message: err.message,
      statusCode: err.statusCode || HTTP_STATUS.BAD_REQUEST
    };
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || MESSAGES.INTERNAL_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for operational errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create and throw a custom error
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 */
const createError = (message, statusCode = HTTP_STATUS.BAD_REQUEST) => {
  throw new AppError(message, statusCode);
};

/**
 * Validation error handler
 * @param {String} message - Error message
 */
const validationError = (message) => {
  throw new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Authentication error handler
 * @param {String} message - Error message
 */
const authError = (message = MESSAGES.UNAUTHORIZED) => {
  throw new AppError(message, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Authorization error handler
 * @param {String} message - Error message
 */
const forbiddenError = (message = MESSAGES.FORBIDDEN) => {
  throw new AppError(message, HTTP_STATUS.FORBIDDEN);
};

/**
 * Not found error handler
 * @param {String} message - Error message
 */
const notFoundError = (message = 'Resource not found') => {
  throw new AppError(message, HTTP_STATUS.NOT_FOUND);
};

/**
 * Conflict error handler
 * @param {String} message - Error message
 */
const conflictError = (message) => {
  throw new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * Internal server error handler
 * @param {String} message - Error message
 */
const internalError = (message = MESSAGES.INTERNAL_ERROR) => {
  throw new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

/**
 * Handle database connection errors
 */
const handleDatabaseError = (err) => {
  console.error('Database Error:', err);
  
  if (err.name === 'MongoNetworkError') {
    return new AppError('Database connection failed', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  
  if (err.name === 'MongoTimeoutError') {
    return new AppError('Database operation timed out', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  
  return new AppError('Database error occurred', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

/**
 * Handle file upload errors
 */
const handleFileUploadError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File size too large', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files uploaded', HTTP_STATUS.BAD_REQUEST);
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected file field', HTTP_STATUS.BAD_REQUEST);
  }
  
  return new AppError('File upload error', HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle rate limiting errors
 */
const handleRateLimitError = () => {
  return new AppError('Too many requests, please try again later', HTTP_STATUS.TOO_MANY_REQUESTS);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
  createError,
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  conflictError,
  internalError,
  handleDatabaseError,
  handleFileUploadError,
  handleRateLimitError
};
