const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  // Basic business information
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
  type: {
    type: String,
    required: true,
    enum: ['business', 'freelancer'],
    default: 'business'
  },
  category: {
    type: String,
    required: true,
    enum: [
      'consulting', 'marketing', 'design', 'development', 'photography', 
      'writing', 'legal', 'accounting', 'healthcare', 'fitness', 
      'education', 'real-estate', 'construction', 'automotive', 'other'
    ]
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
    tagline: {
      type: String,
      maxlength: 200
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
    businessLicense: String,
    taxId: String,
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      coverage: String
    }
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
    bio: String,
    photo: String,
    since: {
      type: String,
      default: new Date().getFullYear().toString()
    },
    // Freelancer-specific fields
    title: String, // Professional title
    experience: String, // Years of experience
    education: [String],
    certifications: [String]
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
  totalProjects: {
    type: Number,
    default: 0
  },
  totalClients: {
    type: Number,
    default: 0
  },

  // Skills and expertise (mainly for freelancers)
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    yearsOfExperience: Number
  }],

  // Services offered
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
        enum: ['fixed', 'hourly', 'project', 'custom'],
        default: 'fixed'
      },
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      unit: String // per hour, per project, etc.
    },
    duration: String, // estimated duration
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Portfolio (mainly for freelancers)
  portfolio: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    category: String,
    images: [String],
    projectUrl: String,
    clientName: String,
    completedDate: Date,
    technologies: [String],
    featured: {
      type: Boolean,
      default: false
    }
  }],

  // Team members (mainly for businesses)
  team: [{
    name: {
      type: String,
      required: true
    },
    role: String,
    bio: String,
    photo: String,
    email: String,
    phone: String,
    skills: [String],
    joinDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Packages and pricing
  packages: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    features: [String],
    price: {
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'USD'
      }
    },
    duration: String,
    isPopular: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

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

  // Page content sections with visibility control
  sectionVisibility: {
    hero: {
      type: Boolean,
      default: true
    },
    'about-us': {
      type: Boolean,
      default: true
    },
    'services-offered': {
      type: Boolean,
      default: true
    },
    portfolio: {
      type: Boolean,
      default: function() { return this.type === 'freelancer'; }
    },
    skills: {
      type: Boolean,
      default: function() { return this.type === 'freelancer'; }
    },
    experience: {
      type: Boolean,
      default: function() { return this.type === 'freelancer'; }
    },
    team: {
      type: Boolean,
      default: function() { return this.type === 'business'; }
    },
    gallery: {
      type: Boolean,
      default: function() { return this.type === 'business'; }
    },
    'packages-pricing': {
      type: Boolean,
      default: true
    },
    testimonials: {
      type: Boolean,
      default: true
    },
    faq: {
      type: Boolean,
      default: true
    },
    contact: {
      type: Boolean,
      default: true
    },
    footer: {
      type: Boolean,
      default: true
    }
  },

  // Page content
  pageContent: {
    sections: [{
      id: String,
      type: {
        type: String,
        enum: [
          'hero', 'about-us', 'services-offered', 'portfolio', 'skills', 
          'experience', 'team', 'gallery', 'packages-pricing', 
          'testimonials', 'faq', 'contact', 'footer'
        ]
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

  // Gallery
  gallery: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    caption: String,
    category: String
  }],

  // Testimonials
  testimonials: [{
    clientName: {
      type: String,
      required: true
    },
    clientPhoto: String,
    clientTitle: String,
    clientCompany: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    testimonial: {
      type: String,
      required: true
    },
    projectType: String,
    date: {
      type: Date,
      default: Date.now
    },
    featured: {
      type: Boolean,
      default: false
    }
  }],

  // FAQ
  faq: [{
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
    }
  }],

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

  // Settings
  settings: {
    allowReviews: {
      type: Boolean,
      default: true
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
    bookingSettings: {
      allowOnlineBooking: {
        type: Boolean,
        default: true
      },
      requireApproval: {
        type: Boolean,
        default: false
      },
      advanceBookingDays: {
        type: Number,
        default: 30
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
    averageProjectValue: {
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
    youtube: String,
    behance: String,
    dribbble: String,
    github: String
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
businessSchema.index({ slug: 1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ type: 1, category: 1 });
businessSchema.index({ featured: -1, rating: -1 });
businessSchema.index({ 'businessInfo.address.city': 1, 'businessInfo.address.state': 1 });

// Text search index
businessSchema.index({
  name: 'text',
  'businessInfo.description': 'text',
  'businessInfo.tagline': 'text',
  category: 'text',
  'skills.name': 'text'
});

// Virtual for full address
businessSchema.virtual('fullAddress').get(function() {
  const addr = this.businessInfo.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean);
  return parts.join(', ');
});

// Virtual for business age
businessSchema.virtual('businessAge').get(function() {
  const currentYear = new Date().getFullYear();
  const sinceYear = parseInt(this.ownerInfo.since) || currentYear;
  return currentYear - sinceYear;
});

// Pre-save middleware to generate slug
businessSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Pre-save middleware to set section visibility based on type
businessSchema.pre('save', function(next) {
  if (this.isModified('type')) {
    if (this.type === 'freelancer') {
      this.sectionVisibility.portfolio = true;
      this.sectionVisibility.skills = true;
      this.sectionVisibility.experience = true;
      this.sectionVisibility.team = false;
      this.sectionVisibility.gallery = false;
    } else {
      this.sectionVisibility.portfolio = false;
      this.sectionVisibility.skills = false;
      this.sectionVisibility.experience = false;
      this.sectionVisibility.team = true;
      this.sectionVisibility.gallery = true;
    }
  }
  next();
});

// Pre-save middleware to update lastActive
businessSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('lastActive')) {
    this.lastActive = new Date();
  }
  next();
});

// Method to update analytics
businessSchema.methods.incrementViews = function() {
  this.analytics.totalViews += 1;
  this.analytics.monthlyViews += 1;
  return this.save();
};

// Method to add service
businessSchema.methods.addService = function(serviceData) {
  this.services.push(serviceData);
  return this.save();
};

// Method to add portfolio item
businessSchema.methods.addPortfolioItem = function(portfolioData) {
  this.portfolio.push(portfolioData);
  return this.save();
};

// Method to add team member
businessSchema.methods.addTeamMember = function(memberData) {
  this.team.push(memberData);
  return this.save();
};

// Method to add testimonial
businessSchema.methods.addTestimonial = function(testimonialData) {
  this.testimonials.push(testimonialData);
  return this.save();
};

module.exports = mongoose.model('Business', businessSchema);
