import mongoose from 'mongoose';
import slugify from 'slugify';

const hotelOfferSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Offer description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  tagline: {
    type: String,
    maxlength: [100, 'Tagline cannot exceed 100 characters']
  },

  // Associated Hotel
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Applicable Rooms (if specific to certain room types)
  applicableRooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }],

  // Offer Type and Category
  offerType: {
    type: String,
    required: true,
    enum: [
      'percentage-discount', 'fixed-amount-discount', 'free-nights',
      'room-upgrade', 'meal-package', 'early-bird', 'last-minute',
      'extended-stay', 'seasonal', 'group-booking', 'corporate',
      'honeymoon', 'family-package', 'weekend-special', 'other'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'accommodation', 'dining', 'spa-wellness', 'activities',
      'transportation', 'business', 'events', 'packages', 'seasonal'
    ]
  },

  // Discount Details
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed-amount', 'free-nights', 'upgrade', 'package'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative']
    },
    maxDiscount: Number, // Maximum discount amount for percentage discounts
    currency: {
      type: String,
      default: 'INR'
    },
    freeNights: Number, // For free nights offers
    upgradeCategory: String // For room upgrade offers
  },

  // Booking Conditions
  conditions: {
    minimumStay: {
      type: Number,
      default: 1
    },
    maximumStay: Number,
    minimumRooms: {
      type: Number,
      default: 1
    },
    minimumGuests: Number,
    maximumGuests: Number,
    minimumBookingAmount: Number,
    advanceBookingDays: Number,
    blackoutDates: [Date],
    applicableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    seasonalRestrictions: [{
      season: String,
      startDate: Date,
      endDate: Date,
      applicable: Boolean
    }]
  },

  // Validity and Timing
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    bookingWindow: {
      startDate: Date,
      endDate: Date
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },

  // Usage Limits
  usageLimit: {
    totalBookings: {
      type: Number,
      default: null // null means unlimited
    },
    bookingsPerCustomer: {
      type: Number,
      default: 1
    },
    bookingsPerDay: Number,
    currentBookings: {
      type: Number,
      default: 0
    },
    roomsAvailable: Number
  },

  // Promo Code
  promoCode: {
    code: {
      type: String,
      uppercase: true,
      sparse: true,
      unique: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    autoApply: {
      type: Boolean,
      default: false
    }
  },

  // Target Audience
  targetAudience: {
    customerType: [{
      type: String,
      enum: ['new-customer', 'returning-customer', 'corporate', 'leisure', 'group', 'all']
    }],
    membershipTier: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'all']
    }],
    ageGroup: {
      min: Number,
      max: Number
    },
    nationality: [String],
    corporateClients: [String]
  },

  // Package Inclusions (for package offers)
  inclusions: [{
    item: String,
    description: String,
    value: Number,
    category: {
      type: String,
      enum: ['accommodation', 'dining', 'spa', 'activities', 'transport', 'other']
    }
  }],

  // Terms and Conditions
  terms: {
    termsAndConditions: {
      type: String,
      required: true
    },
    cancellationPolicy: String,
    modificationPolicy: String,
    paymentTerms: String,
    refundPolicy: String,
    additionalCharges: String,
    importantNotes: [String]
  },

  // Offer Media
  media: {
    bannerImage: String,
    thumbnailImage: String,
    gallery: [{
      url: String,
      alt: String,
      caption: String,
      order: Number
    }],
    video: {
      url: String,
      thumbnail: String,
      title: String,
      duration: Number
    }
  },

  // Marketing and Display
  marketing: {
    isPromoted: {
      type: Boolean,
      default: false
    },
    promotionChannels: [{
      type: String,
      enum: ['website', 'email', 'social-media', 'ota', 'direct-mail', 'phone']
    }],
    marketingBudget: Number,
    targetReach: Number,
    campaignId: String
  },

  display: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    showOnHomepage: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    badgeText: String, // e.g., "BEST DEAL", "LIMITED TIME"
    urgencyText: String, // e.g., "Only 3 days left!"
    highlightColor: String
  },

  // Status and Approval
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'cancelled'],
    default: 'draft'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,

  // Analytics and Performance
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageBookingValue: {
      type: Number,
      default: 0
    },
    customerAcquisition: {
      type: Number,
      default: 0
    }
  },

  // Booking History
  bookingHistory: [{
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    checkInDate: Date,
    checkOutDate: Date,
    rooms: Number,
    guests: Number,
    originalAmount: Number,
    discountAmount: Number,
    finalAmount: Number
  }],

  // SEO and Tags
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  tags: [String],

  // Notifications and Alerts
  notifications: {
    lowBookingAlert: {
      enabled: Boolean,
      threshold: Number // percentage of total bookings
    },
    expiryAlert: {
      enabled: Boolean,
      daysBefore: Number
    },
    performanceAlert: {
      enabled: Boolean,
      minConversionRate: Number
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
hotelOfferSchema.index({ hotel: 1, status: 1 });
hotelOfferSchema.index({ owner: 1 });
hotelOfferSchema.index({ slug: 1 });
hotelOfferSchema.index({ offerType: 1, category: 1 });
hotelOfferSchema.index({ 'validity.startDate': 1, 'validity.endDate': 1 });
hotelOfferSchema.index({ 'promoCode.code': 1 });
hotelOfferSchema.index({ 'display.isFeatured': 1, 'display.displayOrder': 1 });
hotelOfferSchema.index({ status: 1, isApproved: 1 });
hotelOfferSchema.index({ createdAt: -1 });

// Virtual for offer validity status
hotelOfferSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now &&
         (this.usageLimit.totalBookings === null || this.usageLimit.currentBookings < this.usageLimit.totalBookings);
});

// Virtual for days remaining
hotelOfferSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.validity.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for booking percentage
hotelOfferSchema.virtual('bookingPercentage').get(function() {
  if (!this.usageLimit.totalBookings) return 0;
  return (this.usageLimit.currentBookings / this.usageLimit.totalBookings) * 100;
});

// Virtual for savings display
hotelOfferSchema.virtual('savingsDisplay').get(function() {
  switch (this.discount.type) {
    case 'percentage':
      return `Save ${this.discount.value}%`;
    case 'fixed-amount':
      return `Save ₹${this.discount.value}`;
    case 'free-nights':
      return `${this.discount.freeNights} Free Night${this.discount.freeNights > 1 ? 's' : ''}`;
    case 'upgrade':
      return `Free Upgrade to ${this.discount.upgradeCategory}`;
    default:
      return 'Special Offer';
  }
});

// Pre-save middleware to generate slug
hotelOfferSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(`${this.title}-${this._id}`, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to auto-expire offers
hotelOfferSchema.pre('save', function(next) {
  const now = new Date();
  if (this.validity.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Pre-save middleware to generate short description
hotelOfferSchema.pre('save', function(next) {
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = this.description.length > 200 
      ? this.description.substring(0, 200) + '...'
      : this.description;
  }
  next();
});

// Method to calculate discount amount
hotelOfferSchema.methods.calculateDiscount = function(originalAmount, nights = 1) {
  let discountAmount = 0;
  
  switch (this.discount.type) {
    case 'percentage':
      discountAmount = (originalAmount * this.discount.value) / 100;
      if (this.discount.maxDiscount && discountAmount > this.discount.maxDiscount) {
        discountAmount = this.discount.maxDiscount;
      }
      break;
    case 'fixed-amount':
      discountAmount = Math.min(this.discount.value, originalAmount);
      break;
    case 'free-nights':
      if (nights > this.discount.freeNights) {
        const nightlyRate = originalAmount / nights;
        discountAmount = nightlyRate * this.discount.freeNights;
      }
      break;
    default:
      discountAmount = 0;
  }
  
  return {
    discountAmount,
    finalAmount: originalAmount - discountAmount,
    savings: discountAmount
  };
};

// Method to check if offer is applicable
hotelOfferSchema.methods.isApplicable = function(bookingDetails) {
  // Check validity
  if (!this.isValid) return { applicable: false, reason: 'Offer expired or inactive' };
  
  // Check minimum stay
  if (bookingDetails.nights < this.conditions.minimumStay) {
    return { applicable: false, reason: `Minimum stay is ${this.conditions.minimumStay} night${this.conditions.minimumStay > 1 ? 's' : ''}` };
  }
  
  // Check maximum stay
  if (this.conditions.maximumStay && bookingDetails.nights > this.conditions.maximumStay) {
    return { applicable: false, reason: `Maximum stay is ${this.conditions.maximumStay} nights` };
  }
  
  // Check minimum rooms
  if (bookingDetails.rooms < this.conditions.minimumRooms) {
    return { applicable: false, reason: `Minimum ${this.conditions.minimumRooms} room${this.conditions.minimumRooms > 1 ? 's' : ''} required` };
  }
  
  // Check minimum booking amount
  if (this.conditions.minimumBookingAmount && bookingDetails.amount < this.conditions.minimumBookingAmount) {
    return { applicable: false, reason: `Minimum booking amount is ₹${this.conditions.minimumBookingAmount}` };
  }
  
  // Check advance booking
  if (this.conditions.advanceBookingDays) {
    const daysToCheckIn = Math.ceil((new Date(bookingDetails.checkInDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysToCheckIn < this.conditions.advanceBookingDays) {
      return { applicable: false, reason: `Must book at least ${this.conditions.advanceBookingDays} days in advance` };
    }
  }
  
  // Check blackout dates
  const checkInDate = new Date(bookingDetails.checkInDate);
  const isBlackedOut = this.conditions.blackoutDates.some(blackoutDate => {
    return blackoutDate.toDateString() === checkInDate.toDateString();
  });
  
  if (isBlackedOut) {
    return { applicable: false, reason: 'Offer not available for selected dates' };
  }
  
  return { applicable: true };
};

// Method to apply offer
hotelOfferSchema.methods.applyOffer = async function(customerId, bookingDetails) {
  // Check if applicable
  const applicabilityCheck = this.isApplicable(bookingDetails);
  if (!applicabilityCheck.applicable) {
    throw new Error(applicabilityCheck.reason);
  }
  
  // Check usage limits
  if (this.usageLimit.totalBookings && this.usageLimit.currentBookings >= this.usageLimit.totalBookings) {
    throw new Error('Offer booking limit exceeded');
  }
  
  // Check per-customer usage limit
  const customerBookings = this.bookingHistory.filter(booking => 
    booking.customer.toString() === customerId.toString()
  ).length;
  
  if (customerBookings >= this.usageLimit.bookingsPerCustomer) {
    throw new Error('Customer booking limit exceeded for this offer');
  }
  
  // Calculate discount
  const discountCalculation = this.calculateDiscount(bookingDetails.amount, bookingDetails.nights);
  
  // Record booking
  this.bookingHistory.push({
    booking: bookingDetails.bookingId,
    customer: customerId,
    checkInDate: bookingDetails.checkInDate,
    checkOutDate: bookingDetails.checkOutDate,
    rooms: bookingDetails.rooms,
    guests: bookingDetails.guests,
    originalAmount: bookingDetails.amount,
    discountAmount: discountCalculation.discountAmount,
    finalAmount: discountCalculation.finalAmount
  });
  
  // Update usage count and analytics
  this.usageLimit.currentBookings += 1;
  this.analytics.bookings += 1;
  this.analytics.revenue += discountCalculation.finalAmount;
  
  // Calculate conversion rate
  if (this.analytics.clicks > 0) {
    this.analytics.conversionRate = (this.analytics.bookings / this.analytics.clicks) * 100;
  }
  
  // Calculate average booking value
  if (this.analytics.bookings > 0) {
    this.analytics.averageBookingValue = this.analytics.revenue / this.analytics.bookings;
  }
  
  await this.save();
  
  return discountCalculation;
};

// Method to increment views
hotelOfferSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to increment clicks
hotelOfferSchema.methods.incrementClicks = async function() {
  this.analytics.clicks += 1;
  await this.save();
};

// Static method to get active offers
hotelOfferSchema.statics.getActiveOffers = function(hotelId, options = {}) {
  const now = new Date();
  const query = {
    hotel: hotelId,
    status: 'active',
    isApproved: true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now }
  };
  
  return this.find(query)
    .sort(options.sort || { 'display.isFeatured': -1, 'display.displayOrder': 1, createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get featured offers
hotelOfferSchema.statics.getFeaturedOffers = function(category, limit = 10) {
  const now = new Date();
  const query = {
    status: 'active',
    isApproved: true,
    'display.isFeatured': true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now }
  };
  
  if (category) query.category = category;
  
  return this.find(query)
    .populate('hotel', 'name category location starRating')
    .sort({ 'display.displayOrder': 1, createdAt: -1 })
    .limit(limit);
};

// Static method to search offers
hotelOfferSchema.statics.searchOffers = function(searchTerm, filters = {}) {
  const now = new Date();
  const query = {
    status: 'active',
    isApproved: true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now },
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.offerType) query.offerType = filters.offerType;
  if (filters.category) query.category = filters.category;
  if (filters.hotelId) query.hotel = filters.hotelId;
  if (filters.minDiscount) {
    query.$or = [
      { 'discount.type': 'percentage', 'discount.value': { $gte: filters.minDiscount } },
      { 'discount.type': 'fixed-amount', 'discount.value': { $gte: filters.minDiscount } }
    ];
  }

  return this.find(query)
    .populate('hotel', 'name category location starRating')
    .sort({ 'display.isFeatured': -1, 'analytics.bookings': -1 });
};

const HotelOffer = mongoose.model('HotelOffer', hotelOfferSchema);

export default HotelOffer;
