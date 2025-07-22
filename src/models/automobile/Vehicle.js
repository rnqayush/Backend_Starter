import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  variant: {
    type: String,
    trim: true
  },
  
  // Vehicle Details
  bodyType: {
    type: String,
    enum: ['sedan', 'hatchback', 'suv', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'truck'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic', 'cvt', 'amt'],
    required: true
  },
  engineCapacity: {
    type: Number, // in CC
    required: true
  },
  power: {
    bhp: Number,
    torque: Number
  },
  mileage: {
    city: Number,
    highway: Number,
    combined: Number
  },
  
  // Pricing
  price: {
    base: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    negotiable: {
      type: Boolean,
      default: true
    }
  },
  
  // Condition & History
  condition: {
    type: String,
    enum: ['new', 'used', 'certified-pre-owned'],
    required: true
  },
  mileageReading: {
    type: Number,
    default: 0
  },
  owners: {
    type: Number,
    default: 1,
    min: 1
  },
  accidentHistory: {
    type: Boolean,
    default: false
  },
  serviceHistory: {
    type: String,
    enum: ['complete', 'partial', 'none'],
    default: 'none'
  },
  
  // Features & Specifications
  features: {
    safety: [String],
    comfort: [String],
    entertainment: [String],
    exterior: [String],
    interior: [String]
  },
  specifications: {
    seatingCapacity: Number,
    doors: Number,
    bootSpace: Number, // in liters
    fuelTankCapacity: Number, // in liters
    groundClearance: Number, // in mm
    length: Number, // in mm
    width: Number, // in mm
    height: Number, // in mm
    wheelbase: Number, // in mm
    kerbWeight: Number, // in kg
    maxSpeed: Number, // in kmph
    acceleration: Number // 0-100 kmph in seconds
  },
  
  // Colors
  colors: {
    exterior: [String],
    interior: [String],
    available: [String]
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean,
    order: Number
  }],
  videos: [{
    url: String,
    title: String,
    type: String // 'review', 'walkaround', 'test-drive'
  }],
  documents: [{
    type: String, // 'brochure', 'manual', 'certificate'
    url: String,
    name: String
  }],
  
  // Dealer Information
  dealer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  dealership: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    contact: {
      phone: String,
      email: String,
      website: String
    }
  },
  
  // Availability
  availability: {
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'discontinued'],
      default: 'available'
    },
    quantity: {
      type: Number,
      default: 1
    },
    expectedDelivery: Date,
    bookingAmount: Number
  },
  
  // SEO & Marketing
  slug: {
    type: String,
    unique: true
  },
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  tags: [String],
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    enquiries: { type: Number, default: 0 },
    testDrives: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    lastViewed: Date
  },
  
  // Status & Moderation
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'rejected'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  
  // Ratings & Reviews
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // Comparison
  competitors: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle'
  }],
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
vehicleSchema.index({ make: 1, model: 1, year: 1 });
vehicleSchema.index({ dealer: 1 });
vehicleSchema.index({ 'price.current': 1 });
vehicleSchema.index({ bodyType: 1 });
vehicleSchema.index({ fuelType: 1 });
vehicleSchema.index({ condition: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ featured: 1 });
vehicleSchema.index({ 'availability.status': 1 });
vehicleSchema.index({ location: '2dsphere' });
vehicleSchema.index({ slug: 1 });
vehicleSchema.index({ tags: 1 });
vehicleSchema.index({ createdAt: -1 });

// Virtual for full name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}${this.variant ? ' ' + this.variant : ''}`;
});

// Virtual for price range
vehicleSchema.virtual('priceRange').get(function() {
  const price = this.price.current;
  if (price < 500000) return 'budget';
  if (price < 1500000) return 'mid-range';
  if (price < 3000000) return 'premium';
  return 'luxury';
});

// Virtual for age
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Pre-save middleware to generate slug
vehicleSchema.pre('save', function(next) {
  if (this.isModified('make') || this.isModified('model') || this.isModified('year') || !this.slug) {
    const baseSlug = `${this.year}-${this.make}-${this.model}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    this.slug = baseSlug;
  }
  next();
});

// Method to increment views
vehicleSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

// Method to calculate EMI
vehicleSchema.methods.calculateEMI = function(downPayment = 0, loanTenure = 60, interestRate = 8.5) {
  const principal = this.price.current - downPayment;
  const monthlyRate = interestRate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, loanTenure)) / 
              (Math.pow(1 + monthlyRate, loanTenure) - 1);
  
  return {
    emi: Math.round(emi),
    totalAmount: Math.round(emi * loanTenure + downPayment),
    totalInterest: Math.round(emi * loanTenure - principal),
    principal,
    downPayment,
    loanTenure,
    interestRate
  };
};

// Static method to get popular vehicles
vehicleSchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'analytics.views': -1, 'analytics.enquiries': -1 })
    .limit(limit)
    .populate('dealer', 'name businessInfo');
};

// Static method to search vehicles
vehicleSchema.statics.searchVehicles = function(filters = {}) {
  const query = { status: 'published' };
  
  if (filters.make) query.make = new RegExp(filters.make, 'i');
  if (filters.model) query.model = new RegExp(filters.model, 'i');
  if (filters.bodyType) query.bodyType = filters.bodyType;
  if (filters.fuelType) query.fuelType = filters.fuelType;
  if (filters.transmission) query.transmission = filters.transmission;
  if (filters.condition) query.condition = filters.condition;
  
  if (filters.priceMin || filters.priceMax) {
    query['price.current'] = {};
    if (filters.priceMin) query['price.current'].$gte = filters.priceMin;
    if (filters.priceMax) query['price.current'].$lte = filters.priceMax;
  }
  
  if (filters.yearMin || filters.yearMax) {
    query.year = {};
    if (filters.yearMin) query.year.$gte = filters.yearMin;
    if (filters.yearMax) query.year.$lte = filters.yearMax;
  }
  
  if (filters.city) {
    query['location.city'] = new RegExp(filters.city, 'i');
  }
  
  if (filters.features && filters.features.length > 0) {
    query.$or = [
      { 'features.safety': { $in: filters.features } },
      { 'features.comfort': { $in: filters.features } },
      { 'features.entertainment': { $in: filters.features } },
      { 'features.exterior': { $in: filters.features } },
      { 'features.interior': { $in: filters.features } }
    ];
  }
  
  return this.find(query);
};

export default mongoose.model('Vehicle', vehicleSchema);

