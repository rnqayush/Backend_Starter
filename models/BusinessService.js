const mongoose = require('mongoose');

/**
 * Business Service Model
 * Represents services offered by a general business
 */
const businessServiceSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  description: {
    short: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    long: {
      type: String,
      maxlength: [2000, 'Long description cannot exceed 2000 characters']
    }
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
      'consulting', 'design', 'development', 'marketing', 'legal', 'accounting',
      'healthcare', 'education', 'fitness', 'beauty', 'cleaning', 'maintenance',
      'photography', 'videography', 'writing', 'translation', 'coaching',
      'therapy', 'real-estate', 'insurance', 'financial', 'other'
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
      type: { type: String, enum: ['fixed', 'flexible', 'project-based'], default: 'fixed' },
      value: { type: Number }, // in minutes for fixed, null for flexible
      minimum: { type: Number }, // minimum duration in minutes
      maximum: { type: Number }  // maximum duration in minutes
    },
    deliveryMethod: {
      type: String,
      enum: ['in-person', 'remote', 'hybrid', 'on-site'],
      required: true
    },
    location: {
      type: String,
      enum: ['client-location', 'business-location', 'online', 'flexible'],
      default: 'business-location'
    },
    groupSize: {
      type: String,
      enum: ['individual', 'small-group', 'large-group', 'flexible'],
      default: 'individual'
    },
    maxParticipants: { type: Number, min: 1 },
    requirements: [{ type: String }],
    prerequisites: [{ type: String }]
  },
  
  // Pricing Structure
  pricing: {
    model: {
      type: String,
      enum: ['fixed', 'hourly', 'daily', 'weekly', 'monthly', 'project-based', 'tiered'],
      required: true
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: { type: String, default: 'USD' },
    tiers: [{
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true, min: 0 },
      features: [{ type: String }],
      popular: { type: Boolean, default: false }
    }],
    addOns: [{
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true, min: 0 },
      optional: { type: Boolean, default: true }
    }],
    discounts: [{
      name: { type: String, required: true },
      type: { type: String, enum: ['percentage', 'fixed'], required: true },
      value: { type: Number, required: true },
      conditions: { type: String },
      validUntil: { type: Date }
    }],
    packageDeals: [{
      name: { type: String, required: true },
      description: { type: String },
      services: [{ type: String }], // Service names included
      originalPrice: { type: Number, required: true },
      packagePrice: { type: Number, required: true },
      savings: { type: Number }
    }]
  },
  
  // Availability and Scheduling
  availability: {
    bookingWindow: {
      advance: { type: Number, default: 24 }, // hours in advance
      maximum: { type: Number, default: 90 } // days in advance
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    workingHours: {
      start: { type: String }, // e.g., '09:00'
      end: { type: String }   // e.g., '17:00'
    },
    timeSlots: [{
      start: { type: String, required: true },
      end: { type: String, required: true },
      available: { type: Boolean, default: true }
    }],
    blackoutDates: [{
      date: { type: Date, required: true },
      reason: { type: String },
      recurring: { type: Boolean, default: false }
    }],
    seasonalSchedule: [{
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      workingDays: [{ type: String }],
      workingHours: {
        start: { type: String },
        end: { type: String }
      },
      priceMultiplier: { type: Number, default: 1 }
    }]
  },
  
  // Service Process and Workflow
  process: {
    steps: [{
      order: { type: Number, required: true },
      title: { type: String, required: true },
      description: { type: String },
      estimatedTime: { type: Number }, // in minutes
      required: { type: Boolean, default: true },
      clientInvolvement: { type: String, enum: ['none', 'minimal', 'moderate', 'high'] }
    }],
    deliverables: [{
      name: { type: String, required: true },
      description: { type: String },
      format: { type: String }, // e.g., 'PDF', 'Video', 'Physical Product'
      deliveryMethod: { type: String, enum: ['email', 'download', 'mail', 'in-person'] }
    }],
    followUp: {
      included: { type: Boolean, default: false },
      duration: { type: Number }, // days of follow-up support
      method: { type: String, enum: ['email', 'phone', 'meeting', 'chat'] }
    }
  },
  
  // Media and Portfolio
  media: {
    images: [{
      url: { type: String, required: true },
      alt: { type: String },
      category: { type: String, enum: ['service', 'process', 'result', 'team', 'facility'] },
      isPrimary: { type: Boolean, default: false }
    }],
    videos: [{
      url: { type: String, required: true },
      title: { type: String },
      description: { type: String },
      type: { type: String, enum: ['demo', 'testimonial', 'process', 'introduction'] }
    }],
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, enum: ['brochure', 'case-study', 'whitepaper', 'guide', 'contract'] },
      isPublic: { type: Boolean, default: true }
    }]
  },
  
  // Team and Expertise
  team: [{
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String },
    photo: { type: String },
    qualifications: [{ type: String }],
    experience: { type: Number }, // years of experience
    specialties: [{ type: String }],
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Qualifications and Certifications
  qualifications: {
    certifications: [{
      name: { type: String, required: true },
      issuer: { type: String, required: true },
      dateIssued: { type: Date },
      expiryDate: { type: Date },
      credentialId: { type: String }
    }],
    licenses: [{
      name: { type: String, required: true },
      number: { type: String, required: true },
      issuer: { type: String, required: true },
      expiryDate: { type: Date }
    }],
    awards: [{
      name: { type: String, required: true },
      year: { type: Number },
      organization: { type: String }
    }],
    memberships: [{
      organization: { type: String, required: true },
      membershipType: { type: String },
      since: { type: Date }
    }]
  },
  
  // Client Reviews and Testimonials
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
      clientName: { type: String, required: true },
      clientTitle: { type: String },
      clientCompany: { type: String },
      rating: { type: Number, min: 1, max: 5, required: true },
      review: { type: String, required: true },
      serviceDate: { type: Date },
      isPublic: { type: Boolean, default: true },
      featured: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'coming-soon', 'discontinued'],
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
  
  // Analytics and Performance
  analytics: {
    totalBookings: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageProjectValue: { type: Number, default: 0 },
    clientRetentionRate: { type: Number, default: 0 }, // percentage
    inquiries: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }, // percentage
    averageRating: { type: Number, default: 0 },
    repeatClients: { type: Number, default: 0 },
    referrals: { type: Number, default: 0 },
    lastBooked: { type: Date }
  },
  
  // SEO and Marketing
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
    keywords: [{ type: String }],
    focusKeyword: { type: String }
  },
  
  // Tags and Classifications
  tags: [{ type: String, trim: true, lowercase: true }],
  
  // Special Offers and Promotions
  offers: [{
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['discount', 'free-consultation', 'package-deal', 'seasonal'] },
    value: { type: Number, min: 0 },
    valueType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    conditions: { type: String },
    maxRedemptions: { type: Number },
    currentRedemptions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }],
  
  // FAQ
  faq: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String },
    order: { type: Number, default: 0 }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
businessServiceSchema.index({ website: 1, category: 1 });
businessServiceSchema.index({ website: 1, status: 1 });
businessServiceSchema.index({ 'pricing.basePrice': 1 });
businessServiceSchema.index({ 'reviews.averageRating': -1 });
businessServiceSchema.index({ isPopular: 1, 'reviews.averageRating': -1 });
businessServiceSchema.index({ isFeatured: 1 });
businessServiceSchema.index({ tags: 1 });

// Virtual for primary image
businessServiceSchema.virtual('primaryImage').get(function() {
  const primary = this.media.images.find(img => img.isPrimary);
  return primary || this.media.images[0] || null;
});

// Virtual for primary team member
businessServiceSchema.virtual('primaryTeamMember').get(function() {
  const primary = this.team.find(member => member.isPrimary);
  return primary || this.team[0] || null;
});

// Virtual for popular tier
businessServiceSchema.virtual('popularTier').get(function() {
  return this.pricing.tiers.find(tier => tier.popular) || this.pricing.tiers[0] || null;
});

// Virtual for featured testimonials
businessServiceSchema.virtual('featuredTestimonials').get(function() {
  return this.reviews.testimonials.filter(testimonial => testimonial.featured && testimonial.isPublic);
});

// Methods
businessServiceSchema.methods.addReview = function(clientName, rating, review, serviceDate = null, clientTitle = null, clientCompany = null) {
  this.reviews.testimonials.push({
    clientName,
    clientTitle,
    clientCompany,
    rating,
    review,
    serviceDate,
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
  this.analytics.averageRating = this.reviews.averageRating;
  
  return this.save();
};

businessServiceSchema.methods.recordBooking = function(revenue = null) {
  this.analytics.totalBookings += 1;
  this.analytics.inquiries += 1;
  
  if (revenue) {
    this.analytics.totalRevenue += revenue;
    this.analytics.averageProjectValue = this.analytics.totalRevenue / this.analytics.totalBookings;
  }
  
  this.analytics.lastBooked = new Date();
  this.analytics.conversionRate = this.analytics.inquiries > 0 ? 
    (this.analytics.totalBookings / this.analytics.inquiries) * 100 : 0;
  
  return this.save();
};

businessServiceSchema.methods.recordCompletion = function(revenue = null, isRepeatClient = false) {
  this.analytics.completedProjects += 1;
  
  if (revenue) {
    this.analytics.totalRevenue += revenue;
    this.analytics.averageProjectValue = this.analytics.totalRevenue / this.analytics.completedProjects;
  }
  
  if (isRepeatClient) {
    this.analytics.repeatClients += 1;
  }
  
  // Update client retention rate
  this.analytics.clientRetentionRate = this.analytics.completedProjects > 0 ? 
    (this.analytics.repeatClients / this.analytics.completedProjects) * 100 : 0;
  
  return this.save();
};

businessServiceSchema.methods.recordInquiry = function() {
  this.analytics.inquiries += 1;
  this.analytics.conversionRate = this.analytics.inquiries > 0 ? 
    (this.analytics.totalBookings / this.analytics.inquiries) * 100 : 0;
  
  return this.save();
};

businessServiceSchema.methods.recordReferral = function() {
  this.analytics.referrals += 1;
  return this.save();
};

businessServiceSchema.methods.calculatePrice = function(tierName = null, addOns = []) {
  let basePrice = this.pricing.basePrice;
  
  // Use tier price if specified
  if (tierName) {
    const tier = this.pricing.tiers.find(t => t.name === tierName);
    if (tier) {
      basePrice = tier.price;
    }
  }
  
  // Add selected add-ons
  let addOnsCost = 0;
  addOns.forEach(addOnName => {
    const addOn = this.pricing.addOns.find(a => a.name === addOnName);
    if (addOn) {
      addOnsCost += addOn.price;
    }
  });
  
  return basePrice + addOnsCost;
};

businessServiceSchema.methods.checkAvailability = function(date, timeSlot = null) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Check if service is available on this day
  if (!this.availability.workingDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check blackout dates
  const isBlackedOut = this.availability.blackoutDates.some(blackout => {
    if (blackout.recurring) {
      return blackout.date.getMonth() === date.getMonth() && 
             blackout.date.getDate() === date.getDate();
    }
    return blackout.date.toDateString() === date.toDateString();
  });
  
  if (isBlackedOut) return false;
  
  // Check seasonal schedule
  const seasonalSchedule = this.availability.seasonalSchedule.find(season => 
    date >= season.startDate && date <= season.endDate
  );
  
  if (seasonalSchedule) {
    return seasonalSchedule.workingDays.includes(dayOfWeek);
  }
  
  return true;
};

businessServiceSchema.methods.getActiveOffers = function() {
  const now = new Date();
  return this.offers.filter(offer => 
    offer.isActive && 
    offer.startDate <= now && 
    offer.endDate >= now &&
    (offer.maxRedemptions === undefined || offer.currentRedemptions < offer.maxRedemptions)
  );
};

businessServiceSchema.methods.addTeamMember = function(memberInfo) {
  this.team.push(memberInfo);
  return this.save();
};

businessServiceSchema.methods.addFAQ = function(question, answer, category = null) {
  this.faq.push({ question, answer, category, order: this.faq.length });
  return this.save();
};

// Static methods
businessServiceSchema.statics.findByWebsite = function(websiteId, status = 'active') {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query);
};

businessServiceSchema.statics.findByCategory = function(websiteId, category) {
  return this.find({
    website: websiteId,
    category,
    status: 'active'
  });
};

businessServiceSchema.statics.searchServices = function(websiteId, filters = {}) {
  const query = { website: websiteId, status: 'active' };
  
  if (filters.category) query.category = filters.category;
  if (filters.maxPrice) query['pricing.basePrice'] = { $lte: filters.maxPrice };
  if (filters.minRating) query['reviews.averageRating'] = { $gte: filters.minRating };
  if (filters.deliveryMethod) query['details.deliveryMethod'] = filters.deliveryMethod;
  if (filters.location) query['details.location'] = filters.location;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query);
};

businessServiceSchema.statics.getPopularServices = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    isPopular: true
  }).sort({ 'analytics.totalBookings': -1 }).limit(limit);
};

businessServiceSchema.statics.getFeaturedServices = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    isFeatured: true
  }).sort({ 'reviews.averageRating': -1 }).limit(limit);
};

businessServiceSchema.statics.getTopRatedServices = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    'reviews.totalReviews': { $gte: 5 }
  }).sort({ 'reviews.averageRating': -1 }).limit(limit);
};

// Pre-save middleware
businessServiceSchema.pre('save', function(next) {
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
  
  // Ensure only one primary team member
  if (this.team && this.team.length > 0) {
    let primaryCount = 0;
    this.team.forEach(member => {
      if (member.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      this.team[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let firstPrimary = true;
      this.team.forEach(member => {
        if (member.isPrimary && !firstPrimary) {
          member.isPrimary = false;
        } else if (member.isPrimary && firstPrimary) {
          firstPrimary = false;
        }
      });
    }
  }
  
  // Sort FAQ by order
  if (this.faq && this.faq.length > 0) {
    this.faq.sort((a, b) => a.order - b.order);
  }
  
  // Sort process steps by order
  if (this.process.steps && this.process.steps.length > 0) {
    this.process.steps.sort((a, b) => a.order - b.order);
  }
  
  next();
});

module.exports = mongoose.model('BusinessService', businessServiceSchema);

