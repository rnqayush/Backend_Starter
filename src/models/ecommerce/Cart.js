import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Cart Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sku: String,
    image: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    variation: {
      name: String,
      attributes: [{
        name: String,
        value: String
      }]
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    // Track if item is available
    isAvailable: {
      type: Boolean,
      default: true
    },
    availabilityMessage: String
  }],

  // Cart Totals
  totals: {
    subtotal: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Applied Coupons
  coupons: [{
    code: {
      type: String,
      required: true
    },
    discount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free-shipping'],
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Shipping Information
  shipping: {
    method: String,
    carrier: String,
    cost: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedDelivery: Date
  },

  // Cart Status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted', 'expired'],
    default: 'active'
  },

  // Session Information
  sessionId: String,
  
  // Metadata
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Timestamps
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ customer: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
cartSchema.index({ lastActivity: 1 });

// Virtual fields
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.virtual('uniqueSellers').get(function() {
  const sellers = new Set(this.items.map(item => item.seller.toString()));
  return Array.from(sellers);
});

cartSchema.virtual('isMultiVendor').get(function() {
  return this.uniqueSellers.length > 1;
});

cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

cartSchema.virtual('hasUnavailableItems').get(function() {
  return this.items.some(item => !item.isAvailable);
});

cartSchema.virtual('availableItems').get(function() {
  return this.items.filter(item => item.isAvailable);
});

cartSchema.virtual('unavailableItems').get(function() {
  return this.items.filter(item => !item.isAvailable);
});

// Pre-save middleware
cartSchema.pre('save', function(next) {
  // Calculate subtotal
  this.totals.subtotal = this.items.reduce((total, item) => {
    if (item.isAvailable) {
      item.subtotal = item.price * item.quantity;
      return total + item.subtotal;
    }
    return total;
  }, 0);

  // Calculate total discount from coupons
  this.totals.discount = this.coupons.reduce((total, coupon) => total + coupon.discount, 0);

  // Calculate final total
  this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping - this.totals.discount;
  this.totals.total = Math.max(0, this.totals.total); // Ensure total is not negative

  // Update last activity
  this.lastActivity = new Date();

  next();
});

// Static methods
cartSchema.statics.findByCustomer = function(customerId) {
  return this.findOne({ customer: customerId, status: 'active' })
    .populate('items.product', 'name price inventory status')
    .populate('items.seller', 'name businessInfo');
};

cartSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId, status: 'active' })
    .populate('items.product', 'name price inventory status')
    .populate('items.seller', 'name businessInfo');
};

cartSchema.statics.getAbandonedCarts = function(hoursAgo = 24) {
  const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return this.find({
    status: 'active',
    lastActivity: { $lt: cutoffDate },
    'items.0': { $exists: true } // Has at least one item
  }).populate('customer', 'name email');
};

cartSchema.statics.cleanupExpiredCarts = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: 'expired' }
    ]
  });
};

// Instance methods
cartSchema.methods.addItem = async function(productData) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productData.product.toString() &&
    JSON.stringify(item.variation) === JSON.stringify(productData.variation)
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += productData.quantity || 1;
    this.items[existingItemIndex].price = productData.price;
  } else {
    // Add new item
    this.items.push({
      ...productData,
      addedAt: new Date()
    });
  }

  return this.save();
};

cartSchema.methods.updateItem = function(itemId, updates) {
  const item = this.items.id(itemId);
  if (item) {
    Object.assign(item, updates);
  }
  return this.save();
};

cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  this.coupons = [];
  this.totals = {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0
  };
  return this.save();
};

cartSchema.methods.applyCoupon = function(couponData) {
  // Check if coupon already applied
  const existingCoupon = this.coupons.find(c => c.code === couponData.code);
  if (existingCoupon) {
    throw new Error('Coupon already applied');
  }

  this.coupons.push(couponData);
  return this.save();
};

cartSchema.methods.removeCoupon = function(couponCode) {
  this.coupons = this.coupons.filter(c => c.code !== couponCode);
  return this.save();
};

cartSchema.methods.validateItems = async function() {
  const Product = mongoose.model('Product');
  
  for (let item of this.items) {
    const product = await Product.findById(item.product);
    
    if (!product || product.status !== 'published') {
      item.isAvailable = false;
      item.availabilityMessage = 'Product no longer available';
    } else if (product.inventory.trackQuantity && product.inventory.quantity < item.quantity) {
      item.isAvailable = false;
      item.availabilityMessage = `Only ${product.inventory.quantity} items available`;
    } else if (item.price !== product.currentPrice) {
      // Price changed
      item.price = product.currentPrice;
      item.availabilityMessage = 'Price has been updated';
    } else {
      item.isAvailable = true;
      item.availabilityMessage = '';
    }
  }

  return this.save();
};

cartSchema.methods.calculateShipping = function(shippingMethod) {
  // This would integrate with shipping providers
  // For now, simple calculation based on method
  const shippingRates = {
    'standard': 50,
    'express': 150,
    'overnight': 300,
    'free': 0
  };

  this.shipping.method = shippingMethod;
  this.shipping.cost = shippingRates[shippingMethod] || 50;
  this.totals.shipping = this.shipping.cost;

  return this.save();
};

cartSchema.methods.calculateTax = function(taxRate = 0.18) {
  // Calculate tax on subtotal
  this.totals.tax = Math.round(this.totals.subtotal * taxRate);
  return this.save();
};

cartSchema.methods.convertToOrder = function() {
  this.status = 'converted';
  return this.save();
};

cartSchema.methods.markAsAbandoned = function() {
  this.status = 'abandoned';
  return this.save();
};

cartSchema.methods.getItemsBySeller = function() {
  const itemsBySeller = {};
  
  this.items.forEach(item => {
    const sellerId = item.seller.toString();
    if (!itemsBySeller[sellerId]) {
      itemsBySeller[sellerId] = [];
    }
    itemsBySeller[sellerId].push(item);
  });

  return itemsBySeller;
};

export default mongoose.model('Cart', cartSchema);

