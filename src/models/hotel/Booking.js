import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Booking Identification
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Guest Information
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestInfo: {
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
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    idProof: {
      type: String,
      number: String,
      verified: {
        type: Boolean,
        default: false
      }
    }
  },

  // Hotel and Room Information
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  rooms: [{
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    roomNumber: String,
    roomType: String,
    guests: {
      adults: {
        type: Number,
        required: true,
        min: 1
      },
      children: {
        type: Number,
        default: 0,
        min: 0
      },
      infants: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    pricing: {
      basePrice: Number,
      totalPrice: Number,
      nights: Number
    }
  }],

  // Stay Details
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  nights: {
    type: Number,
    required: true
  },
  totalGuests: {
    adults: {
      type: Number,
      required: true
    },
    children: {
      type: Number,
      default: 0
    },
    infants: {
      type: Number,
      default: 0
    }
  },

  // Pricing
  pricing: {
    roomTotal: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      gst: {
        amount: Number,
        rate: Number
      },
      serviceTax: {
        amount: Number,
        rate: Number
      },
      cityTax: {
        amount: Number,
        rate: Number
      }
    },
    extras: {
      extraBed: {
        quantity: {
          type: Number,
          default: 0
        },
        amount: {
          type: Number,
          default: 0
        }
      },
      meals: {
        breakfast: {
          quantity: Number,
          amount: Number
        },
        lunch: {
          quantity: Number,
          amount: Number
        },
        dinner: {
          quantity: Number,
          amount: Number
        }
      },
      services: [{
        name: String,
        amount: Number,
        quantity: {
          type: Number,
          default: 1
        }
      }]
    },
    discount: {
      amount: {
        type: Number,
        default: 0
      },
      code: String,
      type: String,
      reason: String
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Payment Information
  payment: {
    method: {
      type: String,
      required: true,
      enum: ['credit-card', 'debit-card', 'upi', 'net-banking', 'wallet', 'cash', 'bank-transfer']
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially-refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date,
    dueAmount: {
      type: Number,
      default: 0
    },
    refunds: [{
      amount: {
        type: Number,
        required: true
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

  // Booking Status
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'checked-in', 'checked-out', 
      'cancelled', 'no-show', 'modified'
    ],
    default: 'pending'
  },

  // Check-in/Check-out Details
  checkInDetails: {
    actualCheckIn: Date,
    checkedInBy: String,
    idVerified: {
      type: Boolean,
      default: false
    },
    keyCards: [{
      cardNumber: String,
      issuedAt: Date,
      returnedAt: Date
    }],
    specialRequests: [String],
    notes: String
  },

  checkOutDetails: {
    actualCheckOut: Date,
    checkedOutBy: String,
    roomCondition: {
      type: String,
      enum: ['good', 'fair', 'damaged'],
      default: 'good'
    },
    damages: [{
      item: String,
      description: String,
      cost: Number
    }],
    minibarCharges: {
      type: Number,
      default: 0
    },
    additionalCharges: [{
      description: String,
      amount: Number
    }],
    finalBill: Number,
    notes: String
  },

  // Special Requests and Preferences
  preferences: {
    roomPreferences: [String],
    bedType: String,
    floor: String,
    smokingRoom: {
      type: Boolean,
      default: false
    },
    accessibleRoom: {
      type: Boolean,
      default: false
    }
  },
  specialRequests: [String],
  dietaryRequirements: [String],

  // Guest Services
  services: [{
    name: String,
    description: String,
    requestedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    status: {
      type: String,
      enum: ['requested', 'in-progress', 'completed', 'cancelled'],
      default: 'requested'
    },
    cost: {
      type: Number,
      default: 0
    },
    notes: String
  }],

  // Communication
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'in-person', 'app'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    subject: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Booking Timeline
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

  // Source and Channel
  source: {
    type: String,
    enum: ['direct', 'website', 'phone', 'email', 'walk-in', 'ota', 'agent', 'corporate'],
    default: 'website'
  },
  channel: {
    name: String,
    commission: {
      type: Number,
      default: 0
    }
  },

  // Cancellation
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    cancellationFee: {
      type: Number,
      default: 0
    }
  },

  // Modification History
  modifications: [{
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changes: [{
      field: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    reason: String
  }],

  // Notes and Comments
  notes: {
    guest: String,
    internal: String,
    housekeeping: String,
    frontDesk: String
  },

  // Analytics
  analytics: {
    leadTime: Number, // Days between booking and check-in
    lengthOfStay: Number,
    revenue: Number,
    source: String,
    deviceType: String,
    referrer: String
  },

  // Timestamps
  bookedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ hotel: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ 'rooms.room': 1 });
bookingSchema.index({ bookedAt: -1 });

// Virtual fields
bookingSchema.virtual('totalRooms').get(function() {
  return this.rooms.length;
});

bookingSchema.virtual('totalGuestsCount').get(function() {
  return this.totalGuests.adults + this.totalGuests.children + this.totalGuests.infants;
});

bookingSchema.virtual('isActive').get(function() {
  return ['confirmed', 'checked-in'].includes(this.status);
});

bookingSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

bookingSchema.virtual('canModify').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

bookingSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.checkIn;
});

bookingSchema.virtual('totalRefunded').get(function() {
  return this.payment.refunds.reduce((total, refund) => {
    return refund.status === 'completed' ? total + refund.amount : total;
  }, 0);
});

bookingSchema.virtual('remainingBalance').get(function() {
  return this.pricing.total - this.payment.paidAmount;
});

// Pre-save middleware
bookingSchema.pre('save', function(next) {
  // Generate booking number if not exists
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `BKG-${timestamp}-${random}`;
  }

  // Calculate nights
  if (this.checkIn && this.checkOut) {
    this.nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  }

  // Calculate total guests
  this.totalGuests.adults = this.rooms.reduce((total, room) => total + room.guests.adults, 0);
  this.totalGuests.children = this.rooms.reduce((total, room) => total + room.guests.children, 0);
  this.totalGuests.infants = this.rooms.reduce((total, room) => total + room.guests.infants, 0);

  // Calculate room total
  this.pricing.roomTotal = this.rooms.reduce((total, room) => total + room.pricing.totalPrice, 0);

  // Calculate final total
  const taxTotal = Object.values(this.pricing.taxes).reduce((sum, tax) => sum + (tax.amount || 0), 0);
  const extrasTotal = this.pricing.extras.extraBed.amount + 
    Object.values(this.pricing.extras.meals).reduce((sum, meal) => sum + (meal.amount || 0), 0) +
    this.pricing.extras.services.reduce((sum, service) => sum + (service.amount * service.quantity), 0);
  
  this.pricing.total = this.pricing.roomTotal + taxTotal + extrasTotal - this.pricing.discount.amount;

  // Update due amount
  this.payment.dueAmount = this.pricing.total - this.payment.paidAmount;

  // Update lastModified
  this.lastModified = new Date();

  // Calculate analytics
  if (this.bookedAt && this.checkIn) {
    this.analytics.leadTime = Math.ceil((this.checkIn - this.bookedAt) / (1000 * 60 * 60 * 24));
  }
  this.analytics.lengthOfStay = this.nights;
  this.analytics.revenue = this.pricing.total;

  next();
});

// Static methods
bookingSchema.statics.generateBookingNumber = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BKG-${timestamp}-${random}`;
};

bookingSchema.statics.getBookingsByStatus = function(status, hotelId = null) {
  const query = { status };
  if (hotelId) {
    query.hotel = hotelId;
  }
  return this.find(query)
    .populate('guest', 'name email phone')
    .populate('hotel', 'name')
    .populate('rooms.room', 'roomNumber type')
    .sort({ checkIn: 1 });
};

bookingSchema.statics.getBookingsByDateRange = function(startDate, endDate, hotelId = null) {
  const query = {
    $or: [
      {
        checkIn: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      },
      {
        checkOut: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      },
      {
        $and: [
          { checkIn: { $lte: new Date(startDate) } },
          { checkOut: { $gte: new Date(endDate) } }
        ]
      }
    ]
  };
  
  if (hotelId) {
    query.hotel = hotelId;
  }
  
  return this.find(query)
    .populate('guest', 'name email phone')
    .populate('rooms.room', 'roomNumber type')
    .sort({ checkIn: 1 });
};

bookingSchema.statics.getRevenueAnalytics = function(hotelId, dateRange = {}) {
  const matchStage = { hotel: mongoose.Types.ObjectId(hotelId) };
  
  if (dateRange.start && dateRange.end) {
    matchStage.checkIn = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageBookingValue: { $avg: '$pricing.total' },
        totalNights: { $sum: '$nights' },
        averageStay: { $avg: '$nights' }
      }
    }
  ]);
};

// Instance methods
bookingSchema.methods.updateStatus = function(newStatus, message = '', updatedBy = null) {
  this.status = newStatus;
  
  // Add to timeline
  this.timeline.push({
    status: newStatus,
    message: message || `Booking status updated to ${newStatus}`,
    updatedBy
  });

  // Update specific date fields
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'checked-in':
      this.checkInDetails.actualCheckIn = now;
      break;
    case 'checked-out':
      this.checkOutDetails.actualCheckOut = now;
      break;
    case 'cancelled':
      this.cancellation.cancelledAt = now;
      if (updatedBy) this.cancellation.cancelledBy = updatedBy;
      break;
  }

  return this.save();
};

bookingSchema.methods.updatePaymentStatus = function(status, transactionId = null, amount = null) {
  this.payment.status = status;
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  if (amount) {
    this.payment.paidAmount += amount;
  }
  if (status === 'completed') {
    this.payment.paidAt = new Date();
  }
  return this.save();
};

bookingSchema.methods.addRefund = function(amount, reason = '', refundId = '') {
  this.payment.refunds.push({
    amount,
    reason,
    refundId,
    status: 'pending'
  });
  return this.save();
};

bookingSchema.methods.checkIn = function(checkedInBy, keyCards = [], notes = '') {
  this.status = 'checked-in';
  this.checkInDetails = {
    actualCheckIn: new Date(),
    checkedInBy,
    keyCards: keyCards.map(card => ({
      cardNumber: card,
      issuedAt: new Date()
    })),
    notes
  };
  
  // Update room status
  this.rooms.forEach(async (roomBooking) => {
    const Room = mongoose.model('Room');
    const room = await Room.findById(roomBooking.room);
    if (room) {
      await room.checkIn(this._id, this.guest);
    }
  });

  return this.save();
};

bookingSchema.methods.checkOut = function(checkedOutBy, additionalCharges = [], notes = '') {
  this.status = 'checked-out';
  
  const totalAdditionalCharges = additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
  
  this.checkOutDetails = {
    actualCheckOut: new Date(),
    checkedOutBy,
    additionalCharges,
    finalBill: this.pricing.total + totalAdditionalCharges,
    notes
  };

  // Update room status
  this.rooms.forEach(async (roomBooking) => {
    const Room = mongoose.model('Room');
    const room = await Room.findById(roomBooking.room);
    if (room) {
      await room.checkOut();
    }
  });

  return this.save();
};

bookingSchema.methods.cancel = function(reason, cancelledBy = null, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledAt: new Date(),
    cancelledBy,
    reason,
    refundAmount,
    cancellationFee: this.pricing.total - refundAmount
  };

  if (refundAmount > 0) {
    this.addRefund(refundAmount, 'Booking cancellation');
  }

  return this.save();
};

bookingSchema.methods.addService = function(serviceName, description, cost = 0) {
  this.services.push({
    name: serviceName,
    description,
    cost,
    status: 'requested'
  });
  return this.save();
};

bookingSchema.methods.addCommunication = function(type, direction, message, subject = '', staff = null) {
  this.communications.push({
    type,
    direction,
    subject,
    message,
    staff
  });
  return this.save();
};

export default mongoose.model('Booking', bookingSchema);

