const mongoose = require('mongoose');

/**
 * Order Model
 * Represents customer orders in an e-commerce website
 */
const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    index: true
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Customer Information (for guest orders)
  customerInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    isGuest: { type: Boolean, default: false }
  },
  
  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productSnapshot: {
      name: { type: String, required: true },
      sku: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      description: { type: String }
    },
    variant: {
      name: { type: String },
      value: { type: String },
      sku: { type: String }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    }
  }],
  
  // Pricing
  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    tax: {
      amount: { type: Number, default: 0, min: 0 },
      rate: { type: Number, default: 0, min: 0 },
      breakdown: [{
        name: { type: String, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true }
      }]
    },
    shipping: {
      amount: { type: Number, default: 0, min: 0 },
      method: { type: String },
      carrier: { type: String },
      trackingNumber: { type: String }
    },
    discounts: [{
      code: { type: String },
      name: { type: String, required: true },
      type: { type: String, enum: ['percentage', 'fixed'], required: true },
      value: { type: Number, required: true },
      amount: { type: Number, required: true }
    }],
    fees: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      description: { type: String }
    }],
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Addresses
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },
  
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String },
    address1: { type: String, required: true },
    address2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['credit-card', 'debit-card', 'paypal', 'stripe', 'bank-transfer', 'cash-on-delivery', 'other'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded', 'partially-refunded'],
      default: 'pending',
      index: true
    },
    transactionId: { type: String },
    paymentDate: { type: Date },
    gateway: { type: String },
    gatewayTransactionId: { type: String },
    refunds: [{
      amount: { type: Number, required: true },
      reason: { type: String, required: true },
      refundDate: { type: Date, default: Date.now },
      transactionId: { type: String }
    }]
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  
  // Fulfillment
  fulfillment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'partially-shipped', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    shippingMethod: { type: String },
    carrier: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    shippedDate: { type: Date },
    deliveredDate: { type: Date },
    estimatedDelivery: { type: Date },
    notes: { type: String }
  },
  
  // Order Timeline
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    updatedBy: { type: String }
  }],
  
  // Customer Communication
  notifications: [{
    type: {
      type: String,
      enum: ['order-confirmation', 'payment-received', 'processing', 'shipped', 'delivered', 'cancelled'],
      required: true
    },
    sentAt: { type: Date, default: Date.now },
    method: { type: String, enum: ['email', 'sms', 'push'], required: true },
    status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' }
  }],
  
  // Notes and Comments
  customerNotes: { type: String, maxlength: 1000 },
  internalNotes: [{
    note: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    isPrivate: { type: Boolean, default: true }
  }],
  
  // Returns and Exchanges
  returns: [{
    items: [{
      orderItem: { type: mongoose.Schema.Types.ObjectId, required: true },
      quantity: { type: Number, required: true },
      reason: { type: String, required: true },
      condition: { type: String, enum: ['new', 'used', 'damaged'], required: true }
    }],
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'received', 'processed', 'refunded'],
      default: 'requested'
    },
    requestDate: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    refundAmount: { type: Number },
    processedDate: { type: Date }
  }],
  
  // Source and Attribution
  source: {
    type: String,
    enum: ['website', 'mobile-app', 'phone', 'email', 'social-media', 'marketplace', 'other'],
    default: 'website'
  },
  referrer: { type: String },
  utmSource: { type: String },
  utmMedium: { type: String },
  utmCampaign: { type: String },
  
  // Risk Assessment
  riskAssessment: {
    score: { type: Number, min: 0, max: 100, default: 0 },
    level: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    flags: [{ type: String }],
    reviewRequired: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ website: 1, status: 1 });
orderSchema.index({ website: 1, customer: 1 });
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'fulfillment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Virtual for customer full name
orderSchema.virtual('customerFullName').get(function() {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

// Virtual for total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total refunded amount
orderSchema.virtual('totalRefunded').get(function() {
  return this.payment.refunds.reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for net amount (total - refunds)
orderSchema.virtual('netAmount').get(function() {
  return this.pricing.total - this.totalRefunded;
});

// Methods
orderSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.pricing.subtotal = this.items.reduce((total, item) => {
    item.totalPrice = item.unitPrice * item.quantity;
    return total + item.totalPrice;
  }, 0);
  
  // Apply discounts
  let discountAmount = 0;
  this.pricing.discounts.forEach(discount => {
    if (discount.type === 'percentage') {
      discount.amount = (this.pricing.subtotal * discount.value) / 100;
    } else {
      discount.amount = discount.value;
    }
    discountAmount += discount.amount;
  });
  
  // Calculate tax
  const taxableAmount = this.pricing.subtotal - discountAmount;
  this.pricing.tax.amount = (taxableAmount * this.pricing.tax.rate) / 100;
  
  // Calculate fees
  const feesAmount = this.pricing.fees.reduce((total, fee) => total + fee.amount, 0);
  
  // Calculate total
  this.pricing.total = this.pricing.subtotal - discountAmount + this.pricing.tax.amount + this.pricing.shipping.amount + feesAmount;
  
  return this.pricing.total;
};

orderSchema.methods.addTimelineEntry = function(status, note = '', updatedBy = 'system') {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  
  return this;
};

orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = 'system') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.addTimelineEntry(newStatus, note, updatedBy);
  
  // Update fulfillment status based on order status
  if (newStatus === 'processing') {
    this.fulfillment.status = 'processing';
  } else if (newStatus === 'shipped') {
    this.fulfillment.status = 'shipped';
    this.fulfillment.shippedDate = new Date();
  } else if (newStatus === 'delivered') {
    this.fulfillment.status = 'delivered';
    this.fulfillment.deliveredDate = new Date();
  } else if (newStatus === 'cancelled') {
    this.fulfillment.status = 'cancelled';
  }
  
  return this.save();
};

orderSchema.methods.addRefund = function(amount, reason, transactionId = null) {
  this.payment.refunds.push({
    amount,
    reason,
    transactionId,
    refundDate: new Date()
  });
  
  // Update payment status
  const totalRefunded = this.totalRefunded + amount;
  if (totalRefunded >= this.pricing.total) {
    this.payment.status = 'refunded';
    this.status = 'refunded';
  } else {
    this.payment.status = 'partially-refunded';
  }
  
  this.addTimelineEntry('refund-processed', `Refund of ${amount} processed: ${reason}`);
  
  return this.save();
};

orderSchema.methods.canCancel = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

orderSchema.methods.canRefund = function() {
  return ['confirmed', 'processing', 'shipped', 'delivered'].includes(this.status) && 
         this.payment.status === 'captured';
};

orderSchema.methods.reserveInventory = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const reserved = await product.reserveInventory(item.quantity);
      if (!reserved) {
        throw new Error(`Insufficient inventory for product: ${product.name}`);
      }
    }
  }
  
  return true;
};

orderSchema.methods.releaseInventory = async function() {
  const Product = mongoose.model('Product');
  
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      await product.releaseInventory(item.quantity);
    }
  }
  
  return true;
};

orderSchema.methods.sendNotification = function(type, method = 'email') {
  this.notifications.push({
    type,
    method,
    sentAt: new Date(),
    status: 'sent'
  });
  
  return this.save();
};

// Static methods
orderSchema.statics.findByWebsite = function(websiteId, status = null) {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

orderSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByEmail = function(email) {
  return this.find({ 'customerInfo.email': email }).sort({ createdAt: -1 });
};

orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

orderSchema.statics.getOrderStats = function(websiteId, startDate, endDate) {
  const matchStage = { website: mongoose.Types.ObjectId(websiteId) };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    }
  ]);
};

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Generate order number if not exists
  if (!this.orderNumber) {
    this.orderNumber = this.constructor.generateOrderNumber();
  }
  
  // Calculate totals
  this.calculateTotals();
  
  // Add initial timeline entry
  if (this.isNew) {
    this.addTimelineEntry('created', 'Order created');
  }
  
  next();
});

// Post-save middleware
orderSchema.post('save', async function(doc) {
  // Update product analytics
  if (doc.status === 'delivered') {
    const Product = mongoose.model('Product');
    
    for (const item of doc.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await product.recordPurchase(item.quantity, item.totalPrice);
      }
    }
  }
});

module.exports = mongoose.model('Order', orderSchema);

