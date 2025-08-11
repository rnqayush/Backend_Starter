const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Basic Information
  bookingId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required'],
    index: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room ID is required'],
    index: true,
  },

  // Booking Details
  checkInDate: {
    type: Date,
    required: [true, 'Check-in date is required'],
    index: true,
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Check-out date is required'],
    index: true,
  },
  numberOfNights: {
    type: Number,
    required: true,
    min: [1, 'Number of nights must be at least 1'],
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'Number of guests must be at least 1'],
    max: [20, 'Number of guests cannot exceed 20'],
  },
  guestDetails: {
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
  },

  // Guest Information
  primaryGuest: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    dateOfBirth: Date,
    nationality: String,
    passportNumber: String,
    idType: { type: String, enum: ['passport', 'license', 'national_id', 'other'] },
    idNumber: String,
  },
  additionalGuests: [{
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: Date,
    relationship: { type: String, enum: ['spouse', 'child', 'parent', 'sibling', 'friend', 'colleague', 'other'] },
  }],

  // Pricing
  pricing: {
    roomRate: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    serviceCharges: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD', uppercase: true },
    breakdown: [{
      description: String,
      amount: Number,
      type: { type: String, enum: ['room', 'tax', 'service', 'discount', 'addon'] },
    }],
  },

  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'wallet'],
    },
    transactionId: String,
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },
    refundAmount: { type: Number, default: 0, min: 0 },
    paymentDate: Date,
    dueDate: Date,
    paymentHistory: [{
      amount: Number,
      method: String,
      transactionId: String,
      status: { type: String, enum: ['success', 'failed', 'pending'] },
      date: { type: Date, default: Date.now },
      description: String,
    }],
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'pending',
    index: true,
  },
  confirmationDate: Date,
  cancellationDate: Date,
  cancellationReason: String,
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'super_strict'],
  },

  // Check-in/Check-out
  actualCheckIn: Date,
  actualCheckOut: Date,
  earlyCheckIn: { type: Boolean, default: false },
  lateCheckOut: { type: Boolean, default: false },
  checkInNotes: String,
  checkOutNotes: String,

  // Special Requests & Preferences
  specialRequests: {
    bedType: { type: String, enum: ['single', 'double', 'twin', 'king', 'queen'] },
    roomFloor: { type: String, enum: ['low', 'high', 'specific'] },
    specificFloor: Number,
    smokingPreference: { type: String, enum: ['non_smoking', 'smoking'] },
    accessibilityNeeds: [String],
    dietaryRequirements: [String],
    otherRequests: String,
  },
  addOns: [{
    name: String,
    description: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    date: Date, // For date-specific add-ons
  }],

  // Communication
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    checkInInstructionsSent: { type: Boolean, default: false },
    feedbackRequestSent: { type: Boolean, default: false },
  },
  communicationHistory: [{
    type: { type: String, enum: ['email', 'sms', 'call', 'in_person'] },
    subject: String,
    message: String,
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'] },
  }],

  // Reviews & Feedback
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    reviewDate: Date,
    response: String,
    responseDate: Date,
    isPublic: { type: Boolean, default: true },
  },

  // Internal Notes
  internalNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
    category: { type: String, enum: ['general', 'payment', 'guest', 'room', 'service'] },
  }],

  // Source & Marketing
  source: {
    channel: { type: String, enum: ['direct', 'website', 'phone', 'email', 'walk_in', 'ota', 'agent'] },
    referrer: String,
    campaign: String,
    couponCode: String,
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
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ hotelId: 1, status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ hotelId: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for total guests
bookingSchema.virtual('totalGuests').get(function() {
  return this.guestDetails.adults + this.guestDetails.children + this.guestDetails.infants;
});

// Virtual for is cancellable
bookingSchema.virtual('isCancellable').get(function() {
  if (this.status === 'cancelled' || this.status === 'checked_out' || this.status === 'no_show') {
    return false;
  }
  
  // Check cancellation policy and timing
  const now = new Date();
  const checkIn = new Date(this.checkInDate);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  switch (this.cancellationPolicy) {
    case 'flexible':
      return hoursUntilCheckIn > 24;
    case 'moderate':
      return hoursUntilCheckIn > 48;
    case 'strict':
      return hoursUntilCheckIn > 168; // 7 days
    case 'super_strict':
      return hoursUntilCheckIn > 336; // 14 days
    default:
      return hoursUntilCheckIn > 24;
  }
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate booking ID if not exists
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingId = `BK${timestamp}${random}`.toUpperCase();
  }
  
  // Calculate number of nights
  if (this.checkInDate && this.checkOutDate) {
    const diffTime = Math.abs(this.checkOutDate - this.checkInDate);
    this.numberOfNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Update payment pending amount
  if (this.pricing && this.payment) {
    this.payment.pendingAmount = this.pricing.totalAmount - this.payment.paidAmount;
  }
  
  next();
});

// Instance methods
bookingSchema.methods.canCancel = function() {
  return this.isCancellable;
};

bookingSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancellationDate = new Date();
  this.cancellationReason = reason;
  return this.save();
};

bookingSchema.methods.confirm = function() {
  this.status = 'confirmed';
  this.confirmationDate = new Date();
  return this.save();
};

bookingSchema.methods.checkIn = function(notes) {
  this.status = 'checked_in';
  this.actualCheckIn = new Date();
  if (notes) this.checkInNotes = notes;
  return this.save();
};

bookingSchema.methods.checkOut = function(notes) {
  this.status = 'checked_out';
  this.actualCheckOut = new Date();
  if (notes) this.checkOutNotes = notes;
  return this.save();
};

bookingSchema.methods.addPayment = function(amount, method, transactionId, status = 'success') {
  this.payment.paymentHistory.push({
    amount,
    method,
    transactionId,
    status,
    date: new Date(),
  });
  
  if (status === 'success') {
    this.payment.paidAmount += amount;
    this.payment.pendingAmount = this.pricing.totalAmount - this.payment.paidAmount;
    
    // Update payment status
    if (this.payment.paidAmount >= this.pricing.totalAmount) {
      this.payment.status = 'paid';
    } else if (this.payment.paidAmount > 0) {
      this.payment.status = 'partial';
    }
  }
  
  return this.save();
};

bookingSchema.methods.addInternalNote = function(note, addedBy, category = 'general') {
  this.internalNotes.push({
    note,
    addedBy,
    category,
    addedAt: new Date(),
  });
  return this.save();
};

bookingSchema.methods.addReview = function(rating, comment, isPublic = true) {
  this.review = {
    rating,
    comment,
    reviewDate: new Date(),
    isPublic,
  };
  return this.save();
};

// Static methods
bookingSchema.statics.findByDateRange = function(startDate, endDate, hotelId) {
  const query = {
    $or: [
      {
        checkInDate: { $gte: startDate, $lte: endDate }
      },
      {
        checkOutDate: { $gte: startDate, $lte: endDate }
      },
      {
        checkInDate: { $lte: startDate },
        checkOutDate: { $gte: endDate }
      }
    ]
  };
  
  if (hotelId) {
    query.hotelId = hotelId;
  }
  
  return this.find(query).populate('userId roomId hotelId');
};

bookingSchema.statics.getBookingStats = function(hotelId, startDate, endDate) {
  const matchStage = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (hotelId) {
    matchStage.hotelId = mongoose.Types.ObjectId(hotelId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageBookingValue: { $avg: '$pricing.totalAmount' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
      }
    }
  ]);
};

bookingSchema.statics.findConflictingBookings = function(roomId, checkIn, checkOut, excludeBookingId) {
  const query = {
    roomId: roomId,
    status: { $in: ['confirmed', 'checked_in'] },
    $or: [
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Booking', bookingSchema);
