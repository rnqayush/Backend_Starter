const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a business name'],
    trim: true,
    maxlength: [100, 'Business name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please add a business slug'],
    unique: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify business type'],
    enum: ['hotel', 'ecommerce', 'wedding', 'automobile', 'business']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  logo: {
    type: String,
    default: 'default-business-logo.jpg'
  },
  coverImage: {
    type: String,
    default: 'default-business-cover.jpg'
  },
  images: [String],
  contact: {
    email: {
      type: String,
      required: [true, 'Please add a contact email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please add a contact phone'],
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please add a valid phone number']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please add a valid URL'
      ]
    }
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
      default: 'United States'
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  },
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
  settings: {
    isPublished: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    allowOnlineBooking: {
      type: Boolean,
      default: true
    },
    allowOnlineOrdering: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    autoConfirmBookings: {
      type: Boolean,
      default: false
    },
    theme: {
      primaryColor: {
        type: String,
        default: '#3B82F6'
      },
      secondaryColor: {
        type: String,
        default: '#1F2937'
      },
      accentColor: {
        type: String,
        default: '#F59E0B'
      },
      fontFamily: {
        type: String,
        default: 'Inter'
      }
    }
  },
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
    startDate: Date,
    endDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [String],
  staff: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'staff', 'editor'],
      default: 'staff'
    },
    permissions: [String],
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
BusinessSchema.index({ slug: 1 });
BusinessSchema.index({ type: 1 });
BusinessSchema.index({ owner: 1 });
BusinessSchema.index({ 'settings.isPublished': 1 });
BusinessSchema.index({ 'settings.isFeatured': 1 });
BusinessSchema.index({ 'address.coordinates': '2dsphere' });
BusinessSchema.index({ createdAt: -1 });

// Virtual for full address
BusinessSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for business URL
BusinessSchema.virtual('businessUrl').get(function() {
  return `${process.env.CLIENT_URL}/${this.slug}`;
});

// Pre-save middleware to generate coordinates from address
BusinessSchema.pre('save', async function(next) {
  if (!this.isModified('address')) {
    next();
  }

  try {
    // In a real application, you would use a geocoding service like Google Maps API
    // For now, we'll set default coordinates
    if (!this.address.coordinates) {
      this.address.coordinates = {
        type: 'Point',
        coordinates: [-74.006, 40.7128] // Default to NYC coordinates
      };
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get businesses within radius
BusinessSchema.statics.getBusinessesInRadius = async function(zipcode, distance) {
  // Get lat/lng from geocoder (would use real geocoding service)
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calculate radius using radians
  // Divide distance by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const businesses = await this.find({
    'address.coordinates': {
      $geoWithin: { $centerSphere: [[lng, lat], radius] }
    }
  });

  return businesses;
};

module.exports = mongoose.model('Business', BusinessSchema);

