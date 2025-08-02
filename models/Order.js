/**
 * Order Model - E-commerce orders (separate from bookings)
 */

import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS, BUSINESS_CATEGORIES, DEFAULTS } from '../config/constants.js';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  
  productSku: {
    type: String,
    required: [true, 'Product SKU is required']
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
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  
  // Product variant details
  variant: {
    size: String,
    color: String,
    material: String,
    weight: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch', 'm'],
        default: 'cm'
      }
    }
  },
  
  // Item-specific discounts
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      min: 0,
      default: 0
    },
    reason: String
  },
  
  // Tax details for this item
  tax: {
    rate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    type: {
      type: String,
      enum: ['GST', 'VAT', 'Sales Tax', 'None'],
      default: 'GST'
    }
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  
  addressLine2: {
    type: String,
    trim: true
  },
  
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true
  },
  
  country: {
    type: String,
    required: [true, 'Country is required'],
    default: DEFAULTS.COUNTRY
  },
  
  landmark: {
    type: String,
    trim: true
  },
  
  isDefault: {
    type: Boolean,
    default: false
  }
});

const orderSchema = new mongoose.Schema({
  // Order identification
  orderId: {
    type: String,
    unique: true,
    required: true,
    default: () => `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  },
  
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return `#${this.orderId}`;
    }
  },
  
  // Customer information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true
  },
  
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required']
  },
  
  // Vendor information
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required']
  },
  
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true
  },
  
  // Business category
  businessCategory: {
    type: String,
    required: [true, 'Business category is required'],
    enum: {
      values: Object.values(BUSINESS_CATEGORIES),
      message: 'Invalid business category'
    },
    default: BUSINESS_CATEGORIES.ECOMMERCE
  },
  
  // Order items
  items: {
    type: [orderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  
  // Pricing details
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  
  totalDiscount: {
    type: Number,
    default: 0,
    min: [0, 'Total discount cannot be negative']
  },
  
  totalTax: {
    type: Number,
    default: 0,
    min: [0, 'Total tax cannot be negative']
  },
  
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  currency: {
    type: String,
    default: DEFAULTS.CURRENCY,
    uppercase: true
  },
  
  // Shipping information
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  
  billingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Billing address is required']
  },
  
  shippingMethod: {
    name: {
      type: String,
      required: [true, 'Shipping method name is required']
    },
    cost: {
      type: Number,
      required: [true, 'Shipping cost is required'],
      min: 0
    },
    estimatedDelivery: {
      min: Number, // days
      max: Number  // days
    },
    trackingNumber: String,
    carrier: String
  },
  
  // Order status and tracking
  status: {
    type: String,
    enum: {
      values: Object.values(ORDER_STATUS),
      message: 'Invalid order status'
    },
    default: ORDER_STATUS.PENDING
  },
  
  statusHistory: [{
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  paymentMethod: {
    type: String,
    enum: {
      values: Object.values(PAYMENT_METHODS),
      message: 'Invalid payment method'
    },
    required: [true, 'Payment method is required']
  },
  
  paymentDetails: {
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    failureReason: String,
    refundAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    refundReason: String,
    refundedAt: Date
  },
  
  // Delivery tracking
  deliveryTracking: {
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    deliveryAttempts: [{
      attemptDate: Date,
      status: {
        type: String,
        enum: ['successful', 'failed', 'rescheduled']
      },
      note: String,
      deliveryPerson: String,
      contactNumber: String
    }],
    deliveryInstructions: String,
    deliveryProof: {
      type: String, // URL to delivery proof image
    },
    signature: String // Digital signature or delivery confirmation
  },
  
  // Order notes and communication
  customerNotes: {
    type: String,
    maxlength: [500, 'Customer notes cannot exceed 500 characters']
  },
  
  vendorNotes: {
    type: String,
    maxlength: [500, 'Vendor notes cannot exceed 500 characters']
  },
  
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  
  // Cancellation details
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundProcessed: {
      type: Boolean,
      default: false
    },
    cancellationFee: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Return/Exchange information
  returnExchange: {
    isReturnable: {
      type: Boolean,
      default: true
    },
    returnWindow: {
      type: Number, // days
      default: 30
    },
    returnRequests: [{
      requestId: String,
      reason: String,
      requestedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed']
      },
      items: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        reason: String
      }]
    }]
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String,
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ orderId: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ vendor: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ businessCategory: 1 });

// Compound indexes
orderSchema.index({ customer: 1, status: 1, createdAt: -1 });
orderSchema.index({ vendor: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for can cancel
orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'processing'].includes(this.status);
});

// Virtual for can return
orderSchema.virtual('canReturn').get(function() {
  if (!this.returnExchange.isReturnable) return false;
  if (this.status !== 'delivered') return false;
  
  const deliveryDate = this.deliveryTracking.actualDeliveryDate;
  if (!deliveryDate) return false;
  
  const now = new Date();
  const diffTime = Math.abs(now - deliveryDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= this.returnExchange.returnWindow;
});

// Pre-save middleware
orderSchema.pre('save', function(next) {
  // Calculate totals
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.totalTax = this.items.reduce((total, item) => total + (item.tax.amount || 0), 0);
  this.totalDiscount = this.items.reduce((total, item) => {
    if (item.discount.type === 'percentage') {
      return total + (item.totalPrice * item.discount.value / 100);
    }
    return total + item.discount.value;
  }, 0);
  
  this.totalAmount = this.subtotal - this.totalDiscount + this.totalTax + this.shippingCost;
  
  // Add status to history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  
  next();
});

// Static methods
orderSchema.statics.getOrderStats = async function(vendorId, dateRange = {}) {
  const matchStage = { vendor: new mongoose.Types.ObjectId(vendorId) };
  
  if (dateRange.start && dateRange.end) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        statusBreakdown: {
          $push: '$status'
        }
      }
    }
  ]);
  
  if (result.length === 0) {
    return {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      statusBreakdown: {}
    };
  }
  
  const data = result[0];
  const statusBreakdown = {};
  
  data.statusBreakdown.forEach(status => {
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
  });
  
  return {
    totalOrders: data.totalOrders,
    totalRevenue: Math.round(data.totalRevenue * 100) / 100,
    averageOrderValue: Math.round(data.averageOrderValue * 100) / 100,
    statusBreakdown
  };
};

// Instance methods
orderSchema.methods.updateStatus = async function(newStatus, note, updatedBy) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Status updated to ${newStatus}`,
    updatedBy
  });
  
  return await this.save();
};

orderSchema.methods.processRefund = async function(amount, reason) {
  this.paymentDetails.refundAmount = (this.paymentDetails.refundAmount || 0) + amount;
  this.paymentDetails.refundReason = reason;
  this.paymentDetails.refundedAt = new Date();
  
  if (this.paymentDetails.refundAmount >= this.totalAmount) {
    this.paymentStatus = 'refunded';
  } else {
    this.paymentStatus = 'partially_refunded';
  }
  
  return await this.save();
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
