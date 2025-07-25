import mongoose from 'mongoose';

const weddingFAQSchema = new mongoose.Schema({
  // Basic Information
  question: {
    type: String,
    required: [true, 'FAQ question is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  answer: {
    type: String,
    required: [true, 'FAQ answer is required'],
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  shortAnswer: {
    type: String,
    maxlength: [200, 'Short answer cannot exceed 200 characters']
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

  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'general', 'pricing', 'booking', 'cancellation', 'payment',
      'services', 'delivery', 'customization', 'timeline',
      'location', 'equipment', 'team', 'experience', 'portfolio',
      'availability', 'terms', 'contact', 'other'
    ]
  },
  subcategory: String,
  tags: [String],

  // FAQ Type and Format
  faqType: {
    type: String,
    enum: ['text', 'video', 'audio', 'link'],
    default: 'text'
  },
  
  // Media Content (for video/audio FAQs)
  media: {
    videoUrl: String,
    audioUrl: String,
    thumbnail: String,
    duration: Number, // in seconds
    transcript: String
  },

  // External Links (for link type FAQs)
  externalLink: {
    url: String,
    title: String,
    description: String
  },

  // Display and Organization
  displayOrder: {
    type: Number,
    default: 0
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },

  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },

  // Source and Creation
  source: {
    type: String,
    enum: ['manual', 'customer-inquiry', 'support-ticket', 'review', 'chat', 'other'],
    default: 'manual'
  },
  sourceReference: String, // Reference to original inquiry/ticket
  
  // Customer Interaction Data
  customerData: {
    originalInquiry: String,
    customerName: String,
    customerEmail: String,
    inquiryDate: Date,
    resolved: {
      type: Boolean,
      default: false
    }
  },

  // Analytics and Engagement
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    helpfulVotes: {
      type: Number,
      default: 0
    },
    notHelpfulVotes: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    searchAppearances: {
      type: Number,
      default: 0
    }
  },

  // Related FAQs and Content
  relatedFAQs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingFAQ'
  }],
  relatedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingService'
  }],
  relatedPackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingPackage'
  }],

  // SEO and Search
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: String
  },
  searchKeywords: [String],

  // Multilingual Support
  translations: [{
    language: {
      type: String,
      enum: ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
    },
    question: String,
    answer: String,
    shortAnswer: String
  }],

  // Version Control and Updates
  version: {
    type: Number,
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updateHistory: [{
    version: Number,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: Date,
    changes: String,
    previousQuestion: String,
    previousAnswer: String
  }],

  // Approval and Moderation
  moderation: {
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    moderationNotes: String,
    requiresReview: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
weddingFAQSchema.index({ service: 1, category: 1 });
weddingFAQSchema.index({ vendor: 1, status: 1 });
weddingFAQSchema.index({ owner: 1 });
weddingFAQSchema.index({ category: 1, status: 1 });
weddingFAQSchema.index({ isPopular: 1, displayOrder: 1 });
weddingFAQSchema.index({ isFeatured: 1, displayOrder: 1 });
weddingFAQSchema.index({ tags: 1 });
weddingFAQSchema.index({ searchKeywords: 1 });
weddingFAQSchema.index({ 'seo.slug': 1 });
weddingFAQSchema.index({ createdAt: -1 });

// Text index for search
weddingFAQSchema.index({
  question: 'text',
  answer: 'text',
  tags: 'text',
  searchKeywords: 'text'
});

// Virtual for helpfulness ratio
weddingFAQSchema.virtual('helpfulnessRatio').get(function() {
  const totalVotes = this.analytics.helpfulVotes + this.analytics.notHelpfulVotes;
  if (totalVotes === 0) return 0;
  return (this.analytics.helpfulVotes / totalVotes) * 100;
});

// Virtual for engagement score
weddingFAQSchema.virtual('engagementScore').get(function() {
  const views = this.analytics.views || 1; // Avoid division by zero
  const interactions = this.analytics.helpfulVotes + this.analytics.notHelpfulVotes + this.analytics.clicks;
  return (interactions / views) * 100;
});

// Pre-save middleware to generate short answer
weddingFAQSchema.pre('save', function(next) {
  if (this.isModified('answer') && !this.shortAnswer) {
    this.shortAnswer = this.answer.length > 150 
      ? this.answer.substring(0, 150) + '...'
      : this.answer;
  }
  
  // Update version and last updated
  if (this.isModified('question') || this.isModified('answer')) {
    this.lastUpdated = new Date();
    if (!this.isNew) {
      this.version += 1;
    }
  }
  
  next();
});

// Pre-save middleware to generate SEO slug
weddingFAQSchema.pre('save', function(next) {
  if (this.isModified('question') && !this.seo.slug) {
    const slugify = (text) => {
      return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    this.seo.slug = slugify(this.question);
  }
  next();
});

// Method to increment views
weddingFAQSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to record helpful vote
weddingFAQSchema.methods.markHelpful = async function(isHelpful = true) {
  if (isHelpful) {
    this.analytics.helpfulVotes += 1;
  } else {
    this.analytics.notHelpfulVotes += 1;
  }
  await this.save();
};

// Method to record click
weddingFAQSchema.methods.recordClick = async function() {
  this.analytics.clicks += 1;
  await this.save();
};

// Method to record search appearance
weddingFAQSchema.methods.recordSearchAppearance = async function() {
  this.analytics.searchAppearances += 1;
  await this.save();
};

// Method to add translation
weddingFAQSchema.methods.addTranslation = async function(language, question, answer, shortAnswer) {
  // Remove existing translation for the language
  this.translations = this.translations.filter(t => t.language !== language);
  
  // Add new translation
  this.translations.push({
    language,
    question,
    answer,
    shortAnswer: shortAnswer || (answer.length > 150 ? answer.substring(0, 150) + '...' : answer)
  });
  
  await this.save();
};

// Method to create version history
weddingFAQSchema.methods.createVersionHistory = async function(userId, changes, previousQuestion, previousAnswer) {
  this.updateHistory.push({
    version: this.version,
    updatedBy: userId,
    updatedAt: new Date(),
    changes,
    previousQuestion,
    previousAnswer
  });
  await this.save();
};

// Method to approve FAQ
weddingFAQSchema.methods.approve = async function(userId, notes) {
  this.moderation.isApproved = true;
  this.moderation.approvedBy = userId;
  this.moderation.approvedAt = new Date();
  this.moderation.moderationNotes = notes;
  this.status = 'active';
  await this.save();
};

// Static method to get FAQs by category
weddingFAQSchema.statics.getByCategory = function(serviceId, category, options = {}) {
  const query = {
    service: serviceId,
    category,
    status: 'active',
    isPublic: true
  };
  
  return this.find(query)
    .sort(options.sort || { isPopular: -1, displayOrder: 1, createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get popular FAQs
weddingFAQSchema.statics.getPopularFAQs = function(serviceId, limit = 10) {
  return this.find({
    service: serviceId,
    isPopular: true,
    status: 'active',
    isPublic: true
  })
  .sort({ displayOrder: 1, 'analytics.views': -1 })
  .limit(limit);
};

// Static method to get featured FAQs
weddingFAQSchema.statics.getFeaturedFAQs = function(serviceId, limit = 5) {
  return this.find({
    service: serviceId,
    isFeatured: true,
    status: 'active',
    isPublic: true
  })
  .sort({ displayOrder: 1, createdAt: -1 })
  .limit(limit);
};

// Static method to search FAQs
weddingFAQSchema.statics.searchFAQs = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    isPublic: true,
    $text: { $search: searchTerm }
  };

  // Apply filters
  if (filters.serviceId) query.service = filters.serviceId;
  if (filters.vendorId) query.vendor = filters.vendorId;
  if (filters.category) query.category = filters.category;
  if (filters.faqType) query.faqType = filters.faqType;

  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('service', 'serviceName category')
    .populate('vendor', 'businessName')
    .sort({ score: { $meta: 'textScore' }, isPopular: -1 });
};

// Static method to get related FAQs
weddingFAQSchema.statics.getRelatedFAQs = function(faqId, serviceId, limit = 5) {
  return this.findById(faqId)
    .then(faq => {
      if (!faq) return [];
      
      const query = {
        _id: { $ne: faqId },
        service: serviceId,
        status: 'active',
        isPublic: true,
        $or: [
          { category: faq.category },
          { tags: { $in: faq.tags } },
          { searchKeywords: { $in: faq.searchKeywords } }
        ]
      };
      
      return this.find(query)
        .sort({ isPopular: -1, 'analytics.views': -1 })
        .limit(limit);
    });
};

// Static method to get FAQ analytics
weddingFAQSchema.statics.getFAQAnalytics = async function(serviceId, dateRange = 30) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - dateRange);
  
  const analytics = await this.aggregate([
    {
      $match: {
        service: mongoose.Types.ObjectId(serviceId),
        createdAt: { $gte: dateThreshold }
      }
    },
    {
      $group: {
        _id: null,
        totalFAQs: { $sum: 1 },
        totalViews: { $sum: '$analytics.views' },
        totalHelpfulVotes: { $sum: '$analytics.helpfulVotes' },
        totalNotHelpfulVotes: { $sum: '$analytics.notHelpfulVotes' },
        averageHelpfulness: { 
          $avg: {
            $cond: [
              { $eq: [{ $add: ['$analytics.helpfulVotes', '$analytics.notHelpfulVotes'] }, 0] },
              0,
              { 
                $divide: [
                  '$analytics.helpfulVotes',
                  { $add: ['$analytics.helpfulVotes', '$analytics.notHelpfulVotes'] }
                ]
              }
            ]
          }
        },
        categoryDistribution: {
          $push: '$category'
        }
      }
    }
  ]);

  return analytics.length > 0 ? analytics[0] : {
    totalFAQs: 0,
    totalViews: 0,
    totalHelpfulVotes: 0,
    totalNotHelpfulVotes: 0,
    averageHelpfulness: 0,
    categoryDistribution: []
  };
};

const WeddingFAQ = mongoose.model('WeddingFAQ', weddingFAQSchema);

export default WeddingFAQ;

