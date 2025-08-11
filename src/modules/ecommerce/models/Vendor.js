const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Basic vendor information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    default: 'ecommerce',
    enum: ['ecommerce', 'marketplace', 'retail', 'wholesale']
  },
  
  // Business information
  businessInfo: {
    logo: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'US'
      },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    hours: {
      monday: String,
      tuesday: String,
      wednesday: String,
      thursday: String,
      friday: String,
      saturday: String,
      sunday: String
    },
    taxId: String,
    businessLicense: String
  },

  // Owner information
  ownerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: String,
    since: {
      type: String,
      default: new Date().getFullYear().toString()
    }
  },

  // User reference
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Performance metrics
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },

  // Theme and customization
  theme: {
    primaryColor: {
      type: String,
      default: '#1e40af'
    },
    secondaryColor: {
      type: String,
      default: '#3b82f6'
    },
    backgroundColor: {
      type: String,
      default: '#f8fafc'
    },
    textColor: {
      type: String,
      default: '#1f2937'
    }
  },

  // Page content sections
  pageContent: {
    sections: [{
      id: String,
      type: {
        type: String,
        enum: ['hero', 'about', 'featured-products', 'categories', 'testimonials', 'contact', 'footer']
      },
      title: String,
      content: mongoose.Schema.Types.Mixed,
      isVisible: {
        type: Boolean,
        default: true
      },
      order: {
        type: Number,
        default: 0
      }
    }]
  },

  // SEO settings
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },

  // Status and verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },

  // Subscription and billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    expiresAt: Date,
    features: [String]
  },

  // Settings
  settings: {
    allowReviews: {
      type: Boolean,
      default: true
    },
    autoApproveProducts: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR']
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    monthlyViews: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },

  // Social media links
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },

  // Shipping and policies
  policies: {
    shipping: String,
    returns: String,
    privacy: String,
    terms: String
  },

  // Last activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  lastDataSync: Date,
  isDataPersisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
vendorSchema.index({ slug: 1 });
vendorSchema.index({ owner: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ featured: -1, rating: -1 });
vendorSchema.index({ 'businessInfo.address.city': 1, 'businessInfo.address.state': 1 });
vendorSchema.index({ category: 1, status: 1 });

// Text search index
vendorSchema.index({
  name: 'text',
  'businessInfo.description': 'text',
  'businessInfo.address.city': 'text',
  'businessInfo.address.state': 'text'
});

// Virtual for full address
vendorSchema.virtual('fullAddress').get(function() {
  const addr = this.businessInfo.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean);
  return parts.join(', ');
});

// Virtual for business age
vendorSchema.virtual('businessAge').get(function() {
  const currentYear = new Date().getFullYear();
  const sinceYear = parseInt(this.ownerInfo.since) || currentYear;
  return currentYear - sinceYear;
});

// Virtual for subscription status
vendorSchema.virtual('subscriptionActive').get(function() {
  return this.subscription.status === 'active' && 
         (!this.subscription.expiresAt || this.subscription.expiresAt > new Date());
});

// Pre-save middleware to generate slug
vendorSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to update lastActive
vendorSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('lastActive')) {
    this.lastActive = new Date();
  }
  next();
});

// Method to calculate average rating
vendorSchema.methods.updateRating = async function() {
  const Product = mongoose.model('Product');
  const products = await Product.find({ seller: this.owner });
  
  if (products.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
    return;
  }

  let totalRating = 0;
  let totalReviews = 0;

  products.forEach(product => {
    totalRating += product.rating.average * product.rating.count;
    totalReviews += product.rating.count;
  });

  this.rating = totalReviews > 0 ? totalRating / totalReviews : 0;
  this.reviewCount = totalReviews;
};

// Method to update analytics
vendorSchema.methods.incrementViews = function() {
  this.analytics.totalViews += 1;
  this.analytics.monthlyViews += 1;
  return this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema);
