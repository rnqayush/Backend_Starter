const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    bookingType: {
      type: String,
      enum: ['hotel', 'service', 'appointment'],
      required: true,
    },
    // For hotel bookings
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel.rooms',
    },
    checkIn: Date,
    checkOut: Date,
    guests: {
      adults: { type: Number, default: 1 },
      children: { type: Number, default: 0 },
    },
    // For service bookings (weddings, business services)
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    appointmentDate: Date,
    appointmentTime: String,
    duration: Number, // in minutes
    // Common booking details
    customerInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      specialRequests: String,
    },
    pricing: {
      subtotal: { type: Number, required: true },
      taxes: { type: Number, default: 0 },
      fees: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },
    payment: {
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
        default: 'pending',
      },
      method: {
        type: String,
        enum: ['card', 'paypal', 'bank_transfer', 'cash', 'stripe'],
      },
      transactionId: String,
      stripeSessionId: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    notes: String,
    internalNotes: String,
    cancellation: {
      cancelledAt: Date,
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      refundIssued: { type: Boolean, default: false },
    },
    confirmationCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    reminderSent: { type: Boolean, default: false },
    reviewRequested: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
bookingSchema.index({ business: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ appointmentDate: 1 });
bookingSchema.index({ confirmationCode: 1 });

// Generate confirmation code before saving
bookingSchema.pre('save', function (next) {
  if (!this.confirmationCode) {
    this.confirmationCode = Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase();
  }
  next();
});

// Virtual for booking duration (for hotel stays)
bookingSchema.virtual('nights').get(function () {
  if (this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to calculate total price
bookingSchema.methods.calculateTotal = function () {
  this.pricing.total =
    this.pricing.subtotal +
    this.pricing.taxes +
    this.pricing.fees -
    this.pricing.discount;
  return this.pricing.total;
};

module.exports = mongoose.model('Booking', bookingSchema);
