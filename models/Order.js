const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: String,
  sku: String,
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  variant: String,
  total: Number,
});

const orderSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      shipping: { type: Number, default: 0 },
      taxes: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    shippingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      street1: String,
      street2: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      phone: String,
    },
    billingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      street1: String,
      street2: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      phone: String,
    },
    shipping: {
      method: String,
      carrier: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      shippedAt: Date,
      deliveredAt: Date,
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
        default: 'pending',
      },
      method: {
        type: String,
        enum: ['card', 'paypal', 'bank_transfer', 'cod', 'stripe'],
      },
      transactionId: String,
      stripeSessionId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    notes: String,
    internalNotes: String,
    couponCode: String,
    fulfillment: {
      packedAt: Date,
      shippedAt: Date,
      deliveredAt: Date,
      packedBy: String,
      shippedBy: String,
    },
    customerInfo: {
      email: String,
      phone: String,
      isGuest: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
orderSchema.index({ business: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function (next) {
  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.price;
  });

  // Calculate subtotal
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Calculate final total
  this.pricing.total =
    this.pricing.subtotal +
    this.pricing.shipping +
    this.pricing.taxes -
    this.pricing.discount;

  next();
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);
