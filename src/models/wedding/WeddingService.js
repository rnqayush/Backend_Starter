import mongoose from 'mongoose';
import slugify from 'slugify';

const weddingServiceSchema = new mongoose.Schema({
  // Basic Information
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [200, 'Service name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
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

  // Owner/Vendor Information
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

  // Service Category and Details
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
  serviceType: {
    type: String,
    enum: ['product', 'service', 'both'],
    default: 'service'
  },

  // Pricing Information
  pricing: {
    type: {
      type: String,
      enum: ['fixed', 'hourly', 'package', 'custom'],
      default: 'package'
    },
    basePrice: {
      type: Number,
      min: 0
    },
    maxPrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceNote: String
  },

  // Service Features
  features: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    included: {
      type: Boolean,
      default: true
    }
  }],

  // Location and Availability
  serviceAreas: [{
    city: String,
    state: String,
    pincode: String,
    travelCharges: Number
  }],
  availability: {
    daysAdvanceBooking: {
      type: Number,
      default: 30
    },
    maxEventsPerDay: {
      type: Number,
      default: 1
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    seasonalAvailability: [{
      season: String,
      available: Boolean,
      priceMultiplier: Number
    }]
  },

  // Media and Portfolio
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
    thumbnail: String,
    duration: Number
  }],
  portfolioItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingPortfolio'
  }],

  // Business Information
  businessDetails: {
    establishedYear: Number,
    teamSize: Number,
    experience: Number, // in years
    certifications: [String],
    awards: [String]
  },

  // Contact Information
  contact: {
    phone: {
      type: String,
      required: true
    },
    whatsapp: String,
    email: String,
    website: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      youtube: String,
      twitter: String
    }
  },

  // Reviews and Ratings
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
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingReview'
  }],

  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'draft'],
    default: 'draft'
  },

  // SEO and Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  tags: [String],

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
    lastViewed: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
weddingServiceSchema.index({ slug: 1 });
weddingServiceSchema.index({ vendor: 1 });
weddingServiceSchema.index({ owner: 1 });
weddingServiceSchema.index({ category: 1 });
weddingServiceSchema.index({ 'serviceAreas.city': 1 });
weddingServiceSchema.index({ status: 1, visibility: 1 });
weddingServiceSchema.index({ isFeatured: 1, 'rating.average': -1 });
weddingServiceSchema.index({ createdAt: -1 });

// Virtual for packages
weddingServiceSchema.virtual('packages', {
  ref: 'WeddingPackage',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for testimonials
weddingServiceSchema.virtual('testimonials', {
  ref: 'WeddingTestimonial',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for FAQs
weddingServiceSchema.virtual('faqs', {
  ref: 'WeddingFAQ',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for offers
weddingServiceSchema.virtual('offers', {
  ref: 'WeddingOffer',
  localField: '_id',
  foreignField: 'service'
});

// Pre-save middleware to generate slug
weddingServiceSchema.pre('save', function(next) {
  if (this.isModified('serviceName')) {
    this.slug = slugify(this.serviceName, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to set primary image
weddingServiceSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    // Ensure only one primary image
    let hasPrimary = false;
    this.images.forEach((image, index) => {
      if (image.isPrimary && !hasPrimary) {
        hasPrimary = true;
      } else if (image.isPrimary && hasPrimary) {
        image.isPrimary = false;
      }
    });
    
    // If no primary image, set first as primary
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Method to calculate average rating
weddingServiceSchema.methods.calculateAverageRating = async function() {
  const WeddingReview = mongoose.model('WeddingReview');
  const stats = await WeddingReview.aggregate([
    {
      $match: { service: this._id }
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].numOfReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

// Method to increment view count
weddingServiceSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  await this.save();
};

// Static method to get services by category
weddingServiceSchema.statics.getByCategory = function(category, options = {}) {
  const query = { category, status: 'active', visibility: 'public' };
  
  return this.find(query)
    .populate('vendor', 'businessName location')
    .sort(options.sort || { isFeatured: -1, 'rating.average': -1 })
    .limit(options.limit || 20);
};

// Static method to search services
weddingServiceSchema.statics.searchServices = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    visibility: 'public',
    $or: [
      { serviceName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.city) query['serviceAreas.city'] = filters.city;
  if (filters.minPrice) query['pricing.basePrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    query['pricing.maxPrice'] = query['pricing.maxPrice'] || {};
    query['pricing.maxPrice'].$lte = filters.maxPrice;
  }

  return this.find(query)
    .populate('vendor', 'businessName location rating')
    .sort({ isFeatured: -1, 'rating.average': -1 });
};

const WeddingService = mongoose.model('WeddingService', weddingServiceSchema);

export default WeddingService;

