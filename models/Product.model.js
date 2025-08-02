const mongoose = require('mongoose');
const slugify = require('slugify');
const { PRODUCT_STATUS } = require('../config/constants');

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor reference is required']
  },
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
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'electronics',
      'clothing',
      'home_garden',
      'sports',
      'books',
      'health_beauty',
      'automotive',
      'toys_games',
      'food_beverages',
      'jewelry',
      'art_crafts',
      'other'
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
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
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
    cost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    }
  },
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Low stock threshold cannot be negative']
    },
    trackQuantity: {
      type: Boolean,
      default: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],
  variants: [{
    name: {
      type: String,
      required: true // e.g., "Size", "Color"
    },
    options: [{
      value: String, // e.g., "Large", "Red"
      price: Number, // Additional price for this variant
      sku: String,
      inventory: {
        type: Number,
        default: 0
      }
    }]
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch', 'kg', 'lb'],
      default: 'cm'
    }
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingClass: String
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: Object.values(PRODUCT_STATUS),
    default: PRODUCT_STATUS.ACTIVE
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    wishlistCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current price (sale price if available, otherwise regular price)
productSchema.virtual('currentPrice').get(function() {
  return this.price.sale || this.price.regular;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.price.sale) return 0;
  return Math.round(((this.price.regular - this.price.sale) / this.price.regular) * 100);
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackQuantity) return 'in_stock';
  if (this.inventory.quantity === 0) return 'out_of_stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Virtual for reviews (will be populated from Review model)
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// Indexes
productSchema.index({ vendor: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ 'price.regular': 1 });
productSchema.index({ 'price.sale': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ featured: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Pre-save middleware to ensure only one primary image
productSchema.pre('save', function(next) {
  if (this.isModified('images')) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      this.images.forEach((img, index) => {
        if (index > 0) img.isPrimary = false;
      });
    } else if (primaryImages.length === 0 && this.images.length > 0) {
      // Set first image as primary if none is set
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Static method to find active products
productSchema.statics.findActive = function() {
  return this.find({ status: PRODUCT_STATUS.ACTIVE });
};

// Static method to find by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: PRODUCT_STATUS.ACTIVE 
  });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ 
    featured: true, 
    status: PRODUCT_STATUS.ACTIVE 
  });
};

// Static method to search products
productSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    status: PRODUCT_STATUS.ACTIVE
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to update rating
productSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Instance method to update stats
productSchema.methods.updateStats = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.stats[key] !== undefined) {
      this.stats[key] += updates[key];
    }
  });
  return this.save();
};

// Instance method to check if in stock
productSchema.methods.isInStock = function(quantity = 1) {
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.quantity >= quantity;
};

// Instance method to reduce inventory
productSchema.methods.reduceInventory = function(quantity) {
  if (this.inventory.trackQuantity) {
    this.inventory.quantity = Math.max(0, this.inventory.quantity - quantity);
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
