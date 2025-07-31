const mongoose = require('mongoose');

/**
 * Wedding Vendor Model
 * Represents wedding service vendors
 */
const weddingVendorSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters']
  },
  businessName: {
    type: String,
    trim: true,
    maxlength: [150, 'Business name cannot exceed 150 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Vendor Category
  category: {
    type: String,
    required: [true, 'Vendor category is required'],
    enum: [
      'photographer', 'videographer', 'florist', 'caterer', 'venue', 
      'dj', 'band', 'decorator', 'makeup-artist', 'hair-stylist',
      'wedding-planner', 'officiant', 'transportation', 'baker',
      'jeweler', 'dress-designer', 'suit-tailor', 'invitation-designer',
      'lighting', 'security', 'other'
    ],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Contact Information
  contact: {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    alternatePhone: { type: String },
    website: { type: String },
    socialMedia: {
      instagram: { type: String },
      facebook: { type: String },
      pinterest: { type: String },
      youtube: { type: String }
    }
  },
  
  // Location and Service Area
  location: {
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String }
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    serviceRadius: { type: Number, default: 50 }, // in miles/km
    serviceAreas: [{ type: String }] // Cities/regions they serve
  },
  
  // Services and Pricing
  services: [{
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    pricing: {
      type: { type: String, enum: ['fixed', 'hourly', 'per-person', 'package', 'custom'], required: true },
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' },
      unit: { type: String }, // e.g., 'per hour', 'per person', 'per event'
      notes: { type: String }
    },
    duration: { type: String }, // e.g., '4 hours', 'full day'
    included: [{ type: String }], // What's included in the service
    addOns: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String }
    }]
  }],
  
  // Packages
  packages: [{
    name: { type: String, required: true },
    description: { type: String },
    services: [{ type: String }], // Service names included
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    duration: { type: String },
    maxGuests: { type: Number },
    included: [{ type: String }],
    popular: { type: Boolean, default: false }
  }],
  
  // Availability
  availability: {
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workingHours: {
      start: { type: String }, // e.g., '09:00'
      end: { type: String }   // e.g., '18:00'
    },
    advanceBooking: { type: Number, default: 30 }, // days in advance
    blackoutDates: [{
      date: { type: Date, required: true },
      reason: { type: String }
    }],
    seasonalAvailability: [{
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      available: { type: Boolean, default: true },
      priceMultiplier: { type: Number, default: 1 }
    }]
  },
  
  // Portfolio and Media
  portfolio: {
    images: [{
      url: { type: String, required: true },
      alt: { type: String },
      category: { type: String }, // e.g., 'ceremony', 'reception', 'portraits'
      isPrimary: { type: Boolean, default: false },
      caption: { type: String }
    }],
    videos: [{
      url: { type: String, required: true },
      title: { type: String },
      description: { type: String },
      thumbnail: { type: String }
    }],
    testimonials: [{
      clientName: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      review: { type: String, required: true },
      weddingDate: { type: Date },
      isPublic: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Credentials and Experience
  credentials: {
    yearsExperience: { type: Number, min: 0 },
    certifications: [{ type: String }],
    awards: [{
      name: { type: String, required: true },
      year: { type: Number },
      organization: { type: String }
    }],
    education: [{
      institution: { type: String, required: true },
      degree: { type: String },
      year: { type: Number }
    }],
    insurance: {
      liability: { type: Boolean, default: false },
      amount: { type: Number },
      expiryDate: { type: Date }
    }
  },
  
  // Policies
  policies: {
    cancellation: {
      policy: { type: String, required: true },
      refundPercentage: { type: Number, min: 0, max: 100 },
      timeframe: { type: Number } // days before event
    },
    payment: {
      depositRequired: { type: Boolean, default: true },
      depositPercentage: { type: Number, min: 0, max: 100, default: 50 },
      paymentSchedule: [{ type: String }],
      acceptedMethods: [{ type: String }]
    },
    contract: {
      requiresContract: { type: Boolean, default: true },
      contractTemplate: { type: String }
    }
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending-approval', 'suspended'],
    default: 'pending-approval',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics and Performance
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedEvents: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 }, // percentage
    responseTime: { type: Number, default: 0 }, // hours
    lastBooking: { type: Date }
  },
  
  // SEO
  seo: {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    metaTitle: { type: String, maxlength: 60 },
    metaDescription: { type: String, maxlength: 160 },
    keywords: [{ type: String }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
weddingVendorSchema.index({ website: 1, category: 1 });
weddingVendorSchema.index({ website: 1, status: 1 });
weddingVendorSchema.index({ 'location.coordinates': '2dsphere' });
weddingVendorSchema.index({ 'stats.averageRating': -1 });
weddingVendorSchema.index({ isFeatured: 1, 'stats.averageRating': -1 });
weddingVendorSchema.index({ 'location.serviceAreas': 1 });

// Virtual for primary image
weddingVendorSchema.virtual('primaryImage').get(function() {
  const primary = this.portfolio.images.find(img => img.isPrimary);
  return primary || this.portfolio.images[0] || null;
});

// Virtual for starting price
weddingVendorSchema.virtual('startingPrice').get(function() {
  let minPrice = Infinity;
  
  this.services.forEach(service => {
    if (service.pricing.amount && service.pricing.amount < minPrice) {
      minPrice = service.pricing.amount;
    }
  });
  
  this.packages.forEach(package => {
    if (package.price && package.price < minPrice) {
      minPrice = package.price;
    }
  });
  
  return minPrice === Infinity ? null : minPrice;
});

// Virtual for full address
weddingVendorSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.city}, ${addr.state}, ${addr.country}`;
});

// Methods
weddingVendorSchema.methods.checkAvailability = function(eventDate) {
  // Check if date is in blackout dates
  const isBlackedOut = this.availability.blackoutDates.some(blackout => 
    blackout.date.toDateString() === eventDate.toDateString()
  );
  
  if (isBlackedOut) return false;
  
  // Check day of week availability
  const dayOfWeek = eventDate.toLocaleLowerCase().substring(0, 3) + 
                   eventDate.toLocaleLowerCase().substring(3);
  
  return this.availability.workingDays.includes(dayOfWeek);
};

weddingVendorSchema.methods.addTestimonial = function(clientName, rating, review, weddingDate = null) {
  this.portfolio.testimonials.push({
    clientName,
    rating,
    review,
    weddingDate,
    createdAt: new Date()
  });
  
  // Update average rating
  this.updateRating();
  
  return this.save();
};

weddingVendorSchema.methods.updateRating = function() {
  const testimonials = this.portfolio.testimonials;
  if (testimonials.length === 0) {
    this.stats.averageRating = 0;
    this.stats.totalReviews = 0;
    return;
  }
  
  const totalRating = testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
  this.stats.averageRating = totalRating / testimonials.length;
  this.stats.totalReviews = testimonials.length;
};

weddingVendorSchema.methods.incrementViews = function() {
  this.stats.profileViews += 1;
  return this.save();
};

weddingVendorSchema.methods.recordInquiry = function() {
  this.stats.inquiries += 1;
  return this.save();
};

weddingVendorSchema.methods.recordBooking = function(revenue) {
  this.stats.totalBookings += 1;
  this.stats.totalRevenue += revenue;
  this.stats.lastBooking = new Date();
  return this.save();
};

weddingVendorSchema.methods.getServicesByCategory = function(category) {
  return this.services.filter(service => service.category === category);
};

weddingVendorSchema.methods.getPopularPackages = function() {
  return this.packages.filter(package => package.popular);
};

// Static methods
weddingVendorSchema.statics.findByWebsite = function(websiteId, status = 'active') {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query);
};

weddingVendorSchema.statics.findByCategory = function(websiteId, category) {
  return this.find({
    website: websiteId,
    category,
    status: 'active'
  });
};

weddingVendorSchema.statics.findNearby = function(latitude, longitude, maxDistance = 50000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

weddingVendorSchema.statics.searchVendors = function(websiteId, filters = {}) {
  const query = { website: websiteId, status: 'active' };
  
  if (filters.category) query.category = filters.category;
  if (filters.location) query['location.serviceAreas'] = { $in: [filters.location] };
  if (filters.minRating) query['stats.averageRating'] = { $gte: filters.minRating };
  if (filters.maxPrice) {
    query.$or = [
      { 'services.pricing.amount': { $lte: filters.maxPrice } },
      { 'packages.price': { $lte: filters.maxPrice } }
    ];
  }
  if (filters.verified) query.isVerified = true;
  
  return this.find(query);
};

weddingVendorSchema.statics.getFeaturedVendors = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    isFeatured: true
  }).sort({ 'stats.averageRating': -1 }).limit(limit);
};

weddingVendorSchema.statics.getTopRatedVendors = function(websiteId, category = null, limit = 10) {
  const query = {
    website: websiteId,
    status: 'active',
    'stats.totalReviews': { $gte: 5 }
  };
  
  if (category) query.category = category;
  
  return this.find(query)
    .sort({ 'stats.averageRating': -1, 'stats.totalReviews': -1 })
    .limit(limit);
};

// Pre-save middleware
weddingVendorSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Ensure only one primary image
  if (this.portfolio.images && this.portfolio.images.length > 0) {
    let primaryCount = 0;
    this.portfolio.images.forEach(img => {
      if (img.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      this.portfolio.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let firstPrimary = true;
      this.portfolio.images.forEach(img => {
        if (img.isPrimary && !firstPrimary) {
          img.isPrimary = false;
        } else if (img.isPrimary && firstPrimary) {
          firstPrimary = false;
        }
      });
    }
  }
  
  // Update rating statistics
  this.updateRating();
  
  next();
});

module.exports = mongoose.model('WeddingVendor', weddingVendorSchema);

