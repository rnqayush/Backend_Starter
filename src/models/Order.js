const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Basic Information
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required'],
    index: true,
  },
  
  // Order Items
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: { type: String, required: true },
    productImage: String,
    sku: String,
    variant: {
      name: String,
      value: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    discount: {
      amount: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      couponCode: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    trackingNumber: String,
    shippingCarrier: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
  }],

  // Pricing Summary
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      amount: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 },
      couponCode: String,
      couponDiscount: { type: Number, default: 0 },
    },
    shipping: {
      cost: { type: Number, default: 0 },
      method: String,
      carrier: String,
      freeShipping: { type: Boolean, default: false },
    },
    tax: {
      amount: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      breakdown: [{
        name: String,
        rate: Number,
        amount: Number,
      }],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
  },

  // Customer Details
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
  },

  // Addresses
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
    instructions: String,
  },
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
    sameAsShipping: { type: Boolean, default: false },
  },

  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
      index: true,
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cash_on_delivery', 'wallet'],
      required: true,
    },
    transactionId: String,
    paymentIntentId: String, // For Stripe
    paidAmount: { type: Number, default: 0 },
    refundedAmount: { type: Number, default: 0 },
    paymentDate: Date,
    paymentDetails: {
      cardLast4: String,
      cardBrand: String,
      paypalEmail: String,
    },
    paymentHistory: [{
      amount: Number,
      type: { type: String, enum: ['payment', 'refund', 'chargeback'] },
      transactionId: String,
      status: String,
      date: { type: Date, default: Date.now },
      notes: String,
    }],
  },

  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true,
  },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    notes: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],

  // Fulfillment
  fulfillment: {
    method: {
      type: String,
      enum: ['standard_shipping', 'express_shipping', 'overnight', 'pickup', 'digital'],
      default: 'standard_shipping',
    },
    trackingNumber: String,
    carrier: String,
    shippedDate: Date,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryInstructions: String,
    requiresSignature: { type: Boolean, default: false },
  },

  // Multi-vendor Support
  sellers: [{
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    storeName: String,
    items: [{ type: mongoose.Schema.Types.ObjectId }], // References to items array
    subtotal: Number,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    trackingNumber: String,
    shippingCost: Number,
    commission: {
      rate: Number, // percentage
      amount: Number,
    },
  }],

  // Notes & Communication
  notes: {
    customer: String, // Customer notes/instructions
    internal: String, // Internal notes for staff
    public: String,   // Public notes visible to customer
  },
  communicationHistory: [{
    type: { type: String, enum: ['email', 'sms', 'call', 'chat'] },
    subject: String,
    message: String,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentTo: String, // email or phone
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] },
  }],

  // Discounts & Coupons
  coupons: [{
    code: String,
    type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'] },
    value: Number,
    discount: Number,
    appliedAt: { type: Date, default: Date.now },
  }],

  // Returns & Refunds
  returns: [{
    itemId: { type: mongoose.Schema.Types.ObjectId },
    reason: {
      type: String,
      enum: ['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged_shipping', 'other'],
    },
    description: String,
    quantity: Number,
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'received', 'processed', 'refunded'],
      default: 'requested',
    },
    requestDate: { type: Date, default: Date.now },
    approvalDate: Date,
    refundAmount: Number,
    restockFee: { type: Number, default: 0 },
    images: [String], // URLs to return images
    trackingNumber: String,
  }],

  // Source & Marketing
  source: {
    channel: { type: String, enum: ['website', 'mobile_app', 'marketplace', 'social', 'email', 'other'] },
    campaign: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
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
orderSchema.index({ customerId: 1, status: 1 });
orderSchema.index({ 'items.sellerId': 1, status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Compound indexes
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for unique sellers count
orderSchema.virtual('sellersCount').get(function() {
  const uniqueSellers = new Set(this.items.map(item => item.sellerId.toString()));
  return uniqueSellers.size;
});

// Virtual for order age in days
orderSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is returnable
orderSchema.virtual('isReturnable').get(function() {
  if (this.status !== 'delivered') return false;
  
  const deliveryDate = this.fulfillment.actualDelivery || this.createdAt;
  const daysSinceDelivery = Math.ceil((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
  
  return daysSinceDelivery <= 30; // 30-day return window
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate order number if not exists
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderNumber = `ORD${timestamp}${random}`.toUpperCase();
  }
  
  // Calculate item totals
  this.items.forEach(item => {
    item.totalPrice = item.unitPrice * item.quantity;
    if (item.discount.amount > 0) {
      item.totalPrice -= item.discount.amount;
    } else if (item.discount.percentage > 0) {
      item.totalPrice -= (item.totalPrice * item.discount.percentage / 100);
    }
  });
  
  // Calculate pricing totals
  this.pricing.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  
  // Apply order-level discount
  let discountAmount = 0;
  if (this.pricing.discount.amount > 0) {
    discountAmount = this.pricing.discount.amount;
  } else if (this.pricing.discount.percentage > 0) {
    discountAmount = this.pricing.subtotal * this.pricing.discount.percentage / 100;
  }
  
  // Add coupon discount
  if (this.pricing.discount.couponDiscount > 0) {
    discountAmount += this.pricing.discount.couponDiscount;
  }
  
  // Calculate total
  this.pricing.total = this.pricing.subtotal - discountAmount + this.pricing.shipping.cost + this.pricing.tax.amount;
  this.pricing.total = Math.max(0, this.pricing.total); // Ensure total is not negative
  
  // Update sellers array
  this.updateSellersInfo();
  
  next();
});

// Instance methods
orderSchema.methods.updateStatus = function(newStatus, notes, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    notes,
    updatedBy,
  });
  
  // Update item statuses if order status changes
  if (['shipped', 'delivered', 'cancelled'].includes(newStatus)) {
    this.items.forEach(item => {
      if (item.status === 'pending' || item.status === 'confirmed' || item.status === 'processing') {
        item.status = newStatus;
      }
    });
  }
  
  return this.save();
};

orderSchema.methods.addPayment = function(amount, transactionId, method, status = 'paid') {
  this.payment.paymentHistory.push({
    amount,
    type: 'payment',
    transactionId,
    status,
    date: new Date(),
  });
  
  if (status === 'paid') {
    this.payment.paidAmount += amount;
    
    // Update payment status
    if (this.payment.paidAmount >= this.pricing.total) {
      this.payment.status = 'paid';
      this.payment.paymentDate = new Date();
    } else {
      this.payment.status = 'processing';
    }
  }
  
  return this.save();
};

orderSchema.methods.processRefund = function(amount, reason, transactionId) {
  this.payment.paymentHistory.push({
    amount,
    type: 'refund',
    transactionId,
    status: 'processed',
    date: new Date(),
    notes: reason,
  });
  
  this.payment.refundedAmount += amount;
  
  // Update payment status
  if (this.payment.refundedAmount >= this.payment.paidAmount) {
    this.payment.status = 'refunded';
  } else {
    this.payment.status = 'partially_refunded';
  }
  
  return this.save();
};

orderSchema.methods.addTracking = function(trackingNumber, carrier, estimatedDelivery) {
  this.fulfillment.trackingNumber = trackingNumber;
  this.fulfillment.carrier = carrier;
  this.fulfillment.estimatedDelivery = estimatedDelivery;
  this.fulfillment.shippedDate = new Date();
  
  // Update status to shipped
  return this.updateStatus('shipped', `Package shipped with ${carrier}. Tracking: ${trackingNumber}`);
};

orderSchema.methods.markDelivered = function(deliveryDate) {
  this.fulfillment.actualDelivery = deliveryDate || new Date();
  return this.updateStatus('delivered', 'Order delivered successfully');
};

orderSchema.methods.requestReturn = function(itemId, reason, description, quantity) {
  this.returns.push({
    itemId,
    reason,
    description,
    quantity,
    status: 'requested',
    requestDate: new Date(),
  });
  
  return this.save();
};

orderSchema.methods.updateSellersInfo = function() {
  const sellersMap = new Map();
  
  // Group items by seller
  this.items.forEach((item, index) => {
    const sellerId = item.sellerId.toString();
    
    if (!sellersMap.has(sellerId)) {
      sellersMap.set(sellerId, {
        sellerId: item.sellerId,
        storeName: item.storeName || 'Unknown Store',
        items: [],
        subtotal: 0,
        status: 'pending',
      });
    }
    
    const seller = sellersMap.get(sellerId);
    seller.items.push(index);
    seller.subtotal += item.totalPrice;
  });
  
  this.sellers = Array.from(sellersMap.values());
};

orderSchema.methods.calculateCommission = function(sellerId, commissionRate) {
  const seller = this.sellers.find(s => s.sellerId.toString() === sellerId.toString());
  if (seller) {
    seller.commission = {
      rate: commissionRate,
      amount: seller.subtotal * (commissionRate / 100),
    };
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
orderSchema.statics.findByCustomer = function(customerId, options = {}) {
  return this.find({ customerId }, null, options)
    .populate('items.productId', 'name images')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findBySeller = function(sellerId, options = {}) {
  return this.find({ 'items.sellerId': sellerId }, null, options)
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 });
};

orderSchema.statics.getOrderStats = function(sellerId, startDate, endDate) {
  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate },
  };
  
  if (sellerId) {
    matchStage['items.sellerId'] = mongoose.Types.ObjectId(sellerId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        completedOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
      }
    }
  ]);
};

orderSchema.statics.getRecentOrders = function(sellerId, limit = 10) {
  const query = sellerId ? { 'items.sellerId': sellerId } : {};
  
  return this.find(query)
    .populate('customerId', 'name email')
    .populate('items.productId', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Order', orderSchema);
