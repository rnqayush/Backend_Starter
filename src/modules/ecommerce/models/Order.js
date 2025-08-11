const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productSnapshot: {
    name: String,
    sku: String,
    image: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  selectedVariants: [{
    name: String,
    value: String,
    price: Number
  }],
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    amount: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    }
  },
  shipping: {
    cost: {
      type: Number,
      default: 0
    },
    method: String,
    estimatedDelivery: Date
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'fixed'
    }
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },

  // Addresses
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: String,
    address1: { type: String, required: true },
    address2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: String,
    address1: { type: String, required: true },
    address2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },

  // Status and tracking
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled'],
    default: 'unfulfilled'
  },

  // Payment information
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
      required: true
    },
    transactionId: String,
    paymentIntentId: String, // For Stripe
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },

  // Tracking and shipping
  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    shippedAt: Date,
    deliveredAt: Date
  },

  // Notes and communication
  notes: {
    customer: String,
    internal: String
  },
  
  // Timeline
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.seller': 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ fulfillmentStatus: 1 });

// Virtual for formatted order number
orderSchema.virtual('formattedOrderNumber').get(function() {
  return `#${this.orderNumber}`;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Pre-save middleware to add timeline entry
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
  }
  next();
});

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status
orderSchema.methods.updateStatus = function(status, note, updatedBy) {
  this.status = status;
  this.addTimelineEntry(status, note, updatedBy);
  return this.save();
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.total = this.subtotal + this.tax.amount + this.shipping.cost - this.discount.amount;
  return this;
};

// Static method to get orders by seller
orderSchema.statics.getOrdersBySeller = function(sellerId, options = {}) {
  const { status, limit = 20, skip = 0 } = options;
  
  const query = { 'items.seller': sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'name sku images')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get sales analytics
orderSchema.statics.getSalesAnalytics = async function(sellerId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = {
    'items.seller': new mongoose.Types.ObjectId(sellerId),
    status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.seller': new mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$items.totalPrice' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$items.totalPrice' },
        totalQuantitySold: { $sum: '$items.quantity' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);

