import mongoose from 'mongoose';
import slugify from 'slugify';

const hotelSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [200, 'Hotel name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Hotel Details
  category: {
    type: String,
    required: true,
    enum: ['budget', 'mid-range', 'luxury', 'resort', 'boutique', 'business', 'extended-stay', 'hostel']
  },
  starRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['hotel', 'resort', 'motel', 'inn', 'lodge', 'guesthouse', 'hostel', 'apartment', 'villa'],
    default: 'hotel'
  },

  // Location
  location: {
    address: {
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true,
        default: 'India'
      },
      postalCode: {
        type: String,
        required: true
      }
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    landmarks: [String],
    distanceFromAirport: {
      value: Number,
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      }
    },
    distanceFromRailway: {
      value: Number,
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      }
    }
  },

  // Contact Information
  contact: {
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String
    }
  },

  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    category: {
      type: String,
      enum: ['exterior', 'lobby', 'room', 'restaurant', 'amenity', 'other'],
      default: 'other'
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
  videos: [{
    url: String,
    title: String,
    thumbnail: String,
    category: String
  }],

  // Amenities and Services
  amenities: {
    general: [{
      type: String,
      enum: [
        'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar',
        'room-service', 'laundry', 'concierge', 'business-center',
        'conference-rooms', 'airport-shuttle', 'pet-friendly',
        'wheelchair-accessible', 'elevator', 'air-conditioning'
      ]
    }],
    room: [{
      type: String,
      enum: [
        'tv', 'minibar', 'safe', 'balcony', 'kitchenette', 'coffee-maker',
        'hair-dryer', 'iron', 'bathrobe', 'slippers', 'toiletries'
      ]
    }],
    dining: [{
      type: String,
      enum: [
        'breakfast', 'lunch', 'dinner', 'room-service', 'bar',
        'coffee-shop', 'buffet', 'a-la-carte', 'vegetarian-options',
        'vegan-options', 'halal-options'
      ]
    }],
    recreation: [{
      type: String,
      enum: [
        'swimming-pool', 'gym', 'spa', 'sauna', 'jacuzzi', 'tennis-court',
        'golf-course', 'kids-club', 'playground', 'game-room',
        'library', 'garden', 'terrace'
      ]
    }]
  },

  // Policies
  policies: {
    checkIn: {
      time: {
        type: String,
        default: '14:00'
      },
      instructions: String
    },
    checkOut: {
      time: {
        type: String,
        default: '11:00'
      },
      instructions: String
    },
    cancellation: {
      type: String,
      enum: ['flexible', 'moderate', 'strict', 'super-strict'],
      default: 'moderate'
    },
    children: {
      allowed: {
        type: Boolean,
        default: true
      },
      ageLimit: Number,
      extraBedCharge: Number
    },
    pets: {
      allowed: {
        type: Boolean,
        default: false
      },
      charge: Number,
      restrictions: String
    },
    smoking: {
      allowed: {
        type: Boolean,
        default: false
      },
      areas: [String]
    },
    payment: {
      methods: [{
        type: String,
        enum: ['cash', 'credit-card', 'debit-card', 'upi', 'net-banking', 'wallet']
      }],
      advancePayment: {
        required: {
          type: Boolean,
          default: false
        },
        percentage: {
          type: Number,
          min: 0,
          max: 100
        }
      }
    }
  },

  // Pricing
  pricing: {
    currency: {
      type: String,
      default: 'INR'
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    taxes: {
      gst: {
        type: Number,
        default: 12
      },
      serviceTax: {
        type: Number,
        default: 0
      }
    },
    extraCharges: {
      extraBed: Number,
      extraPerson: Number,
      pet: Number,
      parking: Number
    }
  },

  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'fully-booked', 'maintenance', 'closed'],
      default: 'available'
    },
    seasonalRates: [{
      name: String,
      startDate: Date,
      endDate: Date,
      multiplier: {
        type: Number,
        default: 1
      }
    }],
    blackoutDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },

  // Reviews and Ratings
  reviews: [{
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    rating: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      service: {
        type: Number,
        min: 1,
        max: 5
      },
      location: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      amenities: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    title: String,
    comment: String,
    pros: [String],
    cons: [String],
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      count: {
        type: Number,
        default: 0
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    response: {
      message: String,
      respondedAt: Date,
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // SEO
  seo: {
    title: String,
    description: String,
    keywords: [String],
    canonicalUrl: String
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageStay: {
      type: Number,
      default: 0
    },
    repeatGuests: {
      type: Number,
      default: 0
    }
  },

  // Timestamps
  publishedAt: Date,
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
hotelSchema.index({ owner: 1, status: 1 });
hotelSchema.index({ 'location.address.city': 1, status: 1 });
hotelSchema.index({ category: 1, starRating: 1 });
hotelSchema.index({ featured: 1, status: 1 });
hotelSchema.index({ slug: 1 });
hotelSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
hotelSchema.index({ createdAt: -1 });
hotelSchema.index({ 'analytics.views': -1 });

// Virtual fields
hotelSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating.overall, 0);
  return (sum / this.reviews.length).toFixed(1);
});

hotelSchema.virtual('totalReviews').get(function() {
  return this.reviews.length;
});

hotelSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

hotelSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
});

hotelSchema.virtual('priceWithTax').get(function() {
  const basePrice = this.pricing.basePrice;
  const gst = (basePrice * this.pricing.taxes.gst) / 100;
  const serviceTax = (basePrice * this.pricing.taxes.serviceTax) / 100;
  return basePrice + gst + serviceTax;
});

hotelSchema.virtual('rooms', {
  ref: 'Room',
  localField: '_id',
  foreignField: 'hotel'
});

// Pre-save middleware
hotelSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Update lastModified
  this.lastModified = new Date();

  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Ensure only one primary image
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    this.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  }

  next();
});

// Static methods
hotelSchema.statics.searchHotels = function(filters = {}) {
  const query = this.find();

  // Text search
  if (filters.search) {
    query.or([
      { name: new RegExp(filters.search, 'i') },
      { description: new RegExp(filters.search, 'i') },
      { 'location.address.city': new RegExp(filters.search, 'i') },
      { 'location.landmarks': new RegExp(filters.search, 'i') }
    ]);
  }

  // Location filter
  if (filters.city) {
    query.where('location.address.city', new RegExp(filters.city, 'i'));
  }

  // Category filter
  if (filters.category) {
    query.where('category', filters.category);
  }

  // Star rating filter
  if (filters.minRating) {
    query.where('starRating').gte(parseInt(filters.minRating));
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {};
    if (filters.minPrice) priceFilter.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) priceFilter.$lte = parseFloat(filters.maxPrice);
    query.where('pricing.basePrice', priceFilter);
  }

  // Amenities filter
  if (filters.amenities) {
    const amenitiesList = Array.isArray(filters.amenities) ? filters.amenities : [filters.amenities];
    query.where('amenities.general').in(amenitiesList);
  }

  // Featured hotels
  if (filters.featured === 'true') {
    query.where('featured', true);
  }

  // Status filter
  query.where('status', filters.status || 'published');

  return query;
};

// Instance methods
hotelSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

hotelSchema.methods.addBooking = function() {
  this.analytics.bookings += 1;
  this.analytics.conversionRate = (this.analytics.bookings / this.analytics.views * 100).toFixed(2);
  return this.save();
};

hotelSchema.methods.addInquiry = function() {
  this.analytics.inquiries += 1;
  return this.save();
};

hotelSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  return this.save();
};

hotelSchema.methods.updateAvailability = function(status, dates = null) {
  this.availability.status = status;
  if (dates && status === 'maintenance') {
    this.availability.blackoutDates.push({
      startDate: dates.start,
      endDate: dates.end,
      reason: 'Maintenance'
    });
  }
  return this.save();
};

hotelSchema.methods.calculatePrice = function(checkIn, checkOut, guests = 1) {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  let basePrice = this.pricing.basePrice * nights;

  // Apply seasonal rates
  const checkInDate = new Date(checkIn);
  const seasonalRate = this.availability.seasonalRates.find(rate => 
    checkInDate >= rate.startDate && checkInDate <= rate.endDate
  );

  if (seasonalRate) {
    basePrice *= seasonalRate.multiplier;
  }

  // Add extra person charges
  if (guests > 2) {
    basePrice += (guests - 2) * this.pricing.extraCharges.extraPerson * nights;
  }

  // Calculate taxes
  const gst = (basePrice * this.pricing.taxes.gst) / 100;
  const serviceTax = (basePrice * this.pricing.taxes.serviceTax) / 100;

  return {
    basePrice,
    gst,
    serviceTax,
    total: basePrice + gst + serviceTax,
    nights,
    pricePerNight: this.pricing.basePrice
  };
};

export default mongoose.model('Hotel', hotelSchema);

