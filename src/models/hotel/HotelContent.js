import mongoose from 'mongoose';

const hotelContentSchema = new mongoose.Schema({
  // Associated Hotel
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Content Type and Category
  contentType: {
    type: String,
    required: true,
    enum: [
      'description', 'amenities', 'policies', 'location-info',
      'dining', 'activities', 'services', 'gallery',
      'testimonials', 'awards', 'sustainability', 'accessibility'
    ]
  },
  category: {
    type: String,
    enum: ['general', 'rooms', 'facilities', 'location', 'policies', 'marketing'],
    default: 'general'
  },

  // Content Details
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  shortContent: {
    type: String,
    maxlength: [500, 'Short content cannot exceed 500 characters']
  },

  // Structured Content for Amenities
  amenities: {
    general: [{
      name: String,
      description: String,
      icon: String,
      available: {
        type: Boolean,
        default: true
      },
      chargeable: {
        type: Boolean,
        default: false
      },
      charge: Number
    }],
    room: [{
      name: String,
      description: String,
      icon: String,
      available: {
        type: Boolean,
        default: true
      }
    }],
    business: [{
      name: String,
      description: String,
      icon: String,
      available: {
        type: Boolean,
        default: true
      },
      chargeable: {
        type: Boolean,
        default: false
      }
    }],
    recreation: [{
      name: String,
      description: String,
      icon: String,
      available: {
        type: Boolean,
        default: true
      },
      chargeable: {
        type: Boolean,
        default: false
      },
      timings: String
    }],
    dining: [{
      name: String,
      description: String,
      cuisine: String,
      timings: String,
      priceRange: String,
      available: {
        type: Boolean,
        default: true
      }
    }]
  },

  // Policy Information
  policies: {
    checkIn: {
      time: String,
      requirements: [String],
      ageRestrictions: String
    },
    checkOut: {
      time: String,
      lateCheckoutAvailable: Boolean,
      lateCheckoutCharge: Number
    },
    cancellation: {
      policy: String,
      freeCancel: Boolean,
      freeCancelHours: Number,
      cancellationCharge: Number
    },
    payment: {
      acceptedMethods: [String],
      advancePayment: Boolean,
      advancePercentage: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    pets: {
      allowed: Boolean,
      charge: Number,
      restrictions: String
    },
    smoking: {
      allowed: Boolean,
      designatedAreas: Boolean,
      restrictions: String
    },
    children: {
      policy: String,
      freeStayAge: Number,
      extraBedCharge: Number
    }
  },

  // Location and Accessibility
  locationInfo: {
    nearbyAttractions: [{
      name: String,
      distance: String,
      description: String,
      category: {
        type: String,
        enum: ['tourist', 'business', 'shopping', 'dining', 'transport', 'medical', 'entertainment']
      }
    }],
    transportation: {
      airport: {
        name: String,
        distance: String,
        travelTime: String,
        shuttleAvailable: Boolean
      },
      railway: {
        name: String,
        distance: String,
        travelTime: String
      },
      busStation: {
        name: String,
        distance: String,
        travelTime: String
      },
      metro: {
        name: String,
        distance: String,
        travelTime: String
      }
    },
    accessibility: {
      wheelchairAccessible: Boolean,
      elevatorAccess: Boolean,
      accessibleRooms: Number,
      accessibleParking: Boolean,
      brailleSignage: Boolean,
      hearingAssistance: Boolean,
      visualAssistance: Boolean,
      accessibilityFeatures: [String]
    }
  },

  // Dining and Restaurant Information
  dining: [{
    name: String,
    type: {
      type: String,
      enum: ['restaurant', 'bar', 'cafe', 'room-service', 'buffet', 'specialty']
    },
    cuisine: [String],
    description: String,
    timings: {
      breakfast: String,
      lunch: String,
      dinner: String,
      allDay: Boolean
    },
    priceRange: String,
    capacity: Number,
    reservationRequired: Boolean,
    dressCode: String,
    specialFeatures: [String],
    menu: {
      url: String,
      highlights: [String]
    }
  }],

  // Activities and Services
  activities: [{
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['adventure', 'wellness', 'cultural', 'recreational', 'business', 'family']
    },
    duration: String,
    priceRange: String,
    availability: String,
    bookingRequired: Boolean,
    ageRestrictions: String,
    equipment: [String]
  }],

  // Services Offered
  services: [{
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['concierge', 'transport', 'business', 'wellness', 'childcare', 'laundry', 'medical']
    },
    availability: String,
    chargeable: Boolean,
    charge: Number,
    bookingRequired: Boolean,
    contactInfo: String
  }],

  // Sustainability and Awards
  sustainability: {
    certifications: [String],
    initiatives: [String],
    ecoFriendlyPractices: [String],
    carbonFootprint: String,
    wasteManagement: String,
    energyEfficiency: String
  },

  awards: [{
    title: String,
    organization: String,
    year: Number,
    description: String,
    certificate: String
  }],

  // Media Content
  media: {
    images: [{
      url: String,
      alt: String,
      caption: String,
      category: String,
      order: Number
    }],
    videos: [{
      url: String,
      title: String,
      thumbnail: String,
      duration: Number,
      category: String
    }],
    virtualTour: {
      url: String,
      title: String,
      description: String
    },
    brochures: [{
      url: String,
      title: String,
      language: String,
      fileSize: String
    }]
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

  // Version Control
  version: {
    type: Number,
    default: 1
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },

  // SEO and Multilingual
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa']
  },
  translations: [{
    language: String,
    title: String,
    content: String,
    shortContent: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
hotelContentSchema.index({ hotel: 1, contentType: 1 });
hotelContentSchema.index({ owner: 1 });
hotelContentSchema.index({ contentType: 1, category: 1 });
hotelContentSchema.index({ status: 1, isPublic: 1 });
hotelContentSchema.index({ isFeatured: 1, displayOrder: 1 });
hotelContentSchema.index({ language: 1 });
hotelContentSchema.index({ createdAt: -1 });

// Virtual for content summary
hotelContentSchema.virtual('contentSummary').get(function() {
  return {
    type: this.contentType,
    title: this.title,
    hasMedia: this.media && (this.media.images.length > 0 || this.media.videos.length > 0),
    wordCount: this.content ? this.content.split(' ').length : 0,
    lastUpdated: this.lastUpdated
  };
});

// Pre-save middleware to generate short content
hotelContentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.shortContent) {
    this.shortContent = this.content.length > 200 
      ? this.content.substring(0, 200) + '...'
      : this.content;
  }
  
  // Update version and last updated
  if (this.isModified('content') || this.isModified('title')) {
    this.lastUpdated = new Date();
    if (!this.isNew) {
      this.version += 1;
    }
  }
  
  next();
});

// Method to add translation
hotelContentSchema.methods.addTranslation = async function(language, title, content, shortContent) {
  // Remove existing translation for the language
  this.translations = this.translations.filter(t => t.language !== language);
  
  // Add new translation
  this.translations.push({
    language,
    title,
    content,
    shortContent: shortContent || (content.length > 200 ? content.substring(0, 200) + '...' : content)
  });
  
  await this.save();
};

// Method to approve content
hotelContentSchema.methods.approve = async function(userId) {
  this.isApproved = true;
  this.approvedBy = userId;
  this.approvedAt = new Date();
  this.status = 'active';
  await this.save();
};

// Static method to get content by type
hotelContentSchema.statics.getByType = function(hotelId, contentType, options = {}) {
  const query = {
    hotel: hotelId,
    contentType,
    status: 'active',
    isPublic: true
  };
  
  return this.find(query)
    .sort(options.sort || { isFeatured: -1, displayOrder: 1, createdAt: -1 })
    .limit(options.limit || 20);
};

// Static method to get all hotel content
hotelContentSchema.statics.getAllHotelContent = function(hotelId, language = 'en') {
  return this.find({
    hotel: hotelId,
    status: 'active',
    isPublic: true,
    language
  })
  .sort({ contentType: 1, displayOrder: 1 });
};

// Static method to get featured content
hotelContentSchema.statics.getFeaturedContent = function(hotelId, limit = 5) {
  return this.find({
    hotel: hotelId,
    isFeatured: true,
    status: 'active',
    isPublic: true
  })
  .sort({ displayOrder: 1, createdAt: -1 })
  .limit(limit);
};

// Static method to search content
hotelContentSchema.statics.searchContent = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    isPublic: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  // Apply filters
  if (filters.hotelId) query.hotel = filters.hotelId;
  if (filters.contentType) query.contentType = filters.contentType;
  if (filters.category) query.category = filters.category;
  if (filters.language) query.language = filters.language;

  return this.find(query)
    .populate('hotel', 'name category location')
    .sort({ isFeatured: -1, createdAt: -1 });
};

const HotelContent = mongoose.model('HotelContent', hotelContentSchema);

export default HotelContent;
