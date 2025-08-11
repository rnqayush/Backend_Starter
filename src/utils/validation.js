const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation utility functions
 */
class ValidationHelper {
  /**
   * Handle validation results
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString()
      });
    }
    next();
  }

  /**
   * Common validation rules
   */
  static commonValidations = {
    // Email validation
    email: () => body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),

    // Password validation
    password: () => body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    // Name validation
    name: (field = 'name') => body(field)
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage(`${field} must be between 2 and 50 characters`)
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage(`${field} can only contain letters and spaces`),

    // Phone validation
    phone: () => body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please provide a valid phone number'),

    // MongoDB ObjectId validation
    mongoId: (field = 'id') => param(field)
      .isMongoId()
      .withMessage(`Invalid ${field} format`),

    // Slug validation
    slug: () => body('slug')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Slug must be between 3 and 50 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),

    // URL validation
    url: (field = 'url') => body(field)
      .optional()
      .isURL()
      .withMessage(`Please provide a valid ${field}`),

    // Price validation
    price: (field = 'price') => body(field)
      .isFloat({ min: 0 })
      .withMessage(`${field} must be a positive number`),

    // Rating validation
    rating: () => body('rating')
      .optional()
      .isFloat({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),

    // Status validation
    status: (allowedStatuses = ['active', 'inactive']) => body('status')
      .optional()
      .isIn(allowedStatuses)
      .withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),

    // Pagination validation
    pagination: () => [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
    ],

    // Date validation
    date: (field = 'date') => body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid date`),

    // Array validation
    array: (field = 'items') => body(field)
      .optional()
      .isArray()
      .withMessage(`${field} must be an array`),

    // Boolean validation
    boolean: (field = 'active') => body(field)
      .optional()
      .isBoolean()
      .withMessage(`${field} must be a boolean value`)
  };

  /**
   * User validation rules
   */
  static userValidations = {
    register: () => [
      ValidationHelper.commonValidations.name('firstName'),
      ValidationHelper.commonValidations.name('lastName'),
      ValidationHelper.commonValidations.email(),
      ValidationHelper.commonValidations.password(),
      body('role')
        .optional()
        .isIn(['customer', 'vendor', 'admin'])
        .withMessage('Role must be customer, vendor, or admin')
    ],

    login: () => [
      ValidationHelper.commonValidations.email(),
      body('password').notEmpty().withMessage('Password is required')
    ],

    updateProfile: () => [
      ValidationHelper.commonValidations.name('firstName').optional(),
      ValidationHelper.commonValidations.name('lastName').optional(),
      ValidationHelper.commonValidations.phone(),
      body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters')
    ]
  };

  /**
   * Vendor validation rules
   */
  static vendorValidations = {
    create: () => [
      ValidationHelper.commonValidations.name('businessName'),
      body('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      body('category')
        .isIn(['hotel', 'ecommerce', 'automobile', 'wedding', 'business'])
        .withMessage('Invalid category'),
      ValidationHelper.commonValidations.phone(),
      body('address.street').notEmpty().withMessage('Street address is required'),
      body('address.city').notEmpty().withMessage('City is required'),
      body('address.state').notEmpty().withMessage('State is required'),
      body('address.zipCode').notEmpty().withMessage('Zip code is required')
    ],

    update: () => [
      ValidationHelper.commonValidations.name('businessName').optional(),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      ValidationHelper.commonValidations.phone()
    ]
  };

  /**
   * Product validation rules
   */
  static productValidations = {
    create: () => [
      ValidationHelper.commonValidations.name('name'),
      body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
      ValidationHelper.commonValidations.price(),
      body('category').notEmpty().withMessage('Category is required'),
      body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
      body('sku')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('SKU must be between 3 and 50 characters')
    ],

    update: () => [
      ValidationHelper.commonValidations.name('name').optional(),
      body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
      ValidationHelper.commonValidations.price().optional(),
      body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer')
    ]
  };

  /**
   * Booking validation rules
   */
  static bookingValidations = {
    create: () => [
      body('checkIn')
        .isISO8601()
        .withMessage('Check-in date must be a valid date')
        .custom((value) => {
          if (new Date(value) <= new Date()) {
            throw new Error('Check-in date must be in the future');
          }
          return true;
        }),
      body('checkOut')
        .isISO8601()
        .withMessage('Check-out date must be a valid date')
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.checkIn)) {
            throw new Error('Check-out date must be after check-in date');
          }
          return true;
        }),
      body('guests')
        .isInt({ min: 1, max: 20 })
        .withMessage('Number of guests must be between 1 and 20'),
      body('contactInfo.name').notEmpty().withMessage('Contact name is required'),
      body('contactInfo.email').isEmail().withMessage('Valid contact email is required'),
      body('contactInfo.phone').isMobilePhone().withMessage('Valid contact phone is required')
    ]
  };

  /**
   * Search validation rules
   */
  static searchValidations = {
    general: () => [
      query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
      query('category')
        .optional()
        .isIn(['hotel', 'ecommerce', 'automobile', 'wedding', 'business'])
        .withMessage('Invalid category'),
      query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),
      query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number'),
      query('rating')
        .optional()
        .isFloat({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
      ...ValidationHelper.commonValidations.pagination()
    ]
  };
}

module.exports = ValidationHelper;
