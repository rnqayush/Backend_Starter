import mongoose from 'mongoose';

const weddingMediaSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Media title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  alt: {
    type: String,
    maxlength: [200, 'Alt text cannot exceed 200 characters']
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

  // Media Type and Details
  mediaType: {
    type: String,
    required: true,
    enum: ['image', 'video', 'audio', 'document']
  },
  fileType: {
    type: String,
    required: true,
    enum: [
      // Images
      'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
      // Videos
      'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
      // Audio
      'mp3', 'wav', 'aac', 'ogg',
      // Documents
      'pdf', 'doc', 'docx', 'txt'
    ]
  },

  // File Information
  originalUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  compressedUrl: String,
  fileName: {
    type: String,
    required: true
  },
  originalName: String,
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: String,

  // Media Dimensions (for images/videos)
  dimensions: {
    width: Number,
    height: Number,
    aspectRatio: String
  },

  // Video Specific
  duration: Number, // in seconds
  videoQuality: {
    type: String,
    enum: ['720p', '1080p', '4K', 'other']
  },

  // Organization and Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'portfolio', 'gallery', 'before-after', 'behind-scenes',
      'testimonial-video', 'service-demo', 'venue-tour',
      'product-showcase', 'team-photo', 'certificate',
      'award', 'brochure', 'price-list', 'other'
    ]
  },
  tags: [String],
  eventType: {
    type: String,
    enum: [
      'wedding', 'engagement', 'pre-wedding', 'reception',
      'mehendi', 'sangeet', 'haldi', 'ring-ceremony',
      'baby-shower', 'anniversary', 'other'
    ]
  },

  // Display and Organization
  displayOrder: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPrimary: {
    type: Boolean,
    default: false
  },

  // Portfolio Specific
  portfolioDetails: {
    clientName: String,
    eventDate: Date,
    location: String,
    eventDescription: String,
    servicesProvided: [String],
    clientTestimonial: String
  },

  // SEO and Metadata
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },

  // Status and Moderation
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,

  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  },

  // Technical Metadata
  exifData: {
    camera: String,
    lens: String,
    settings: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    dateTaken: Date
  },

  // Watermark and Protection
  watermark: {
    enabled: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'],
      default: 'bottom-right'
    },
    opacity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  downloadProtection: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
weddingMediaSchema.index({ service: 1, category: 1 });
weddingMediaSchema.index({ vendor: 1, mediaType: 1 });
weddingMediaSchema.index({ owner: 1 });
weddingMediaSchema.index({ status: 1, isPublic: 1 });
weddingMediaSchema.index({ isFeatured: 1, displayOrder: 1 });
weddingMediaSchema.index({ eventType: 1, category: 1 });
weddingMediaSchema.index({ createdAt: -1 });
weddingMediaSchema.index({ tags: 1 });

// Virtual for file URL with CDN
weddingMediaSchema.virtual('cdnUrl').get(function() {
  const cdnBase = process.env.CDN_BASE_URL || '';
  return cdnBase + this.originalUrl;
});

// Virtual for responsive image URLs
weddingMediaSchema.virtual('responsiveUrls').get(function() {
  if (this.mediaType !== 'image') return null;
  
  const baseUrl = this.originalUrl.replace(/\.[^/.]+$/, '');
  return {
    thumbnail: `${baseUrl}_thumb.${this.fileType}`,
    small: `${baseUrl}_small.${this.fileType}`,
    medium: `${baseUrl}_medium.${this.fileType}`,
    large: `${baseUrl}_large.${this.fileType}`,
    original: this.originalUrl
  };
});

// Pre-save middleware
weddingMediaSchema.pre('save', function(next) {
  // Set aspect ratio for images
  if (this.mediaType === 'image' && this.dimensions.width && this.dimensions.height) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(this.dimensions.width, this.dimensions.height);
    this.dimensions.aspectRatio = `${this.dimensions.width / divisor}:${this.dimensions.height / divisor}`;
  }

  // Ensure only one primary media per category per service
  if (this.isPrimary && this.isModified('isPrimary')) {
    this.constructor.updateMany(
      { 
        service: this.service, 
        category: this.category, 
        _id: { $ne: this._id } 
      },
      { isPrimary: false }
    ).exec();
  }

  next();
});

// Method to increment view count
weddingMediaSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  await this.save();
};

// Method to increment download count
weddingMediaSchema.methods.incrementDownloads = async function() {
  this.analytics.downloads += 1;
  await this.save();
};

// Method to toggle like
weddingMediaSchema.methods.toggleLike = async function(increment = true) {
  if (increment) {
    this.analytics.likes += 1;
  } else {
    this.analytics.likes = Math.max(0, this.analytics.likes - 1);
  }
  await this.save();
};

// Static method to get media by category
weddingMediaSchema.statics.getByCategory = function(serviceId, category, options = {}) {
  const query = { 
    service: serviceId, 
    category, 
    status: 'active', 
    isPublic: true 
  };
  
  return this.find(query)
    .sort(options.sort || { isFeatured: -1, displayOrder: 1, createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get portfolio media
weddingMediaSchema.statics.getPortfolioMedia = function(serviceId, options = {}) {
  const query = { 
    service: serviceId, 
    category: 'portfolio', 
    status: 'active', 
    isPublic: true 
  };
  
  return this.find(query)
    .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get featured media
weddingMediaSchema.statics.getFeaturedMedia = function(serviceId, limit = 10) {
  return this.find({ 
    service: serviceId, 
    isFeatured: true, 
    status: 'active', 
    isPublic: true 
  })
  .sort({ displayOrder: 1, createdAt: -1 })
  .limit(limit);
};

// Static method to search media
weddingMediaSchema.statics.searchMedia = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    isPublic: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.mediaType) query.mediaType = filters.mediaType;
  if (filters.category) query.category = filters.category;
  if (filters.eventType) query.eventType = filters.eventType;
  if (filters.serviceId) query.service = filters.serviceId;

  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName')
    .sort({ isFeatured: -1, createdAt: -1 });
};

const WeddingMedia = mongoose.model('WeddingMedia', weddingMediaSchema);

export default WeddingMedia;

