import mongoose from 'mongoose';
import slugify from 'slugify';

const websiteSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Website name is required'],
    trim: true,
    maxlength: [200, 'Website name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  domain: {
    type: String,
    unique: true,
    lowercase: true
  },
  subdomain: {
    type: String,
    unique: true,
    lowercase: true
  },

  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Business Information
  business: {
    name: {
      type: String,
      required: true
    },
    description: String,
    tagline: String,
    industry: {
      type: String,
      enum: [
        'technology', 'healthcare', 'finance', 'education', 'retail',
        'manufacturing', 'consulting', 'real-estate', 'food-beverage',
        'travel-tourism', 'fitness-wellness', 'legal', 'automotive',
        'construction', 'entertainment', 'non-profit', 'other'
      ]
    },
    type: {
      type: String,
      enum: ['startup', 'small-business', 'enterprise', 'freelancer', 'agency', 'non-profit'],
      default: 'small-business'
    },
    established: Date,
    employees: {
      type: String,
      enum: ['1', '2-10', '11-50', '51-200', '201-500', '500+']
    }
  },

  // Contact Information
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      youtube: String
    },
    workingHours: {
      monday: { start: String, end: String, closed: Boolean },
      tuesday: { start: String, end: String, closed: Boolean },
      wednesday: { start: String, end: String, closed: Boolean },
      thursday: { start: String, end: String, closed: Boolean },
      friday: { start: String, end: String, closed: Boolean },
      saturday: { start: String, end: String, closed: Boolean },
      sunday: { start: String, end: String, closed: Boolean }
    }
  },

  // Template and Design
  template: {
    id: {
      type: String,
      required: true
    },
    name: String,
    category: String,
    version: {
      type: String,
      default: '1.0'
    }
  },
  
  // Design Customization
  design: {
    theme: {
      primary: {
        type: String,
        default: '#007bff'
      },
      secondary: {
        type: String,
        default: '#6c757d'
      },
      accent: {
        type: String,
        default: '#28a745'
      },
      background: {
        type: String,
        default: '#ffffff'
      },
      text: {
        type: String,
        default: '#333333'
      }
    },
    fonts: {
      heading: {
        type: String,
        default: 'Inter'
      },
      body: {
        type: String,
        default: 'Inter'
      }
    },
    layout: {
      headerStyle: {
        type: String,
        enum: ['classic', 'modern', 'minimal', 'bold'],
        default: 'modern'
      },
      footerStyle: {
        type: String,
        enum: ['simple', 'detailed', 'minimal'],
        default: 'simple'
      },
      containerWidth: {
        type: String,
        enum: ['full', 'container', 'narrow'],
        default: 'container'
      }
    },
    customCSS: String
  },

  // Pages
  pages: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    },
    title: String,
    description: String,
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    sections: [{
      id: String,
      type: {
        type: String,
        enum: [
          'hero', 'about', 'services', 'portfolio', 'testimonials',
          'team', 'contact', 'blog', 'gallery', 'pricing',
          'features', 'stats', 'cta', 'faq', 'custom'
        ]
      },
      title: String,
      content: mongoose.Schema.Types.Mixed,
      settings: mongoose.Schema.Types.Mixed,
      order: {
        type: Number,
        default: 0
      },
      visible: {
        type: Boolean,
        default: true
      }
    }],
    seo: {
      title: String,
      description: String,
      keywords: [String],
      ogImage: String,
      canonical: String
    },
    isHomePage: {
      type: Boolean,
      default: false
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Navigation
  navigation: {
    header: [{
      label: String,
      url: String,
      type: {
        type: String,
        enum: ['page', 'external', 'section'],
        default: 'page'
      },
      target: {
        type: String,
        enum: ['_self', '_blank'],
        default: '_self'
      },
      order: Number,
      visible: {
        type: Boolean,
        default: true
      },
      children: [{
        label: String,
        url: String,
        type: String,
        target: String
      }]
    }],
    footer: [{
      label: String,
      url: String,
      type: String,
      target: String,
      order: Number
    }]
  },

  // Content
  content: {
    logo: {
      url: String,
      alt: String,
      width: Number,
      height: Number
    },
    favicon: String,
    images: [{
      id: String,
      url: String,
      alt: String,
      category: String,
      size: Number,
      dimensions: {
        width: Number,
        height: Number
      }
    }],
    videos: [{
      id: String,
      url: String,
      title: String,
      thumbnail: String,
      duration: Number
    }],
    documents: [{
      id: String,
      name: String,
      url: String,
      type: String,
      size: Number
    }]
  },

  // Services/Products
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    image: String,
    price: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      type: {
        type: String,
        enum: ['fixed', 'starting-from', 'hourly', 'custom'],
        default: 'fixed'
      }
    },
    features: [String],
    category: String,
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Portfolio/Gallery
  portfolio: [{
    title: String,
    description: String,
    image: String,
    images: [String],
    category: String,
    client: String,
    date: Date,
    url: String,
    tags: [String],
    order: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Team Members
  team: [{
    name: {
      type: String,
      required: true
    },
    position: String,
    bio: String,
    image: String,
    email: String,
    phone: String,
    socialMedia: {
      linkedin: String,
      twitter: String,
      facebook: String
    },
    order: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Testimonials
  testimonials: [{
    name: {
      type: String,
      required: true
    },
    position: String,
    company: String,
    content: {
      type: String,
      required: true
    },
    image: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    date: Date,
    order: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Blog Posts
  blog: [{
    title: {
      type: String,
      required: true
    },
    slug: String,
    excerpt: String,
    content: String,
    featuredImage: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    category: String,
    tags: [String],
    seo: {
      title: String,
      description: String,
      keywords: [String]
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // SEO Settings
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String,
    twitterCard: String,
    googleAnalytics: String,
    googleTagManager: String,
    facebookPixel: String,
    customHead: String,
    customBody: String,
    sitemap: {
      enabled: {
        type: Boolean,
        default: true
      },
      lastGenerated: Date
    },
    robots: {
      index: {
        type: Boolean,
        default: true
      },
      follow: {
        type: Boolean,
        default: true
      }
    }
  },

  // Settings
  settings: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    currency: {
      type: String,
      default: 'INR'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    },
    maintenance: {
      enabled: {
        type: Boolean,
        default: false
      },
      message: String
    },
    ssl: {
      enabled: {
        type: Boolean,
        default: false
      },
      certificate: String
    },
    backup: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      lastBackup: Date
    }
  },

  // Status and Publishing
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'maintenance'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueVisitors: {
      type: Number,
      default: 0
    },
    pageViews: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    leads: {
      type: Number,
      default: 0
    },
    lastAnalyticsUpdate: Date
  },

  // Timestamps
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
websiteSchema.index({ owner: 1, status: 1 });
websiteSchema.index({ domain: 1 });
websiteSchema.index({ subdomain: 1 });
websiteSchema.index({ slug: 1 });
websiteSchema.index({ 'business.industry': 1 });
websiteSchema.index({ isPublished: 1 });

// Virtual fields
websiteSchema.virtual('url').get(function() {
  if (this.domain) {
    return `https://${this.domain}`;
  } else if (this.subdomain) {
    return `https://${this.subdomain}.yourplatform.com`;
  }
  return null;
});

websiteSchema.virtual('homePage').get(function() {
  return this.pages.find(page => page.isHomePage) || this.pages[0];
});

websiteSchema.virtual('publishedPages').get(function() {
  return this.pages.filter(page => page.isPublished);
});

websiteSchema.virtual('activeServices').get(function() {
  return this.services.filter(service => service.isActive);
});

websiteSchema.virtual('activePortfolio').get(function() {
  return this.portfolio.filter(item => item.isActive);
});

websiteSchema.virtual('activeTeam').get(function() {
  return this.team.filter(member => member.isActive);
});

websiteSchema.virtual('activeTestimonials').get(function() {
  return this.testimonials.filter(testimonial => testimonial.isActive);
});

websiteSchema.virtual('publishedBlogPosts').get(function() {
  return this.blog.filter(post => post.isPublished);
});

// Pre-save middleware
websiteSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  // Generate subdomain if not provided
  if (!this.subdomain && !this.domain) {
    this.subdomain = this.slug;
  }

  // Update lastModified
  this.lastModified = new Date();

  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }

  // Update page slugs
  this.pages.forEach(page => {
    if (!page.slug) {
      page.slug = slugify(page.name, { lower: true, strict: true });
    }
    page.updatedAt = new Date();
  });

  // Update blog post slugs
  this.blog.forEach(post => {
    if (!post.slug) {
      post.slug = slugify(post.title, { lower: true, strict: true });
    }
    post.updatedAt = new Date();
  });

  next();
});

// Static methods
websiteSchema.statics.findByDomain = function(domain) {
  return this.findOne({
    $or: [
      { domain: domain },
      { subdomain: domain.split('.')[0] }
    ],
    status: 'published'
  });
};

websiteSchema.statics.searchWebsites = function(filters = {}) {
  const query = this.find();

  // Text search
  if (filters.search) {
    query.or([
      { name: new RegExp(filters.search, 'i') },
      { 'business.name': new RegExp(filters.search, 'i') },
      { 'business.description': new RegExp(filters.search, 'i') }
    ]);
  }

  // Industry filter
  if (filters.industry) {
    query.where('business.industry', filters.industry);
  }

  // Status filter
  query.where('status', filters.status || 'published');

  return query;
};

// Instance methods
websiteSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.pageViews += 1;
  return this.save();
};

websiteSchema.methods.addPage = function(pageData) {
  const page = {
    id: new mongoose.Types.ObjectId().toString(),
    ...pageData,
    slug: pageData.slug || slugify(pageData.name, { lower: true, strict: true }),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.pages.push(page);
  return this.save();
};

websiteSchema.methods.updatePage = function(pageId, updates) {
  const page = this.pages.id(pageId);
  if (page) {
    Object.assign(page, updates);
    page.updatedAt = new Date();
  }
  return this.save();
};

websiteSchema.methods.deletePage = function(pageId) {
  this.pages.pull(pageId);
  return this.save();
};

websiteSchema.methods.addBlogPost = function(postData) {
  const post = {
    ...postData,
    slug: postData.slug || slugify(postData.title, { lower: true, strict: true }),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.blog.push(post);
  return this.save();
};

websiteSchema.methods.publish = function() {
  this.status = 'published';
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

websiteSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.isPublished = false;
  return this.save();
};

websiteSchema.methods.generateSitemap = function() {
  const pages = this.publishedPages.map(page => ({
    url: `${this.url}/${page.slug}`,
    lastmod: page.updatedAt,
    changefreq: 'weekly',
    priority: page.isHomePage ? '1.0' : '0.8'
  }));

  const blogPosts = this.publishedBlogPosts.map(post => ({
    url: `${this.url}/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'monthly',
    priority: '0.6'
  }));

  this.seo.sitemap.lastGenerated = new Date();
  return [...pages, ...blogPosts];
};

export default mongoose.model('Website', websiteSchema);

