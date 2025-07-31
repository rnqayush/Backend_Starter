const mongoose = require('mongoose');

/**
 * Hotel Booking Model
 * Represents bookings for hotel rooms
 */
const hotelBookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingNumber: {
    type: String,
    required: [true, 'Booking number is required'],
    unique: true,
    index: true
  },
  
  // References
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required'],
    index: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required'],
    index: true
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Guest Information
  guest: {
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], lowercase: true },
    phone: { type: String, required: [true, 'Phone number is required'] },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    idType: { type: String, enum: ['passport', 'license', 'national-id', 'other'] },
    idNumber: { type: String }
  },
  
  // Additional Guests
  additionalGuests: [{
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    age: { type: Number },
    relationship: { type: String }
  }],
  
  // Booking Details
  dates: {
    checkIn: { type: Date, required: [true, 'Check-in date is required'], index: true },
    checkOut: { type: Date, required: [true, 'Check-out date is required'], index: true },
    nights: { type: Number, required: true, min: 1 }
  },
  
  occupancy: {
    adults: { type: Number, required: [true, 'Number of adults is required'], min: 1 },
    children: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 1 }
  },
  
  // Pricing
  pricing: {
    roomRate: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fees: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' }
    }],
    discounts: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
      code: { type: String }
    }],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['credit-card', 'debit-card', 'paypal', 'bank-transfer', 'cash', 'other'],
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
    refundAmount: { type: Number, default: 0 },
    refundDate: { type: Date },
    refundReason: { type: String }
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },
  
  // Special Requests
  specialRequests: [{
    type: {
      type: String,
      enum: ['room-preference', 'accessibility', 'dietary', 'celebration', 'transport', 'other'],
      required: true
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'not-available', 'additional-cost'],
      default: 'pending'
    },
    additionalCost: { type: Number, default: 0 }
  }],
  
  // Check-in/Check-out Details
  checkInDetails: {
    actualCheckIn: { type: Date },
    checkedInBy: { type: String },
    roomAssigned: { type: String },
    keyIssued: { type: Boolean, default: false },
    notes: { type: String }
  },
  
  checkOutDetails: {
    actualCheckOut: { type: Date },
    checkedOutBy: { type: String },
    roomCondition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'damaged']
    },
    additionalCharges: [{
      description: { type: String, required: true },
      amount: { type: Number, required: true }
    }],
    notes: { type: String }
  },
  
  // Communication
  notifications: [{
    type: {
      type: String,
      enum: ['confirmation', 'reminder', 'check-in', 'check-out', 'cancellation', 'modification'],
      required: true
    },
    sentAt: { type: Date, default: Date.now },
    method: { type: String, enum: ['email', 'sms', 'push'], required: true },
    status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' }
  }],
  
  // Reviews and Feedback
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    reviewDate: { type: Date },
    isPublic: { type: Boolean, default: true }
  },
  
  // Booking Source
  source: {
    type: String,
    enum: ['direct', 'phone', 'email', 'walk-in', 'online', 'agent', 'third-party'],
    default: 'online'
  },
  
  // Cancellation Details
  cancellation: {
    cancelledAt: { type: Date },
    cancelledBy: { type: String },
    reason: { type: String },
    refundAmount: { type: Number },
    cancellationFee: { type: Number, default: 0 }
  },
  
  // Internal Notes
  internalNotes: [{
    note: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['general', 'payment', 'guest-service', 'housekeeping', 'maintenance'],
      default: 'general'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
hotelBookingSchema.index({ hotel: 1, 'dates.checkIn': 1 });
hotelBookingSchema.index({ hotel: 1, status: 1 });
hotelBookingSchema.index({ 'guest.email': 1 });
hotelBookingSchema.index({ bookingNumber: 1 });
hotelBookingSchema.index({ 'dates.checkIn': 1, 'dates.checkOut': 1 });
hotelBookingSchema.index({ createdAt: -1 });

// Virtual for guest full name
hotelBookingSchema.virtual('guestFullName').get(function() {
  return `${this.guest.firstName} ${this.guest.lastName}`;
});

// Virtual for total guests
hotelBookingSchema.virtual('totalGuests').get(function() {
  return this.occupancy.total;
});

// Virtual for booking duration
hotelBookingSchema.virtual('duration').get(function() {
  return this.dates.nights;
});

// Methods
hotelBookingSchema.methods.calculateTotal = function() {
  let total = this.pricing.roomRate;
  
  // Add taxes
  total += this.pricing.taxes;
  
  // Add fees
  this.pricing.fees.forEach(fee => {
    if (fee.type === 'percentage') {
      total += (this.pricing.roomRate * fee.amount / 100);
    } else {
      total += fee.amount;
    }
  });
  
  // Apply discounts
  this.pricing.discounts.forEach(discount => {
    if (discount.type === 'percentage') {
      total -= (this.pricing.roomRate * discount.amount / 100);
    } else {
      total -= discount.amount;
    }
  });
  
  this.pricing.subtotal = this.pricing.roomRate + this.pricing.taxes;
  this.pricing.total = Math.max(0, total);
  
  return this.pricing.total;
};

hotelBookingSchema.methods.canCancel = function() {
  const now = new Date();
  const checkIn = new Date(this.dates.checkIn);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
  
  // Can cancel if more than 24 hours before check-in and not already checked in
  return hoursUntilCheckIn > 24 && !['checked-in', 'checked-out', 'cancelled'].includes(this.status);
};

hotelBookingSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason
  };
  
  // Calculate refund amount based on cancellation policy
  // This would depend on hotel's cancellation policy
  this.cancellation.refundAmount = this.pricing.total * 0.8; // 80% refund as example
  this.cancellation.cancellationFee = this.pricing.total * 0.2; // 20% fee as example
  
  return this.save();
};

hotelBookingSchema.methods.checkIn = function(checkedInBy, roomAssigned) {
  this.status = 'checked-in';
  this.checkInDetails = {
    actualCheckIn: new Date(),
    checkedInBy,
    roomAssigned: roomAssigned || this.room.roomNumber,
    keyIssued: true
  };
  
  return this.save();
};

hotelBookingSchema.methods.checkOut = function(checkedOutBy, roomCondition = 'good') {
  this.status = 'checked-out';
  this.checkOutDetails = {
    actualCheckOut: new Date(),
    checkedOutBy,
    roomCondition
  };
  
  return this.save();
};

hotelBookingSchema.methods.addNote = function(note, addedBy, category = 'general') {
  this.internalNotes.push({
    note,
    addedBy,
    category,
    addedAt: new Date()
  });
  
  return this.save();
};

hotelBookingSchema.methods.sendNotification = function(type, method = 'email') {
  this.notifications.push({
    type,
    method,
    sentAt: new Date(),
    status: 'sent'
  });
  
  return this.save();
};

// Static methods
hotelBookingSchema.statics.findByHotel = function(hotelId, status = null) {
  const query = { hotel: hotelId };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

hotelBookingSchema.statics.findByDateRange = function(hotelId, startDate, endDate) {
  return this.find({
    hotel: hotelId,
    $or: [
      {
        'dates.checkIn': { $gte: startDate, $lte: endDate }
      },
      {
        'dates.checkOut': { $gte: startDate, $lte: endDate }
      },
      {
        'dates.checkIn': { $lte: startDate },
        'dates.checkOut': { $gte: endDate }
      }
    ]
  });
};

hotelBookingSchema.statics.findByGuest = function(email) {
  return this.find({ 'guest.email': email }).sort({ createdAt: -1 });
};

hotelBookingSchema.statics.generateBookingNumber = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `HTL-${timestamp}-${random}`.toUpperCase();
};

// Pre-save middleware
hotelBookingSchema.pre('save', function(next) {
  // Generate booking number if not exists
  if (!this.bookingNumber) {
    this.bookingNumber = this.constructor.generateBookingNumber();
  }
  
  // Calculate nights
  if (this.dates.checkIn && this.dates.checkOut) {
    const checkIn = new Date(this.dates.checkIn);
    const checkOut = new Date(this.dates.checkOut);
    this.dates.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }
  
  // Calculate total occupancy
  if (this.occupancy.adults !== undefined && this.occupancy.children !== undefined) {
    this.occupancy.total = this.occupancy.adults + this.occupancy.children;
  }
  
  // Calculate total pricing
  if (this.pricing.roomRate) {
    this.calculateTotal();
  }
  
  next();
});

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);

