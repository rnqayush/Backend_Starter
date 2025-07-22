import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },

  // Order Items
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
      min: 1
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
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending'
    },
    tracking: {
      carrier: String,
      trackingNumber: String,
      trackingUrl: String,
      estimatedDelivery: Date,
      actualDelivery: Date
    }
  }],

  // Pricing
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      rate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    shipping: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      method: String,
      carrier: String
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      code: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'free-shipping']
      }
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },

  // Addresses
  addresses: {
    billing: {
      name: String,
      company: String,
      address1: {
        type: String,
        required: true
      },
      address2: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      postalCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true,
        default: 'India'
      },
      phone: String
    },
    shipping: {
      name: String,
      company: String,
      address1: {
        type: String,
        required: true
      },
      address2: String,
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      postalCode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true,
        default: 'India'
      },
      phone: String,
      instructions: String
    }
  },

  // Payment Information
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['credit-card', 'debit-card', 'paypal', 'stripe', 'razorpay', 'cod', 'bank-transfer', 'wallet']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially-refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    refunds: [{
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      reason: String,
      refundId: String,
      processedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      }
    }]
  },

  // Order Status and Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending'
  },
  
  // Order Timeline
  timeline: [{
    status: {
      type: String,
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Shipping Information
  shipping: {
    method: String,
    carrier: String,
    service: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },

  // Notes and Communication
  notes: {
    customer: String,
    internal: String,
    seller: String
  },

  // Fulfillment
  fulfillment: {
    status: {
      type: String,
      enum: ['unfulfilled', 'partial', 'fulfilled'],
      default: 'unfulfilled'
    },
    location: String,
    method: {
      type: String,
      enum: ['ship', 'pickup', 'digital'],
      default: 'ship'
    }
  },

  // Returns and Exchanges
  returns: [{
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      reason: String
    }],
    reason: {
      type: String,
      enum: ['defective', 'wrong-item', 'not-as-described', 'changed-mind', 'damaged', 'other']
    },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'processing', 'completed'],
      default: 'requested'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    refundAmount: Number,
    restockFee: {
      type: Number,
      default: 0
    }
  }],

  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin', 'api'],
    default: 'web'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  tags: [String],
  
  // Dates
  placedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  cancelledAt: Date,
  
  // Analytics
  analytics: {
    deviceType: String,
    browser: String,
    referrer: String,
    utm: {
      source: String,
      medium: String,
      campaign: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ placedAt: -1 });
orderSchema.index({ 'payment.transactionId': 1 });

// Virtual fields
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

orderSchema.virtual('uniqueSellers').get(function() {
  const sellers = new Set(this.items.map(item => item.seller.toString()));
  return Array.from(sellers);
});

orderSchema.virtual('isMultiVendor').get(function() {
  return this.uniqueSellers.length > 1;
});

orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

orderSchema.virtual('canReturn').get(function() {
  return ['delivered'].includes(this.status);
});

orderSchema.virtual('totalRefunded').get(function() {
  return this.payment.refunds.reduce((total, refund) => {
    return refund.status === 'completed' ? total + refund.amount : total;
  }, 0);
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Generate order number if not exists
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }

  // Calculate totals
  this.pricing.subtotal = this.items.reduce((total, item) => total + item.subtotal, 0);
  this.pricing.total = this.pricing.subtotal + this.pricing.tax.amount + this.pricing.shipping.amount - this.pricing.discount.amount;

  // Update fulfillment status
  const fulfilledItems = this.items.filter(item => ['delivered'].includes(item.status));
  const totalItems = this.items.length;
  
  if (fulfilledItems.length === 0) {
    this.fulfillment.status = 'unfulfilled';
  } else if (fulfilledItems.length === totalItems) {
    this.fulfillment.status = 'fulfilled';
  } else {
    this.fulfillment.status = 'partial';
  }

  next();
});

// Static methods
orderSchema.statics.generateOrderNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

orderSchema.statics.getOrdersByStatus = function(status, sellerId = null) {
  const query = { status };
  if (sellerId) {
    query['items.seller'] = sellerId;
  }
  return this.find(query).populate('customer', 'name email').sort({ createdAt: -1 });
};

orderSchema.statics.getOrdersByDateRange = function(startDate, endDate, sellerId = null) {
  const query = {
    placedAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  if (sellerId) {
    query['items.seller'] = sellerId;
  }
  return this.find(query).populate('customer', 'name email').sort({ placedAt: -1 });
};

orderSchema.statics.getSalesAnalytics = function(sellerId, dateRange = {}) {
  const matchStage = { 'items.seller': mongoose.Types.ObjectId(sellerId) };
  
  if (dateRange.start && dateRange.end) {
    matchStage.placedAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.seller': mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$items.subtotal' },
        totalItems: { $sum: '$items.quantity' },
        averageOrderValue: { $avg: '$items.subtotal' }
      }
    }
  ]);
};

// Instance methods
orderSchema.methods.updateStatus = function(newStatus, message = '', updatedBy = null) {
  this.status = newStatus;
  
  // Add to timeline
  this.timeline.push({
    status: newStatus,
    message: message || `Order status updated to ${newStatus}`,
    updatedBy
  });

  // Update specific date fields
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'shipped':
      this.shipping.shippedAt = now;
      break;
    case 'delivered':
      this.shipping.deliveredAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
  }

  return this.save();
};

orderSchema.methods.updatePaymentStatus = function(status, transactionId = null) {
  this.payment.status = status;
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  if (status === 'completed') {
    this.payment.paidAt = new Date();
  }
  return this.save();
};

orderSchema.methods.addRefund = function(amount, reason = '', refundId = '') {
  this.payment.refunds.push({
    amount,
    reason,
    refundId,
    status: 'pending'
  });
  return this.save();
};

orderSchema.methods.updateItemStatus = function(itemId, status, trackingInfo = {}) {
  const item = this.items.id(itemId);
  if (item) {
    item.status = status;
    if (trackingInfo.carrier) item.tracking.carrier = trackingInfo.carrier;
    if (trackingInfo.trackingNumber) item.tracking.trackingNumber = trackingInfo.trackingNumber;
    if (trackingInfo.trackingUrl) item.tracking.trackingUrl = trackingInfo.trackingUrl;
    if (trackingInfo.estimatedDelivery) item.tracking.estimatedDelivery = trackingInfo.estimatedDelivery;
  }
  return this.save();
};

orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

orderSchema.methods.canBeReturned = function() {
  return ['delivered'].includes(this.status);
};

export default mongoose.model('Order', orderSchema);

