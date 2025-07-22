import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },

  // Room Details
  type: {
    type: String,
    required: true,
    enum: [
      'standard', 'deluxe', 'premium', 'suite', 'executive',
      'presidential', 'family', 'connecting', 'accessible',
      'studio', 'apartment', 'villa', 'penthouse'
    ]
  },
  category: {
    type: String,
    enum: ['economy', 'standard', 'premium', 'luxury'],
    default: 'standard'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Capacity
  capacity: {
    adults: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    children: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    infants: {
      type: Number,
      default: 0,
      min: 0,
      max: 3
    },
    maxOccupancy: {
      type: Number,
      required: true
    }
  },

  // Room Specifications
  specifications: {
    size: {
      value: Number,
      unit: {
        type: String,
        enum: ['sqft', 'sqm'],
        default: 'sqft'
      }
    },
    bedType: {
      type: String,
      enum: [
        'single', 'double', 'queen', 'king', 'twin',
        'sofa-bed', 'bunk-bed', 'murphy-bed'
      ],
      required: true
    },
    bedCount: {
      type: Number,
      required: true,
      min: 1
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1
    },
    view: {
      type: String,
      enum: [
        'city', 'ocean', 'mountain', 'garden', 'pool',
        'courtyard', 'street', 'interior', 'partial-ocean',
        'partial-city', 'no-view'
      ]
    },
    smoking: {
      type: Boolean,
      default: false
    }
  },

  // Amenities
  amenities: [{
    type: String,
    enum: [
      'wifi', 'tv', 'ac', 'heater', 'minibar', 'safe',
      'balcony', 'terrace', 'kitchenette', 'coffee-maker',
      'tea-maker', 'hair-dryer', 'iron', 'bathrobe',
      'slippers', 'toiletries', 'towels', 'desk',
      'chair', 'sofa', 'dining-table', 'wardrobe',
      'telephone', 'alarm-clock', 'blackout-curtains',
      'soundproof', 'jacuzzi', 'bathtub', 'shower',
      'bidet', 'separate-toilet'
    ]
  }],

  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    category: {
      type: String,
      enum: ['bedroom', 'bathroom', 'balcony', 'view', 'amenity', 'other'],
      default: 'bedroom'
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],

  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    seasonalRates: [{
      name: String,
      startDate: Date,
      endDate: Date,
      price: Number
    }],
    weekendSurcharge: {
      type: Number,
      default: 0
    },
    holidaySurcharge: {
      type: Number,
      default: 0
    }
  },

  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'out-of-order', 'reserved'],
      default: 'available'
    },
    maintenanceSchedule: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      type: {
        type: String,
        enum: ['cleaning', 'repair', 'renovation', 'inspection'],
        default: 'maintenance'
      }
    }],
    lastCleaned: Date,
    lastInspected: Date
  },

  // Booking Information
  currentBooking: {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkIn: Date,
    checkOut: Date,
    status: {
      type: String,
      enum: ['checked-in', 'checked-out', 'no-show', 'cancelled']
    }
  },

  // Room Status
  housekeeping: {
    status: {
      type: String,
      enum: ['clean', 'dirty', 'out-of-order', 'maintenance'],
      default: 'clean'
    },
    lastCleaned: Date,
    cleanedBy: String,
    notes: String,
    inspectionRequired: {
      type: Boolean,
      default: false
    }
  },

  // Special Features
  features: {
    accessible: {
      type: Boolean,
      default: false
    },
    connecting: {
      rooms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
      }]
    },
    petFriendly: {
      type: Boolean,
      default: false
    },
    businessFriendly: {
      type: Boolean,
      default: false
    }
  },

  // Analytics
  analytics: {
    bookings: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    occupancyRate: {
      type: Number,
      default: 0
    },
    averageStay: {
      type: Number,
      default: 0
    },
    guestRating: {
      type: Number,
      default: 0
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },

  // Timestamps
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
roomSchema.index({ hotel: 1, status: 1 });
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ type: 1, 'capacity.adults': 1 });
roomSchema.index({ 'availability.status': 1 });
roomSchema.index({ 'pricing.basePrice': 1 });

// Virtual fields
roomSchema.virtual('isAvailable').get(function() {
  return this.availability.status === 'available' && this.status === 'active';
});

roomSchema.virtual('isOccupied').get(function() {
  return this.availability.status === 'occupied' || this.currentBooking.status === 'checked-in';
});

roomSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

roomSchema.virtual('totalCapacity').get(function() {
  return this.capacity.adults + this.capacity.children + this.capacity.infants;
});

roomSchema.virtual('pricePerNight').get(function() {
  // This could include seasonal rates, weekend surcharges, etc.
  return this.pricing.basePrice;
});

// Pre-save middleware
roomSchema.pre('save', function(next) {
  // Update lastModified
  this.lastModified = new Date();

  // Ensure only one primary image
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }

  // Set max occupancy if not set
  if (!this.capacity.maxOccupancy) {
    this.capacity.maxOccupancy = this.capacity.adults + this.capacity.children;
  }

  next();
});

// Static methods
roomSchema.statics.findAvailableRooms = function(hotelId, checkIn, checkOut, guests = 1) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  return this.aggregate([
    {
      $match: {
        hotel: mongoose.Types.ObjectId(hotelId),
        status: 'active',
        'availability.status': 'available',
        'capacity.maxOccupancy': { $gte: guests }
      }
    },
    {
      $lookup: {
        from: 'bookings',
        let: { roomId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$roomId', '$rooms.room'] },
                  { $ne: ['$status', 'cancelled'] },
                  {
                    $or: [
                      {
                        $and: [
                          { $lte: ['$checkIn', checkInDate] },
                          { $gt: ['$checkOut', checkInDate] }
                        ]
                      },
                      {
                        $and: [
                          { $lt: ['$checkIn', checkOutDate] },
                          { $gte: ['$checkOut', checkOutDate] }
                        ]
                      },
                      {
                        $and: [
                          { $gte: ['$checkIn', checkInDate] },
                          { $lte: ['$checkOut', checkOutDate] }
                        ]
                      }
                    ]
                  }
                ]
              }
            }
          }
        ],
        as: 'conflictingBookings'
      }
    },
    {
      $match: {
        conflictingBookings: { $size: 0 }
      }
    },
    {
      $project: {
        conflictingBookings: 0
      }
    }
  ]);
};

roomSchema.statics.getRoomsByType = function(hotelId, type = null) {
  const query = { hotel: hotelId, status: 'active' };
  if (type) query.type = type;
  
  return this.find(query).sort({ floor: 1, roomNumber: 1 });
};

roomSchema.statics.getOccupancyReport = function(hotelId, startDate, endDate) {
  return this.aggregate([
    { $match: { hotel: mongoose.Types.ObjectId(hotelId) } },
    {
      $lookup: {
        from: 'bookings',
        let: { roomId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$roomId', '$rooms.room'] },
                  { $ne: ['$status', 'cancelled'] },
                  { $gte: ['$checkOut', new Date(startDate)] },
                  { $lte: ['$checkIn', new Date(endDate)] }
                ]
              }
            }
          }
        ],
        as: 'bookings'
      }
    },
    {
      $project: {
        roomNumber: 1,
        type: 1,
        totalBookings: { $size: '$bookings' },
        totalNights: {
          $sum: {
            $map: {
              input: '$bookings',
              as: 'booking',
              in: {
                $divide: [
                  { $subtract: ['$$booking.checkOut', '$$booking.checkIn'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        }
      }
    }
  ]);
};

// Instance methods
roomSchema.methods.checkIn = function(bookingId, guestId) {
  this.availability.status = 'occupied';
  this.currentBooking = {
    booking: bookingId,
    guest: guestId,
    checkIn: new Date(),
    status: 'checked-in'
  };
  this.housekeeping.status = 'dirty';
  return this.save();
};

roomSchema.methods.checkOut = function() {
  this.availability.status = 'available';
  this.currentBooking.checkOut = new Date();
  this.currentBooking.status = 'checked-out';
  this.housekeeping.status = 'dirty';
  this.housekeeping.inspectionRequired = true;
  return this.save();
};

roomSchema.methods.setMaintenance = function(startDate, endDate, reason, type = 'maintenance') {
  this.availability.status = 'maintenance';
  this.availability.maintenanceSchedule.push({
    startDate,
    endDate,
    reason,
    type
  });
  return this.save();
};

roomSchema.methods.completeMaintenance = function() {
  this.availability.status = 'available';
  this.housekeeping.status = 'clean';
  this.housekeeping.inspectionRequired = false;
  return this.save();
};

roomSchema.methods.updateHousekeeping = function(status, cleanedBy = null, notes = null) {
  this.housekeeping.status = status;
  if (status === 'clean') {
    this.housekeeping.lastCleaned = new Date();
    this.housekeeping.cleanedBy = cleanedBy;
    this.housekeeping.inspectionRequired = false;
  }
  if (notes) {
    this.housekeeping.notes = notes;
  }
  return this.save();
};

roomSchema.methods.calculatePrice = function(checkIn, checkOut) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  let totalPrice = 0;
  let currentDate = new Date(checkInDate);

  for (let i = 0; i < nights; i++) {
    let nightPrice = this.pricing.basePrice;

    // Check for seasonal rates
    const seasonalRate = this.pricing.seasonalRates.find(rate =>
      currentDate >= rate.startDate && currentDate <= rate.endDate
    );
    if (seasonalRate) {
      nightPrice = seasonalRate.price;
    }

    // Add weekend surcharge (Friday and Saturday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      nightPrice += this.pricing.weekendSurcharge;
    }

    totalPrice += nightPrice;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    basePrice: this.pricing.basePrice,
    totalPrice,
    nights,
    averagePerNight: totalPrice / nights
  };
};

roomSchema.methods.addBooking = function(revenue) {
  this.analytics.bookings += 1;
  this.analytics.revenue += revenue;
  return this.save();
};

export default mongoose.model('Room', roomSchema);

