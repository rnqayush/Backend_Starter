const { body, param, query, validationResult } = require('express-validator');

// Generic validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'vendor', 'admin'])
    .withMessage('Invalid role'),
  validate,
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// Business validation rules
const validateBusiness = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('type')
    .isIn(['hotel', 'ecommerce', 'automobile', 'wedding', 'business'])
    .withMessage('Invalid business type'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  validate,
];

// Product validation rules
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('pricing.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  validate,
];

// Hotel validation rules
const validateHotel = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('business').isMongoId().withMessage('Valid business ID is required'),
  body('starRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Star rating must be between 1 and 5'),
  validate,
];

// Room validation rules
const validateRoom = [
  body('name').trim().notEmpty().withMessage('Room name is required'),
  body('type')
    .isIn(['Standard', 'Deluxe', 'Suite', 'Presidential'])
    .withMessage('Invalid room type'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  validate,
];

// Vehicle validation rules
const validateVehicle = [
  body('name').trim().notEmpty().withMessage('Vehicle name is required'),
  body('make').trim().notEmpty().withMessage('Vehicle make is required'),
  body('model').trim().notEmpty().withMessage('Vehicle model is required'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage('Invalid year'),
  body('condition')
    .isIn(['new', 'used', 'certified'])
    .withMessage('Invalid condition'),
  body('pricing.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  validate,
];

// Booking validation rules
const validateBooking = [
  body('customerInfo.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('customerInfo.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('customerInfo.email').isEmail().withMessage('Valid email is required'),
  body('customerInfo.phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('pricing.total')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be positive'),
  validate,
];

// Order validation rules
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.street1')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  validate,
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),
  validate,
];

// Blog validation rules
const validateBlog = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  validate,
];

// Parameter validation
const validateObjectId = paramName => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} ID`),
  validate,
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateBusiness,
  validateProduct,
  validateHotel,
  validateRoom,
  validateVehicle,
  validateBooking,
  validateOrder,
  validateReview,
  validateBlog,
  validateObjectId,
  validatePagination,
};
