const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Basic Information
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel ID is required'],
    index: true,
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['single', 'double', 'twin', 'triple', 'quad', 'suite', 'deluxe', 'presidential'],
    lowercase: true,
  },
  title: {
    type: String,
    required: [true, 'Room title is required'],
    trim: true,
    maxlength: [100, 'Room title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true,
    maxlength: [1000, 'Room description cannot exceed 1000 characters'],
  },

  // Capacity
  maxOccupancy: {
    type: Number,
    required: [true, 'Maximum occupancy is required'],
    min: [1, 'Maximum occupancy must be at least 1'],
    max: [20, 'Maximum occupancy cannot exceed 20'],
  },
  bedConfiguration: {
    singleBeds: { type: Number, default: 0, min: 0 },
    doubleBeds: { type: Number, default: 0, min: 0 },
    queenBeds: { type: Number, default: 0, min: 0 },
    kingBeds: { type: Number, default: 0, min: 0 },
    sofaBeds: { type: Number, default: 0, min: 0 },
  },

  // Pricing
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
  },
  seasonalPricing: [{
    season: {
      type: String,
      required: true,
      enum: ['peak', 'high', 'low', 'off'],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    priceMultiplier: {
      type: Number,
      required: true,
      min: [0.1, 'Price multiplier must be at least 0.1'],
      max: [5, 'Price multiplier cannot exceed 5'],
    },
  }],

  // Room Details
  size: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' },
  },
  floor: {
    type: Number,
    min: [-5, 'Floor cannot be below -5'],
    max: [200, 'Floor cannot exceed 200'],
  },
  view: {
    type: String,
    enum: ['city', 'ocean', 'mountain', 'garden', 'pool', 'courtyard', 'street', 'none'],
    default: 'none',
  },

  // Amenities
  amenities: {
    basic: {
      airConditioning: { type: Boolean, default: false },
      heating: { type: Boolean, default: false },
      wifi: { type: Boolean, default: true },
      television: { type: Boolean, default: true },
      telephone: { type: Boolean, default: false },
      minibar: { type: Boolean, default: false },
      safe: { type: Boolean, default: false },
      ironingBoard: { type: Boolean, default: false },
    },
    bathroom: {
      privateBathroom: { type: Boolean, default: true },
      bathtub: { type: Boolean, default: false },
      shower: { type: Boolean, default: true },
      hairdryer: { type: Boolean, default: true },
      toiletries: { type: Boolean, default: true },
      towels: { type: Boolean, default: true },
    },
    comfort: {
      balcony: { type: Boolean, default: false },
      terrace: { type: Boolean, default: false },
      seatingArea: { type: Boolean, default: false },
      workDesk: { type: Boolean, default: false },
      wardrobe: { type: Boolean, default: true },
      slippers: { type: Boolean, default: false },
      bathrobes: { type: Boolean, default: false },
    },
    technology: {
      smartTV: { type: Boolean, default: false },
      streamingServices: { type: Boolean, default: false },
      bluetoothSpeaker: { type: Boolean, default: false },
      usbPorts: { type: Boolean, default: false },
      wirelessCharging: { type: Boolean, default: false },
    },
  },

  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  }],
  virtualTour: {
    url: String,
    provider: { type: String, enum: ['matterport', '360', 'custom'] },
  },

  // Availability & Status
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true,
  },
  maintenanceStatus: {
    type: String,
    enum: ['available', 'maintenance', 'renovation', 'out_of_order'],
    default: 'available',
    index: true,
  },
  unavailableDates: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { 
      type: String, 
      enum: ['booked', 'maintenance', 'blocked', 'renovation'],
      required: true 
    },
  }],

  // Booking Rules
  bookingRules: {
    minStay: { type: Number, default: 1, min: 1 },
    maxStay: { type: Number, default: 30, min: 1 },
    advanceBooking: { type: Number, default: 365, min: 0 }, // days
    checkInTime: { type: String, default: '15:00' },
    checkOutTime: { type: String, default: '11:00' },
    allowSameDay: { type: Boolean, default: true },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict', 'super_strict'],
      default: 'moderate',
    },
  },

  // Statistics
  stats: {
    totalBookings: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0, min: 0 },
    occupancyRate: { type: Number, default: 0, min: 0, max: 100 },
    lastBooked: Date,
  },

  // SEO & Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  tags: [String],
  specialOffers: [{
    title: String,
    description: String,
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: Number,
    validFrom: Date,
    validTo: Date,
    isActive: { type: Boolean, default: true },
  }],

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
roomSchema.index({ hotelId: 1, roomType: 1 });
roomSchema.index({ hotelId: 1, isActive: 1, isAvailable: 1 });
roomSchema.index({ basePrice: 1 });
roomSchema.index({ 'stats.averageRating': -1 });
roomSchema.index({ createdAt: -1 });

// Compound index for availability queries
roomSchema.index({
  hotelId: 1,
  isActive: 1,
  isAvailable: 1,
  maintenanceStatus: 1,
});

// Virtual for current price (considering discounts)
roomSchema.virtual('currentPrice').get(function() {
  if (this.discountPercentage > 0) {
    return this.basePrice * (1 - this.discountPercentage / 100);
  }
  return this.basePrice;
});

// Virtual for total beds
roomSchema.virtual('totalBeds').get(function() {
  const beds = this.bedConfiguration;
  return beds.singleBeds + beds.doubleBeds + beds.queenBeds + beds.kingBeds + beds.sofaBeds;
});

// Virtual for primary image
roomSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Pre-save middleware
roomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach((img, index) => {
      if (img.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          img.isPrimary = false;
        }
      }
    });
    
    // If no primary image, make the first one primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Instance methods
roomSchema.methods.isAvailableForDates = function(checkIn, checkOut) {
  // Check if room is active and available
  if (!this.isActive || !this.isAvailable || this.maintenanceStatus !== 'available') {
    return false;
  }

  // Check against unavailable dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  for (const unavailable of this.unavailableDates) {
    const unavailableStart = new Date(unavailable.startDate);
    const unavailableEnd = new Date(unavailable.endDate);

    // Check for date overlap
    if (checkInDate < unavailableEnd && checkOutDate > unavailableStart) {
      return false;
    }
  }

  return true;
};

roomSchema.methods.getPriceForDates = function(checkIn, checkOut) {
  let price = this.currentPrice;
  
  // Apply seasonal pricing if applicable
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  for (const seasonal of this.seasonalPricing) {
    const seasonStart = new Date(seasonal.startDate);
    const seasonEnd = new Date(seasonal.endDate);
    
    // Check if dates overlap with seasonal pricing
    if (checkInDate < seasonEnd && checkOutDate > seasonStart) {
      price *= seasonal.priceMultiplier;
      break; // Apply first matching seasonal price
    }
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

roomSchema.methods.addUnavailableDates = function(startDate, endDate, reason) {
  this.unavailableDates.push({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason: reason || 'blocked',
  });
  return this.save();
};

roomSchema.methods.removeUnavailableDates = function(startDate, endDate) {
  this.unavailableDates = this.unavailableDates.filter(unavailable => {
    const unavailableStart = new Date(unavailable.startDate);
    const unavailableEnd = new Date(unavailable.endDate);
    const removeStart = new Date(startDate);
    const removeEnd = new Date(endDate);
    
    // Keep dates that don't match the removal criteria
    return !(unavailableStart.getTime() === removeStart.getTime() && 
             unavailableEnd.getTime() === removeEnd.getTime());
  });
  return this.save();
};

// Static methods
roomSchema.statics.findAvailableRooms = function(hotelId, checkIn, checkOut, guests) {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  return this.find({
    hotelId: hotelId,
    isActive: true,
    isAvailable: true,
    maintenanceStatus: 'available',
    maxOccupancy: { $gte: guests || 1 },
    unavailableDates: {
      $not: {
        $elemMatch: {
          startDate: { $lt: checkOutDate },
          endDate: { $gt: checkInDate },
        }
      }
    }
  }).populate('hotelId', 'name location');
};

roomSchema.statics.getRoomsByType = function(hotelId, roomType) {
  return this.find({
    hotelId: hotelId,
    roomType: roomType,
    isActive: true,
  }).sort({ roomNumber: 1 });
};

module.exports = mongoose.model('Room', roomSchema);
