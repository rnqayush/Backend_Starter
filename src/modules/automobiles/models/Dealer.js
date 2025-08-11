const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  // Basic dealer information
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
    default: 'automobile',
    enum: ['automobile', 'motorcycle', 'commercial', 'luxury', 'used-cars']
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
    dealerLicense: String,
    taxId: String
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

  // Brands and specializations
  brands: [{
    name: String,
    authorized: {
      type: Boolean,
      default: false
    },
    certificationLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }
  }],
  specializations: [String], // luxury, electric, commercial, etc.

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
  totalVehicles: {
    type: Number,
    default: 0
  },

  // Services offered
  services: {
    sales: {
      new: {
        type: Boolean,
        default: true
      },
      used: {
        type: Boolean,
        default: true
      },
      certified: {
        type: Boolean,
        default: false
      }
    },
    financing: {
      available: {
        type: Boolean,
        default: true
      },
      partners: [String],
      minCreditScore: Number,
      maxLoanTerm: Number
    },
    service: {
      maintenance: {
        type: Boolean,
        default: true
      },
      repairs: {
        type: Boolean,
        default: true
      },
      warranty: {
        type: Boolean,
        default: true
      },
      bodyShop: {
        type: Boolean,
        default: false
      }
    },
    additional: {
      tradeIn: {
        type: Boolean,
        default: true
      },
      leasing: {
        type: Boolean,
        default: true
      },
      delivery: {
        type: Boolean,
        default: false
      },
      pickup: {
        type: Boolean,
        default: false
      }
    }
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
        enum: ['hero', 'about', 'inventory', 'services', 'testimonials', 'contact', 'footer', 'financing']
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

  // Certifications and awards
  certifications: [{
    name: String,
    issuer: String,
    dateIssued: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  awards: [{
    title: String,
    issuer: String,
    year: Number,
    description: String
  }],

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
    autoApproveVehicles: {
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
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    leadManagement: {
      autoAssign: {
        type: Boolean,
        default: true
      },
      followUpDays: {
        type: Number,
        default: 3
      }
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
    averageSalePrice: {
      type: Number,
      default: 0
    },
    leadSources: {
      website: {
        type: Number,
        default: 0
      },
      referral: {
        type: Number,
        default: 0
      },
      social: {
        type: Number,
        default: 0
      },
      advertising: {
        type: Number,
        default: 0
      }
    }
  },

  // Social media links
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String,
    tiktok: String
  },

  // Policies
  policies: {
    returns: String,
    warranty: String,
    privacy: String,
    terms: String,
    financing: String
  },

  // Staff information
  staff: [{
    name: String,
    role: {
      type: String,
      enum: ['manager', 'salesperson', 'finance', 'service', 'technician']
    },
    email: String,
    phone: String,
    photo: String,
    bio: String,
    specialties: [String]
  }],

  // Inventory settings
  inventory: {
    autoSync: {
      type: Boolean,
      default: false
    },
    lowStockAlert: {
      type: Number,
      default: 5
    },
    categories: [String],
    priceRanges: [{
      min: Number,
      max: Number,
      label: String
    }]
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
dealerSchema.index({ slug: 1 });
dealerSchema.index({ owner: 1 });
dealerSchema.index({ status: 1 });
dealerSchema.index({ featured: -1, rating: -1 });
dealerSchema.index({ 'businessInfo.address.city': 1, 'businessInfo.address.state': 1 });
dealerSchema.index({ category: 1, status: 1 });
dealerSchema.index({ 'brands.name': 1 });

// Text search index
dealerSchema.index({
  name: 'text',
  'businessInfo.description': 'text',
  'businessInfo.address.city': 'text',
  'businessInfo.address.state': 'text',
  specializations: 'text'
});

// Virtual for full address
dealerSchema.virtual('fullAddress').get(function() {
  const addr = this.businessInfo.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean);
  return parts.join(', ');
});

// Virtual for business age
dealerSchema.virtual('businessAge').get(function() {
  const currentYear = new Date().getFullYear();
  const sinceYear = parseInt(this.ownerInfo.since) || currentYear;
  return currentYear - sinceYear;
});

// Virtual for subscription status
dealerSchema.virtual('subscriptionActive').get(function() {
  return this.subscription.status === 'active' && 
         (!this.subscription.expiresAt || this.subscription.expiresAt > new Date());
});

// Pre-save middleware to generate slug
dealerSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to update lastActive
dealerSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('lastActive')) {
    this.lastActive = new Date();
  }
  next();
});

// Method to calculate average rating
dealerSchema.methods.updateRating = async function() {
  const Vehicle = mongoose.model('Vehicle');
  const vehicles = await Vehicle.find({ dealer: this._id });
  
  if (vehicles.length === 0) {
    this.rating = 0;
    this.reviewCount = 0;
    return;
  }

  // This would typically aggregate reviews from vehicles or separate review system
  // For now, we'll use a placeholder calculation
  this.totalVehicles = vehicles.length;
};

// Method to update analytics
dealerSchema.methods.incrementViews = function() {
  this.analytics.totalViews += 1;
  this.analytics.monthlyViews += 1;
  return this.save();
};

// Method to check if dealer handles specific brand
dealerSchema.methods.handlesBrand = function(brandName) {
  return this.brands.some(brand => 
    brand.name.toLowerCase() === brandName.toLowerCase()
  );
};

module.exports = mongoose.model('Dealer', dealerSchema);
