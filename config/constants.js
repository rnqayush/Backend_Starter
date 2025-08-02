// Application-wide constants for multi-vendor backend

// User roles and permissions
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Business categories
export const BUSINESS_CATEGORIES = {
  HOTEL: 'hotel',
  ECOMMERCE: 'ecommerce',
  WEDDING: 'wedding',
  AUTOMOBILE: 'automobile',
  BUSINESS: 'business'
};

// Vendor status
export const VENDOR_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected'
};

// Booking/Order status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  REFUNDED: 'refunded'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Product/Service availability
export const AVAILABILITY_STATUS = {
  IN_STOCK: 'in_stock',
  OUT_OF_STOCK: 'out_of_stock',
  LIMITED_STOCK: 'limited_stock',
  PRE_ORDER: 'pre_order',
  DISCONTINUED: 'discontinued'
};

// Vehicle conditions
export const VEHICLE_CONDITIONS = {
  NEW: 'new',
  USED: 'used',
  CERTIFIED_PRE_OWNED: 'certified_pre_owned',
  DAMAGED: 'damaged'
};

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  NET_BANKING: 'net_banking',
  WALLET: 'wallet',
  EMI: 'emi'
};

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Search and filter constants
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_LOW_HIGH: 'price_asc',
  PRICE_HIGH_LOW: 'price_desc',
  RATING_HIGH_LOW: 'rating_desc',
  POPULARITY: 'popularity',
  ALPHABETICAL: 'alphabetical'
};

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  ORDER_PLACED: 'order_placed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_RECEIVED: 'payment_received',
  VENDOR_APPROVED: 'vendor_approved',
  VENDOR_REJECTED: 'vendor_rejected',
  REVIEW_RECEIVED: 'review_received'
};

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  ORDER_CONFIRMATION: 'order_confirmation',
  VENDOR_APPROVAL: 'vendor_approval',
  PASSWORD_RESET: 'password_reset',
  INVOICE: 'invoice'
};

// API response messages
export const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  DUPLICATE_ENTRY: 'Resource already exists'
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// Rate limiting
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 requests per windowMs
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20 // limit each IP to 20 uploads per hour
  }
};

// Default values
export const DEFAULTS = {
  CURRENCY: 'INR',
  COUNTRY: 'India',
  TIMEZONE: 'Asia/Kolkata',
  LANGUAGE: 'en',
  RATING: 0,
  REVIEW_COUNT: 0,
  PAGE_SIZE: 10
};

export default {
  USER_ROLES,
  BUSINESS_CATEGORIES,
  VENDOR_STATUS,
  BOOKING_STATUS,
  ORDER_STATUS,
  AVAILABILITY_STATUS,
  VEHICLE_CONDITIONS,
  PAYMENT_METHODS,
  FILE_LIMITS,
  PAGINATION,
  SORT_OPTIONS,
  NOTIFICATION_TYPES,
  EMAIL_TEMPLATES,
  RESPONSE_MESSAGES,
  VALIDATION_PATTERNS,
  CACHE_TTL,
  RATE_LIMITS,
  DEFAULTS
};
