/**
 * Booking Model - For hotel bookings and other service bookings
 * Based on frontend booking data structure
 */

import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_METHODS, BUSINESS_CATEGORIES } from '../config/constants.js';

// Guest information schema
const guestInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Guest name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Guest email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Guest phone is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  idProof: {
    type: { type: String, trim: true }, // passport, driving_license, aadhar, etc.
    number: { type: String, trim: true }
  }
}, { _id: false });

// Payment information schema
const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: {
      values: Object.values(PAYMENT_METHODS),
      message: 'Invalid payment method'
    },
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  transactionId: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    trim: true
  },
  paidAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  refundedAt: {
    type: Date
  },
  paymentGateway: {
    type: String,
    trim: true
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, { _id: false });

// Cancellation information schema
const cancellationInfoSchema = new mongoose.Schema({
  reason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledBy: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    required: true
  },
  cancelledAt: {
    type: Date,
    default: Date.now
  },
  refundEligible: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  cancellationFee: {
    type: Number,
    min: 0,
    default: 0
  }
}, { _id: false });

// Main Booking Schema
const bookingSchema = new mongoose.Schema({
  // Basic Information
  bookingId: {
    type: String,
    required: [true, 'Booking ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  
  // References
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required'],
    index: true
  },
  
  // Booking Type and Category
  category: {
    type: String,
    enum: {
      values: Object.values(BUSINESS_CATEGORIES),
      message: 'Invalid booking category'
    },
    required: [true, 'Booking category is required'],
    index: true
  },
  
  // Hotel-specific fields
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    index: true
  },
  hotelName: {
    type: String,
    trim: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    index: true
  },
  roomId: {
    type: Number
  },
  roomName: {
    type: String,
    trim: true
  },
  roomType: {
    type: String,
    trim: true
  },
  
  // Wedding-specific fields
  weddingService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingService',
    index: true
  },
  serviceType: {
    type: String,
    trim: true
  },
  eventDate: {
    type: Date,
    index: true
  },
  eventLocation: {
    type: String,
    trim: true
  },
  
  // Business service-specific fields
  businessService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessService',
    index: true
  },
  appointmentDate: {
    type: Date,
    index: true
  },
  appointmentTime: {
    type: String,
    trim: true
  },
  
  // Date Information
  checkIn: {
    type: Date,
    index: true
  },
  checkOut: {
    type: Date,
    index: true
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required'],
    default: Date.now,
    index: true
  },
  
  // Guest Information
  guests: {
    type: Number,
    min: [1, 'Number of guests must be at least 1'],
    max: [50, 'Number of guests cannot exceed 50']
  },
  guestInfo: {
    type: guestInfoSchema,
    required: [true, 'Guest information is required']
  },
  additionalGuests: [{
    name: { type: String, trim: true },
    age: { type: Number, min: 0, max: 120 },
    relation: { type: String, trim: true }
  }],
  
  // Pricing Information
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative']
  },
  taxes: {
    type: Number,
    min: 0,
    default: 0
  },
  serviceCharges: {
    type: Number,
    min: 0,
    default: 0
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative'],
    index: true
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
    trim: true
  },
  
  // Booking Status
  status: {
    type: String,
    enum: {
      values: Object.values(BOOKING_STATUS),
      message: 'Invalid booking status'
    },
    default: BOOKING_STATUS.PENDING,
    index: true
  },
  
  // Payment Information
  payment: {
    type: paymentInfoSchema,
    required: [true, 'Payment information is required']
  },
  
  // Special Requests and Notes
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [1000, 'Special requests cannot exceed 1000 characters']
  },
  vendorNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Vendor notes cannot exceed 1000 characters']
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  
  // Cancellation Information
  cancellation: {
    type: cancellationInfoSchema
  },
  
  // Confirmation Details
  confirmationNumber: {
    type: String,
    trim: true,
    sparse: true,
    index: true
  },
  confirmedAt: {
    type: Date
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Check-in/Check-out tracking
  checkedInAt: {
    type: Date
  },
  checkedOutAt: {
    type: Date
  },
  actualGuests: {
    type: Number,
    min: 0
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'in_person', 'system'],
      required: true
    },
    message: { type: String, trim: true },
    sentBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    sentAt: { 
      type: Date, 
      default: Date.now 
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Review and Rating
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    reviewedAt: { type: Date },
    response: { type: String, trim: true, maxlength: 500 },
    respondedAt: { type: Date }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'phone', 'walk_in', 'third_party'],
    default: 'website'
  },
  deviceInfo: {
    userAgent: { type: String, trim: true },
    ipAddress: { type: String, trim: true },
    platform: { type: String, trim: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ vendor: 1, status: 1 });
bookingSchema.index({ category: 1, status: 1 });
bookingSchema.index({ bookingDate: -1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ confirmationNumber: 1 });
bookingSchema.index({ eventDate: 1 });
bookingSchema.index({ appointmentDate: 1 });

// Virtual for booking duration (in days)
bookingSchema.virtual('duration').get(function() {
  if (!this.checkIn || !this.checkOut) return 0;
  const diffTime = Math.abs(this.checkOut - this.checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until check-in
bookingSchema.virtual('daysUntilCheckIn').get(function() {
  if (!this.checkIn) return null;
  const diffTime = this.checkIn - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for booking age (days since booking)
bookingSchema.virtual('bookingAge').get(function() {
  const diffTime = new Date() - this.bookingDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is cancellable
bookingSchema.virtual('isCancellable').get(function() {
  if (this.status === BOOKING_STATUS.CANCELLED || this.status === BOOKING_STATUS.COMPLETED) {
    return false;
  }
  
  // Check if check-in is more than 24 hours away
  if (this.checkIn) {
    const hoursUntilCheckIn = (this.checkIn - new Date()) / (1000 * 60 * 60);
    return hoursUntilCheckIn > 24;
  }
  
  return true;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Generate booking ID if not provided
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.bookingId = `BK${timestamp}${random}`.toUpperCase();
  }
  
  // Generate confirmation number when booking is confirmed
  if (this.status === BOOKING_STATUS.CONFIRMED && !this.confirmationNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    this.confirmationNumber = `CNF${timestamp}${random}`.toUpperCase();
    this.confirmedAt = new Date();
  }
  
  // Calculate total price if not provided
  if (!this.totalPrice) {
    this.totalPrice = this.basePrice + this.taxes + this.serviceCharges - this.discountAmount;
  }
  
  // Update payment amount to match total price
  if (this.payment && this.payment.amount !== this.totalPrice) {
    this.payment.amount = this.totalPrice;
  }
  
  next();
});

// Static methods
bookingSchema.statics.findByUser = function(userId, options = {}) {
  return this.find({ user: userId }, null, options);
};

bookingSchema.statics.findByVendor = function(vendorId, options = {}) {
  return this.find({ vendor: vendorId }, null, options);
};

bookingSchema.statics.findByStatus = function(status, options = {}) {
  return this.find({ status }, null, options);
};

bookingSchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
  const query = {
    $or: [
      { checkIn: { $gte: startDate, $lte: endDate } },
      { checkOut: { $gte: startDate, $lte: endDate } },
      { eventDate: { $gte: startDate, $lte: endDate } },
      { appointmentDate: { $gte: startDate, $lte: endDate } }
    ]
  };
  return this.find(query, null, options);
};

bookingSchema.statics.findUpcoming = function(options = {}) {
  const query = {
    $or: [
      { checkIn: { $gte: new Date() } },
      { eventDate: { $gte: new Date() } },
      { appointmentDate: { $gte: new Date() } }
    ],
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING] }
  };
  return this.find(query, null, options);
};

bookingSchema.statics.findPendingPayment = function(options = {}) {
  const query = {
    'payment.status': 'pending',
    status: { $ne: BOOKING_STATUS.CANCELLED }
  };
  return this.find(query, null, options);
};

// Instance methods
bookingSchema.methods.confirm = async function(confirmedBy = null) {
  this.status = BOOKING_STATUS.CONFIRMED;
  this.confirmedAt = new Date();
  if (confirmedBy) {
    this.confirmedBy = confirmedBy;
  }
  return this.save();
};

bookingSchema.methods.cancel = async function(reason, cancelledBy = 'customer') {
  this.status = BOOKING_STATUS.CANCELLED;
  this.cancellation = {
    reason,
    cancelledBy,
    cancelledAt: new Date(),
    refundEligible: this.isCancellable,
    refundAmount: this.isCancellable ? this.totalPrice : 0,
    cancellationFee: this.isCancellable ? 0 : this.totalPrice * 0.1 // 10% cancellation fee
  };
  return this.save();
};

bookingSchema.methods.checkIn = async function(actualGuests = null) {
  this.checkedInAt = new Date();
  if (actualGuests) {
    this.actualGuests = actualGuests;
  }
  return this.save();
};

bookingSchema.methods.checkOut = async function() {
  this.checkedOutAt = new Date();
  this.status = BOOKING_STATUS.COMPLETED;
  return this.save();
};

bookingSchema.methods.updatePaymentStatus = async function(status, transactionId = null, gatewayResponse = null) {
  this.payment.status = status;
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  if (gatewayResponse) {
    this.payment.gatewayResponse = gatewayResponse;
  }
  if (status === 'completed') {
    this.payment.paidAt = new Date();
  }
  return this.save();
};

bookingSchema.methods.addCommunication = async function(type, message, sentBy = null) {
  this.communications.push({
    type,
    message,
    sentBy,
    sentAt: new Date()
  });
  return this.save();
};

bookingSchema.methods.addReview = async function(rating, comment) {
  this.review = {
    rating,
    comment,
    reviewedAt: new Date()
  };
  return this.save();
};

bookingSchema.methods.respondToReview = async function(response) {
  if (this.review) {
    this.review.response = response;
    this.review.respondedAt = new Date();
  }
  return this.save();
};

bookingSchema.methods.toPublicJSON = function() {
  const booking = this.toObject();
  
  // Remove sensitive information
  delete booking.payment.gatewayResponse;
  delete booking.internalNotes;
  delete booking.deviceInfo;
  
  return booking;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
