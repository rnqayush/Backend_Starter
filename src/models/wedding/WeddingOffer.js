import mongoose from 'mongoose';
import slugify from 'slugify';

const weddingOfferSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Offer title is required'],
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
    required: [true, 'Offer description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  tagline: {
    type: String,
    maxlength: [100, 'Tagline cannot exceed 100 characters']
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

  // Applicable Packages (if specific to certain packages)
  applicablePackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WeddingPackage'
  }],

  // Offer Type and Category
  offerType: {
    type: String,
    required: true,
    enum: [
      'percentage-discount', 'fixed-amount-discount', 'buy-one-get-one',
      'free-service', 'upgrade', 'combo-deal', 'early-bird',
      'last-minute', 'seasonal', 'bulk-booking', 'referral',
      'loyalty', 'first-time-customer', 'other'
    ]
  },
  category: {
    type: String,
    required: true,
    enum: [
      'photography', 'videography', 'decoration', 'catering', 'venue',
      'makeup', 'mehendi', 'music', 'flowers', 'planning',
      'clothing', 'jewelry', 'invitations', 'transportation', 'combo'
    ]
  },

  // Discount Details
  discount: {
    type: {
      type: String,
      enum: ['percentage', 'fixed-amount', 'free-item', 'upgrade'],
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Discount value cannot be negative']
    },
    maxDiscount: Number, // Maximum discount amount for percentage discounts
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Offer Conditions and Requirements
  conditions: {
    minimumBookingAmount: {
      type: Number,
      min: 0
    },
    minimumAdvanceBooking: Number, // days
    maximumAdvanceBooking: Number, // days
    applicableEventTypes: [{
      type: String,
      enum: [
        'wedding', 'engagement', 'pre-wedding', 'reception',
        'mehendi', 'sangeet', 'haldi', 'ring-ceremony',
        'baby-shower', 'anniversary', 'other'
      ]
    }],
    applicableLocations: [{
      city: String,
      state: String,
      pincode: String
    }],
    guestCountRange: {
      min: Number,
      max: Number
    }
  },

  // Validity and Timing
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },

  // Usage Limits
  usageLimit: {
    totalUses: {
      type: Number,
      default: null // null means unlimited
    },
    usesPerCustomer: {
      type: Number,
      default: 1
    },
    usesPerDay: Number,
    currentUses: {
      type: Number,
      default: 0
    }
  },

  // Promo Code (if applicable)
  promoCode: {
    code: {
      type: String,
      uppercase: true,
      sparse: true,
      unique: true
    },
    isRequired: {
      type: Boolean,
      default: false
    },
    autoApply: {
      type: Boolean,
      default: false
    }
  },

  // Display and Visibility
  display: {
    isFeatured: {
      type: Boolean,
      default: false
    },
    showOnHomepage: {
      type: Boolean,
      default: false
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    badgeText: String, // e.g., "LIMITED TIME", "BEST DEAL"
    urgencyText: String // e.g., "Only 2 days left!"
  },

  // Status and Approval
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'cancelled'],
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

  // Terms and Conditions
  terms: {
    termsAndConditions: {
      type: String,
      required: true
    },
    cancellationPolicy: String,
    refundPolicy: String,
    additionalNotes: String
  },

  // Analytics and Performance
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
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
  tags: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
weddingOfferSchema.index({ service: 1, status: 1 });
weddingOfferSchema.index({ vendor: 1, status: 1 });
weddingOfferSchema.index({ owner: 1 });
weddingOfferSchema.index({ slug: 1 });
weddingOfferSchema.index({ offerType: 1, category: 1 });
weddingOfferSchema.index({ 'validity.startDate': 1, 'validity.endDate': 1 });
weddingOfferSchema.index({ 'promoCode.code': 1 });
weddingOfferSchema.index({ 'display.isFeatured': 1, 'display.displayOrder': 1 });
weddingOfferSchema.index({ status: 1, isApproved: 1 });
weddingOfferSchema.index({ createdAt: -1 });

// Virtual for offer validity status
weddingOfferSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now &&
         (this.usageLimit.totalUses === null || this.usageLimit.currentUses < this.usageLimit.totalUses);
});

// Virtual for days remaining
weddingOfferSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.validity.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Pre-save middleware to generate slug
weddingOfferSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(`${this.title}-${this._id}`, { lower: true, strict: true });
  }
  next();
});

// Method to get discount display text
weddingOfferSchema.methods.getDiscountDisplayText = function() {
  switch (this.discount.type) {
    case 'percentage':
      return `${this.discount.value}% OFF`;
    case 'fixed-amount':
      return `₹${this.discount.value} OFF`;
    case 'free-item':
      return 'FREE ITEM';
    case 'upgrade':
      return 'FREE UPGRADE';
    default:
      return 'SPECIAL OFFER';
  }
};

// Method to calculate discount amount
weddingOfferSchema.methods.calculateDiscount = function(originalAmount) {
  let discountAmount = 0;
  
  switch (this.discount.type) {
    case 'percentage':
      discountAmount = (originalAmount * this.discount.value) / 100;
      if (this.discount.maxDiscount && discountAmount > this.discount.maxDiscount) {
        discountAmount = this.discount.maxDiscount;
      }
      break;
    case 'fixed-amount':
      discountAmount = Math.min(this.discount.value, originalAmount);
      break;
    default:
      discountAmount = 0;
  }
  
  return {
    discountAmount,
    finalAmount: originalAmount - discountAmount,
    savings: discountAmount
  };
};

// Method to increment views
weddingOfferSchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to increment clicks
weddingOfferSchema.methods.incrementClicks = async function() {
  this.analytics.clicks += 1;
  await this.save();
};

// Static method to get active offers
weddingOfferSchema.statics.getActiveOffers = function(serviceId, options = {}) {
  const now = new Date();
  const query = {
    service: serviceId,
    status: 'active',
    isApproved: true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now }
  };
  
  return this.find(query)
    .sort(options.sort || { 'display.isFeatured': -1, 'display.displayOrder': 1, createdAt: -1 })
    .limit(options.limit || 20);
};

const WeddingOffer = mongoose.model('WeddingOffer', weddingOfferSchema);

export default WeddingOffer;
