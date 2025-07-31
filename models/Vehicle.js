const mongoose = require('mongoose');

/**
 * Vehicle Model
 * Represents vehicles in an automobile business
 */
const vehicleSchema = new mongoose.Schema({
  // Basic Information
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    index: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'],
    index: true
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Vehicle Identification
  vin: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    index: true
  },
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true,
    index: true
  },
  stockNumber: {
    type: String,
    trim: true,
    uppercase: true,
    index: true
  },
  
  // Vehicle Details
  details: {
    bodyType: {
      type: String,
      enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'wagon', 'hatchback', 'van', 'motorcycle', 'other'],
      required: true,
      index: true
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'semi-automatic'],
      required: true
    },
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'plug-in-hybrid', 'hydrogen'],
      required: true,
      index: true
    },
    drivetrain: {
      type: String,
      enum: ['fwd', 'rwd', 'awd', '4wd'],
      required: true
    },
    engine: {
      size: { type: Number }, // in liters
      cylinders: { type: Number },
      horsepower: { type: Number },
      torque: { type: Number }
    },
    doors: { type: Number, min: 2, max: 6 },
    seats: { type: Number, min: 1, max: 15 },
    color: {
      exterior: { type: String, required: true },
      interior: { type: String }
    }
  },
  
  // Condition and Mileage
  condition: {
    type: String,
    enum: ['new', 'used', 'certified-pre-owned', 'salvage', 'rebuilt'],
    required: true,
    index: true
  },
  mileage: {
    type: Number,
    min: 0,
    index: true
  },
  
  // Pricing
  pricing: {
    listPrice: {
      type: Number,
      required: [true, 'List price is required'],
      min: [0, 'Price cannot be negative']
    },
    salePrice: { type: Number, min: 0 },
    msrp: { type: Number, min: 0 },
    invoicePrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    priceType: {
      type: String,
      enum: ['fixed', 'negotiable', 'auction', 'lease-only'],
      default: 'negotiable'
    },
    financing: {
      available: { type: Boolean, default: true },
      downPayment: { type: Number, min: 0 },
      monthlyPayment: { type: Number, min: 0 },
      term: { type: Number }, // in months
      apr: { type: Number, min: 0, max: 100 }
    },
    lease: {
      available: { type: Boolean, default: false },
      monthlyPayment: { type: Number, min: 0 },
      term: { type: Number }, // in months
      mileageLimit: { type: Number }, // per year
      downPayment: { type: Number, min: 0 }
    }
  },
  
  // Features and Options
  features: {
    standard: [{ type: String }],
    optional: [{
      name: { type: String, required: true },
      price: { type: Number, min: 0 },
      installed: { type: Boolean, default: false }
    }],
    packages: [{
      name: { type: String, required: true },
      features: [{ type: String }],
      price: { type: Number, min: 0 },
      installed: { type: Boolean, default: false }
    }]
  },
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    category: {
      type: String,
      enum: ['exterior', 'interior', 'engine', 'wheels', 'features', 'damage', 'other'],
      default: 'exterior'
    },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  }],
  videos: [{
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    type: { type: String, enum: ['walkthrough', 'test-drive', 'features', 'other'] }
  }],
  
  // Location
  location: {
    dealership: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // History and Records
  history: {
    owners: { type: Number, min: 0 },
    accidents: { type: Number, min: 0, default: 0 },
    serviceRecords: [{
      date: { type: Date, required: true },
      mileage: { type: Number, required: true },
      service: { type: String, required: true },
      cost: { type: Number, min: 0 },
      provider: { type: String }
    }],
    inspections: [{
      date: { type: Date, required: true },
      type: { type: String, required: true },
      result: { type: String, enum: ['pass', 'fail', 'conditional'], required: true },
      expiryDate: { type: Date },
      notes: { type: String }
    }]
  },
  
  // Warranty
  warranty: {
    manufacturer: {
      remaining: { type: Boolean, default: false },
      expiryDate: { type: Date },
      mileageLimit: { type: Number },
      coverage: { type: String }
    },
    extended: {
      available: { type: Boolean, default: false },
      provider: { type: String },
      cost: { type: Number, min: 0 },
      coverage: { type: String },
      term: { type: Number } // in months
    }
  },
  
  // Status and Availability
  status: {
    type: String,
    enum: ['available', 'sold', 'pending', 'reserved', 'in-service', 'unavailable'],
    default: 'available',
    index: true
  },
  availability: {
    testDrive: { type: Boolean, default: true },
    inspection: { type: Boolean, default: true },
    delivery: { type: Boolean, default: true },
    trade: { type: Boolean, default: true }
  },
  
  // SEO and Marketing
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String }],
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    }
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    testDrives: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    lastViewed: { type: Date },
    daysOnLot: { type: Number, default: 0 }
  },
  
  // Special Offers
  offers: [{
    type: { type: String, enum: ['discount', 'rebate', 'financing', 'lease', 'trade-bonus'] },
    title: { type: String, required: true },
    description: { type: String },
    value: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  }],
  
  // Tags and Categories
  tags: [{ type: String, trim: true, lowercase: true }],
  categories: [{ type: String, enum: ['luxury', 'economy', 'family', 'sports', 'commercial', 'classic'] }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
vehicleSchema.index({ website: 1, status: 1 });
vehicleSchema.index({ make: 1, model: 1, year: 1 });
vehicleSchema.index({ 'details.bodyType': 1 });
vehicleSchema.index({ 'details.fuelType': 1 });
vehicleSchema.index({ condition: 1 });
vehicleSchema.index({ 'pricing.listPrice': 1 });
vehicleSchema.index({ mileage: 1 });
vehicleSchema.index({ tags: 1 });
vehicleSchema.index({ categories: 1 });

// Virtual for vehicle name
vehicleSchema.virtual('name').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for primary image
vehicleSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for current price
vehicleSchema.virtual('currentPrice').get(function() {
  return this.pricing.salePrice || this.pricing.listPrice;
});

// Virtual for savings amount
vehicleSchema.virtual('savings').get(function() {
  if (this.pricing.salePrice && this.pricing.listPrice > this.pricing.salePrice) {
    return this.pricing.listPrice - this.pricing.salePrice;
  }
  if (this.pricing.msrp && this.pricing.listPrice < this.pricing.msrp) {
    return this.pricing.msrp - this.pricing.listPrice;
  }
  return 0;
});

// Virtual for fuel economy estimate
vehicleSchema.virtual('fuelEconomy').get(function() {
  // This would typically come from a database or API
  // Simplified estimation based on vehicle type and fuel type
  const baseEconomy = {
    'sedan': 28,
    'suv': 22,
    'truck': 18,
    'coupe': 25,
    'convertible': 24,
    'wagon': 26,
    'hatchback': 30,
    'van': 20,
    'motorcycle': 45
  };
  
  let mpg = baseEconomy[this.details.bodyType] || 25;
  
  if (this.details.fuelType === 'hybrid') mpg *= 1.5;
  else if (this.details.fuelType === 'electric') mpg = 100; // MPGe equivalent
  else if (this.details.fuelType === 'diesel') mpg *= 1.2;
  
  return Math.round(mpg);
});

// Methods
vehicleSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.analytics.lastViewed = new Date();
  return this.save();
};

vehicleSchema.methods.recordInquiry = function() {
  this.analytics.inquiries += 1;
  return this.save();
};

vehicleSchema.methods.recordTestDrive = function() {
  this.analytics.testDrives += 1;
  return this.save();
};

vehicleSchema.methods.addToFavorites = function() {
  this.analytics.favorites += 1;
  return this.save();
};

vehicleSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

vehicleSchema.methods.addServiceRecord = function(serviceInfo) {
  this.history.serviceRecords.push(serviceInfo);
  this.history.serviceRecords.sort((a, b) => b.date - a.date);
  return this.save();
};

vehicleSchema.methods.addInspection = function(inspectionInfo) {
  this.history.inspections.push(inspectionInfo);
  this.history.inspections.sort((a, b) => b.date - a.date);
  return this.save();
};

vehicleSchema.methods.calculateDaysOnLot = function() {
  const today = new Date();
  const createdDate = new Date(this.createdAt);
  this.analytics.daysOnLot = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
  return this.analytics.daysOnLot;
};

vehicleSchema.methods.getActiveOffers = function() {
  const now = new Date();
  return this.offers.filter(offer => 
    offer.isActive && 
    offer.startDate <= now && 
    offer.endDate >= now
  );
};

// Static methods
vehicleSchema.statics.findByWebsite = function(websiteId, status = 'available') {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query);
};

vehicleSchema.statics.searchVehicles = function(websiteId, filters = {}) {
  const query = { website: websiteId, status: 'available' };
  
  if (filters.make) query.make = new RegExp(filters.make, 'i');
  if (filters.model) query.model = new RegExp(filters.model, 'i');
  if (filters.yearMin || filters.yearMax) {
    query.year = {};
    if (filters.yearMin) query.year.$gte = filters.yearMin;
    if (filters.yearMax) query.year.$lte = filters.yearMax;
  }
  if (filters.priceMin || filters.priceMax) {
    query['pricing.listPrice'] = {};
    if (filters.priceMin) query['pricing.listPrice'].$gte = filters.priceMin;
    if (filters.priceMax) query['pricing.listPrice'].$lte = filters.priceMax;
  }
  if (filters.mileageMax) query.mileage = { $lte: filters.mileageMax };
  if (filters.bodyType) query['details.bodyType'] = filters.bodyType;
  if (filters.fuelType) query['details.fuelType'] = filters.fuelType;
  if (filters.condition) query.condition = filters.condition;
  if (filters.transmission) query['details.transmission'] = filters.transmission;
  if (filters.drivetrain) query['details.drivetrain'] = filters.drivetrain;
  if (filters.categories && filters.categories.length > 0) {
    query.categories = { $in: filters.categories };
  }
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  
  return this.find(query);
};

vehicleSchema.statics.getFeaturedVehicles = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'available',
    categories: 'luxury'
  }).sort({ 'analytics.views': -1 }).limit(limit);
};

vehicleSchema.statics.getRecentlyAdded = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'available'
  }).sort({ createdAt: -1 }).limit(limit);
};

vehicleSchema.statics.getByPriceRange = function(websiteId, minPrice, maxPrice) {
  return this.find({
    website: websiteId,
    status: 'available',
    'pricing.listPrice': { $gte: minPrice, $lte: maxPrice }
  }).sort({ 'pricing.listPrice': 1 });
};

// Pre-save middleware
vehicleSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.seo.slug) {
    this.seo.slug = `${this.year}-${this.make}-${this.model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(img => {
      if (img.isPrimary) primaryCount++;
    });
    
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    } else if (primaryCount > 1) {
      let firstPrimary = true;
      this.images.forEach(img => {
        if (img.isPrimary && !firstPrimary) {
          img.isPrimary = false;
        } else if (img.isPrimary && firstPrimary) {
          firstPrimary = false;
        }
      });
    }
  }
  
  // Calculate days on lot
  this.calculateDaysOnLot();
  
  // Set default SEO title if not provided
  if (!this.seo.title) {
    this.seo.title = `${this.year} ${this.make} ${this.model} for Sale`;
  }
  
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);

