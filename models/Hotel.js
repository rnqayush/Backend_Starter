const mongoose = require('mongoose');

/**
 * Hotel Model
 * Represents a hotel within a website
 */
const hotelSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Location Information
  location: {
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String, required: true }
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    website: { type: String },
    socialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      twitter: { type: String }
    }
  },
  
  // Hotel Details
  starRating: {
    type: Number,
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5'],
    default: 3
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms count is required'],
    min: [1, 'Hotel must have at least 1 room']
  },
  
  // Amenities
  amenities: [{
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    category: {
      type: String,
      enum: ['general', 'room', 'dining', 'recreation', 'business', 'wellness'],
      default: 'general'
    }
  }],
  
  // Policies
  policies: {
    checkIn: {
      time: { type: String, default: '15:00' },
      instructions: { type: String }
    },
    checkOut: {
      time: { type: String, default: '11:00' },
      instructions: { type: String }
    },
    cancellation: {
      policy: { type: String, required: true },
      freeUntil: { type: Number, default: 24 } // hours before check-in
    },
    pets: {
      allowed: { type: Boolean, default: false },
      fee: { type: Number, default: 0 },
      restrictions: { type: String }
    },
    smoking: {
      allowed: { type: Boolean, default: false },
      designatedAreas: { type: String }
    }
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    category: {
      type: String,
      enum: ['exterior', 'lobby', 'room', 'amenity', 'dining', 'other'],
      default: 'other'
    },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Pricing
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // SEO
  seo: {
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    keywords: [{ type: String }]
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

// Indexes for performance
hotelSchema.index({ website: 1, status: 1 });
hotelSchema.index({ 'location.coordinates': '2dsphere' });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ 'priceRange.min': 1, 'priceRange.max': 1 });
hotelSchema.index({ createdAt: -1 });

// Virtual for primary image
hotelSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for available rooms count
hotelSchema.virtual('availableRooms').get(function() {
  // This would be calculated based on current bookings
  return this.totalRooms; // Simplified for now
});

// Methods
hotelSchema.methods.updateStats = async function() {
  // This would calculate stats from bookings
  // Implementation would depend on booking model
  return this;
};

hotelSchema.methods.checkAvailability = async function(checkIn, checkOut, guests) {
  // Implementation would check room availability
  return true; // Simplified for now
};

hotelSchema.methods.addAmenity = function(amenity) {
  this.amenities.push(amenity);
  return this.save();
};

hotelSchema.methods.removeAmenity = function(amenityId) {
  this.amenities.id(amenityId).remove();
  return this.save();
};

// Static methods
hotelSchema.statics.findByWebsite = function(websiteId) {
  return this.find({ website: websiteId, isActive: true });
};

hotelSchema.statics.findNearby = function(latitude, longitude, maxDistance = 10000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

hotelSchema.statics.searchHotels = function(filters = {}) {
  const query = { isActive: true };
  
  if (filters.website) query.website = filters.website;
  if (filters.starRating) query.starRating = { $gte: filters.starRating };
  if (filters.priceMin || filters.priceMax) {
    query['priceRange.min'] = {};
    if (filters.priceMin) query['priceRange.min'].$gte = filters.priceMin;
    if (filters.priceMax) query['priceRange.max'] = { $lte: filters.priceMax };
  }
  if (filters.amenities && filters.amenities.length > 0) {
    query['amenities.name'] = { $in: filters.amenities };
  }
  
  return this.find(query);
};

// Pre-save middleware
hotelSchema.pre('save', function(next) {
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
  
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);

