const mongoose = require('mongoose');

/**
 * Product Model
 * Represents products in an e-commerce website
 */
const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true
  },
  description: {
    short: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    long: {
      type: String,
      maxlength: [5000, 'Long description cannot exceed 5000 characters']
    }
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category reference is required'],
    index: true
  },
  
  // Product Identification
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  barcode: {
    type: String,
    trim: true,
    index: true
  },
  brand: {
    type: String,
    trim: true,
    index: true
  },
  
  // Pricing
  pricing: {
    cost: { type: Number, min: 0 }, // Cost to business
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: { type: Number, min: 0 }, // Original price for sale items
    currency: { type: String, default: 'USD' },
    taxable: { type: Boolean, default: true },
    taxRate: { type: Number, default: 0 }
  },
  
  // Inventory
  inventory: {
    trackQuantity: { type: Boolean, default: true },
    quantity: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    allowBackorder: { type: Boolean, default: false },
    backorderLimit: { type: Number, default: 0 },
    reservedQuantity: { type: Number, default: 0 }, // Reserved for pending orders
    availableQuantity: { type: Number, default: 0 } // Calculated field
  },
  
  // Physical Properties
  physical: {
    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['g', 'kg', 'oz', 'lb'], default: 'kg' }
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ['cm', 'in', 'm'], default: 'cm' }
    },
    requiresShipping: { type: Boolean, default: true }
  },
  
  // Variants (for products with multiple options)
  variants: [{
    name: { type: String, required: true }, // e.g., "Size", "Color"
    values: [{ type: String, required: true }], // e.g., ["Small", "Medium", "Large"]
    required: { type: Boolean, default: false }
  }],
  
  // Product Options (specific combinations)
  options: [{
    variantCombination: [{
      name: { type: String, required: true },
      value: { type: String, required: true }
    }],
    sku: { type: String, required: true },
    price: { type: Number },
    quantity: { type: Number, default: 0 },
    image: { type: String }
  }],
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  }],
  videos: [{
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String }
  }],
  
  // SEO
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    }
  },
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden', 'catalog-only'],
    default: 'visible',
    index: true
  },
  featured: { type: Boolean, default: false, index: true },
  
  // Shipping
  shipping: {
    weight: { type: Number, min: 0 },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    shippingClass: { type: String },
    freeShipping: { type: Boolean, default: false },
    separateShipping: { type: Boolean, default: false }
  },
  
  // Reviews and Ratings
  reviews: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastPurchase: { type: Date },
    popularityScore: { type: Number, default: 0 }
  },
  
  // Related Products
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Tags
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Custom Fields
  customFields: [{
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'date', 'url', 'email'],
      default: 'text'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
productSchema.index({ website: 1, status: 1 });
productSchema.index({ website: 1, category: 1 });
productSchema.index({ website: 1, featured: 1 });
productSchema.index({ 'pricing.price': 1 });
productSchema.index({ 'reviews.averageRating': -1 });
productSchema.index({ 'analytics.popularityScore': -1 });
productSchema.index({ tags: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ createdAt: -1 });

// Compound index for search
productSchema.index({
  name: 'text',
  'description.short': 'text',
  'description.long': 'text',
  brand: 'text',
  tags: 'text'
});

// Virtual for sale price
productSchema.virtual('salePrice').get(function() {
  return this.pricing.compareAtPrice && this.pricing.compareAtPrice > this.pricing.price 
    ? this.pricing.price 
    : null;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.compareAtPrice && this.pricing.compareAtPrice > this.pricing.price) {
    return Math.round(((this.pricing.compareAtPrice - this.pricing.price) / this.pricing.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.availableQuantity > 0 || this.inventory.allowBackorder;
});

// Virtual for low stock status
productSchema.virtual('lowStock').get(function() {
  if (!this.inventory.trackQuantity) return false;
  return this.inventory.availableQuantity <= this.inventory.lowStockThreshold;
});

// Methods
productSchema.methods.updateInventory = function(quantityChange, reason = 'manual') {
  if (this.inventory.trackQuantity) {
    this.inventory.quantity += quantityChange;
    this.inventory.availableQuantity = Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
  }
  return this.save();
};

productSchema.methods.reserveInventory = function(quantity) {
  if (!this.inventory.trackQuantity) return true;
  
  if (this.inventory.availableQuantity >= quantity) {
    this.inventory.reservedQuantity += quantity;
    this.inventory.availableQuantity -= quantity;
    return this.save();
  }
  
  return false;
};

productSchema.methods.releaseInventory = function(quantity) {
  if (this.inventory.trackQuantity) {
    this.inventory.reservedQuantity = Math.max(0, this.inventory.reservedQuantity - quantity);
    this.inventory.availableQuantity = Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
    return this.save();
  }
  return Promise.resolve(this);
};

productSchema.methods.addReview = function(rating, review = null) {
  // Update rating distribution
  this.reviews.ratingDistribution[rating] += 1;
  this.reviews.totalReviews += 1;
  
  // Recalculate average rating
  let totalRating = 0;
  for (let i = 1; i <= 5; i++) {
    totalRating += i * this.reviews.ratingDistribution[i];
  }
  this.reviews.averageRating = totalRating / this.reviews.totalReviews;
  
  return this.save();
};

productSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

productSchema.methods.recordPurchase = function(quantity = 1, revenue = null) {
  this.analytics.purchases += quantity;
  this.analytics.revenue += revenue || (this.pricing.price * quantity);
  this.analytics.lastPurchase = new Date();
  this.analytics.conversionRate = this.analytics.views > 0 ? (this.analytics.purchases / this.analytics.views) * 100 : 0;
  
  return this.save();
};

// Static methods
productSchema.statics.findByWebsite = function(websiteId, status = 'active') {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query);
};

productSchema.statics.findByCategory = function(categoryId, status = 'active') {
  const query = { category: categoryId };
  if (status) query.status = status;
  return this.find(query);
};

productSchema.statics.searchProducts = function(websiteId, searchTerm, filters = {}) {
  const query = { 
    website: websiteId,
    status: 'active',
    visibility: { $in: ['visible', 'catalog-only'] }
  };
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (filters.category) query.category = filters.category;
  if (filters.brand) query.brand = filters.brand;
  if (filters.minPrice || filters.maxPrice) {
    query['pricing.price'] = {};
    if (filters.minPrice) query['pricing.price'].$gte = filters.minPrice;
    if (filters.maxPrice) query['pricing.price'].$lte = filters.maxPrice;
  }
  if (filters.inStock) {
    query.$or = [
      { 'inventory.trackQuantity': false },
      { 'inventory.availableQuantity': { $gt: 0 } },
      { 'inventory.allowBackorder': true }
    ];
  }
  if (filters.featured) query.featured = true;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query);
};

productSchema.statics.getFeaturedProducts = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    featured: true,
    visibility: 'visible'
  }).limit(limit);
};

productSchema.statics.getBestSellers = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    visibility: 'visible'
  }).sort({ 'analytics.purchases': -1 }).limit(limit);
};

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(img => {
      if (img.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let firstPrimary = true;
      this.images.forEach(img => {
        if (img.isPrimary && !firstPrimary) {
          img.isPrimary = false;
        } else if (img.isPrimary && firstPrimary) {
          firstPrimary = false;
        }
      });
    }
  }
  
  // Calculate available quantity
  if (this.inventory.trackQuantity) {
    this.inventory.availableQuantity = Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
  }
  
  // Update popularity score (simple algorithm)
  this.analytics.popularityScore = (this.analytics.views * 0.1) + 
                                   (this.analytics.purchases * 10) + 
                                   (this.reviews.averageRating * 20);
  
  next();
});

module.exports = mongoose.model('Product', productSchema);

