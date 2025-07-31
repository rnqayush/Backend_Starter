const mongoose = require('mongoose');

/**
 * Auto Service Model
 * Represents automotive services offered by a business
 */
const autoServiceSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Service Category
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'maintenance', 'repair', 'diagnostic', 'inspection', 'tire-service',
      'oil-change', 'brake-service', 'transmission', 'engine-repair',
      'electrical', 'air-conditioning', 'bodywork', 'detailing',
      'towing', 'roadside-assistance', 'custom-work', 'other'
    ],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Service Details
  details: {
    duration: {
      estimated: { type: Number, required: true }, // in minutes
      minimum: { type: Number },
      maximum: { type: Number }
    },
    difficulty: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    warranty: {
      offered: { type: Boolean, default: true },
      duration: { type: Number }, // in days
      coverage: { type: String },
      terms: { type: String }
    },
    requirements: {
      appointment: { type: Boolean, default: true },
      dropOff: { type: Boolean, default: false },
      vehicleAge: { type: String }, // e.g., "All years", "2010 and newer"
      vehicleTypes: [{ type: String }] // e.g., ["car", "truck", "motorcycle"]
    }
  },
  
  // Pricing
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'diagnostic-plus-repair', 'quote-based'],
      required: true
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    hourlyRate: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    priceIncludes: [{ type: String }],
    additionalCosts: [{
      item: { type: String, required: true },
      cost: { type: Number, required: true, min: 0 },
      optional: { type: Boolean, default: false }
    }],
    discounts: [{
      name: { type: String, required: true },
      type: { type: String, enum: ['percentage', 'fixed'], required: true },
      value: { type: Number, required: true },
      conditions: { type: String },
      validUntil: { type: Date }
    }]
  },
  
  // Parts and Materials
  parts: [{
    name: { type: String, required: true },
    partNumber: { type: String },
    brand: { type: String },
    cost: { type: Number, min: 0 },
    markup: { type: Number, default: 0 }, // percentage
    required: { type: Boolean, default: true },
    warranty: {
      duration: { type: Number }, // in days
      coverage: { type: String }
    }
  }],
  
  // Service Process
  process: {
    steps: [{
      order: { type: Number, required: true },
      title: { type: String, required: true },
      description: { type: String },
      estimatedTime: { type: Number }, // in minutes
      required: { type: Boolean, default: true }
    }],
    tools: [{ type: String }],
    equipment: [{ type: String }],
    specialRequirements: { type: String }
  },
  
  // Availability
  availability: {
    daysAvailable: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    hoursAvailable: {
      start: { type: String }, // e.g., '08:00'
      end: { type: String }   // e.g., '17:00'
    },
    advanceBooking: { type: Number, default: 1 }, // days in advance
    maxBookingsPerDay: { type: Number, default: 10 },
    seasonalAvailability: [{
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      available: { type: Boolean, default: true },
      priceMultiplier: { type: Number, default: 1 }
    }]
  },
  
  // Quality and Certifications
  quality: {
    certifications: [{ type: String }],
    standards: [{ type: String }],
    guarantees: [{ type: String }],
    qualityChecks: [{
      name: { type: String, required: true },
      description: { type: String },
      required: { type: Boolean, default: true }
    }]
  },
  
  // Media and Documentation
  media: {
    images: [{
      url: { type: String, required: true },
      alt: { type: String },
      category: { type: String, enum: ['before', 'after', 'process', 'tools', 'parts'] },
      isPrimary: { type: Boolean, default: false }
    }],
    videos: [{
      url: { type: String, required: true },
      title: { type: String },
      description: { type: String },
      type: { type: String, enum: ['tutorial', 'demonstration', 'testimonial'] }
    }],
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['manual', 'specification', 'warranty', 'certificate'] }
    }]
  },
  
  // Customer Reviews and Ratings
  reviews: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    },
    testimonials: [{
      customerName: { type: String, required: true },
      rating: { type: Number, min: 1, max: 5, required: true },
      review: { type: String, required: true },
      serviceDate: { type: Date },
      vehicleInfo: { type: String },
      isPublic: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'seasonal', 'discontinued'],
    default: 'active',
    index: true
  },
  isPopular: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics
  analytics: {
    totalBookings: { type: Number, default: 0 },
    completedServices: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageJobTime: { type: Number, default: 0 }, // in minutes
    customerSatisfaction: { type: Number, default: 0 }, // percentage
    repeatCustomers: { type: Number, default: 0 },
    cancellationRate: { type: Number, default: 0 }, // percentage
    profitMargin: { type: Number, default: 0 }, // percentage
    lastBooked: { type: Date }
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
  },
  
  // Tags and Classifications
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Special Offers
  offers: [{
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['discount', 'package-deal', 'seasonal', 'first-time'] },
    value: { type: Number, min: 0 },
    valueType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    conditions: { type: String },
    isActive: { type: Boolean, default: true }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
autoServiceSchema.index({ website: 1, category: 1 });
autoServiceSchema.index({ website: 1, status: 1 });
autoServiceSchema.index({ 'pricing.basePrice': 1 });
autoServiceSchema.index({ 'reviews.averageRating': -1 });
autoServiceSchema.index({ isPopular: 1, 'reviews.averageRating': -1 });
autoServiceSchema.index({ isFeatured: 1 });
autoServiceSchema.index({ tags: 1 });

// Virtual for primary image
autoServiceSchema.virtual('primaryImage').get(function() {
  const primary = this.media.images.find(img => img.isPrimary);
  return primary || this.media.images[0] || null;
});

// Virtual for total price estimate
autoServiceSchema.virtual('totalPriceEstimate').get(function() {
  let total = this.pricing.basePrice;
  
  // Add required additional costs
  this.pricing.additionalCosts.forEach(cost => {
    if (!cost.optional) {
      total += cost.cost;
    }
  });
  
  return total;
});

// Virtual for estimated completion time
autoServiceSchema.virtual('estimatedTime').get(function() {
  return this.details.duration.estimated;
});

// Methods
autoServiceSchema.methods.addReview = function(customerName, rating, review, serviceDate = null, vehicleInfo = null) {
  this.reviews.testimonials.push({
    customerName,
    rating,
    review,
    serviceDate,
    vehicleInfo,
    createdAt: new Date()
  });
  
  // Update rating distribution
  this.reviews.ratingDistribution[rating] += 1;
  this.reviews.totalReviews += 1;
  
  // Recalculate average rating
  let totalRating = 0;
  for (let i = 1; i <= 5; i++) {
    totalRating += i * this.reviews.ratingDistribution[i];
  }
  this.reviews.averageRating = totalRating / this.reviews.totalReviews;
  
  return this.save();
};

autoServiceSchema.methods.recordBooking = function(revenue = null) {
  this.analytics.totalBookings += 1;
  if (revenue) {
    this.analytics.totalRevenue += revenue;
  }
  this.analytics.lastBooked = new Date();
  return this.save();
};

autoServiceSchema.methods.recordCompletion = function(actualTime = null, revenue = null) {
  this.analytics.completedServices += 1;
  
  if (actualTime) {
    // Update average job time
    const totalTime = this.analytics.averageJobTime * (this.analytics.completedServices - 1) + actualTime;
    this.analytics.averageJobTime = totalTime / this.analytics.completedServices;
  }
  
  if (revenue) {
    this.analytics.totalRevenue += revenue;
  }
  
  return this.save();
};

autoServiceSchema.methods.calculatePrice = function(additionalParts = [], laborHours = null) {
  let total = this.pricing.basePrice;
  
  // Add hourly labor if applicable
  if (this.pricing.type === 'hourly' && laborHours) {
    total = this.pricing.hourlyRate * laborHours;
  }
  
  // Add required additional costs
  this.pricing.additionalCosts.forEach(cost => {
    if (!cost.optional) {
      total += cost.cost;
    }
  });
  
  // Add parts costs
  additionalParts.forEach(part => {
    const servicePart = this.parts.find(p => p.name === part.name);
    if (servicePart) {
      const partCost = servicePart.cost * (1 + servicePart.markup / 100);
      total += partCost * (part.quantity || 1);
    }
  });
  
  return total;
};

autoServiceSchema.methods.checkAvailability = function(date, timeSlot = null) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if service is available on this day
  if (!this.availability.daysAvailable.includes(dayOfWeek)) {
    return false;
  }
  
  // Check seasonal availability
  const isSeasonallyAvailable = this.availability.seasonalAvailability.every(season => {
    if (date >= season.startDate && date <= season.endDate) {
      return season.available;
    }
    return true;
  });
  
  return isSeasonallyAvailable;
};

autoServiceSchema.methods.getActiveOffers = function() {
  const now = new Date();
  return this.offers.filter(offer => 
    offer.isActive && 
    offer.startDate <= now && 
    offer.endDate >= now
  );
};

autoServiceSchema.methods.addStep = function(stepInfo) {
  this.process.steps.push(stepInfo);
  this.process.steps.sort((a, b) => a.order - b.order);
  return this.save();
};

// Static methods
autoServiceSchema.statics.findByWebsite = function(websiteId, status = 'active') {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query);
};

autoServiceSchema.statics.findByCategory = function(websiteId, category) {
  return this.find({
    website: websiteId,
    category,
    status: 'active'
  });
};

autoServiceSchema.statics.searchServices = function(websiteId, filters = {}) {
  const query = { website: websiteId, status: 'active' };
  
  if (filters.category) query.category = filters.category;
  if (filters.maxPrice) query['pricing.basePrice'] = { $lte: filters.maxPrice };
  if (filters.minRating) query['reviews.averageRating'] = { $gte: filters.minRating };
  if (filters.maxDuration) query['details.duration.estimated'] = { $lte: filters.maxDuration };
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.vehicleType) {
    query['details.requirements.vehicleTypes'] = { $in: [filters.vehicleType] };
  }
  
  return this.find(query);
};

autoServiceSchema.statics.getPopularServices = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    isPopular: true
  }).sort({ 'analytics.totalBookings': -1 }).limit(limit);
};

autoServiceSchema.statics.getFeaturedServices = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    isFeatured: true
  }).sort({ 'reviews.averageRating': -1 }).limit(limit);
};

autoServiceSchema.statics.getTopRatedServices = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    'reviews.totalReviews': { $gte: 5 }
  }).sort({ 'reviews.averageRating': -1 }).limit(limit);
};

// Pre-save middleware
autoServiceSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.seo.slug && this.name) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Ensure only one primary image
  if (this.media.images && this.media.images.length > 0) {
    let primaryCount = 0;
    this.media.images.forEach(img => {
      if (img.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      this.media.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let firstPrimary = true;
      this.media.images.forEach(img => {
        if (img.isPrimary && !firstPrimary) {
          img.isPrimary = false;
        } else if (img.isPrimary && firstPrimary) {
          firstPrimary = false;
        }
      });
    }
  }
  
  // Sort process steps by order
  if (this.process.steps && this.process.steps.length > 0) {
    this.process.steps.sort((a, b) => a.order - b.order);
  }
  
  next();
});

module.exports = mongoose.model('AutoService', autoServiceSchema);

