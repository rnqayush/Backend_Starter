const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  business: {
    type: mongoose.Schema.ObjectId,
    ref: 'Business',
    required: true
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: function() {
      return this.bookingType === 'hotel';
    }
  },
  weddingVendor: {
    type: mongoose.Schema.ObjectId,
    ref: 'WeddingVendor',
    required: function() {
      return this.bookingType === 'wedding';
    }
  },
  bookingType: {
    type: String,
    required: true,
    enum: ['hotel', 'wedding', 'service']
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  guestDetails: {
    primaryGuest: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      phone: {
        type: String,
        required: true
      }
    },
    additionalGuests: [{
      name: String,
      age: Number,
      relation: String
    }],
    totalGuests: {
      adults: {
        type: Number,
        required: true,
        min: 1
      },
      children: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    specialRequests: String
  },
  // Hotel-specific fields
  roomDetails: {
    room: {
      type: mongoose.Schema.ObjectId,
      required: function() {
        return this.bookingType === 'hotel';
      }
    },
    roomType: String,
    roomNumber: String,
    checkIn: {
      type: Date,
      required: function() {
        return this.bookingType === 'hotel';
      }
    },
    checkOut: {
      type: Date,
      required: function() {
        return this.bookingType === 'hotel';
      }
    },
    nights: Number,
    roomsBooked: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  // Wedding-specific fields
  eventDetails: {
    eventDate: {
      type: Date,
      required: function() {
        return this.bookingType === 'wedding';
      }
    },
    eventType: {
      type: String,
      enum: ['wedding', 'engagement', 'reception', 'mehendi', 'sangeet', 'other']
    },
    venue: String,
    guestCount: Number,
    duration: {
      hours: Number,
      startTime: String,
      endTime: String
    },
    services: [{
      service: String,
      description: String,
      price: Number
    }]
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    serviceFees: {
      type: Number,
      default: 0
    },
    discounts: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash', 'bank_transfer']
    },
    transactionId: String,
    stripePaymentIntentId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    paymentDate: Date,
    refundDate: Date,
    installments: [{
      amount: Number,
      dueDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending'
      },
      paidDate: Date,
      transactionId: String
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  communication: {
    confirmationSent: {
      type: Boolean,
      default: false
    },
    remindersSent: [{
      type: {
        type: String,
        enum: ['booking_confirmation', 'check_in_reminder', 'check_out_reminder', 'payment_reminder']
      },
      sentAt: Date,
      method: {
        type: String,
        enum: ['email', 'sms', 'push']
      }
    }],
    notes: [{
      note: String,
      addedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      addedAt: {
        type: Date,
        default: Date.now
      },
      isInternal: {
        type: Boolean,
        default: false
      }
    }]
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewDate: Date
  },
  metadata: {
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'phone', 'walk_in', 'third_party'],
      default: 'website'
    },
    userAgent: String,
    ipAddress: String,
    referrer: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
BookingSchema.index({ bookingNumber: 1 });
BookingSchema.index({ business: 1 });
BookingSchema.index({ customer: 1 });
BookingSchema.index({ hotel: 1 });
BookingSchema.index({ weddingVendor: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'payment.status': 1 });
BookingSchema.index({ 'roomDetails.checkIn': 1 });
BookingSchema.index({ 'roomDetails.checkOut': 1 });
BookingSchema.index({ 'eventDetails.eventDate': 1 });
BookingSchema.index({ createdAt: -1 });

// Virtual for booking duration (hotel bookings)
BookingSchema.virtual('duration').get(function() {
  if (this.bookingType === 'hotel' && this.roomDetails.checkIn && this.roomDetails.checkOut) {
    const checkIn = new Date(this.roomDetails.checkIn);
    const checkOut = new Date(this.roomDetails.checkOut);
    return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual for total guests
BookingSchema.virtual('totalGuestsCount').get(function() {
  return this.guestDetails.totalGuests.adults + this.guestDetails.totalGuests.children;
});

// Virtual for payment balance
BookingSchema.virtual('paymentBalance').get(function() {
  return this.pricing.totalAmount - this.payment.paidAmount;
});

// Virtual for is fully paid
BookingSchema.virtual('isFullyPaid').get(function() {
  return this.payment.paidAmount >= this.pricing.totalAmount;
});

// Pre-save middleware to generate booking number
BookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const prefix = this.bookingType.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `${prefix}${timestamp}${random}`;
  }

  // Calculate nights for hotel bookings
  if (this.bookingType === 'hotel' && this.roomDetails.checkIn && this.roomDetails.checkOut) {
    const checkIn = new Date(this.roomDetails.checkIn);
    const checkOut = new Date(this.roomDetails.checkOut);
    this.roomDetails.nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  }

  next();
});

// Method to calculate refund amount based on cancellation policy
BookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  let refundPercentage = 0;

  if (this.bookingType === 'hotel') {
    const checkIn = new Date(this.roomDetails.checkIn);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn >= 24) {
      refundPercentage = 100; // Full refund
    } else if (hoursUntilCheckIn >= 12) {
      refundPercentage = 50; // 50% refund
    } else {
      refundPercentage = 0; // No refund
    }
  } else if (this.bookingType === 'wedding') {
    const eventDate = new Date(this.eventDetails.eventDate);
    const daysUntilEvent = (eventDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilEvent >= 30) {
      refundPercentage = 90; // 90% refund
    } else if (daysUntilEvent >= 14) {
      refundPercentage = 50; // 50% refund
    } else if (daysUntilEvent >= 7) {
      refundPercentage = 25; // 25% refund
    } else {
      refundPercentage = 0; // No refund
    }
  }

  return (this.payment.paidAmount * refundPercentage) / 100;
};

// Method to send confirmation email
BookingSchema.methods.sendConfirmation = async function() {
  // Implementation would integrate with email service
  this.communication.confirmationSent = true;
  await this.save();
};

// Method to add note
BookingSchema.methods.addNote = function(note, addedBy, isInternal = false) {
  this.communication.notes.push({
    note,
    addedBy,
    isInternal
  });
  return this.save();
};

module.exports = mongoose.model('Booking', BookingSchema);

