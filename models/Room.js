const mongoose = require('mongoose');

/**
 * Room Model
 * Represents individual rooms within a hotel
 */
const roomSchema = new mongoose.Schema({
  // Basic Information
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: [true, 'Hotel reference is required'],
    index: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Room Type and Category
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['standard', 'deluxe', 'suite', 'presidential', 'family', 'accessible'],
    index: true
  },
  category: {
    type: String,
    enum: ['economy', 'standard', 'premium', 'luxury'],
    default: 'standard'
  },
  
  // Room Specifications
  specifications: {
    size: {
      value: { type: Number, required: true }, // in square feet/meters
      unit: { type: String, enum: ['sqft', 'sqm'], default: 'sqft' }
    },
    bedConfiguration: [{
      type: {
        type: String,
        enum: ['single', 'double', 'queen', 'king', 'sofa-bed', 'bunk'],
        required: true
      },
      count: { type: Number, required: true, min: 1 }
    }],
    maxOccupancy: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0 },
      total: { type: Number, required: true, min: 1 }
    },
    bathrooms: { type: Number, default: 1, min: 1 },
    floor: { type: Number },
    view: {
      type: String,
      enum: ['city', 'ocean', 'mountain', 'garden', 'pool', 'courtyard', 'none'],
      default: 'none'
    }
  },
  
  // Amenities
  amenities: [{
    name: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['comfort', 'technology', 'bathroom', 'entertainment', 'convenience'],
      default: 'comfort'
    }
  }],
  
  // Pricing
  pricing: {
    baseRate: {
      type: Number,
      required: [true, 'Base rate is required'],
      min: [0, 'Base rate cannot be negative']
    },
    currency: { type: String, default: 'USD' },
    seasonalRates: [{
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      rate: { type: Number, required: true },
      isActive: { type: Boolean, default: true }
    }],
    weekendSurcharge: { type: Number, default: 0 },
    holidaySurcharge: { type: Number, default: 0 }
  },
  
  // Availability
  availability: {
    isAvailable: { type: Boolean, default: true, index: true },
    maintenanceSchedule: [{
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, required: true },
      isActive: { type: Boolean, default: true }
    }],
    blockedDates: [{
      date: { type: Date, required: true },
      reason: { type: String },
      isActive: { type: Boolean, default: true }
    }]
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    category: {
      type: String,
      enum: ['room', 'bathroom', 'view', 'amenity', 'other'],
      default: 'room'
    },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'out-of-order'],
    default: 'available',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Housekeeping
  housekeeping: {
    lastCleaned: { type: Date },
    cleaningStatus: {
      type: String,
      enum: ['clean', 'dirty', 'out-of-order', 'maintenance'],
      default: 'clean'
    },
    inspectionStatus: {
      type: String,
      enum: ['passed', 'failed', 'pending'],
      default: 'pending'
    },
    notes: { type: String }
  },
  
  // Analytics
  stats: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 },
    lastBooking: { type: Date }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
roomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });
roomSchema.index({ hotel: 1, type: 1 });
roomSchema.index({ hotel: 1, status: 1 });
roomSchema.index({ 'pricing.baseRate': 1 });
roomSchema.index({ 'specifications.maxOccupancy.total': 1 });

// Virtual for current rate
roomSchema.virtual('currentRate').get(function() {
  const now = new Date();
  const activeSeasonalRate = this.pricing.seasonalRates.find(rate => 
    rate.isActive && 
    now >= rate.startDate && 
    now <= rate.endDate
  );
  
  return activeSeasonalRate ? activeSeasonalRate.rate : this.pricing.baseRate;
});

// Virtual for primary image
roomSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for bed count
roomSchema.virtual('totalBeds').get(function() {
  return this.specifications.bedConfiguration.reduce((total, bed) => total + bed.count, 0);
});

// Methods
roomSchema.methods.checkAvailability = async function(checkIn, checkOut) {
  if (!this.availability.isAvailable || !this.isActive) {
    return false;
  }
  
  // Check maintenance schedule
  const hasMaintenanceConflict = this.availability.maintenanceSchedule.some(maintenance => 
    maintenance.isActive &&
    ((checkIn >= maintenance.startDate && checkIn <= maintenance.endDate) ||
     (checkOut >= maintenance.startDate && checkOut <= maintenance.endDate) ||
     (checkIn <= maintenance.startDate && checkOut >= maintenance.endDate))
  );
  
  if (hasMaintenanceConflict) return false;
  
  // Check blocked dates
  const hasBlockedDateConflict = this.availability.blockedDates.some(blocked => 
    blocked.isActive &&
    checkIn <= blocked.date && checkOut >= blocked.date
  );
  
  if (hasBlockedDateConflict) return false;
  
  // Check existing bookings (would need to query HotelBooking model)
  // This is simplified for now
  return true;
};

roomSchema.methods.calculateRate = function(checkIn, checkOut) {
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  let totalRate = 0;
  
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    
    let dailyRate = this.pricing.baseRate;
    
    // Check for seasonal rates
    const seasonalRate = this.pricing.seasonalRates.find(rate => 
      rate.isActive && 
      currentDate >= rate.startDate && 
      currentDate <= rate.endDate
    );
    
    if (seasonalRate) {
      dailyRate = seasonalRate.rate;
    }
    
    // Add weekend surcharge
    const dayOfWeek = currentDate.getDay();
    if ((dayOfWeek === 5 || dayOfWeek === 6) && this.pricing.weekendSurcharge > 0) {
      dailyRate += this.pricing.weekendSurcharge;
    }
    
    totalRate += dailyRate;
  }
  
  return totalRate;
};

roomSchema.methods.updateHousekeepingStatus = function(status, notes = '') {
  this.housekeeping.cleaningStatus = status;
  this.housekeeping.lastCleaned = status === 'clean' ? new Date() : this.housekeeping.lastCleaned;
  this.housekeeping.notes = notes;
  return this.save();
};

roomSchema.methods.addMaintenance = function(startDate, endDate, reason) {
  this.availability.maintenanceSchedule.push({
    startDate,
    endDate,
    reason,
    isActive: true
  });
  return this.save();
};

// Static methods
roomSchema.statics.findByHotel = function(hotelId) {
  return this.find({ hotel: hotelId, isActive: true });
};

roomSchema.statics.findAvailableRooms = function(hotelId, checkIn, checkOut, guests) {
  return this.find({
    hotel: hotelId,
    isActive: true,
    'availability.isAvailable': true,
    'specifications.maxOccupancy.total': { $gte: guests }
  });
};

roomSchema.statics.findByType = function(hotelId, type) {
  return this.find({ hotel: hotelId, type, isActive: true });
};

// Pre-save middleware
roomSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(img => {
      if (img.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let firstPrimary = true;
      this.images.forEach(img => {
        if (img.isPrimary && !firstPrimary) {
          img.isPrimary = false;
        } else if (img.isPrimary && firstPrimary) {
          firstPrimary = false;
        }
      });
    }
  }
  
  // Calculate total max occupancy
  if (this.specifications.maxOccupancy.adults && this.specifications.maxOccupancy.children !== undefined) {
    this.specifications.maxOccupancy.total = this.specifications.maxOccupancy.adults + this.specifications.maxOccupancy.children;
  }
  
  next();
});

module.exports = mongoose.model('Room', roomSchema);

