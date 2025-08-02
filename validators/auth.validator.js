const Joi = require('joi');
const { USER_ROLES } = require('../config/constants');

// Common validation patterns
const emailPattern = Joi.string()
  .email({ tlds: { allow: false } })
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

const passwordPattern = Joi.string()
  .min(6)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  });

const namePattern = Joi.string()
  .min(2)
  .max(50)
  .pattern(/^[a-zA-Z\s]+$/)
  .trim()
  .required()
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters and spaces',
    'any.required': 'Name is required'
  });

const phonePattern = Joi.string()
  .pattern(/^\+?[\d\s-()]+$/)
  .min(10)
  .max(20)
  .trim()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'string.min': 'Phone number must be at least 10 characters',
    'string.max': 'Phone number cannot exceed 20 characters'
  });

// User registration validation schema
const registerSchema = Joi.object({
  firstName: namePattern.messages({
    'any.required': 'First name is required'
  }),
  
  lastName: namePattern.messages({
    'any.required': 'Last name is required'
  }),
  
  email: emailPattern,
  
  password: passwordPattern,
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    }),
  
  phone: phonePattern.optional(),
  
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .default(USER_ROLES.CUSTOMER)
    .messages({
      'any.only': `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`
    }),
  
  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
  
  address: Joi.object({
    street: Joi.string().max(200).trim().optional(),
    city: Joi.string().max(100).trim().optional(),
    state: Joi.string().max(100).trim().optional(),
    zipCode: Joi.string().max(20).trim().optional(),
    country: Joi.string().max(100).trim().optional()
  }).optional(),
  
  agreeToTerms: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': 'You must agree to the terms and conditions',
      'any.required': 'Agreement to terms is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: emailPattern,
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    }),
  
  rememberMe: Joi.boolean().optional()
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: emailPattern
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  
  password: passwordPattern,
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: passwordPattern.messages({
    'any.required': 'New password is required'
  }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required'
    })
});

// Update profile validation schema
const updateProfileSchema = Joi.object({
  firstName: namePattern.optional(),
  
  lastName: namePattern.optional(),
  
  phone: phonePattern.optional(),
  
  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future'
    }),
  
  address: Joi.object({
    street: Joi.string().max(200).trim().optional(),
    city: Joi.string().max(100).trim().optional(),
    state: Joi.string().max(100).trim().optional(),
    zipCode: Joi.string().max(20).trim().optional(),
    country: Joi.string().max(100).trim().optional()
  }).optional()
});

// Email verification validation schema
const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required'
    })
});

// Resend verification email schema
const resendVerificationSchema = Joi.object({
  email: emailPattern
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

// Admin user creation schema
const adminCreateUserSchema = Joi.object({
  firstName: namePattern,
  lastName: namePattern,
  email: emailPattern,
  password: passwordPattern,
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .required()
    .messages({
      'any.only': `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
      'any.required': 'Role is required'
    }),
  phone: phonePattern.optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'suspended')
    .default('active')
});

// Admin user update schema
const adminUpdateUserSchema = Joi.object({
  firstName: namePattern.optional(),
  lastName: namePattern.optional(),
  email: emailPattern.optional(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLES))
    .optional(),
  phone: phonePattern.optional(),
  status: Joi.string()
    .valid('active', 'inactive', 'suspended')
    .optional()
});

// User ID parameter validation
const userIdParamSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  refreshTokenSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userIdParamSchema
};
