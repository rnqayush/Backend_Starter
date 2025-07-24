import mongoose from 'mongoose';
import slugify from 'slugify';

const vendorSchema = new mongoose.Schema({
  // Basic Information
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Business description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  tagline: {
    type: String,
    maxlength: [100, 'Tagline cannot exceed 100 characters']
  },

  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Business Details
  category: {
    type: String,
    required: true,
    enum: [
      'photographer', 'videographer', 'decorator', 'caterer', 'venue',
      'makeup-artist', 'mehendi-artist', 'dj', 'band', 'florist',
      'wedding-planner', 'bridal-wear', 'groom-wear', 'jewelry',
      'invitation-cards', 'transportation', 'priest', 'other'
    ]
  },
  subcategories: [{
    type: String,
    trim: true
  }],
  specializations: [String],

  // Location and Service Areas
  location: {
    address: {
      street: String,
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
      postalCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    serviceAreas: [{
      city: String,
      state: String,
      travelCharge: {
        type: Number,
        default: 0
      }
    }]
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
      youtube: String,
      twitter: String
    }
  },

  // Business Information
  businessInfo: {
    established: Date,
    teamSize: {
      type: Number,
      min: 1
    },
    experience: {
      type: Number,
      min: 0
    },
    languages: [String],
    workingHours: {
      monday: { start: String, end: String, closed: Boolean },
      tuesday: { start: String, end: String, closed: Boolean },
      wednesday: { start: String, end: String, closed: Boolean },
      thursday: { start: String, end: String, closed: Boolean },
      friday: { start: String, end: String, closed: Boolean },
      saturday: { start: String, end: String, closed: Boolean },
      sunday: { start: String, end: String, closed: Boolean }
    }
  },

  // Services and Packages
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: String,
    pricing: {
      type: {
        type: String,
        enum: ['fixed', 'hourly', 'per-event', 'per-person', 'custom'],
        default: 'fixed'
      },
      amount: {
        type: Number,
        min: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      unit: String // e.g., 'per hour', 'per person', 'per event'
    },
    duration: String,
    inclusions: [String],
    exclusions: [String],
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Packages
  packages: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    services: [{
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      name: String,
      included: {
        type: Boolean,
        default: true
      }
    }],
    pricing: {
      amount: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      discount: {
        type: Number,
        default: 0
      }
    },
    duration: String,
    maxGuests: Number,
    inclusions: [String],
    exclusions: [String],
    terms: [String],
    isPopular: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Portfolio
  portfolio: {
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: String,
      category: {
        type: String,
        enum: ['wedding', 'engagement', 'pre-wedding', 'reception', 'ceremony', 'other'],
        default: 'wedding'
      },
      event: String,
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
      category: String,
      event: String,
      duration: Number
    }],
    albums: [{
      name: String,
      description: String,
      coverImage: String,
      images: [String],
      event: String,
      date: Date
    }]
  },

  // Pricing
  pricing: {
    startingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceRange: {
      min: Number,
      max: Number
    },
    paymentTerms: {
      advance: {
        percentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 25
        },
        required: {
          type: Boolean,
          default: true
        }
      },
      cancellation: {
        policy: String,
        refundPercentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 0
        }
      }
    }
  },

  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    bookedDates: [{
      startDate: Date,
      endDate: Date,
      event: String,
      status: {
        type: String,
        enum: ['booked', 'tentative', 'blocked'],
        default: 'booked'
      }
    }],
    blackoutDates: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }],
    advanceBookingDays: {
      type: Number,
      default: 30
    }
  },

  // Reviews and Ratings
  reviews: [{
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeddingBooking'
    },
    rating: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      quality: {
        type: Number,
        min: 1,
        max: 5
      },
      service: {
        type: Number,
        min: 1,
        max: 5
      },
      value: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    title: String,
    comment: String,
    pros: [String],
    cons: [String],
    eventType: String,
    eventDate: Date,
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

  // Certifications and Awards
  credentials: {
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateUrl: String
    }],
    awards: [{
      name: String,
      issuedBy: String,
      year: Number,
      description: String
    }],
    memberships: [{
      organization: String,
      membershipType: String,
      since: Date
    }]
  },

  // FAQs
  faqs: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    category: String,
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Offers and Promotions
  offers: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'package'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true
    },
    terms: [String],
    applicableServices: [String],
    maxRedemptions: {
      type: Number,
      default: null // null means unlimited
    },
    currentRedemptions: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
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

  // Status and Verification
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  },
  verified: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    inquiries: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRevenue: {
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
vendorSchema.index({ owner: 1, status: 1 });
vendorSchema.index({ category: 1, 'location.address.city': 1 });
vendorSchema.index({ featured: 1, status: 1 });
vendorSchema.index({ slug: 1 });
vendorSchema.index({ 'pricing.startingPrice': 1 });
vendorSchema.index({ createdAt: -1 });
vendorSchema.index({ 'analytics.views': -1 });

// Virtual fields
vendorSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating.overall, 0);
  return (sum / this.reviews.length).toFixed(1);
});

vendorSchema.virtual('totalReviews').get(function() {
  return this.reviews.length;
});

vendorSchema.virtual('primaryImage').get(function() {
  const primary = this.portfolio.images.find(img => img.isPrimary);
  return primary || this.portfolio.images[0];
});

vendorSchema.virtual('isAvailable').get(function() {
  return this.availability.status === 'available' && this.status === 'published';
});

// Pre-save middleware
vendorSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('businessName') && !this.slug) {
    this.slug = slugify(this.businessName, { lower: true, strict: true });
  }

  // Update lastModified
  this.lastModified = new Date();

  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Ensure only one primary image
  const primaryImages = this.portfolio.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    this.portfolio.images.forEach((img, index) => {
      img.isPrimary = index === 0;
    });
  } else if (primaryImages.length === 0 && this.portfolio.images.length > 0) {
    this.portfolio.images[0].isPrimary = true;
  }

  // Update analytics
  if (this.reviews.length > 0) {
    this.analytics.averageRating = this.averageRating;
  }

  next();
});

// Static methods
vendorSchema.statics.searchVendors = function(filters = {}) {
  const query = this.find();

  // Text search
  if (filters.search) {
    query.or([
      { businessName: new RegExp(filters.search, 'i') },
      { description: new RegExp(filters.search, 'i') },
      { specializations: new RegExp(filters.search, 'i') },
      { 'location.address.city': new RegExp(filters.search, 'i') }
    ]);
  }

  // Category filter
  if (filters.category) {
    query.where('category', filters.category);
  }

  // Location filter
  if (filters.city) {
    query.where('location.address.city', new RegExp(filters.city, 'i'));
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    const priceFilter = {};
    if (filters.minPrice) priceFilter.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) priceFilter.$lte = parseFloat(filters.maxPrice);
    query.where('pricing.startingPrice', priceFilter);
  }

  // Rating filter
  if (filters.minRating) {
    query.where('analytics.averageRating').gte(parseFloat(filters.minRating));
  }

  // Featured vendors
  if (filters.featured === 'true') {
    query.where('featured', true);
  }

  // Status filter - if no status specified, show published and draft vendors
  if (filters.status) {
    query.where('status', filters.status);
  } else {
    // For public API, show both published and draft vendors by default
    query.where('status').in(['published', 'draft']);
  }

  return query;
};

// Instance methods
vendorSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

vendorSchema.methods.addInquiry = function() {
  this.analytics.inquiries += 1;
  this.analytics.conversionRate = (this.analytics.bookings / this.analytics.inquiries * 100).toFixed(2);
  return this.save();
};

vendorSchema.methods.addBooking = function(revenue = 0) {
  this.analytics.bookings += 1;
  this.analytics.totalRevenue += revenue;
  this.analytics.conversionRate = (this.analytics.bookings / this.analytics.inquiries * 100).toFixed(2);
  return this.save();
};

vendorSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  return this.save();
};

vendorSchema.methods.checkAvailability = function(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check booked dates
  const isBooked = this.availability.bookedDates.some(booking => {
    return (start <= booking.endDate && end >= booking.startDate);
  });

  // Check blackout dates
  const isBlackedOut = this.availability.blackoutDates.some(blackout => {
    return (start <= blackout.endDate && end >= blackout.startDate);
  });

  return !isBooked && !isBlackedOut && this.availability.status === 'available';
};

vendorSchema.methods.blockDates = function(startDate, endDate, reason = 'Booked') {
  this.availability.bookedDates.push({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    event: reason,
    status: 'booked'
  });
  return this.save();
};

export default mongoose.model('WeddingVendor', vendorSchema);
