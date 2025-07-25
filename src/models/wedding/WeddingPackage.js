import mongoose from 'mongoose';
import slugify from 'slugify';

const weddingPackageSchema = new mongoose.Schema({
  // Basic Information
  packageName: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    maxlength: [200, 'Package name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Package description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Associated Service/Vendor
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingService',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingVendor',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Package Type and Category
  packageType: {
    type: String,
    required: true,
    enum: ['basic', 'standard', 'premium', 'luxury', 'custom']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'photography', 'videography', 'decoration', 'catering', 'venue',
      'makeup', 'mehendi', 'music', 'flowers', 'planning',
      'clothing', 'jewelry', 'invitations', 'transportation', 'combo'
    ]
  },

  // Pricing Information
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    discountedPrice: {
      type: Number,
      min: [0, 'Discounted price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceType: {
      type: String,
      enum: ['fixed', 'per-person', 'per-hour', 'per-day', 'per-event'],
      default: 'fixed'
    },
    minimumBooking: {
      amount: Number,
      unit: String // e.g., 'hours', 'days', 'people'
    },
    additionalCharges: [{
      name: String,
      amount: Number,
      type: {
        type: String,
        enum: ['fixed', 'percentage']
      },
      description: String
    }]
  },

  // Package Inclusions
  inclusions: [{
    item: {
      type: String,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    },
    unit: String,
    isHighlight: {
      type: Boolean,
      default: false
    }
  }],

  // Package Exclusions
  exclusions: [{
    item: String,
    description: String,
    additionalCost: Number
  }],

  // Service Duration and Timing
  duration: {
    hours: Number,
    days: Number,
    description: String
  },
  availability: {
    advanceBookingDays: {
      type: Number,
      default: 30
    },
    maxBookingsPerDay: {
      type: Number,
      default: 1
    },
    seasonalPricing: [{
      season: String,
      startDate: Date,
      endDate: Date,
      priceMultiplier: {
        type: Number,
        default: 1
      }
    }],
    blackoutDates: [Date],
    workingHours: {
      start: String,
      end: String
    }
  },

  // Terms and Conditions
  terms: {
    cancellationPolicy: {
      type: String,
      required: true
    },
    paymentTerms: {
      advancePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
      },
      paymentMethods: [{
        type: String,
        enum: ['cash', 'card', 'upi', 'bank-transfer', 'cheque']
      }],
      paymentSchedule: String
    },
    refundPolicy: String,
    reschedulePolicy: String,
    additionalTerms: [String]
  },

  // Customization Options
  customizations: [{
    option: String,
    description: String,
    additionalCost: Number,
    available: {
      type: Boolean,
      default: true
    }
  }],

  // Add-ons and Extras
  addOns: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    available: {
      type: Boolean,
      default: true
    }
  }],

  // Package Media
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: Number
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  brochure: {
    url: String,
    fileName: String
  },

  // Comparison and Features
  highlights: [String],
  features: [{
    name: String,
    included: Boolean,
    description: String
  }],
  comparison: {
    competitorAnalysis: String,
    uniqueSellingPoints: [String]
  },

  // Booking and Availability
  bookingSettings: {
    instantBooking: {
      type: Boolean,
      default: false
    },
    requiresApproval: {
      type: Boolean,
      default: true
    },
    maxAdvanceBooking: Number, // days
    minAdvanceBooking: Number   // days
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'draft'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },

  // SEO and Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  tags: [String],
  marketingText: String,

  // Analytics and Performance
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
    revenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    lastBooked: Date
  },

  // Reviews specific to this package
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingReview'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
weddingPackageSchema.index({ service: 1, packageType: 1 });
weddingPackageSchema.index({ vendor: 1, status: 1 });
weddingPackageSchema.index({ owner: 1 });
weddingPackageSchema.index({ category: 1, status: 1 });
weddingPackageSchema.index({ 'pricing.basePrice': 1 });
weddingPackageSchema.index({ isPopular: 1, isFeatured: 1 });
weddingPackageSchema.index({ slug: 1 });
weddingPackageSchema.index({ createdAt: -1 });

// Virtual for effective price (considering discounts)
weddingPackageSchema.virtual('effectivePrice').get(function() {
  return this.pricing.discountedPrice || this.pricing.basePrice;
});

// Virtual for discount percentage
weddingPackageSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.discountedPrice && this.pricing.discountedPrice < this.pricing.basePrice) {
    return Math.round(((this.pricing.basePrice - this.pricing.discountedPrice) / this.pricing.basePrice) * 100);
  }
  return 0;
});

// Virtual for savings amount
weddingPackageSchema.virtual('savings').get(function() {
  if (this.pricing.discountedPrice && this.pricing.discountedPrice < this.pricing.basePrice) {
    return this.pricing.basePrice - this.pricing.discountedPrice;
  }
  return 0;
});

// Pre-save middleware to generate slug
weddingPackageSchema.pre('save', function(next) {
  if (this.isModified('packageName')) {
    this.slug = slugify(`${this.packageName}-${this._id}`, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to ensure only one primary image
weddingPackageSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    let hasPrimary = false;
    this.images.forEach((image, index) => {
      if (image.isPrimary && !hasPrimary) {
        hasPrimary = true;
      } else if (image.isPrimary && hasPrimary) {
        image.isPrimary = false;
      }
    });
    
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Method to calculate conversion rate
weddingPackageSchema.methods.calculateConversionRate = function() {
  if (this.analytics.inquiries > 0) {
    this.analytics.conversionRate = (this.analytics.bookings / this.analytics.inquiries) * 100;
  } else {
    this.analytics.conversionRate = 0;
  }
  return this.analytics.conversionRate;
};

// Method to increment views
weddingPackageSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to record inquiry
weddingPackageSchema.methods.recordInquiry = async function() {
  this.analytics.inquiries += 1;
  await this.save();
};

// Method to record booking
weddingPackageSchema.methods.recordBooking = async function(amount) {
  this.analytics.bookings += 1;
  this.analytics.revenue += amount || this.effectivePrice;
  this.analytics.lastBooked = new Date();
  this.calculateConversionRate();
  await this.save();
};

// Method to check availability for a date
weddingPackageSchema.methods.isAvailableOn = function(date) {
  const checkDate = new Date(date);
  
  // Check blackout dates
  const isBlackedOut = this.availability.blackoutDates.some(blackoutDate => {
    return blackoutDate.toDateString() === checkDate.toDateString();
  });
  
  if (isBlackedOut) return false;
  
  // Check advance booking requirements
  const today = new Date();
  const daysFromNow = Math.ceil((checkDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysFromNow < this.availability.advanceBookingDays) return false;
  
  return true;
};

// Method to get seasonal price
weddingPackageSchema.methods.getSeasonalPrice = function(date) {
  const checkDate = new Date(date);
  let multiplier = 1;
  
  this.availability.seasonalPricing.forEach(season => {
    if (checkDate >= season.startDate && checkDate <= season.endDate) {
      multiplier = season.priceMultiplier;
    }
  });
  
  return this.effectivePrice * multiplier;
};

// Static method to get packages by price range
weddingPackageSchema.statics.getByPriceRange = function(minPrice, maxPrice, options = {}) {
  const query = {
    status: 'active',
    $or: [
      { 'pricing.discountedPrice': { $gte: minPrice, $lte: maxPrice } },
      { 
        'pricing.discountedPrice': { $exists: false },
        'pricing.basePrice': { $gte: minPrice, $lte: maxPrice }
      }
    ]
  };
  
  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName location')
    .sort(options.sort || { isPopular: -1, 'pricing.basePrice': 1 });
};

// Static method to get popular packages
weddingPackageSchema.statics.getPopularPackages = function(category, limit = 10) {
  const query = { status: 'active', isPopular: true };
  if (category) query.category = category;
  
  return this.find(query)
    .populate('service', 'serviceName category rating')
    .populate('vendor', 'businessName location')
    .sort({ 'analytics.bookings': -1, 'rating.average': -1 })
    .limit(limit);
};

// Static method to search packages
weddingPackageSchema.statics.searchPackages = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    $or: [
      { packageName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.packageType) query.packageType = filters.packageType;
  if (filters.minPrice) {
    query.$or = [
      { 'pricing.discountedPrice': { $gte: filters.minPrice } },
      { 
        'pricing.discountedPrice': { $exists: false },
        'pricing.basePrice': { $gte: filters.minPrice }
      }
    ];
  }
  if (filters.maxPrice) {
    const priceQuery = query.$or || [];
    query.$and = [
      { $or: priceQuery },
      {
        $or: [
          { 'pricing.discountedPrice': { $lte: filters.maxPrice } },
          { 
            'pricing.discountedPrice': { $exists: false },
            'pricing.basePrice': { $lte: filters.maxPrice }
          }
        ]
      }
    ];
    delete query.$or;
  }

  return this.find(query)
    .populate('service', 'serviceName category rating')
    .populate('vendor', 'businessName location rating')
    .sort({ isFeatured: -1, isPopular: -1, 'rating.average': -1 });
};

const WeddingPackage = mongoose.model('WeddingPackage', weddingPackageSchema);

export default WeddingPackage;

