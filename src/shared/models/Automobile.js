const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true
  },
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
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future']
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Vehicle category is required'],
    enum: ['sedan', 'suv', 'truck', 'coupe', 'convertible', 'hatchback', 'wagon', 'van', 'motorcycle', 'luxury', 'sports', 'electric', 'hybrid']
  },
  type: {
    type: String,
    enum: ['new', 'used', 'certified-pre-owned'],
    default: 'used'
  },
  condition: {
    type: String,
    enum: ['excellent', 'very-good', 'good', 'fair', 'poor'],
    default: 'good'
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Vehicle price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  priceType: {
    type: String,
    enum: ['fixed', 'negotiable', 'auction'],
    default: 'negotiable'
  },
  
  // Vehicle details
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
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
  engine: {
    size: String, // e.g., "2.0L"
    cylinders: Number,
    horsepower: Number,
    torque: String // e.g., "250 lb-ft"
  },
  
  // Exterior
  exteriorColor: {
    type: String,
    required: [true, 'Exterior color is required']
  },
  interiorColor: String,
  bodyStyle: String,
  doors: {
    type: Number,
    min: [2, 'Must have at least 2 doors'],
    max: [5, 'Cannot have more than 5 doors']
  },
  seats: {
    type: Number,
    min: [1, 'Must have at least 1 seat'],
    max: [8, 'Cannot have more than 8 seats']
  },
  
  // Features and options
  features: [String],
  safetyFeatures: [String],
  techFeatures: [String],
  comfortFeatures: [String],
  
  // Media
  images: [{
    url: String,
    alt: String,
    category: {
      type: String,
      enum: ['exterior', 'interior', 'engine', 'detail', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  
  // Status and availability
  status: {
    type: String,
    enum: ['available', 'sold', 'pending', 'reserved', 'unavailable'],
    default: 'available'
  },
  availability: {
    type: String,
    enum: ['in_stock', 'limited_stock', 'out_of_stock', 'pre_order', 'sold'],
    default: 'in_stock'
  },
  
  // History and documentation
  carfaxReport: String,
  serviceHistory: [{
    date: Date,
    mileage: Number,
    service: String,
    cost: Number,
    provider: String
  }],
  accidents: [{
    date: Date,
    description: String,
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major']
    },
    repaired: {
      type: Boolean,
      default: false
    }
  }],
  previousOwners: {
    type: Number,
    default: 1,
    min: [0, 'Cannot have negative previous owners']
  },
  
  // Location
  location: {
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // SEO and tags
  tags: [String],
  keywords: [String],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  
  // Timestamps for listing
  listedAt: {
    type: Date,
    default: Date.now
  },
  soldAt: Date,
  
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const dealerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Dealer name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Dealer slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Dealer description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    default: 'automobile',
    immutable: true
  },
  
  // Owner information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Dealer owner is required']
  },
  
  // Business information
  businessInfo: {
    logo: String,
    coverImage: String,
    establishedYear: Number,
    licenseNumber: String,
    dealerLicense: String,
    taxId: String,
    website: String,
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    }
  },

  // Location information
  address: {
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
      default: 'United States'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Inventory
  vehicles: [vehicleSchema],
  totalVehicles: {
    type: Number,
    default: 0
  },
  
  // Categories and specialties
  specialties: [{
    type: String,
    enum: ['luxury', 'sports', 'electric', 'hybrid', 'trucks', 'suvs', 'sedans', 'motorcycles', 'classic', 'exotic']
  }],
  brands: [String], // Brands they specialize in
  
  // Services offered
  services: [{
    name: String,
    description: String,
    price: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Financing options
  financing: {
    available: {
      type: Boolean,
      default: true
    },
    minCreditScore: Number,
    maxLoanTerm: Number, // in months
    minDownPayment: Number, // percentage
    partners: [String] // Financing partners
  },
  
  // Warranties and guarantees
  warranties: [{
    name: String,
    description: String,
    duration: String,
    coverage: [String]
  }],
  
  // Reviews and ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    },
    breakdown: {
      quality: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      overall: { type: Number, default: 0 }
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  
  // Business hours
  businessHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  
  // Media
  images: [{
    url: String,
    alt: String,
    category: {
      type: String,
      enum: ['exterior', 'interior', 'showroom', 'service', 'team', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  virtualTour: String,
  
  // Status and verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  
  // Page sections for dynamic rendering
  sections: {
    hero: {
      isVisible: { type: Boolean, default: true },
      title: String,
      subtitle: String,
      backgroundImage: String,
      ctaText: String
    },
    about: {
      isVisible: { type: Boolean, default: true },
      title: String,
      content: String,
      images: [String]
    },
    inventory: {
      isVisible: { type: Boolean, default: true },
      title: String,
      subtitle: String
    },
    services: {
      isVisible: { type: Boolean, default: true },
      title: String,
      subtitle: String
    },
    financing: {
      isVisible: { type: Boolean, default: true },
      title: String,
      content: String
    },
    testimonials: {
      isVisible: { type: Boolean, default: true },
      title: String
    },
    contact: {
      isVisible: { type: Boolean, default: true },
      title: String
    }
  },
  sectionOrder: [{
    type: String,
    enum: ['hero', 'about', 'inventory', 'services', 'financing', 'testimonials', 'contact']
  }],
  
  // Theme customization
  theme: {
    primaryColor: {
      type: String,
      default: '#dc2626'
    },
    secondaryColor: {
      type: String,
      default: '#ef4444'
    },
    backgroundColor: {
      type: String,
      default: '#f8fafc'
    },
    textColor: {
      type: String,
      default: '#1f2937'
    }
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
  salesCount: {
    type: Number,
    default: 0
  },
  
  // Social media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
dealerSchema.index({ slug: 1 });
dealerSchema.index({ owner: 1 });
dealerSchema.index({ 'address.city': 1 });
dealerSchema.index({ 'address.state': 1 });
dealerSchema.index({ status: 1, isPublished: 1 });
dealerSchema.index({ 'rating.average': -1 });
dealerSchema.index({ isFeatured: -1, createdAt: -1 });

// Vehicle indexes
dealerSchema.index({ 'vehicles.make': 1 });
dealerSchema.index({ 'vehicles.model': 1 });
dealerSchema.index({ 'vehicles.year': 1 });
dealerSchema.index({ 'vehicles.category': 1 });
dealerSchema.index({ 'vehicles.price': 1 });
dealerSchema.index({ 'vehicles.status': 1 });

// Virtual for available vehicles
dealerSchema.virtual('availableVehicles').get(function() {
  return this.vehicles.filter(vehicle => vehicle.status === 'available' && vehicle.isActive);
});

// Virtual for vehicle categories
dealerSchema.virtual('vehicleCategories').get(function() {
  const categories = [...new Set(this.vehicles.map(vehicle => vehicle.category))];
  return categories;
});

// Update total vehicles count when vehicles are modified
dealerSchema.pre('save', function(next) {
  this.totalVehicles = this.vehicles.length;
  next();
});

// Update slug from name if not provided
dealerSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to calculate average rating
dealerSchema.methods.calculateAverageRating = function() {
  if (this.rating.count === 0) {
    this.rating.average = 0;
    return 0;
  }
  
  const { quality, service, value, communication, overall } = this.rating.breakdown;
  const average = (quality + service + value + communication + overall) / 5;
  this.rating.average = Math.round(average * 10) / 10;
  
  return this.rating.average;
};

// Method to add a vehicle
dealerSchema.methods.addVehicle = function(vehicleData) {
  this.vehicles.push(vehicleData);
  this.totalVehicles = this.vehicles.length;
  return this.save();
};

// Method to remove a vehicle
dealerSchema.methods.removeVehicle = function(vehicleId) {
  this.vehicles.id(vehicleId).remove();
  this.totalVehicles = this.vehicles.length;
  return this.save();
};

// Method to update vehicle status
dealerSchema.methods.updateVehicleStatus = function(vehicleId, status) {
  const vehicle = this.vehicles.id(vehicleId);
  if (vehicle) {
    vehicle.status = status;
    if (status === 'sold') {
      vehicle.soldAt = new Date();
      this.salesCount += 1;
    }
    return this.save();
  }
  throw new Error('Vehicle not found');
};

// Method to get vehicles by category
dealerSchema.methods.getVehiclesByCategory = function(category) {
  return this.vehicles.filter(vehicle => 
    vehicle.category === category && 
    vehicle.status === 'available' && 
    vehicle.isActive
  );
};

module.exports = mongoose.model('Dealer', dealerSchema);
