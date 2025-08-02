const Joi = require('joi');

// Common validation patterns
const businessNamePattern = Joi.string()
  .min(2)
  .max(100)
  .trim()
  .required()
  .messages({
    'string.min': 'Business name must be at least 2 characters long',
    'string.max': 'Business name cannot exceed 100 characters',
    'any.required': 'Business name is required'
  });

const emailPattern = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

const phonePattern = Joi.string()
  .pattern(/^\+?[\d\s-()]+$/)
  .min(10)
  .max(20)
  .trim()
  .required()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters',
    'any.required': 'Phone number is required'
  });

const urlPattern = Joi.string()
  .uri({ scheme: ['http', 'https'] })
  .optional()
  .messages({
    'string.uri': 'Please provide a valid URL'
  });

// Vendor registration/creation schema
const createVendorSchema = Joi.object({
  businessName: businessNamePattern,
  
  description: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  businessType: Joi.string()
    .valid('individual', 'partnership', 'corporation', 'llc', 'nonprofit', 'other')
    .required()
    .messages({
      'any.only': 'Business type must be one of: individual, partnership, corporation, llc, nonprofit, other',
      'any.required': 'Business type is required'
    }),
  
  category: Joi.string()
    .valid(
      'electronics', 'clothing', 'home_garden', 'sports', 'books',
      'health_beauty', 'automotive', 'toys_games', 'food_beverages',
      'jewelry', 'art_crafts', 'services', 'other'
    )
    .required()
    .messages({
      'any.only': 'Please select a valid business category',
      'any.required': 'Business category is required'
    }),
  
  businessAddress: Joi.object({
    street: Joi.string()
      .max(200)
      .trim()
      .required()
      .messages({
        'string.max': 'Street address cannot exceed 200 characters',
        'any.required': 'Street address is required'
      }),
    
    city: Joi.string()
      .max(100)
      .trim()
      .required()
      .messages({
        'string.max': 'City cannot exceed 100 characters',
        'any.required': 'City is required'
      }),
    
    state: Joi.string()
      .max(100)
      .trim()
      .required()
      .messages({
        'string.max': 'State cannot exceed 100 characters',
        'any.required': 'State is required'
      }),
    
    zipCode: Joi.string()
      .max(20)
      .trim()
      .required()
      .messages({
        'string.max': 'Zip code cannot exceed 20 characters',
        'any.required': 'Zip code is required'
      }),
    
    country: Joi.string()
      .max(100)
      .trim()
      .required()
      .messages({
        'string.max': 'Country cannot exceed 100 characters',
        'any.required': 'Country is required'
      })
  }).required().messages({
    'any.required': 'Business address is required'
  }),
  
  contactInfo: Joi.object({
    phone: phonePattern,
    email: emailPattern,
    website: urlPattern
  }).required().messages({
    'any.required': 'Contact information is required'
  }),
  
  businessDocuments: Joi.object({
    businessLicense: Joi.string().optional(),
    taxId: Joi.string().optional(),
    bankStatement: Joi.string().optional(),
    identityProof: Joi.string().optional()
  }).optional(),
  
  settings: Joi.object({
    acceptsReturns: Joi.boolean().default(true),
    returnPolicy: Joi.string().max(1000).trim().optional(),
    shippingPolicy: Joi.string().max(1000).trim().optional(),
    processingTime: Joi.number().min(1).max(30).default(1).messages({
      'number.min': 'Processing time must be at least 1 day',
      'number.max': 'Processing time cannot exceed 30 days'
    })
  }).optional(),
  
  socialMedia: Joi.object({
    facebook: urlPattern,
    instagram: urlPattern,
    twitter: urlPattern,
    linkedin: urlPattern
  }).optional()
});

// Vendor update schema
const updateVendorSchema = Joi.object({
  businessName: businessNamePattern.optional(),
  
  description: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  businessType: Joi.string()
    .valid('individual', 'partnership', 'corporation', 'llc', 'nonprofit', 'other')
    .optional(),
  
  category: Joi.string()
    .valid(
      'electronics', 'clothing', 'home_garden', 'sports', 'books',
      'health_beauty', 'automotive', 'toys_games', 'food_beverages',
      'jewelry', 'art_crafts', 'services', 'other'
    )
    .optional(),
  
  businessAddress: Joi.object({
    street: Joi.string().max(200).trim().optional(),
    city: Joi.string().max(100).trim().optional(),
    state: Joi.string().max(100).trim().optional(),
    zipCode: Joi.string().max(20).trim().optional(),
    country: Joi.string().max(100).trim().optional()
  }).optional(),
  
  contactInfo: Joi.object({
    phone: phonePattern.optional(),
    email: emailPattern.optional(),
    website: urlPattern
  }).optional(),
  
  settings: Joi.object({
    isActive: Joi.boolean().optional(),
    acceptsReturns: Joi.boolean().optional(),
    returnPolicy: Joi.string().max(1000).trim().optional(),
    shippingPolicy: Joi.string().max(1000).trim().optional(),
    processingTime: Joi.number().min(1).max(30).optional()
  }).optional(),
  
  socialMedia: Joi.object({
    facebook: urlPattern,
    instagram: urlPattern,
    twitter: urlPattern,
    linkedin: urlPattern
  }).optional()
});

// Vendor approval/rejection schema (admin only)
const vendorStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'suspended')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, approved, rejected, suspended',
      'any.required': 'Status is required'
    }),
  
  verificationNotes: Joi.string()
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.max': 'Verification notes cannot exceed 500 characters'
    }),
  
  rejectionReason: Joi.string()
    .max(500)
    .trim()
    .when('status', {
      is: 'rejected',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      'string.max': 'Rejection reason cannot exceed 500 characters',
      'any.required': 'Rejection reason is required when rejecting vendor'
    })
});

// Vendor search/filter schema
const vendorSearchSchema = Joi.object({
  search: Joi.string()
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  
  category: Joi.string()
    .valid(
      'electronics', 'clothing', 'home_garden', 'sports', 'books',
      'health_beauty', 'automotive', 'toys_games', 'food_beverages',
      'jewelry', 'art_crafts', 'services', 'other'
    )
    .optional(),
  
  status: Joi.string()
    .valid('pending', 'approved', 'rejected', 'suspended')
    .optional(),
  
  businessType: Joi.string()
    .valid('individual', 'partnership', 'corporation', 'llc', 'nonprofit', 'other')
    .optional(),
  
  minRating: Joi.number()
    .min(0)
    .max(5)
    .optional()
    .messages({
      'number.min': 'Minimum rating must be at least 0',
      'number.max': 'Minimum rating cannot exceed 5'
    }),
  
  city: Joi.string()
    .max(100)
    .trim()
    .optional(),
  
  state: Joi.string()
    .max(100)
    .trim()
    .optional(),
  
  country: Joi.string()
    .max(100)
    .trim()
    .optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional(),
  
  sort: Joi.string()
    .valid('businessName', 'createdAt', 'rating.average', 'stats.totalOrders')
    .default('createdAt')
    .optional(),
  
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional()
});

// Vendor ID parameter validation
const vendorIdParamSchema = Joi.object({
  vendorId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid vendor ID format',
      'any.required': 'Vendor ID is required'
    })
});

// Vendor slug parameter validation
const vendorSlugParamSchema = Joi.object({
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid vendor slug format',
      'any.required': 'Vendor slug is required'
    })
});

// Vendor rating schema
const vendorRatingSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
  
  review: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.max': 'Review cannot exceed 1000 characters'
    })
});

module.exports = {
  createVendorSchema,
  updateVendorSchema,
  vendorStatusSchema,
  vendorSearchSchema,
  vendorIdParamSchema,
  vendorSlugParamSchema,
  vendorRatingSchema
};
