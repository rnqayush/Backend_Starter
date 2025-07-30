const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify product category']
  },
  subcategory: String,
  brand: String,
  sku: {
    type: String,
    required: [true, 'Please add a SKU'],
    unique: true,
    uppercase: true
  },
  images: {
    main: {
      type: String,
      required: [true, 'Please add a main product image']
    },
    gallery: [String],
    thumbnail: String
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Please add base price'],
      min: 0
    },
    salePrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    costPrice: {
      type: Number,
      min: 0
    },
    compareAtPrice: Number,
    priceHistory: [{
      price: Number,
      date: {
        type: Date,
        default: Date.now
      },
      reason: String
    }]
  },
  inventory: {
    trackQuantity: {
      type: Boolean,
      default: true
    },
    quantity: {
      type: Number,
      required: function() {
        return this.inventory.trackQuantity;
      },
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    backorderLimit: Number,
    reservedQuantity: {
      type: Number,
      default: 0
    }
  },
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [{
      value: String, // e.g., "Large", "Red"
      price: Number,
      sku: String,
      quantity: Number,
      image: String
    }]
  }],
  specifications: [{
    name: String,
    value: String,
    unit: String
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'in', 'kg', 'lb'],
      default: 'cm'
    }
  },
  shipping: {
    isShippable: {
      type: Boolean,
      default: true
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: String,
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'hidden'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    images: [String],
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  relatedProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  upsellProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ProductSchema.index({ business: 1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ 'pricing.basePrice': 1 });
ProductSchema.index({ 'analytics.averageRating': -1 });
ProductSchema.index({ 'analytics.purchases': -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for current price
ProductSchema.virtual('currentPrice').get(function() {
  return this.pricing.salePrice || this.pricing.basePrice;
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.salePrice && this.pricing.basePrice > this.pricing.salePrice) {
    return Math.round(((this.pricing.basePrice - this.pricing.salePrice) / this.pricing.basePrice) * 100);
  }
  return 0;
});

// Virtual for availability status
ProductSchema.virtual('availabilityStatus').get(function() {
  if (!this.inventory.trackQuantity) return 'in_stock';
  
  if (this.inventory.quantity <= 0) {
    return this.inventory.allowBackorder ? 'backorder' : 'out_of_stock';
  } else if (this.inventory.quantity <= this.inventory.lowStockThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
});

// Virtual for available quantity
ProductSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.inventory.quantity - this.inventory.reservedQuantity);
});

// Virtual for is on sale
ProductSchema.virtual('isOnSale').get(function() {
  return this.pricing.salePrice && this.pricing.salePrice < this.pricing.basePrice;
});

// Pre-save middleware to generate slug
ProductSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function(quantity = 1) {
  if (!this.inventory.trackQuantity) return true;
  
  const available = this.availableQuantity;
  if (available >= quantity) return true;
  
  return this.inventory.allowBackorder;
};

// Method to reserve quantity
ProductSchema.methods.reserveQuantity = function(quantity) {
  if (this.inventory.trackQuantity) {
    this.inventory.reservedQuantity += quantity;
  }
  return this.save();
};

// Method to release reserved quantity
ProductSchema.methods.releaseReservedQuantity = function(quantity) {
  if (this.inventory.trackQuantity) {
    this.inventory.reservedQuantity = Math.max(0, this.inventory.reservedQuantity - quantity);
  }
  return this.save();
};

// Method to update quantity after purchase
ProductSchema.methods.updateQuantityAfterPurchase = function(quantity) {
  if (this.inventory.trackQuantity) {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
    this.inventory.reservedQuantity = Math.max(0, this.inventory.reservedQuantity - quantity);
    this.analytics.purchases += quantity;
  }
  return this.save();
};

// Method to add review
ProductSchema.methods.addReview = function(userId, rating, title, comment, images = []) {
  this.reviews.push({
    user: userId,
    rating,
    title,
    comment,
    images
  });
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.analytics.averageRating = totalRating / this.reviews.length;
  this.analytics.totalReviews = this.reviews.length;
  
  return this.save();
};

// Method to increment view count
ProductSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Static method to get products by category
ProductSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    category, 
    status: 'active', 
    isActive: true 
  })
  .limit(limit)
  .sort({ createdAt: -1 });
};

// Static method to get featured products
ProductSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    featured: true, 
    status: 'active', 
    isActive: true 
  })
  .limit(limit)
  .sort({ 'analytics.purchases': -1 });
};

// Static method to search products
ProductSchema.statics.searchProducts = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'active',
    isActive: true,
    ...filters
  };
  
  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Product', ProductSchema);

