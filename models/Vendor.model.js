const mongoose = require('mongoose');
const slugify = require('slugify');
const { VENDOR_STATUS } = require('../config/constants');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  businessType: {
    type: String,
    required: [true, 'Business type is required'],
    enum: [
      'individual',
      'partnership',
      'corporation',
      'llc',
      'nonprofit',
      'other'
    ]
  },
  category: {
    type: String,
    required: [true, 'Business category is required'],
    enum: [
      'electronics',
      'clothing',
      'home_garden',
      'sports',
      'books',
      'health_beauty',
      'automotive',
      'toys_games',
      'food_beverages',
      'jewelry',
      'art_crafts',
      'services',
      'other'
    ]
  },
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  businessAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Business phone is required'],
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Business email is required'],
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email'
      ]
    },
    website: {
      type: String,
      match: [
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        'Please enter a valid website URL'
      ]
    }
  },
  businessDocuments: {
    businessLicense: String,
    taxId: String,
    bankStatement: String,
    identityProof: String
  },
  status: {
    type: String,
    enum: Object.values(VENDOR_STATUS),
    default: VENDOR_STATUS.PENDING
  },
  verificationNotes: String,
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  rejectionReason: String,
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    completedOrders: {
      type: Number,
      default: 0
    }
  },
  settings: {
    isActive: {
      type: Boolean,
      default: true
    },
    acceptsReturns: {
      type: Boolean,
      default: true
    },
    returnPolicy: String,
    shippingPolicy: String,
    processingTime: {
      type: Number,
      default: 1, // days
      min: 1,
      max: 30
    }
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full business address
vendorSchema.virtual('fullAddress').get(function() {
  const addr = this.businessAddress;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for approval status
vendorSchema.virtual('isApproved').get(function() {
  return this.status === VENDOR_STATUS.APPROVED;
});

// Virtual for products (will be populated from Product model)
vendorSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'vendor'
});

// Indexes
vendorSchema.index({ user: 1 });
vendorSchema.index({ slug: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ category: 1 });
vendorSchema.index({ 'rating.average': -1 });
vendorSchema.index({ createdAt: -1 });
vendorSchema.index({ businessName: 'text', description: 'text' });

// Pre-save middleware to generate slug
vendorSchema.pre('save', function(next) {
  if (this.isModified('businessName') || this.isNew) {
    this.slug = slugify(this.businessName, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Static method to find approved vendors
vendorSchema.statics.findApproved = function() {
  return this.find({ status: VENDOR_STATUS.APPROVED });
};

// Static method to find by category
vendorSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: VENDOR_STATUS.APPROVED,
    'settings.isActive': true 
  });
};

// Static method to search vendors
vendorSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    status: VENDOR_STATUS.APPROVED,
    'settings.isActive': true
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance method to update rating
vendorSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Instance method to update stats
vendorSchema.methods.updateStats = function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.stats[key] !== undefined) {
      this.stats[key] += updates[key];
    }
  });
  return this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema);
