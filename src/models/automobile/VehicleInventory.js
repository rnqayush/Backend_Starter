import mongoose from 'mongoose';

const vehicleInventorySchema = new mongoose.Schema({
  // Associated Vehicle and Dealer
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Inventory Details
  stockNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format']
  },
  engineNumber: {
    type: String,
    uppercase: true
  },
  chassisNumber: {
    type: String,
    uppercase: true
  },

  // Vehicle Condition and Status
  condition: {
    type: String,
    enum: ['new', 'used', 'certified-pre-owned', 'demo', 'damaged'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'in-transit', 'service', 'damaged', 'discontinued'],
    default: 'available'
  },
  availability: {
    type: String,
    enum: ['in-stock', 'on-order', 'coming-soon', 'out-of-stock'],
    default: 'in-stock'
  },

  // Pricing Information
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      min: 0
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
        min: 0
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    taxes: {
      gst: {
        type: Number,
        default: 0
      },
      roadTax: {
        type: Number,
        default: 0
      },
      insurance: {
        type: Number,
        default: 0
      },
      registration: {
        type: Number,
        default: 0
      },
      other: {
        type: Number,
        default: 0
      }
    },
    finalPrice: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },

  // Location and Storage
  location: {
    showroom: String,
    warehouse: String,
    lot: String,
    section: String,
    row: String,
    position: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India'
      }
    }
  },

  // Vehicle Specifications (if different from base vehicle)
  specifications: {
    color: {
      exterior: {
        name: String,
        code: String,
        type: {
          type: String,
          enum: ['solid', 'metallic', 'pearl', 'matte']
        }
      },
      interior: {
        name: String,
        code: String,
        material: String
      }
    },
    features: [{
      category: String,
      name: String,
      description: String,
      standard: Boolean,
      optional: Boolean,
      price: Number
    }],
    accessories: [{
      name: String,
      description: String,
      price: Number,
      installed: Boolean,
      category: String
    }],
    modifications: [{
      type: String,
      description: String,
      cost: Number,
      date: Date,
      vendor: String
    }]
  },

  // Purchase and Acquisition Details
  acquisition: {
    source: {
      type: String,
      enum: ['manufacturer', 'auction', 'trade-in', 'lease-return', 'rental-return', 'other']
    },
    purchaseDate: Date,
    purchasePrice: Number,
    vendor: String,
    invoiceNumber: String,
    warrantyInfo: {
      manufacturer: {
        duration: String,
        expiryDate: Date,
        coverage: String
      },
      extended: {
        provider: String,
        duration: String,
        expiryDate: Date,
        coverage: String,
        cost: Number
      }
    }
  },

  // Inspection and Quality
  inspection: {
    lastInspectionDate: Date,
    nextInspectionDate: Date,
    inspector: String,
    overallCondition: {
      type: String,
      enum: ['excellent', 'very-good', 'good', 'fair', 'poor']
    },
    exterior: {
      rating: {
        type: Number,
        min: 1,
        max: 10
      },
      notes: String,
      damages: [String]
    },
    interior: {
      rating: {
        type: Number,
        min: 1,
        max: 10
      },
      notes: String,
      damages: [String]
    },
    mechanical: {
      rating: {
        type: Number,
        min: 1,
        max: 10
      },
      notes: String,
      issues: [String]
    },
    documents: [{
      type: String,
      url: String,
      uploadDate: Date
    }]
  },

  // Mileage and Usage (for used vehicles)
  usage: {
    odometer: {
      reading: Number,
      unit: {
        type: String,
        enum: ['km', 'miles'],
        default: 'km'
      },
      lastUpdated: Date
    },
    previousOwners: Number,
    serviceHistory: [{
      date: Date,
      mileage: Number,
      serviceType: String,
      serviceCenter: String,
      cost: Number,
      description: String,
      documents: [String]
    }],
    accidentHistory: [{
      date: Date,
      description: String,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'total-loss']
      },
      repairCost: Number,
      documents: [String]
    }]
  },

  // Media and Documentation
  media: {
    images: [{
      url: String,
      alt: String,
      category: {
        type: String,
        enum: ['exterior', 'interior', 'engine', 'dashboard', 'features', 'damage', 'documents']
      },
      isPrimary: Boolean,
      order: Number
    }],
    videos: [{
      url: String,
      title: String,
      category: String,
      duration: Number
    }],
    documents: [{
      type: {
        type: String,
        enum: ['invoice', 'registration', 'insurance', 'service-record', 'inspection', 'warranty', 'other']
      },
      url: String,
      fileName: String,
      uploadDate: Date,
      expiryDate: Date
    }]
  },

  // Sales and Marketing
  marketing: {
    isPromoted: {
      type: Boolean,
      default: false
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    promotionEndDate: Date,
    marketingNotes: String,
    tags: [String],
    keywords: [String]
  },

  // Reservation and Sales Tracking
  reservation: {
    isReserved: {
      type: Boolean,
      default: false
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reservationDate: Date,
    reservationExpiry: Date,
    reservationAmount: Number,
    reservationNotes: String
  },

  // Analytics and Performance
  analytics: {
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
    },
    daysInInventory: {
      type: Number,
      default: 0
    },
    priceChanges: [{
      oldPrice: Number,
      newPrice: Number,
      changeDate: Date,
      reason: String
    }]
  },

  // Alerts and Notifications
  alerts: {
    lowInterest: {
      enabled: Boolean,
      threshold: Number // days without inquiry
    },
    priceReduction: {
      enabled: Boolean,
      schedule: String
    },
    maintenanceDue: {
      enabled: Boolean,
      dueDate: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
vehicleInventorySchema.index({ vehicle: 1, dealer: 1 });
vehicleInventorySchema.index({ stockNumber: 1 });
vehicleInventorySchema.index({ vin: 1 });
vehicleInventorySchema.index({ status: 1, availability: 1 });
vehicleInventorySchema.index({ condition: 1 });
vehicleInventorySchema.index({ 'pricing.sellingPrice': 1 });
vehicleInventorySchema.index({ 'location.showroom': 1 });
vehicleInventorySchema.index({ 'marketing.isFeatured': 1, 'marketing.isPromoted': 1 });
vehicleInventorySchema.index({ createdAt: -1 });

// Virtual for total price including taxes
vehicleInventorySchema.virtual('totalPrice').get(function() {
  const taxes = this.pricing.taxes;
  const totalTax = taxes.gst + taxes.roadTax + taxes.insurance + taxes.registration + taxes.other;
  return this.pricing.sellingPrice + totalTax;
});

// Virtual for profit margin
vehicleInventorySchema.virtual('profitMargin').get(function() {
  if (this.pricing.costPrice === 0) return 0;
  return ((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.costPrice) * 100;
});

// Virtual for days in inventory
vehicleInventorySchema.virtual('daysInStock').get(function() {
  const now = new Date();
  const createdDate = new Date(this.createdAt);
  return Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
});

// Virtual for effective discount
vehicleInventorySchema.virtual('effectiveDiscount').get(function() {
  const discountAmount = this.pricing.discount.amount;
  const discountPercentage = this.pricing.discount.percentage;
  const sellingPrice = this.pricing.sellingPrice;
  
  if (discountAmount > 0) return discountAmount;
  if (discountPercentage > 0) return (sellingPrice * discountPercentage) / 100;
  return 0;
});

// Pre-save middleware to calculate final price
vehicleInventorySchema.pre('save', function(next) {
  const discount = this.effectiveDiscount;
  this.pricing.finalPrice = this.pricing.sellingPrice - discount;
  
  // Update days in inventory
  this.analytics.daysInInventory = this.daysInStock;
  
  next();
});

// Method to reserve vehicle
vehicleInventorySchema.methods.reserve = async function(customerId, amount, expiryDate, notes) {
  if (this.status !== 'available') {
    throw new Error('Vehicle is not available for reservation');
  }
  
  this.reservation.isReserved = true;
  this.reservation.reservedBy = customerId;
  this.reservation.reservationDate = new Date();
  this.reservation.reservationExpiry = expiryDate;
  this.reservation.reservationAmount = amount;
  this.reservation.reservationNotes = notes;
  this.status = 'reserved';
  
  await this.save();
};

// Method to cancel reservation
vehicleInventorySchema.methods.cancelReservation = async function() {
  this.reservation.isReserved = false;
  this.reservation.reservedBy = null;
  this.reservation.reservationDate = null;
  this.reservation.reservationExpiry = null;
  this.reservation.reservationAmount = 0;
  this.reservation.reservationNotes = '';
  this.status = 'available';
  
  await this.save();
};

// Method to mark as sold
vehicleInventorySchema.methods.markAsSold = async function(salePrice, customerId) {
  this.status = 'sold';
  this.availability = 'out-of-stock';
  
  // Record price change if different
  if (salePrice !== this.pricing.sellingPrice) {
    this.analytics.priceChanges.push({
      oldPrice: this.pricing.sellingPrice,
      newPrice: salePrice,
      changeDate: new Date(),
      reason: 'Final sale price'
    });
  }
  
  await this.save();
};

// Method to update price
vehicleInventorySchema.methods.updatePrice = async function(newPrice, reason) {
  this.analytics.priceChanges.push({
    oldPrice: this.pricing.sellingPrice,
    newPrice: newPrice,
    changeDate: new Date(),
    reason: reason
  });
  
  this.pricing.sellingPrice = newPrice;
  await this.save();
};

// Method to increment views
vehicleInventorySchema.methods.incrementViews = async function() {
  this.analytics.views += 1;
  await this.save();
};

// Method to record inquiry
vehicleInventorySchema.methods.recordInquiry = async function() {
  this.analytics.inquiries += 1;
  await this.save();
};

// Method to record test drive
vehicleInventorySchema.methods.recordTestDrive = async function() {
  this.analytics.testDrives += 1;
  await this.save();
};

// Static method to get available vehicles
vehicleInventorySchema.statics.getAvailableVehicles = function(filters = {}, options = {}) {
  const query = { status: 'available', availability: 'in-stock' };
  
  // Apply filters
  if (filters.dealer) query.dealer = filters.dealer;
  if (filters.condition) query.condition = filters.condition;
  if (filters.minPrice) query['pricing.sellingPrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    query['pricing.sellingPrice'] = query['pricing.sellingPrice'] || {};
    query['pricing.sellingPrice'].$lte = filters.maxPrice;
  }
  if (filters.location) query['location.showroom'] = filters.location;
  
  return this.find(query)
    .populate('vehicle', 'make model year bodyType fuelType')
    .sort(options.sort || { 'marketing.isFeatured': -1, createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to get featured vehicles
vehicleInventorySchema.statics.getFeaturedVehicles = function(dealerId, limit = 10) {
  const query = {
    dealer: dealerId,
    status: 'available',
    'marketing.isFeatured': true
  };
  
  return this.find(query)
    .populate('vehicle', 'make model year bodyType fuelType')
    .sort({ 'analytics.views': -1, createdAt: -1 })
    .limit(limit);
};

// Static method to search inventory
vehicleInventorySchema.statics.searchInventory = function(searchTerm, filters = {}) {
  const query = {
    status: 'available',
    $or: [
      { stockNumber: { $regex: searchTerm, $options: 'i' } },
      { vin: { $regex: searchTerm, $options: 'i' } },
      { 'marketing.tags': { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };

  // Apply filters
  if (filters.dealer) query.dealer = filters.dealer;
  if (filters.condition) query.condition = filters.condition;
  if (filters.minPrice) query['pricing.sellingPrice'] = { $gte: filters.minPrice };
  if (filters.maxPrice) {
    query['pricing.sellingPrice'] = query['pricing.sellingPrice'] || {};
    query['pricing.sellingPrice'].$lte = filters.maxPrice;
  }

  return this.find(query)
    .populate('vehicle', 'make model year bodyType fuelType')
    .populate('dealer', 'name location')
    .sort({ 'marketing.isFeatured': -1, 'analytics.views': -1 });
};

const VehicleInventory = mongoose.model('VehicleInventory', vehicleInventorySchema);

export default VehicleInventory;
