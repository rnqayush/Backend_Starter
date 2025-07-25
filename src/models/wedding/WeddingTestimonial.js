import mongoose from 'mongoose';

const weddingTestimonialSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Testimonial title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Testimonial content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  shortContent: {
    type: String,
    maxlength: [500, 'Short content cannot exceed 500 characters']
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
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingPackage'
  },

  // Client Information
  client: {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    phone: String,
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    profileImage: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },

  // Event Details
  eventDetails: {
    eventType: {
      type: String,
      enum: [
        'wedding', 'engagement', 'pre-wedding', 'reception',
        'mehendi', 'sangeet', 'haldi', 'ring-ceremony',
        'baby-shower', 'anniversary', 'other'
      ],
      required: true
    },
    eventDate: {
      type: Date,
      required: true
    },
    venue: String,
    guestCount: Number,
    budget: Number,
    servicesUsed: [String]
  },

  // Rating and Review
  rating: {
    overall: {
      type: Number,
      required: [true, 'Overall rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    serviceQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    }
  },

  // Media Attachments
  media: {
    images: [{
      url: String,
      alt: String,
      caption: String,
      order: Number
    }],
    videos: [{
      url: String,
      title: String,
      thumbnail: String,
      duration: Number
    }],
    documents: [{
      url: String,
      fileName: String,
      fileType: String
    }]
  },

  // Testimonial Type and Category
  testimonialType: {
    type: String,
    enum: ['written', 'video', 'audio', 'combined'],
    default: 'written'
  },
  category: {
    type: String,
    enum: [
      'service-quality', 'customer-service', 'value-for-money',
      'creativity', 'professionalism', 'overall-experience'
    ],
    default: 'overall-experience'
  },

  // Display and Visibility
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },

  // Status and Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,

  // Verification and Authenticity
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationMethod: {
      type: String,
      enum: ['email', 'phone', 'booking-reference', 'manual'],
    },
    verificationDate: Date,
    bookingReference: String,
    verificationNotes: String
  },

  // Response from Vendor
  vendorResponse: {
    content: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Analytics and Engagement
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
    helpfulVotes: {
      type: Number,
      default: 0
    },
    reportCount: {
      type: Number,
      default: 0
    }
  },

  // SEO and Tags
  tags: [String],
  keywords: [String],
  
  // Source and Attribution
  source: {
    type: String,
    enum: ['website', 'google', 'facebook', 'instagram', 'email', 'phone', 'other'],
    default: 'website'
  },
  sourceDetails: String,

  // Follow-up and Communication
  followUp: {
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date,
    responseReceived: {
      type: Boolean,
      default: false
    },
    responseReceivedAt: Date,
    remindersSent: {
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
weddingTestimonialSchema.index({ service: 1, status: 1 });
weddingTestimonialSchema.index({ vendor: 1, status: 1 });
weddingTestimonialSchema.index({ 'rating.overall': -1 });
weddingTestimonialSchema.index({ isFeatured: 1, displayOrder: 1 });
weddingTestimonialSchema.index({ 'eventDetails.eventDate': -1 });
weddingTestimonialSchema.index({ createdAt: -1 });
weddingTestimonialSchema.index({ 'client.isVerified': 1 });
weddingTestimonialSchema.index({ 'verification.isVerified': 1 });

// Virtual for client display name
weddingTestimonialSchema.virtual('clientDisplayName').get(function() {
  if (this.client.name) {
    // Show only first name and last initial for privacy
    const nameParts = this.client.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
    }
    return nameParts[0];
  }
  return 'Anonymous';
});

// Virtual for time since event
weddingTestimonialSchema.virtual('timeSinceEvent').get(function() {
  if (!this.eventDetails.eventDate) return null;
  
  const now = new Date();
  const eventDate = new Date(this.eventDetails.eventDate);
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

// Virtual for average detailed rating
weddingTestimonialSchema.virtual('averageDetailedRating').get(function() {
  const ratings = [
    this.rating.serviceQuality,
    this.rating.communication,
    this.rating.punctuality,
    this.rating.valueForMoney,
    this.rating.professionalism
  ].filter(rating => rating != null);
  
  if (ratings.length === 0) return this.rating.overall;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
});

// Pre-save middleware to generate short content
weddingTestimonialSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.shortContent) {
    this.shortContent = this.content.length > 200 
      ? this.content.substring(0, 200) + '...'
      : this.content;
  }
  next();
});

// Method to increment views
weddingTestimonialSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to toggle like
weddingTestimonialSchema.methods.toggleLike = async function(increment = true) {
  if (increment) {
    this.analytics.likes += 1;
  } else {
    this.analytics.likes = Math.max(0, this.analytics.likes - 1);
  }
  await this.save();
};

// Method to mark as helpful
weddingTestimonialSchema.methods.markHelpful = async function() {
  this.analytics.helpfulVotes += 1;
  await this.save();
};

// Method to report testimonial
weddingTestimonialSchema.methods.reportTestimonial = async function() {
  this.analytics.reportCount += 1;
  await this.save();
};

// Method to verify testimonial
weddingTestimonialSchema.methods.verifyTestimonial = async function(method, notes) {
  this.verification.isVerified = true;
  this.verification.verificationMethod = method;
  this.verification.verificationDate = new Date();
  this.verification.verificationNotes = notes;
  this.status = 'approved';
  await this.save();
};

// Method to add vendor response
weddingTestimonialSchema.methods.addVendorResponse = async function(content, userId) {
  this.vendorResponse.content = content;
  this.vendorResponse.respondedAt = new Date();
  this.vendorResponse.respondedBy = userId;
  await this.save();
};

// Static method to get testimonials by rating
weddingTestimonialSchema.statics.getByRating = function(serviceId, minRating = 4, options = {}) {
  const query = {
    service: serviceId,
    'rating.overall': { $gte: minRating },
    status: 'approved',
    isPublic: true
  };
  
  return this.find(query)
    .sort(options.sort || { isFeatured: -1, 'rating.overall': -1, createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get featured testimonials
weddingTestimonialSchema.statics.getFeaturedTestimonials = function(serviceId, limit = 5) {
  return this.find({
    service: serviceId,
    isFeatured: true,
    status: 'approved',
    isPublic: true
  })
  .sort({ displayOrder: 1, 'rating.overall': -1, createdAt: -1 })
  .limit(limit);
};

// Static method to get recent testimonials
weddingTestimonialSchema.statics.getRecentTestimonials = function(serviceId, days = 30, limit = 10) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    service: serviceId,
    status: 'approved',
    isPublic: true,
    createdAt: { $gte: dateThreshold }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to calculate service rating from testimonials
weddingTestimonialSchema.statics.calculateServiceRating = async function(serviceId) {
  const stats = await this.aggregate([
    {
      $match: { 
        service: mongoose.Types.ObjectId(serviceId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    }
  ]);

  if (stats.length > 0) {
    const result = stats[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[Math.floor(rating)] += 1;
    });

    return {
      average: Math.round(result.averageRating * 10) / 10,
      count: result.totalReviews,
      distribution
    };
  }

  return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
};

// Static method to search testimonials
weddingTestimonialSchema.statics.searchTestimonials = function(searchTerm, filters = {}) {
  const query = {
    status: 'approved',
    isPublic: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { 'client.name': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  // Apply filters
  if (filters.serviceId) query.service = filters.serviceId;
  if (filters.vendorId) query.vendor = filters.vendorId;
  if (filters.eventType) query['eventDetails.eventType'] = filters.eventType;
  if (filters.minRating) query['rating.overall'] = { $gte: filters.minRating };
  if (filters.verified) query['verification.isVerified'] = filters.verified;

  return this.find(query)
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName')
    .sort({ isFeatured: -1, 'rating.overall': -1, createdAt: -1 });
};

const WeddingTestimonial = mongoose.model('WeddingTestimonial', weddingTestimonialSchema);

export default WeddingTestimonial;

