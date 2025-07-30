const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a room name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify room type'],
    enum: ['single', 'double', 'suite', 'deluxe', 'presidential', 'family', 'twin']
  },
  description: {
    type: String,
    required: [true, 'Please add a room description']
  },
  images: [String],
  capacity: {
    adults: {
      type: Number,
      required: [true, 'Please specify adult capacity'],
      min: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  bedConfiguration: {
    kingBeds: { type: Number, default: 0 },
    queenBeds: { type: Number, default: 0 },
    doubleBeds: { type: Number, default: 0 },
    singleBeds: { type: Number, default: 0 },
    sofaBeds: { type: Number, default: 0 }
  },
  size: {
    value: Number,
    unit: {
      type: String,
      enum: ['sqft', 'sqm'],
      default: 'sqft'
    }
  },
  amenities: [String],
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Please add base price'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    seasonalRates: [{
      name: String,
      startDate: Date,
      endDate: Date,
      rate: Number,
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    weekendRate: Number,
    taxes: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    }
  },
  availability: {
    totalRooms: {
      type: Number,
      required: [true, 'Please specify total rooms'],
      min: 1
    },
    availableRooms: {
      type: Number,
      required: true
    },
    blockedDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  policies: {
    checkIn: {
      type: String,
      default: '15:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    cancellation: {
      type: String,
      default: 'Free cancellation up to 24 hours before check-in'
    },
    smoking: {
      type: Boolean,
      default: false
    },
    pets: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const HotelSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a hotel name'],
    trim: true,
    maxlength: [100, 'Hotel name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    enum: ['budget', 'mid-range', 'luxury', 'boutique', 'resort', 'business'],
    default: 'mid-range'
  },
  starRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  images: [String],
  rooms: [RoomSchema],
  amenities: {
    general: [String],
    business: [String],
    wellness: [String],
    dining: [String],
    entertainment: [String],
    connectivity: [String],
    accessibility: [String]
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  dining: [{
    name: String,
    type: {
      type: String,
      enum: ['restaurant', 'bar', 'cafe', 'room_service', 'buffet']
    },
    cuisine: String,
    description: String,
    hours: {
      open: String,
      close: String
    },
    images: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  policies: {
    checkIn: {
      type: String,
      default: '15:00'
    },
    checkOut: {
      type: String,
      default: '11:00'
    },
    cancellation: {
      type: String,
      default: 'Free cancellation up to 24 hours before check-in'
    },
    children: String,
    pets: {
      allowed: {
        type: Boolean,
        default: false
      },
      fee: Number,
      restrictions: String
    },
    smoking: {
      type: Boolean,
      default: false
    },
    ageRestriction: {
      minimum: {
        type: Number,
        default: 18
      }
    }
  },
  location: {
    nearbyAttractions: [{
      name: String,
      distance: String,
      type: String
    }],
    transportation: [{
      type: String,
      name: String,
      distance: String
    }]
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    images: [String],
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    occupancyRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageDailyRate: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
HotelSchema.index({ business: 1 });
HotelSchema.index({ 'analytics.averageRating': -1 });
HotelSchema.index({ starRating: -1 });
HotelSchema.index({ category: 1 });
HotelSchema.index({ isActive: 1 });
HotelSchema.index({ createdAt: -1 });

// Virtual for total rooms
HotelSchema.virtual('totalRooms').get(function() {
  return this.rooms.reduce((total, room) => total + room.availability.totalRooms, 0);
});

// Virtual for available rooms
HotelSchema.virtual('availableRooms').get(function() {
  return this.rooms.reduce((total, room) => total + room.availability.availableRooms, 0);
});

// Virtual for starting price
HotelSchema.virtual('startingPrice').get(function() {
  if (this.rooms.length === 0) return 0;
  return Math.min(...this.rooms.map(room => room.pricing.basePrice));
});

// Method to check room availability
HotelSchema.methods.checkAvailability = function(roomId, checkIn, checkOut, roomsNeeded = 1) {
  const room = this.rooms.id(roomId);
  if (!room || !room.isActive) return false;

  // Check if enough rooms available
  if (room.availability.availableRooms < roomsNeeded) return false;

  // Check blocked dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  for (let blockedPeriod of room.availability.blockedDates) {
    const blockStart = new Date(blockedPeriod.startDate);
    const blockEnd = new Date(blockedPeriod.endDate);

    // Check if dates overlap with blocked period
    if (checkInDate < blockEnd && checkOutDate > blockStart) {
      return false;
    }
  }

  return true;
};

// Method to calculate room price
HotelSchema.methods.calculateRoomPrice = function(roomId, checkIn, checkOut) {
  const room = this.rooms.id(roomId);
  if (!room) return 0;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

  let totalPrice = 0;
  let currentDate = new Date(checkInDate);

  for (let i = 0; i < nights; i++) {
    let dailyRate = room.pricing.basePrice;

    // Check for seasonal rates
    for (let seasonalRate of room.pricing.seasonalRates) {
      if (seasonalRate.isActive &&
          currentDate >= new Date(seasonalRate.startDate) &&
          currentDate <= new Date(seasonalRate.endDate)) {
        dailyRate = seasonalRate.rate;
        break;
      }
    }

    // Check for weekend rates
    const dayOfWeek = currentDate.getDay();
    if ((dayOfWeek === 5 || dayOfWeek === 6) && room.pricing.weekendRate) {
      dailyRate = room.pricing.weekendRate;
    }

    totalPrice += dailyRate;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add taxes and service fees
  totalPrice += (room.pricing.taxes || 0) * nights;
  totalPrice += (room.pricing.serviceFee || 0) * nights;

  return totalPrice;
};

// Method to update availability
HotelSchema.methods.updateRoomAvailability = function(roomId, change) {
  const room = this.rooms.id(roomId);
  if (room) {
    room.availability.availableRooms += change;
    if (room.availability.availableRooms < 0) {
      room.availability.availableRooms = 0;
    }
    if (room.availability.availableRooms > room.availability.totalRooms) {
      room.availability.availableRooms = room.availability.totalRooms;
    }
  }
};

module.exports = mongoose.model('Hotel', HotelSchema);

