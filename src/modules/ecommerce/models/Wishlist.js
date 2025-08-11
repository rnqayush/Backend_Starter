const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: 500
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  name: {
    type: String,
    default: 'My Wishlist',
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [String],
  totalValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one wishlist per user per vendor
wishlistSchema.index({ user: 1, vendor: 1 }, { unique: true });

// Index for efficient queries
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ vendor: 1 });
wishlistSchema.index({ shareToken: 1 });
wishlistSchema.index({ isPublic: 1 });

// Virtual for item count
wishlistSchema.virtual('itemCount').get(function() {
  return this.items ? this.items.length : 0;
});

// Pre-save middleware to calculate total value
wishlistSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    try {
      const Product = mongoose.model('Product');
      let totalValue = 0;

      for (const item of this.items) {
        const product = await Product.findById(item.product);
        if (product) {
          totalValue += product.currentPrice || product.price.regular;
        }
      }

      this.totalValue = totalValue;
    } catch (error) {
      console.error('Error calculating wishlist total value:', error);
    }
  }
  next();
});

// Method to add item to wishlist
wishlistSchema.methods.addItem = function(productId, notes = '', priority = 'medium') {
  // Check if item already exists
  const existingItem = this.items.find(item => 
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    // Update existing item
    existingItem.notes = notes;
    existingItem.priority = priority;
    existingItem.addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      product: productId,
      notes,
      priority,
      addedAt: new Date()
    });
  }

  return this.save();
};

// Method to remove item from wishlist
wishlistSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(item => 
    item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Method to clear all items
wishlistSchema.methods.clearItems = function() {
  this.items = [];
  this.totalValue = 0;
  return this.save();
};

// Method to generate share token
wishlistSchema.methods.generateShareToken = function() {
  if (!this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  return this.shareToken;
};

// Static method to find or create wishlist
wishlistSchema.statics.findOrCreate = async function(userId, vendorId) {
  let wishlist = await this.findOne({ user: userId, vendor: vendorId });
  
  if (!wishlist) {
    wishlist = new this({
      user: userId,
      vendor: vendorId,
      items: []
    });
    await wishlist.save();
  }
  
  return wishlist;
};

// Static method to get user's wishlists across all vendors
wishlistSchema.statics.getUserWishlists = function(userId) {
  return this.find({ user: userId })
    .populate('vendor', 'name slug businessInfo.logo')
    .populate('items.product', 'name slug price images status')
    .sort({ updatedAt: -1 });
};

// Static method to get public wishlists
wishlistSchema.statics.getPublicWishlists = function(limit = 10) {
  return this.find({ isPublic: true })
    .populate('user', 'name')
    .populate('vendor', 'name slug businessInfo.logo')
    .populate('items.product', 'name slug price images')
    .sort({ updatedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
