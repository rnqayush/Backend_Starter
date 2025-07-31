const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Website Schema
 * Core model for multi-tenant website management
 * Handles website creation, configuration, and tenant identification
 */
const websiteSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Website name is required'],
    trim: true,
    maxlength: [100, 'Website name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    minlength: [3, 'Slug must be at least 3 characters'],
    maxlength: [50, 'Slug cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Website Type (Business Module)
  type: {
    type: String,
    required: [true, 'Website type is required'],
    enum: ['hotel', 'ecommerce', 'wedding', 'automobile', 'business'],
    index: true
  },
  
  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Website owner is required'],
    index: true
  },
  
  // Website Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'suspended'],
    default: 'draft',
    index: true
  },
  
  // Domain and URL Configuration
  domain: {
    custom: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9.-]+\.[a-z]{2,}$/, 'Please provide a valid domain name']
    },
    subdomain: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens']
    },
    isCustomDomainVerified: {
      type: Boolean,
      default: false
    }
  },
  
  // Website Configuration
  settings: {
    // General Settings
    title: {
      type: String,
      default: function() { return this.name; }
    },
    tagline: String,
    logo: String,
    favicon: String,
    
    // SEO Settings
    seo: {
      metaTitle: String,
      metaDescription: String,
      metaKeywords: [String],
      ogImage: String,
      twitterCard: String
    },
    
    // Theme and Appearance
    theme: {
      template: {
        type: String,
        default: 'default'
      },
      primaryColor: {
        type: String,
        default: '#3B82F6'
      },
      secondaryColor: {
        type: String,
        default: '#64748B'
      },
      fontFamily: {
        type: String,
        default: 'Inter'
      },
      customCSS: String
    },
    
    // Contact Information
    contact: {
      email: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      socialMedia: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        youtube: String
      }
    },
    
    // Business Hours
    businessHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      isOpen: {
        type: Boolean,
        default: true
      },
      openTime: String,
      closeTime: String
    }],
    
    // Features and Modules
    features: {
      booking: {
        type: Boolean,
        default: true
      },
      payments: {
        type: Boolean,
        default: false
      },
      reviews: {
        type: Boolean,
        default: true
      },
      blog: {
        type: Boolean,
        default: false
      },
      newsletter: {
        type: Boolean,
        default: false
      },
      analytics: {
        type: Boolean,
        default: true
      }
    },
    
    // Payment Configuration
    payments: {
      stripe: {
        enabled: {
          type: Boolean,
          default: false
        },
        publishableKey: String,
        webhookSecret: String
      },
      paypal: {
        enabled: {
          type: Boolean,
          default: false
        },
        clientId: String
      }
    },
    
    // Email Configuration
    email: {
      provider: {
        type: String,
        enum: ['default', 'custom'],
        default: 'default'
      },
      fromName: String,
      fromEmail: String,
      smtpSettings: {
        host: String,
        port: Number,
        secure: Boolean,
        username: String,
        password: String
      }
    },
    
    // Analytics
    analytics: {
      googleAnalytics: String,
      facebookPixel: String,
      customScripts: [String]
    }
  },
  
  // Website Statistics
  stats: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    lastVisit: Date,
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    }
  },
  
  // Subscription and Billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    features: [String],
    expiresAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Metadata and Custom Fields
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
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

// Indexes for performance (removed duplicate indexes that are already defined with index: true)
websiteSchema.index({ slug: 1 }, { unique: true });
websiteSchema.index({ 'domain.custom': 1 });
websiteSchema.index({ 'domain.subdomain': 1 });
websiteSchema.index({ createdAt: -1 });

// Compound indexes
websiteSchema.index({ owner: 1, type: 1 });
websiteSchema.index({ status: 1, type: 1 });

// Virtual for full URL
websiteSchema.virtual('url').get(function() {
  if (this.domain.custom && this.domain.isCustomDomainVerified) {
    return `https://${this.domain.custom}`;
  } else if (this.domain.subdomain) {
    return `https://${this.domain.subdomain}.${process.env.PLATFORM_DOMAIN || 'yourplatform.com'}`;
  } else {
    return `https://${process.env.PLATFORM_DOMAIN || 'yourplatform.com'}/${this.slug}`;
  }
});

// Virtual for admin URL
websiteSchema.virtual('adminUrl').get(function() {
  return `${this.url}/admin`;
});

// Virtual for type-specific data
websiteSchema.virtual('typeData', {
  refPath: 'type',
  localField: '_id',
  foreignField: 'website',
  justOne: true
});

// Pre-save middleware to generate slug
websiteSchema.pre('save', async function(next) {
  if (!this.slug || this.isModified('name')) {
    let baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
    
    let slug = baseSlug;
    let counter = 1;
    
    // Ensure slug is unique (with safety limit to prevent infinite loops)
    const maxAttempts = 100;
    while (counter <= maxAttempts && await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    if (counter > maxAttempts) {
      throw new Error('Unable to generate unique slug after maximum attempts');
    }
    
    this.slug = slug;
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  next();
});

// Pre-save middleware to set subdomain
websiteSchema.pre('save', function(next) {
  if (!this.domain.subdomain && this.slug) {
    this.domain.subdomain = this.slug;
  }
  next();
});

// Pre-save middleware to set published date
websiteSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Instance method to check if website is accessible
websiteSchema.methods.isAccessible = function() {
  return this.status === 'active' && this.subscription.isActive;
};

// Instance method to increment view count
websiteSchema.methods.incrementViews = function(isUnique = false) {
  this.stats.views += 1;
  if (isUnique) {
    this.stats.uniqueVisitors += 1;
  }
  this.stats.lastVisit = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to update revenue
websiteSchema.methods.updateRevenue = function(amount) {
  this.stats.totalRevenue += amount;
  this.stats.totalBookings += 1;
  return this.save({ validateBeforeSave: false });
};

// Static method to find by slug
websiteSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' });
};

// Static method to find by domain
websiteSchema.statics.findByDomain = function(domain) {
  return this.findOne({
    $or: [
      { 'domain.custom': domain },
      { 'domain.subdomain': domain }
    ],
    status: 'active'
  });
};

// Static method to find by owner and type
websiteSchema.statics.findByOwnerAndType = function(ownerId, type) {
  return this.find({ owner: ownerId, type });
};

module.exports = mongoose.model('Website', websiteSchema);
