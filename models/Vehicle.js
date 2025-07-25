import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
    maxlength: [200, 'Vehicle name cannot exceed 200 characters'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  
  // Basic vehicle information
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 2, 'Year cannot be more than 2 years in the future'],
  },
  trim: {
    type: String,
    trim: true,
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Vehicle price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  
  // Category and classification
  category: {
    type: String,
    required: [true, 'Vehicle category is required'],
    enum: ['luxury-cars', 'electric-vehicles', 'suvs-trucks', 'classic-cars', 'sedans', 'hatchbacks', 'convertibles', 'motorcycles'],
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VehicleCategory',
  },
  
  // Vehicle condition and status
  condition: {
    type: String,
    required: [true, 'Vehicle condition is required'],
    enum: ['new', 'used', 'certified-pre-owned', 'refurbished'],
    default: 'new',
  },
  mileage: {
    type: Number,
    required: [true, 'Vehicle mileage is required'],
    min: [0, 'Mileage cannot be negative'],
  },
  
  // Images and media
  image: {
    type: String,
    required: [true, 'Main vehicle image is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL',
    },
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL',
    },
  }],
  
  // Description and features
  description: {
    type: String,
    required: [true, 'Vehicle description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  features: [{
    type: String,
    maxlength: [100, 'Feature description cannot exceed 100 characters'],
  }],
  
  // Technical specifications
  specifications: {
    engine: {
      type: String,
      required: [true, 'Engine specification is required'],
    },
    horsepower: {
      type: String,
      required: [true, 'Horsepower specification is required'],
    },
    transmission: {
      type: String,
      required: [true, 'Transmission type is required'],
      enum: ['Manual', 'Automatic', 'CVT', 'Semi-Automatic', 'Dual-Clutch'],
    },
    drivetrain: {
      type: String,
      required: [true, 'Drivetrain type is required'],
      enum: ['FWD', 'RWD', 'AWD', '4WD'],
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Hydrogen'],
    },
    fuelEconomy: {
      type: String,
      // e.g., "23/32 MPG", "120 MPGe"
    },
    seating: {
      type: String,
      required: [true, 'Seating capacity is required'],
      // e.g., "5 passengers", "7 passengers"
    },
    doors: {
      type: Number,
      min: [2, 'Vehicle must have at least 2 doors'],
      max: [6, 'Vehicle cannot have more than 6 doors'],
    },
    bodyType: {
      type: String,
      enum: ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Truck', 'Van', 'Motorcycle'],
    },
  },
  
  // Inventory and availability
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 1,
  },
  availability: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock',
  },
  
  // Marketing and display
  featured: {
    type: Boolean,
    default: false,
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  
  // Customer feedback
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0,
  },
  reviews: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0,
  },
  
  // Vehicle identification
  vin: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    validate: {
      validator: function(v) {
        return !v || /^[A-HJ-NPR-Z0-9]{17}$/i.test(v);
      },
      message: 'Please provide a valid 17-character VIN',
    },
  },
  licensePlate: {
    type: String,
    sparse: true,
  },
  
  // Location and dealer info
  location: {
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Indexes for better query performance
vehicleSchema.index({ vendorId: 1, availability: 1 });
vehicleSchema.index({ category: 1, price: 1 });
vehicleSchema.index({ make: 1, model: 1, year: 1 });
vehicleSchema.index({ featured: 1, onSale: 1 });
vehicleSchema.index({ slug: 1 }, { unique: true });
vehicleSchema.index({ vin: 1 }, { unique: true, sparse: true });

// Virtual for discounted price
vehicleSchema.virtual('discountedPrice').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.price;
  }
  return null;
});

// Virtual for discount percentage
vehicleSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}${this.trim ? ` ${this.trim}` : ''}`;
});

// Method to update availability based on stock
vehicleSchema.methods.updateAvailability = function() {
  if (this.stock === 0) {
    this.availability = 'out_of_stock';
  } else if (this.stock <= 5) {
    this.availability = 'low_stock';
  } else {
    this.availability = 'in_stock';
  }
  return this.save();
};

// Method to reserve stock
vehicleSchema.methods.reserveStock = function(quantity = 1) {
  if (this.stock >= quantity) {
    this.stock -= quantity;
    return this.updateAvailability();
  } else {
    throw new Error('Insufficient stock available');
  }
};

// Method to release reserved stock
vehicleSchema.methods.releaseStock = function(quantity = 1) {
  this.stock += quantity;
  return this.updateAvailability();
};

// Soft delete method
vehicleSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Pre-save middleware to generate slug
vehicleSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Pre-save middleware to update availability
vehicleSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    if (this.stock === 0) {
      this.availability = 'out_of_stock';
    } else if (this.stock <= 5) {
      this.availability = 'low_stock';
    } else if (this.availability === 'out_of_stock' || this.availability === 'low_stock') {
      this.availability = 'in_stock';
    }
  }
  next();
});

// Exclude soft deleted documents by default
vehicleSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
