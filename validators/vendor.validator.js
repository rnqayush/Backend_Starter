/**
 * Vendor Validation Middleware
 */

import { body, validationResult } from 'express-validator';
import { AppError } from '../middleware/error.middleware.js';
import { BUSINESS_CATEGORIES } from '../config/constants.js';

// Validation rules for vendor creation
export const validateVendorCreation = [
  // Required fields validation
  body('name')
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
    .trim(),

  body('category')
    .notEmpty()
    .withMessage('Business category is required')
    .isIn(Object.values(BUSINESS_CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(BUSINESS_CATEGORIES).join(', ')}`),

  body('description')
    .notEmpty()
    .withMessage('Business description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),

  body('email')
    .notEmpty()
    .withMessage('Business email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  // Address validation
  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isObject()
    .withMessage('Address must be an object'),

  body('address.street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim(),

  body('address.city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),

  body('address.state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),

  body('address.zipCode')
    .notEmpty()
    .withMessage('Zip code is required')
    .trim(),

  body('address.country')
    .optional()
    .trim(),

  // Business hours validation (optional but if provided, must be object)
  body('businessHours')
    .optional()
    .isObject()
    .withMessage('Business hours must be an object with day properties, not a string'),

  // Optional fields validation
  body('tagline')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Tagline cannot exceed 200 characters')
    .trim(),

  body('establishedYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Established year must be between 1900 and ${new Date().getFullYear()}`),

  body('licenseNumber')
    .optional()
    .trim(),

  body('taxId')
    .optional()
    .trim(),

  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GST number format')
];

// Validation rules for vendor update
export const validateVendorUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters')
    .trim(),

  body('category')
    .optional()
    .isIn(Object.values(BUSINESS_CATEGORIES))
    .withMessage(`Category must be one of: ${Object.values(BUSINESS_CATEGORIES).join(', ')}`),

  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('businessHours')
    .optional()
    .isObject()
    .withMessage('Business hours must be an object with day properties, not a string'),

  body('tagline')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Tagline cannot exceed 200 characters')
    .trim(),

  body('establishedYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Established year must be between 1900 and ${new Date().getFullYear()}`),

  body('gstNumber')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GST number format')
];

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    // Create detailed error message
    const detailedMessage = errorMessages.map(err => `${err.field}: ${err.message}`).join(', ');
    
    return next(new AppError(
      `Vendor validation failed: ${detailedMessage}`,
      400,
      'VALIDATION_ERROR',
      errorMessages
    ));
  }
  
  next();
};

// Combined validation middleware for vendor creation
export const validateVendor = [
  ...validateVendorCreation,
  handleValidationErrors
];

// Combined validation middleware for vendor update
export const validateVendorUpdateData = [
  ...validateVendorUpdate,
  handleValidationErrors
];

