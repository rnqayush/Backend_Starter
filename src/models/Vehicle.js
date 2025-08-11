const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Vehicle title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true,
  },
  description: {
    type: String,
    required: [true, 'Vehicle description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },

  // Dealer Information
  dealerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dealer ID is required'],
    index: true,
  },
  dealershipName: {
    type: String,
    required: true,
    trim: true,
  },

  // Vehicle Details
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    index: true,
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    index: true,
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'],
    index: true,
  },
  trim: {
    type: String,
    trim: true,
  },

  // Vehicle Type & Category
  category: {
    type: String,
    required: [true, 'Vehicle category is required'],
    enum: [
      'sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'wagon', 'pickup',
      'van', 'truck', 'motorcycle', 'boat', 'rv', 'atv', 'other'
    ],
    index: true,
  },
  bodyType: {
    type: String,
    enum: [
      '2-door', '4-door', 'hatchback', 'wagon', 'convertible', 'pickup',
      'van', 'suv', 'crossover', 'coupe', 'sedan', 'other'
    ],
  },
  condition: {
    type: String,
    required: [true, 'Vehicle condition is required'],
    enum: ['new', 'used', 'certified_pre_owned', 'salvage', 'rebuilt'],
    index: true,
  },

  // Pricing
  pricing: {
    listPrice: {
      type: Number,
      required: [true, 'List price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    },
    priceType: {
      type: String,
      enum: ['fixed', 'negotiable', 'auction', 'lease'],
      default: 'negotiable',
    },
    downPayment: Number,
    monthlyPayment: Number,
    leaseTerm: Number, // months
    priceHistory: [{
      price: Number,
      date: { type: Date, default: Date.now },
      reason: String,
    }],
  },

  // Technical Specifications
  specifications: {
    engine: {
      type: String,
      displacement: Number, // in liters
      cylinders: Number,
      horsepower: Number,
      torque: Number,
      fuelType: {
        type: String,
        enum: ['gasoline', 'diesel', 'hybrid', 'electric', 'plug_in_hybrid', 'hydrogen', 'other'],
      },
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt', 'semi_automatic', 'dual_clutch'],
    },
    drivetrain: {
      type: String,
      enum: ['fwd', 'rwd', 'awd', '4wd'],
    },
    fuelEconomy: {
      city: Number, // mpg
      highway: Number, // mpg
      combined: Number, // mpg
    },
    performance: {
      acceleration: Number, // 0-60 mph time
      topSpeed: Number,
      quarterMile: Number,
    },
  },

  // Physical Details
  exterior: {
    color: {
      type: String,
      required: [true, 'Exterior color is required'],
    },
    colorCode: String,
    paintType: {
      type: String,
      enum: ['solid', 'metallic', 'pearl', 'matte', 'custom'],
    },
  },
  interior: {
    color: String,
    material: {
      type: String,
      enum: ['cloth', 'leather', 'vinyl', 'synthetic', 'alcantara', 'other'],
    },
    seatingCapacity: {
      type: Number,
      min: 1,
      max: 50,
    },
  },

  // Vehicle History & Condition
  history: {
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage cannot be negative'],
    },
    previousOwners: {
      type: Number,
      default: 1,
      min: 0,
    },
    accidents: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceRecords: [{
      date: Date,
      mileage: Number,
      service: String,
      cost: Number,
      provider: String,
    }],
    recalls: [{
      recallNumber: String,
      description: String,
      status: { type: String, enum: ['open', 'completed', 'not_applicable'] },
      completedDate: Date,
    }],
  },

  // Identification
  identification: {
    vin: {
      type: String,
      required: [true, 'VIN is required'],
      unique: true,
      uppercase: true,
      minlength: [17, 'VIN must be 17 characters'],
      maxlength: [17, 'VIN must be 17 characters'],
      index: true,
    },
    licensePlate: String,
    stockNumber: String,
    lotNumber: String,
  },

  // Features & Options
  features: {
    safety: [String], // e.g., ['ABS', 'Airbags', 'Backup Camera']
    comfort: [String], // e.g., ['AC', 'Heated Seats', 'Sunroof']
    technology: [String], // e.g., ['Bluetooth', 'Navigation', 'Apple CarPlay']
    performance: [String], // e.g., ['Sport Mode', 'Launch Control']
    exterior: [String], // e.g., ['Alloy Wheels', 'Roof Rails']
    interior: [String], // e.g., ['Premium Audio', 'Leather Seats']
  },

  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['exterior', 'interior', 'engine', 'wheels', 'other'],
      default: 'exterior',
    },
    order: { type: Number, default: 0 },
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String,
    duration: Number,
    category: {
      type: String,
      enum: ['walkaround', 'interior', 'driving', 'engine', 'other'],
    },
  }],

  // Location
  location: {
    address: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: String,
    country: { type: String, default: 'US' },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },

  // Status & Availability
  status: {
    type: String,
    enum: ['available', 'pending', 'sold', 'reserved', 'inactive'],
    default: 'available',
    index: true,
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    reservedUntil: Date,
    soldDate: Date,
    deliveryDate: Date,
  },

  // SEO & Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
  },
  marketing: {
    featured: { type: Boolean, default: false },
    certified: { type: Boolean, default: false },
    specialOffer: String,
    badges: [String], // e.g., ['Best Deal', 'Low Mileage', 'One Owner']
  },

  // Inquiries & Interest
  inquiries: {
    totalInquiries: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalFavorites: { type: Number, default: 0 },
    lastInquiry: Date,
  },

  // Financing & Insurance
  financing: {
    available: { type: Boolean, default: true },
    minDownPayment: Number,
    maxLoanTerm: Number, // months
    estimatedPayment: Number,
    apr: Number,
  },
  warranty: {
    manufacturer: {
      remaining: Number, // months
      mileage: Number,
      transferable: Boolean,
    },
    extended: {
      available: Boolean,
      provider: String,
      terms: String,
    },
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
vehicleSchema.index({ dealerId: 1, status: 1 });
vehicleSchema.index({ make: 1, model: 1, year: 1 });
vehicleSchema.index({ category: 1, condition: 1 });
vehicleSchema.index({ 'pricing.listPrice': 1 });
vehicleSchema.index({ 'location.city': 1, 'location.state': 1 });
vehicleSchema.index({ createdAt: -1 });
vehicleSchema.index({ title: 'text', description: 'text' });

// Compound indexes
vehicleSchema.index({ make: 1, model: 1, year: 1, status: 1 });
vehicleSchema.index({ category: 1, 'pricing.listPrice': 1, status: 1 });
vehicleSchema.index({ dealerId: 1, createdAt: -1 });

// Virtual for current price
vehicleSchema.virtual('currentPrice').get(function() {
  return this.pricing.salePrice || this.pricing.listPrice;
});

// Virtual for age in years
vehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for primary image
vehicleSchema.virtual('primaryImage').get(function() {
  const primaryImg = this.images.find(img => img.isPrimary);
  return primaryImg || this.images[0] || null;
});

// Virtual for full name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}${this.trim ? ` ${this.trim}` : ''}`;
});

// Virtual for estimated monthly payment
vehicleSchema.virtual('estimatedMonthlyPayment').get(function() {
  if (this.pricing.monthlyPayment) return this.pricing.monthlyPayment;
  
  // Simple calculation: (price - down payment) / 60 months
  const price = this.currentPrice;
  const downPayment = this.pricing.downPayment || 0;
  const loanAmount = price - downPayment;
  
  return Math.round(loanAmount / 60); // Simplified calculation
});

// Pre-save middleware
vehicleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate slug if not exists
  if (!this.slug) {
    this.slug = `${this.year}-${this.make}-${this.model}`
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Add random suffix to ensure uniqueness
    const random = Math.random().toString(36).substr(2, 5);
    this.slug += `-${random}`;
  }
  
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach((img, index) => {
      if (img.isPrimary) {
        primaryCount++;
        if (primaryCount > 1) {
          img.isPrimary = false;
        }
      }
    });
    
    // If no primary image, make the first one primary
    if (primaryCount === 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  // Update availability based on status
  this.availability.isAvailable = this.status === 'available';
  
  // Set sold date if status changes to sold
  if (this.status === 'sold' && !this.availability.soldDate) {
    this.availability.soldDate = new Date();
  }
  
  next();
});

// Instance methods
vehicleSchema.methods.incrementView = function() {
  this.inquiries.totalViews += 1;
  return this.save();
};

vehicleSchema.methods.addInquiry = function() {
  this.inquiries.totalInquiries += 1;
  this.inquiries.lastInquiry = new Date();
  return this.save();
};

vehicleSchema.methods.toggleFavorite = function(add = true) {
  if (add) {
    this.inquiries.totalFavorites += 1;
  } else {
    this.inquiries.totalFavorites = Math.max(0, this.inquiries.totalFavorites - 1);
  }
  return this.save();
};

vehicleSchema.methods.updateStatus = function(newStatus, notes) {
  this.status = newStatus;
  this.lastModified = new Date();
  
  if (newStatus === 'sold') {
    this.availability.soldDate = new Date();
    this.availability.isAvailable = false;
  } else if (newStatus === 'available') {
    this.availability.isAvailable = true;
    this.availability.soldDate = undefined;
  }
  
  return this.save();
};

vehicleSchema.methods.reserve = function(until) {
  this.status = 'reserved';
  this.availability.reservedUntil = until || new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours default
  this.availability.isAvailable = false;
  return this.save();
};

vehicleSchema.methods.addServiceRecord = function(record) {
  this.history.serviceRecords.push({
    ...record,
    date: record.date || new Date(),
  });
  return this.save();
};

// Static methods
vehicleSchema.statics.findByDealer = function(dealerId, options = {}) {
  return this.find({ dealerId }, null, options);
};

vehicleSchema.statics.searchVehicles = function(filters = {}) {
  const query = { status: 'available' };
  
  if (filters.make) query.make = new RegExp(filters.make, 'i');
  if (filters.model) query.model = new RegExp(filters.model, 'i');
  if (filters.year) query.year = filters.year;
  if (filters.category) query.category = filters.category;
  if (filters.condition) query.condition = filters.condition;
  if (filters.minPrice) query['pricing.listPrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    if (query['pricing.listPrice']) {
      query['pricing.listPrice'].$lte = filters.maxPrice;
    } else {
      query['pricing.listPrice'] = { $lte: filters.maxPrice };
    }
  }
  if (filters.maxMileage) query['history.mileage'] = { $lte: filters.maxMileage };
  if (filters.city) query['location.city'] = new RegExp(filters.city, 'i');
  if (filters.state) query['location.state'] = new RegExp(filters.state, 'i');
  
  return this.find(query);
};

vehicleSchema.statics.getFeaturedVehicles = function(limit = 10) {
  return this.find({
    status: 'available',
    'marketing.featured': true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

vehicleSchema.statics.getRecentListings = function(limit = 10) {
  return this.find({ status: 'available' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

vehicleSchema.statics.getPopularMakes = function() {
  return this.aggregate([
    { $match: { status: 'available' } },
    {
      $group: {
        _id: '$make',
        count: { $sum: 1 },
        avgPrice: { $avg: '$pricing.listPrice' },
        minPrice: { $min: '$pricing.listPrice' },
        maxPrice: { $max: '$pricing.listPrice' },
      }
    },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]);
};

vehicleSchema.statics.getDealerStats = function(dealerId) {
  return this.aggregate([
    { $match: { dealerId: mongoose.Types.ObjectId(dealerId) } },
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        availableVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] }
        },
        soldVehicles: {
          $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] }
        },
        totalViews: { $sum: '$inquiries.totalViews' },
        totalInquiries: { $sum: '$inquiries.totalInquiries' },
        averagePrice: { $avg: '$pricing.listPrice' },
        totalInventoryValue: { $sum: '$pricing.listPrice' },
      }
    }
  ]);
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
