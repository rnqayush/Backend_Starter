/**
 * Product Model - For ecommerce products
 * Based on frontend ecommerce data structure
 */

import mongoose from 'mongoose';
import { AVAILABILITY_STATUS, DEFAULTS } from '../config/constants.js';

// Pricing schema
const pricingSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  onSale: {
    type: Boolean,
    default: false,
    index: true
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  currency: {
    type: String,
    default: DEFAULTS.CURRENCY,
    uppercase: true,
    trim: true
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: false });

// Media schema
const mediaSchema = new mongoose.Schema({
  mainImage: {
    type: String,
    required: [true, 'Main image is required'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  videos: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Specifications schema
const specificationsSchema = new mongoose.Schema({
  brand: {
    type: String,
    trim: true,
    index: true
  },
  model: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  dimensions: {
    type: String,
    trim: true
  },
  weight: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  warranty: {
    type: String,
    trim: true
  },
  // Additional custom specifications
  customSpecs: {
    type: Map,
    of: String
  }
}, { _id: false });

// Availability schema
const availabilitySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: {
      values: Object.values(AVAILABILITY_STATUS),
      message: 'Invalid availability status'
    },
    default: AVAILABILITY_STATUS.IN_STOCK,
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  restockDate: {
    type: Date
  }
}, { _id: false });

// Reviews schema
const reviewsSchema = new mongoose.Schema({
  rating: {
    type: Number,
    default: DEFAULTS.RATING,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: DEFAULTS.REVIEW_COUNT,
    min: 0
  },
  averageRating: {
    type: Number,
    default: DEFAULTS.RATING,
    min: 0,
    max: 5
  },
  ratingDistribution: {
    five: { type: Number, default: 0, min: 0 },
    four: { type: Number, default: 0, min: 0 },
    three: { type: Number, default: 0, min: 0 },
    two: { type: Number, default: 0, min: 0 },
    one: { type: Number, default: 0, min: 0 }
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

// Shipping schema
const shippingSchema = new mongoose.Schema({
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
  },
  shippingClass: {
    type: String,
    trim: true
  },
  freeShipping: {
    type: Boolean,
    default: false
  },
  shippingCost: {
    type: Number,
    min: 0,
    default: 0
  }
}, { _id: false });

// Main Product Schema
const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    index: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Vendor and Category
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required'],
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Pricing
  pricing: {
    type: pricingSchema,
    required: [true, 'Pricing information is required']
  },
  
  // Media
  media: {
    type: mediaSchema,
    required: [true, 'Media information is required']
  },
  
  // Specifications
  specifications: {
    type: specificationsSchema,
    default: () => ({})
  },
  
  // Availability
  availability: {
    type: availabilitySchema,
    required: [true, 'Availability information is required']
  },
  
  // Reviews and Ratings
  reviews: {
    type: reviewsSchema,
    default: () => ({})
  },
  
  // Product Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    default: 'new',
    index: true
  },
  
  // SEO
  seo: {
    type: seoSchema,
    default: () => ({})
  },
  
  // Shipping
  shipping: {
    type: shippingSchema,
    default: () => ({})
  },
  
  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0
    },
    revenue: {
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
  },
  
  // Variants (for products with different sizes, colors, etc.)
  variants: [{
    name: { type: String, trim: true },
    value: { type: String, trim: true },
    price: { type: Number, min: 0 },
    quantity: { type: Number, min: 0, default: 0 },
    sku: { type: String, trim: true },
    image: { type: String, trim: true }
  }],
  
  // Related Products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Additional metadata
  sku: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true
  },
  
  // Timestamps
  publishedAt: {
    type: Date
  },
  lastRestocked: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
productSchema.index({ vendor: 1, isActive: 1 });
productSchema.index({ category: 1, 'pricing.onSale': 1 });
productSchema.index({ 'pricing.price': 1, 'reviews.rating': -1 });
productSchema.index({ isFeatured: -1, 'reviews.rating': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'availability.status': 1, isActive: 1 });
productSchema.index({ tags: 1 });

// Ensure unique slug per vendor
productSchema.index({ vendor: 1, slug: 1 }, { unique: true });

// Virtual for display price (considering sale)
productSchema.virtual('displayPrice').get(function() {
  if (this.pricing.onSale && this.pricing.salePrice) {
    return this.pricing.salePrice;
  }
  return this.pricing.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.onSale && this.pricing.originalPrice && this.pricing.salePrice) {
    return Math.round(((this.pricing.originalPrice - this.pricing.salePrice) / this.pricing.originalPrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  const quantity = this.availability.quantity;
  const threshold = this.availability.lowStockThreshold;
  
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for average rating display
productSchema.virtual('displayRating').get(function() {
  return Math.round(this.reviews.averageRating * 10) / 10;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Auto-generate SEO title if not provided
  if (!this.seo.title) {
    this.seo.title = `${this.name} - ${this.specifications.brand || 'Quality Product'}`;
  }
  
  // Auto-generate SEO description if not provided
  if (!this.seo.description) {
    this.seo.description = this.shortDescription || this.description.substring(0, 160);
  }
  
  // Update availability status based on quantity
  if (this.availability.quantity === 0) {
    this.availability.status = AVAILABILITY_STATUS.OUT_OF_STOCK;
  } else if (this.availability.quantity <= this.availability.lowStockThreshold) {
    this.availability.status = AVAILABILITY_STATUS.LIMITED_STOCK;
  } else {
    this.availability.status = AVAILABILITY_STATUS.IN_STOCK;
  }
  
  // Calculate discount percentage for pricing
  if (this.pricing.onSale && this.pricing.originalPrice && this.pricing.salePrice) {
    this.pricing.discountPercentage = Math.round(
      ((this.pricing.originalPrice - this.pricing.salePrice) / this.pricing.originalPrice) * 100
    );
  }
  
  // Set published date if product is being activated for the first time
  if (this.isActive && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Static methods
productSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query, null, options);
};

productSchema.statics.findByVendor = function(vendorId, options = {}) {
  const query = { vendor: vendorId, isActive: true };
  return this.find(query, null, options);
};

productSchema.statics.findOnSale = function(options = {}) {
  const query = { 'pricing.onSale': true, isActive: true };
  return this.find(query, null, options);
};

productSchema.statics.findFeatured = function(options = {}) {
  const query = { isFeatured: true, isActive: true };
  return this.find(query, null, options);
};

productSchema.statics.findInStock = function(options = {}) {
  const query = { 
    'availability.status': { $in: [AVAILABILITY_STATUS.IN_STOCK, AVAILABILITY_STATUS.LIMITED_STOCK] },
    isActive: true 
  };
  return this.find(query, null, options);
};

productSchema.statics.searchProducts = function(searchTerm, options = {}) {
  const query = {
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          { 'specifications.brand': { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };
  return this.find(query, null, options);
};

// Instance methods
productSchema.methods.updateStock = async function(quantity, operation = 'set') {
  if (operation === 'add') {
    this.availability.quantity += quantity;
  } else if (operation === 'subtract') {
    this.availability.quantity = Math.max(0, this.availability.quantity - quantity);
  } else {
    this.availability.quantity = Math.max(0, quantity);
  }
  
  if (this.availability.quantity > 0) {
    this.lastRestocked = new Date();
  }
  
  return this.save();
};

productSchema.methods.updateRating = async function(newRating) {
  const reviews = this.reviews;
  reviews.totalReviews += 1;
  reviews.averageRating = ((reviews.averageRating * (reviews.totalReviews - 1)) + newRating) / reviews.totalReviews;
  reviews.rating = reviews.averageRating;
  
  // Update rating distribution
  const ratingKey = ['one', 'two', 'three', 'four', 'five'][newRating - 1];
  if (ratingKey) {
    reviews.ratingDistribution[ratingKey] += 1;
  }
  
  return this.save();
};

productSchema.methods.incrementViews = async function() {
  this.analytics.totalViews += 1;
  return this.save();
};

productSchema.methods.recordSale = async function(quantity = 1, saleAmount = null) {
  this.analytics.totalSales += quantity;
  if (saleAmount) {
    this.analytics.revenue += saleAmount;
  }
  
  // Update stock
  await this.updateStock(quantity, 'subtract');
  
  return this.save();
};

productSchema.methods.toPublicJSON = function() {
  const product = this.toObject();
  
  // Remove sensitive analytics data
  delete product.analytics.revenue;
  delete product.analytics.conversionRate;
  
  return product;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
