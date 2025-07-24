import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeName: {
    type: String,
    required: true
  },

  // Product Details
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'electronics', 'clothing', 'home-garden', 'sports', 'books',
      'beauty', 'automotive', 'toys', 'jewelry', 'food', 'health',
      'industrial', 'handmade', 'digital', 'services', 'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },

  // Pricing
  price: {
    regular: {
      type: Number,
      required: [true, 'Regular price is required'],
      min: [0, 'Price cannot be negative']
    },
    sale: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
      validate: {
        validator: function(value) {
          return !value || value < this.price.regular;
        },
        message: 'Sale price must be less than regular price'
      }
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    }
  },

  // Inventory
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in', 'm'],
        default: 'cm'
      }
    }
  },

  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],

  // Product Attributes
  attributes: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    isVariation: {
      type: Boolean,
      default: false
    }
  }],

  // Variations (for products with different sizes, colors, etc.)
  variations: [{
    name: String, // e.g., "Size: Large, Color: Red"
    sku: String,
    price: {
      regular: Number,
      sale: Number
    },
    inventory: {
      quantity: Number,
      lowStockThreshold: Number
    },
    attributes: [{
      name: String,
      value: String
    }],
    images: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    canonicalUrl: String
  },

  // Shipping
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'free', 'pickup-only'],
      default: 'standard'
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
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'out-of-stock'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'password-protected'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },

  // Reviews and Ratings
  reviews: [{
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    addedToCart: {
      type: Number,
      default: 0
    },
    wishlistAdds: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },

  // Tags and Categories
  tags: [String],
  collections: [String],

  // Timestamps
  publishedAt: Date,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ 'price.regular': 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'analytics.views': -1 });

// Virtual fields
productSchema.virtual('currentPrice').get(function() {
  return this.price.sale && this.price.sale > 0 ? this.price.sale : this.price.regular;
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.price.sale && this.price.sale > 0) {
    return Math.round(((this.price.regular - this.price.sale) / this.price.regular) * 100);
  }
  return 0;
});

productSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

productSchema.virtual('totalReviews').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

productSchema.virtual('isInStock').get(function() {
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.quantity > 0 || this.inventory.allowBackorder;
});

productSchema.virtual('isLowStock').get(function() {
  if (!this.inventory.trackQuantity) return false;
  return this.inventory.quantity <= this.inventory.lowStockThreshold;
});

productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Update lastModified
  this.lastModified = new Date();

  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Ensure only one primary image
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }

  next();
});

// Static methods
productSchema.statics.searchProducts = function(filters = {}) {
  const query = this.find();

  // Text search
  if (filters.search) {
    query.or([
      { name: new RegExp(filters.search, 'i') },
      { description: new RegExp(filters.search, 'i') },
      { tags: new RegExp(filters.search, 'i') },
      { brand: new RegExp(filters.search, 'i') }
    ]);
  }

  // Category filter
  if (filters.category) {
    query.where('category', filters.category);
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {};
    if (filters.minPrice) priceFilter.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) priceFilter.$lte = parseFloat(filters.maxPrice);
    query.where('price.regular', priceFilter);
  }

  // Brand filter
  if (filters.brand) {
    query.where('brand', new RegExp(filters.brand, 'i'));
  }

  // In stock only
  if (filters.inStock === 'true') {
    query.where('inventory.quantity').gt(0);
  }

  // Featured products
  if (filters.featured === 'true') {
    query.where('featured', true);
  }

  // Status filter
  query.where('status', filters.status || 'published');

  return query;
};

// Instance methods
productSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

productSchema.methods.addToCart = function() {
  this.analytics.addedToCart += 1;
  return this.save();
};

productSchema.methods.purchase = function() {
  this.analytics.purchases += 1;
  this.analytics.conversionRate = (this.analytics.purchases / this.analytics.views * 100).toFixed(2);
  return this.save();
};

productSchema.methods.updateInventory = function(quantity, operation = 'subtract') {
  if (!this.inventory.trackQuantity) return this.save();
  
  if (operation === 'subtract') {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  } else {
    this.inventory.quantity += quantity;
  }
  
  return this.save();
};

productSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  return this.save();
};

export default mongoose.model('Product', productSchema);
