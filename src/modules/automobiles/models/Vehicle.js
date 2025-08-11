const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Basic vehicle information
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 2
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  
  // Vehicle details
  category: {
    type: String,
    required: true,
    enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'wagon', 'hatchback', 'minivan', 'motorcycle', 'commercial']
  },
  bodyType: String,
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'hydrogen'],
    default: 'gasoline'
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'cvt', 'semi-automatic'],
    default: 'automatic'
  },
  drivetrain: {
    type: String,
    enum: ['fwd', 'rwd', 'awd', '4wd'],
    default: 'fwd'
  },
  
  // Engine specifications
  engine: {
    displacement: Number, // in liters
    cylinders: Number,
    horsepower: Number,
    torque: Number,
    configuration: String // V6, I4, etc.
  },
  
  // Pricing
  price: {
    msrp: {
      type: Number,
      required: true,
      min: 0
    },
    dealerPrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD']
    }
  },
  
  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'pending', 'unavailable'],
      default: 'available'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    location: {
      lot: String,
      section: String,
      notes: String
    }
  },
  
  // Vehicle condition
  condition: {
    type: String,
    enum: ['new', 'used', 'certified-pre-owned', 'damaged'],
    required: true
  },
  mileage: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Images and media
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      enum: ['exterior', 'interior', 'engine', 'features', 'damage'],
      default: 'exterior'
    }
  }],
  
  // Features and options
  features: {
    exterior: [String],
    interior: [String],
    safety: [String],
    technology: [String],
    performance: [String]
  },
  
  // Specifications
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      wheelbase: Number,
      groundClearance: Number,
      unit: {
        type: String,
        enum: ['inches', 'cm'],
        default: 'inches'
      }
    },
    weight: {
      curb: Number,
      gross: Number,
      unit: {
        type: String,
        enum: ['lbs', 'kg'],
        default: 'lbs'
      }
    },
    capacity: {
      seating: Number,
      cargo: Number,
      fuelTank: Number,
      towing: Number
    },
    performance: {
      acceleration: String, // 0-60 mph time
      topSpeed: Number,
      fuelEconomy: {
        city: Number,
        highway: Number,
        combined: Number,
        unit: {
          type: String,
          enum: ['mpg', 'l/100km'],
          default: 'mpg'
        }
      }
    }
  },
  
  // Dealer information
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  
  // SEO and marketing
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  title: String, // Marketing title
  description: {
    type: String,
    maxlength: 2000
  },
  highlights: [String],
  tags: [String],
  
  // Pricing history and promotions
  priceHistory: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  promotions: [{
    title: String,
    description: String,
    discount: {
      type: String,
      amount: Number,
      percentage: Number
    },
    validFrom: Date,
    validTo: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Vehicle history (for used cars)
  history: {
    previousOwners: Number,
    accidents: [{
      date: Date,
      description: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major']
      }
    }],
    serviceRecords: [{
      date: Date,
      mileage: Number,
      service: String,
      cost: Number,
      provider: String
    }],
    inspections: [{
      date: Date,
      type: String,
      result: String,
      notes: String
    }]
  },
  
  // Financing options
  financing: {
    available: {
      type: Boolean,
      default: true
    },
    downPayment: {
      minimum: Number,
      recommended: Number
    },
    loanTerms: [Number], // Available loan terms in months
    apr: {
      min: Number,
      max: Number
    },
    monthlyPayment: {
      estimated: Number,
      basedOnTerm: Number,
      basedOnDownPayment: Number
    }
  },
  
  // Warranty information
  warranty: {
    basic: {
      years: Number,
      miles: Number,
      description: String
    },
    powertrain: {
      years: Number,
      miles: Number,
      description: String
    },
    extended: [{
      name: String,
      years: Number,
      miles: Number,
      cost: Number,
      description: String
    }]
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  testDrives: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
vehicleSchema.index({ dealer: 1, status: 1 });
vehicleSchema.index({ make: 1, model: 1, year: 1 });
vehicleSchema.index({ category: 1, condition: 1 });
vehicleSchema.index({ 'price.msrp': 1 });
vehicleSchema.index({ 'availability.status': 1 });
vehicleSchema.index({ featured: -1, priority: -1 });
vehicleSchema.index({ slug: 1 });
vehicleSchema.index({ vin: 1 });

// Text search index
vehicleSchema.index({
  make: 'text',
  model: 'text',
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for full name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for current price (dealer price if available, otherwise MSRP)
vehicleSchema.virtual('currentPrice').get(function() {
  return this.price.dealerPrice || this.price.msrp;
});

// Virtual for savings
vehicleSchema.virtual('savings').get(function() {
  if (this.price.dealerPrice && this.price.dealerPrice < this.price.msrp) {
    return this.price.msrp - this.price.dealerPrice;
  }
  return 0;
});

// Virtual for primary image
vehicleSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
  }
  return null;
});

// Pre-save middleware to generate slug
vehicleSchema.pre('save', function(next) {
  if (this.isModified('make') || this.isModified('model') || this.isModified('year')) {
    const baseSlug = `${this.year}-${this.make}-${this.model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Add unique identifier if needed
    this.slug = `${baseSlug}-${this._id.toString().slice(-6)}`;
  }
  next();
});

// Pre-save middleware to set primary image
vehicleSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  next();
});

// Pre-save middleware to update price history
vehicleSchema.pre('save', function(next) {
  if (this.isModified('price.msrp') || this.isModified('price.dealerPrice')) {
    const currentPrice = this.price.dealerPrice || this.price.msrp;
    const lastEntry = this.priceHistory[this.priceHistory.length - 1];
    
    if (!lastEntry || lastEntry.price !== currentPrice) {
      this.priceHistory.push({
        price: currentPrice,
        date: new Date(),
        reason: this.isModified('price.dealerPrice') ? 'Dealer price update' : 'MSRP update'
      });
    }
  }
  next();
});

// Method to increment views
vehicleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to check availability
vehicleSchema.methods.isAvailable = function() {
  return this.availability.status === 'available' && this.availability.quantity > 0;
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
