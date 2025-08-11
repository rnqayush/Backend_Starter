const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Product description cannot exceed 2000 characters'],
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },

  // Seller Information
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
    index: true,
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
  },

  // Category & Classification
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'electronics', 'clothing', 'home_garden', 'sports', 'books', 'toys',
      'health_beauty', 'automotive', 'jewelry', 'food_beverages', 'other'
    ],
    index: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
    index: true,
  },
  model: {
    type: String,
    trim: true,
  },
  tags: [String],

  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative'],
    },
    priceHistory: [{
      price: Number,
      date: { type: Date, default: Date.now },
      reason: String,
    }],
  },

  // Inventory
  inventory: {
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    barcode: String,
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative'],
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
    allowBackorders: {
      type: Boolean,
      default: false,
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
      default: 'in_stock',
      index: true,
    },
  },

  // Physical Properties
  physical: {
    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['kg', 'g', 'lb', 'oz'], default: 'kg' },
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ['cm', 'in', 'm'], default: 'cm' },
    },
    color: String,
    size: String,
    material: String,
  },

  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String,
    duration: Number, // in seconds
  }],

  // Variants (for products with multiple options)
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [String], // e.g., ["Small", "Medium", "Large"]
    sku: String,
    price: Number,
    stockQuantity: Number,
    images: [String],
  }],

  // SEO & Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String,
  },
  marketing: {
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    promotionalText: String,
  },

  // Shipping
  shipping: {
    weight: Number,
    requiresShipping: { type: Boolean, default: true },
    freeShipping: { type: Boolean, default: false },
    shippingClass: String,
    handlingTime: { type: Number, default: 1 }, // days
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
  },

  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true,
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public',
  },
  publishedAt: Date,

  // Reviews & Ratings
  reviews: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 },
    },
  },

  // Sales Statistics
  stats: {
    totalSales: { type: Number, default: 0, min: 0 },
    totalRevenue: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },
    wishlistCount: { type: Number, default: 0, min: 0 },
    lastSold: Date,
  },

  // Additional Information
  specifications: [{
    name: String,
    value: String,
    group: String, // e.g., "Technical", "General"
  }],
  warranty: {
    duration: Number, // in months
    type: { type: String, enum: ['manufacturer', 'seller', 'none'], default: 'none' },
    description: String,
  },
  returnPolicy: {
    returnable: { type: Boolean, default: true },
    returnWindow: { type: Number, default: 30 }, // days
    returnConditions: String,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
productSchema.index({ sellerId: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ 'pricing.basePrice': 1 });
productSchema.index({ 'reviews.averageRating': -1 });
productSchema.index({ 'stats.totalSales': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Compound indexes
productSchema.index({ category: 1, 'pricing.basePrice': 1, status: 1 });
productSchema.index({ sellerId: 1, createdAt: -1 });

// Virtual for current price (considering sale price)
productSchema.virtual('currentPrice').get(function() {
  return this.pricing.salePrice || this.pricing.basePrice;
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (this.pricing.salePrice && this.pricing.salePrice < this.pricing.basePrice) {
    return this.pricing.basePrice - this.pricing.salePrice;
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.pricing.costPrice && this.pricing.costPrice > 0) {
    const sellingPrice = this.currentPrice;
    return ((sellingPrice - this.pricing.costPrice) / sellingPrice) * 100;
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('isInStock').get(function() {
  if (!this.inventory.trackInventory) return true;
  return this.inventory.stockQuantity > 0 || this.inventory.allowBackorders;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate slug if not exists
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  
  // Generate SKU if not exists
  if (!this.inventory.sku) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.inventory.sku = `PRD${timestamp}${random}`.toUpperCase();
  }
  
  // Update stock status based on quantity
  if (this.inventory.trackInventory) {
    if (this.inventory.stockQuantity === 0) {
      this.inventory.stockStatus = 'out_of_stock';
    } else if (this.inventory.stockQuantity <= this.inventory.lowStockThreshold) {
      this.inventory.stockStatus = 'low_stock';
    } else {
      this.inventory.stockStatus = 'in_stock';
    }
  }
  
  // Calculate discount percentage if sale price is set
  if (this.pricing.salePrice && this.pricing.salePrice < this.pricing.basePrice) {
    this.pricing.discountPercentage = Math.round(
      ((this.pricing.basePrice - this.pricing.salePrice) / this.pricing.basePrice) * 100
    );
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach((img, index) => {
      if (img.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          img.isPrimary = false;
        }
      }
    });
    
    // If no primary image, make the first one primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  // Set published date if status changes to active
  if (this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Instance methods
productSchema.methods.updateStock = function(quantity, operation = 'set') {
  if (operation === 'add') {
    this.inventory.stockQuantity += quantity;
  } else if (operation === 'subtract') {
    this.inventory.stockQuantity = Math.max(0, this.inventory.stockQuantity - quantity);
  } else {
    this.inventory.stockQuantity = Math.max(0, quantity);
  }
  
  return this.save();
};

productSchema.methods.addReview = function(rating, reviewCount = 1) {
  const currentTotal = this.reviews.totalReviews;
  const currentAverage = this.reviews.averageRating;
  
  // Update total reviews
  this.reviews.totalReviews = currentTotal + reviewCount;
  
  // Update average rating
  const totalRatingPoints = (currentAverage * currentTotal) + (rating * reviewCount);
  this.reviews.averageRating = totalRatingPoints / this.reviews.totalReviews;
  
  // Update rating distribution
  this.reviews.ratingDistribution[rating] += reviewCount;
  
  return this.save();
};

productSchema.methods.recordSale = function(quantity, revenue) {
  this.stats.totalSales += quantity;
  this.stats.totalRevenue += revenue;
  this.stats.lastSold = new Date();
  
  // Update stock if tracking inventory
  if (this.inventory.trackInventory) {
    this.inventory.stockQuantity = Math.max(0, this.inventory.stockQuantity - quantity);
  }
  
  return this.save();
};

productSchema.methods.incrementView = function() {
  this.stats.viewCount += 1;
  return this.save();
};

productSchema.methods.toggleWishlist = function(add = true) {
  if (add) {
    this.stats.wishlistCount += 1;
  } else {
    this.stats.wishlistCount = Math.max(0, this.stats.wishlistCount - 1);
  }
  return this.save();
};

// Static methods
productSchema.statics.findBySeller = function(sellerId, options = {}) {
  const query = { sellerId, status: { $ne: 'archived' } };
  return this.find(query, null, options);
};

productSchema.statics.findByCategory = function(category, options = {}) {
  const query = { category, status: 'active' };
  return this.find(query, null, options);
};

productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    status: 'active',
    ...filters,
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

productSchema.statics.getFeaturedProducts = function(limit = 10) {
  return this.find({
    status: 'active',
    'marketing.featured': true,
  })
    .sort({ 'stats.totalSales': -1, createdAt: -1 })
    .limit(limit);
};

productSchema.statics.getBestSellers = function(limit = 10) {
  return this.find({
    status: 'active',
    'stats.totalSales': { $gt: 0 },
  })
    .sort({ 'stats.totalSales': -1 })
    .limit(limit);
};

productSchema.statics.getNewArrivals = function(limit = 10) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    status: 'active',
    createdAt: { $gte: thirtyDaysAgo },
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

productSchema.statics.getProductsOnSale = function(limit = 10) {
  return this.find({
    status: 'active',
    'pricing.salePrice': { $exists: true, $gt: 0 },
    'pricing.discountPercentage': { $gt: 0 },
  })
    .sort({ 'pricing.discountPercentage': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);
