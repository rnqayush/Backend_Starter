/**
 * Vendor Model - Multi-business vendor schema
 * Supports hotels, ecommerce, wedding services, automobiles, and business services
 */

import mongoose from 'mongoose';
import { BUSINESS_CATEGORIES, VENDOR_STATUS, DEFAULTS } from '../config/constants.js';

// Address schema for reusability
const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: DEFAULTS.COUNTRY,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  }
}, { _id: false });

// Social media links schema
const socialMediaSchema = new mongoose.Schema({
  facebook: { type: String, trim: true },
  instagram: { type: String, trim: true },
  twitter: { type: String, trim: true },
  youtube: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  website: { type: String, trim: true }
}, { _id: false });

// Business hours schema
const businessHoursSchema = new mongoose.Schema({
  monday: { type: String, default: '9:00 AM - 6:00 PM' },
  tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
  wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
  thursday: { type: String, default: '9:00 AM - 6:00 PM' },
  friday: { type: String, default: '9:00 AM - 6:00 PM' },
  saturday: { type: String, default: '10:00 AM - 4:00 PM' },
  sunday: { type: String, default: 'Closed' }
}, { _id: false });

// Theme/branding schema
const themeSchema = new mongoose.Schema({
  primaryColor: {
    type: String,
    default: '#1e40af',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  secondaryColor: {
    type: String,
    default: '#3b82f6',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  backgroundColor: {
    type: String,
    default: '#f8fafc',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  textColor: {
    type: String,
    default: '#1f2937',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  }
}, { _id: false });

// SEO schema
const seoSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 60,
    trim: true
  },
  description: {
    type: String,
    maxlength: 160,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  ogImage: {
    type: String,
    trim: true
  }
}, { _id: false });

// Analytics schema
const analyticsSchema = new mongoose.Schema({
  totalViews: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyViews: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  conversionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { _id: false });

// Main Vendor Schema
const vendorSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters'],
    index: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Business category is required'],
    enum: {
      values: Object.values(BUSINESS_CATEGORIES),
      message: 'Invalid business category'
    },
    index: true
  },
  
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required'],
    index: true
  },
  
  // Business Details
  description: {
    type: String,
    required: [true, 'Business description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  tagline: {
    type: String,
    trim: true,
    maxlength: [200, 'Tagline cannot exceed 200 characters']
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Business email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format']
  },
  address: {
    type: addressSchema,
    required: [true, 'Address is required']
  },
  
  // Media
  logo: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  videos: [{
    type: String,
    trim: true
  }],
  
  // Business Configuration
  businessHours: {
    type: businessHoursSchema,
    default: () => ({})
  },
  socialMedia: {
    type: socialMediaSchema,
    default: () => ({})
  },
  theme: {
    type: themeSchema,
    default: () => ({})
  },
  
  // Status and Verification
  status: {
    type: String,
    enum: {
      values: Object.values(VENDOR_STATUS),
      message: 'Invalid vendor status'
    },
    default: VENDOR_STATUS.PENDING,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Ratings and Reviews
  rating: {
    type: Number,
    default: DEFAULTS.RATING,
    min: 0,
    max: 5,
    index: true
  },
  reviewCount: {
    type: Number,
    default: DEFAULTS.REVIEW_COUNT,
    min: 0
  },
  
  // Business License and Legal
  licenseNumber: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  taxId: {
    type: String,
    trim: true,
    sparse: true
  },
  gstNumber: {
    type: String,
    trim: true,
    sparse: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format']
  },
  
  // SEO and Marketing
  seo: {
    type: seoSchema,
    default: () => ({})
  },
  
  // Analytics
  analytics: {
    type: analyticsSchema,
    default: () => ({})
  },
  
  // Category-specific data
  categoryData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Settings
  settings: {
    acceptOnlineBookings: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowCancellation: {
      type: Boolean,
      default: true
    },
    cancellationPolicy: {
      type: String,
      trim: true,
      maxlength: 500
    },
    paymentMethods: [{
      type: String,
      trim: true
    }],
    currency: {
      type: String,
      default: DEFAULTS.CURRENCY,
      uppercase: true,
      trim: true
    },
    timezone: {
      type: String,
      default: DEFAULTS.TIMEZONE,
      trim: true
    },
    language: {
      type: String,
      default: DEFAULTS.LANGUAGE,
      lowercase: true,
      trim: true
    }
  },
  
  // Timestamps
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
vendorSchema.index({ category: 1, status: 1 });
vendorSchema.index({ 'address.city': 1, category: 1 });
vendorSchema.index({ rating: -1, reviewCount: -1 });
vendorSchema.index({ isFeatured: -1, rating: -1 });
vendorSchema.index({ createdAt: -1 });
vendorSchema.index({ 'address.coordinates.lat': 1, 'address.coordinates.lng': 1 });

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Virtual for average rating display
vendorSchema.virtual('displayRating').get(function() {
  return Math.round(this.rating * 10) / 10;
});

// Virtual for business age
vendorSchema.virtual('businessAge').get(function() {
  if (!this.establishedYear) return null;
  return new Date().getFullYear() - this.establishedYear;
});

// Pre-save middleware
vendorSchema.pre('save', function(next) {
  // Update lastActive timestamp
  this.lastActive = new Date();
  
  // Generate SEO title if not provided
  if (!this.seo.title) {
    this.seo.title = `${this.name} - ${this.category.charAt(0).toUpperCase() + this.category.slice(1)} in ${this.address.city}`;
  }
  
  // Generate SEO description if not provided
  if (!this.seo.description) {
    this.seo.description = this.description.substring(0, 160);
  }
  
  next();
});

// Static methods
vendorSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, status: VENDOR_STATUS.ACTIVE };
  return this.find(query, null, options);
};

vendorSchema.statics.findByLocation = function(city, state, options = {}) {
  const query = { 
    'address.city': new RegExp(city, 'i'),
    'address.state': new RegExp(state, 'i'),
    status: VENDOR_STATUS.ACTIVE 
  };
  return this.find(query, null, options);
};

vendorSchema.statics.findFeatured = function(category = null, options = {}) {
  const query = { isFeatured: true, status: VENDOR_STATUS.ACTIVE };
  if (category) query.category = category;
  return this.find(query, null, options);
};

// Instance methods
vendorSchema.methods.updateRating = async function(newRating) {
  // This would typically be called after a new review is added
  // Implementation would calculate average from all reviews
  this.reviewCount += 1;
  this.rating = ((this.rating * (this.reviewCount - 1)) + newRating) / this.reviewCount;
  return this.save();
};

vendorSchema.methods.incrementViews = async function() {
  this.analytics.totalViews += 1;
  this.analytics.monthlyViews += 1;
  this.lastActive = new Date();
  return this.save();
};

vendorSchema.methods.toPublicJSON = function() {
  const vendor = this.toObject();
  
  // Remove sensitive information
  delete vendor.owner;
  delete vendor.licenseNumber;
  delete vendor.taxId;
  delete vendor.gstNumber;
  delete vendor.analytics;
  
  return vendor;
};

const Vendor = mongoose.model('Vendor', vendorSchema);

export default Vendor;
