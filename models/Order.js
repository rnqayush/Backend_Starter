import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Vendor and customer information
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  
  // Customer details (denormalized for quick access)
  customerInfo: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  
  // Order type and domain
  orderType: {
    type: String,
    enum: ['automobile', 'ecommerce'],
    required: true,
  },
  
  // Order items (flexible for both domains)
  items: [{
    // Product/Vehicle information
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.itemType',
    },
    itemType: {
      type: String,
      enum: ['Vehicle', 'EcommerceProduct'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: String,
    
    // Pricing
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    
    // Item-specific details
    specifications: mongoose.Schema.Types.Mixed,
    customizations: mongoose.Schema.Types.Mixed,
  }],
  
  // Order totals
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'financing', 'crypto'],
  },
  transactionId: String,
  paymentDate: Date,
  
  // Shipping information
  shippingAddress: {
    name: String,
    street: {
      type: String,
      required: function() {
        return this.orderType === 'ecommerce';
      },
    },
    city: String,
    state: String,
    country: String,
    zipCode: String,
    phone: String,
    instructions: String,
  },
  
  // Delivery information
  deliveryDate: Date,
  estimatedDeliveryDate: Date,
  trackingNumber: String,
  shippingCarrier: String,
  
  // Order dates
  orderDate: {
    type: Date,
    default: Date.now,
  },
  confirmedDate: Date,
  shippedDate: Date,
  deliveredDate: Date,
  
  // Sales information (automobile specific)
  salesPerson: {
    type: String,
    required: function() {
      return this.orderType === 'automobile';
    },
  },
  commission: {
    type: Number,
    min: [0, 'Commission cannot be negative'],
  },
  
  // Financing information (automobile specific)
  financing: {
    isFinanced: {
      type: Boolean,
      default: false,
    },
    lender: String,
    loanAmount: Number,
    downPayment: Number,
    interestRate: Number,
    termMonths: Number,
    monthlyPayment: Number,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
  },
  
  // Trade-in information (automobile specific)
  tradeIn: {
    hasTradeIn: {
      type: Boolean,
      default: false,
    },
    vehicleDetails: {
      make: String,
      model: String,
      year: Number,
      mileage: Number,
      condition: String,
    },
    estimatedValue: Number,
    finalValue: Number,
  },
  
  // Order notes and communication
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters'],
  },
  
  // Order history and tracking
  statusHistory: [{
    status: String,
    date: {
      type: Date,
      default: Date.now,
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // Cancellation information
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancelledDate: Date,
  
  // Refund information
  refundAmount: {
    type: Number,
    min: [0, 'Refund amount cannot be negative'],
  },
  refundReason: String,
  refundDate: Date,
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  
  // Source and channel
  orderSource: {
    type: String,
    enum: ['website', 'mobile_app', 'phone', 'in_store', 'marketplace'],
    default: 'website',
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Indexes for better query performance
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ customerId: 1, orderDate: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ orderId: 1 }, { unique: true });
orderSchema.index({ orderType: 1, status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const diffTime = Math.abs(new Date() - this.orderDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to generate unique order number
orderSchema.statics.generateOrderNumber = function(orderType) {
  const prefix = orderType === 'automobile' ? 'AUTO' : 'ECOM';
  const year = new Date().getFullYear().toString().slice(-2);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}${timestamp}${random}`;
};

// Method to generate unique order ID
orderSchema.statics.generateOrderId = function(orderType) {
  const prefix = orderType === 'automobile' ? 'ORD-AUTO' : 'ORD-ECOM';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${timestamp}${random}`;
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.tax + this.shipping - this.discount;
  return this;
};

// Method to update status with history
orderSchema.methods.updateStatus = function(newStatus, notes, updatedBy) {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    notes: notes || `Status changed from ${oldStatus} to ${newStatus}`,
    updatedBy,
  });
  
  // Update relevant dates
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedDate = now;
      break;
    case 'shipped':
      this.shippedDate = now;
      break;
    case 'delivered':
      this.deliveredDate = now;
      break;
    case 'cancelled':
      this.cancelledDate = now;
      break;
  }
  
  return this.save();
};

// Method to process payment
orderSchema.methods.processPayment = function(paymentMethod, transactionId) {
  this.paymentStatus = 'paid';
  this.paymentMethod = paymentMethod;
  this.transactionId = transactionId;
  this.paymentDate = new Date();
  
  // Auto-confirm order if payment is successful
  if (this.status === 'pending') {
    this.status = 'confirmed';
    this.confirmedDate = new Date();
  }
  
  return this.save();
};

// Method to cancel order
orderSchema.methods.cancelOrder = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledDate = new Date();
  
  this.statusHistory.push({
    status: 'cancelled',
    notes: `Order cancelled: ${reason}`,
    updatedBy: cancelledBy,
  });
  
  return this.save();
};

// Soft delete method
orderSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Pre-save middleware to generate order numbers
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    if (!this.orderNumber) {
      this.orderNumber = this.constructor.generateOrderNumber(this.orderType);
    }
    if (!this.orderId) {
      this.orderId = this.constructor.generateOrderId(this.orderType);
    }
    
    // Calculate totals
    this.calculateTotals();
    
    // Add initial status to history
    this.statusHistory.push({
      status: this.status,
      notes: 'Order created',
    });
  }
  next();
});

// Pre-save middleware to update item totals
orderSchema.pre('save', function(next) {
  // Calculate total price for each item
  this.items.forEach(item => {
    item.totalPrice = item.unitPrice * item.quantity;
  });
  
  // Recalculate order totals
  this.calculateTotals();
  
  next();
});

// Exclude soft deleted documents by default
orderSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
