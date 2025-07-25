import mongoose from 'mongoose';
import slugify from 'slugify';

const weddingPortfolioSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Portfolio title is required'],
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
    required: [true, 'Portfolio description is required'],
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

  // Project Details
  project: {
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'wedding', 'engagement', 'pre-wedding', 'reception',
        'mehendi', 'sangeet', 'haldi', 'ring-ceremony',
        'baby-shower', 'anniversary', 'other'
      ]
    },
    eventDate: {
      type: Date,
      required: true
    },
    venue: {
      name: String,
      address: String,
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    guestCount: Number,
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    }
  },

  // Services Provided
  servicesProvided: [{
    serviceName: String,
    description: String,
    duration: String,
    teamMembers: Number
  }],

  // Portfolio Category and Type
  category: {
    type: String,
    required: true,
    enum: [
      'photography', 'videography', 'decoration', 'catering', 'venue',
      'makeup', 'mehendi', 'music', 'flowers', 'planning',
      'clothing', 'jewelry', 'invitations', 'transportation', 'combo'
    ]
  },
  portfolioType: {
    type: String,
    enum: ['complete-event', 'highlight-reel', 'before-after', 'process', 'testimonial'],
    default: 'complete-event'
  },

  // Media Content
  media: {
    coverImage: {
      url: String,
      alt: String,
      caption: String
    },
    images: [{
      url: String,
      alt: String,
      caption: String,
      order: Number,
      category: {
        type: String,
        enum: ['ceremony', 'reception', 'decoration', 'food', 'candid', 'portrait', 'detail', 'other']
      }
    }],
    videos: [{
      url: String,
      title: String,
      thumbnail: String,
      duration: Number,
      category: {
        type: String,
        enum: ['highlight', 'ceremony', 'reception', 'behind-scenes', 'testimonial', 'other']
      }
    }],
    documents: [{
      url: String,
      fileName: String,
      fileType: String,
      description: String
    }]
  },

  // Client Testimonial
  clientTestimonial: {
    content: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    clientName: String,
    clientImage: String,
    isPublic: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },

  // Technical Details
  technicalDetails: {
    equipment: [String],
    techniques: [String],
    software: [String],
    challenges: String,
    solutions: String,
    timeline: String
  },

  // Results and Achievements
  results: {
    deliverables: [String],
    clientSatisfaction: String,
    awards: [String],
    recognition: [String],
    mediaFeatures: [String]
  },

  // Display and Organization
  display: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    showOnHomepage: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },

  // Status and Approval
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
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

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
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
    }
  },

  // SEO and Tags
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  tags: [String],

  // Collaboration and Team
  team: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: String,
    contribution: String
  }],

  // Related Content
  relatedPortfolios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingPortfolio'
  }],
  relatedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingService'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
weddingPortfolioSchema.index({ service: 1, status: 1 });
weddingPortfolioSchema.index({ vendor: 1, status: 1 });
weddingPortfolioSchema.index({ owner: 1 });
weddingPortfolioSchema.index({ slug: 1 });
weddingPortfolioSchema.index({ category: 1, portfolioType: 1 });
weddingPortfolioSchema.index({ 'project.eventDate': -1 });
weddingPortfolioSchema.index({ 'display.isFeatured': 1, 'display.displayOrder': 1 });
weddingPortfolioSchema.index({ 'clientTestimonial.rating': -1 });
weddingPortfolioSchema.index({ tags: 1 });
weddingPortfolioSchema.index({ createdAt: -1 });

// Virtual for project duration
weddingPortfolioSchema.virtual('projectAge').get(function() {
  if (!this.project.eventDate) return null;
  
  const now = new Date();
  const eventDate = new Date(this.project.eventDate);
  const diffTime = Math.abs(now - eventDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
});

// Virtual for media count
weddingPortfolioSchema.virtual('mediaCount').get(function() {
  return {
    images: this.media.images ? this.media.images.length : 0,
    videos: this.media.videos ? this.media.videos.length : 0,
    documents: this.media.documents ? this.media.documents.length : 0,
    total: (this.media.images ? this.media.images.length : 0) + 
           (this.media.videos ? this.media.videos.length : 0) + 
           (this.media.documents ? this.media.documents.length : 0)
  };
});

// Virtual for engagement score
weddingPortfolioSchema.virtual('engagementScore').get(function() {
  const views = this.analytics.views || 1; // Avoid division by zero
  const interactions = this.analytics.likes + this.analytics.shares + this.analytics.inquiries;
  return (interactions / views) * 100;
});

// Pre-save middleware to generate slug
weddingPortfolioSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(`${this.title}-${this._id}`, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to generate short description
weddingPortfolioSchema.pre('save', function(next) {
  if (this.isModified('description') && !this.shortDescription) {
    this.shortDescription = this.description.length > 200 
      ? this.description.substring(0, 200) + '...'
      : this.description;
  }
  next();
});

// Pre-save middleware to set cover image
weddingPortfolioSchema.pre('save', function(next) {
  if (!this.media.coverImage.url && this.media.images && this.media.images.length > 0) {
    // Set first image as cover if no cover image is set
    this.media.coverImage = {
      url: this.media.images[0].url,
      alt: this.media.images[0].alt || this.title,
      caption: this.media.images[0].caption || this.title
    };
  }
  next();
});

// Method to increment views
weddingPortfolioSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to toggle like
weddingPortfolioSchema.methods.toggleLike = async function(increment = true) {
  if (increment) {
    this.analytics.likes += 1;
  } else {
    this.analytics.likes = Math.max(0, this.analytics.likes - 1);
  }
  await this.save();
};

// Method to record share
weddingPortfolioSchema.methods.recordShare = async function() {
  this.analytics.shares += 1;
  await this.save();
};

// Method to record inquiry
weddingPortfolioSchema.methods.recordInquiry = async function() {
  this.analytics.inquiries += 1;
  await this.save();
};

// Method to record booking
weddingPortfolioSchema.methods.recordBooking = async function() {
  this.analytics.bookings += 1;
  await this.save();
};

// Method to add team member
weddingPortfolioSchema.methods.addTeamMember = async function(userId, role, contribution) {
  this.team.push({
    member: userId,
    role,
    contribution
  });
  await this.save();
};

// Method to approve portfolio
weddingPortfolioSchema.methods.approve = async function(userId) {
  this.isApproved = true;
  this.approvedBy = userId;
  this.approvedAt = new Date();
  this.status = 'active';
  await this.save();
};

// Static method to get featured portfolios
weddingPortfolioSchema.statics.getFeaturedPortfolios = function(category, limit = 10) {
  const query = {
    status: 'active',
    isApproved: true,
    'display.isFeatured': true,
    'display.isPublic': true
  };
  
  if (category) query.category = category;
  
  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName location')
    .sort({ 'display.displayOrder': 1, 'analytics.views': -1 })
    .limit(limit);
};

// Static method to get portfolios by service
weddingPortfolioSchema.statics.getByService = function(serviceId, options = {}) {
  const query = {
    service: serviceId,
    status: 'active',
    isApproved: true,
    'display.isPublic': true
  };
  
  return this.find(query)
    .sort(options.sort || { 'display.isFeatured': -1, 'project.eventDate': -1 })
    .limit(options.limit || 20);
};

// Static method to get recent portfolios
weddingPortfolioSchema.statics.getRecentPortfolios = function(category, days = 30, limit = 10) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  const query = {
    status: 'active',
    isApproved: true,
    'display.isPublic': true,
    createdAt: { $gte: dateThreshold }
  };
  
  if (category) query.category = category;
  
  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName location')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search portfolios
weddingPortfolioSchema.statics.searchPortfolios = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    isApproved: true,
    'display.isPublic': true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { 'project.clientName': { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.category) query.category = filters.category;
  if (filters.portfolioType) query.portfolioType = filters.portfolioType;
  if (filters.eventType) query['project.eventType'] = filters.eventType;
  if (filters.serviceId) query.service = filters.serviceId;
  if (filters.vendorId) query.vendor = filters.vendorId;
  if (filters.minRating) query['clientTestimonial.rating'] = { $gte: filters.minRating };

  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName location')
    .sort({ 'display.isFeatured': -1, 'analytics.views': -1 });
};

// Static method to get top-rated portfolios
weddingPortfolioSchema.statics.getTopRatedPortfolios = function(category, limit = 10) {
  const query = {
    status: 'active',
    isApproved: true,
    'display.isPublic': true,
    'clientTestimonial.rating': { $gte: 4 }
  };
  
  if (category) query.category = category;
  
  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName location')
    .sort({ 'clientTestimonial.rating': -1, 'analytics.views': -1 })
    .limit(limit);
};

const WeddingPortfolio = mongoose.model('WeddingPortfolio', weddingPortfolioSchema);

export default WeddingPortfolio;
