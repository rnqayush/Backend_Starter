const mongoose = require('mongoose');

const autoWishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dealer',
    required: true
  },
  items: [{
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: 500
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    priceAlert: {
      enabled: {
        type: Boolean,
        default: false
      },
      targetPrice: Number
    },
    testDriveRequested: {
      type: Boolean,
      default: false
    },
    testDriveDate: Date
  }],
  name: {
    type: String,
    default: 'My Vehicle Wishlist',
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [String],
  totalValue: {
    type: Number,
    default: 0
  },
  preferences: {
    maxBudget: Number,
    preferredMakes: [String],
    preferredCategories: [String],
    fuelTypePreference: [String],
    transmissionPreference: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one wishlist per user per dealer
autoWishlistSchema.index({ user: 1, dealer: 1 }, { unique: true });

// Index for efficient queries
autoWishlistSchema.index({ user: 1 });
autoWishlistSchema.index({ dealer: 1 });
autoWishlistSchema.index({ shareToken: 1 });
autoWishlistSchema.index({ isPublic: 1 });

// Virtual for item count
autoWishlistSchema.virtual('itemCount').get(function() {
  return this.items ? this.items.length : 0;
});

// Pre-save middleware to calculate total value
autoWishlistSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    try {
      const Vehicle = mongoose.model('Vehicle');
      let totalValue = 0;

      for (const item of this.items) {
        const vehicle = await Vehicle.findById(item.vehicle);
        if (vehicle) {
          totalValue += vehicle.currentPrice || vehicle.price.msrp;
        }
      }

      this.totalValue = totalValue;
    } catch (error) {
      console.error('Error calculating auto wishlist total value:', error);
    }
  }
  next();
});

// Method to add vehicle to wishlist
autoWishlistSchema.methods.addVehicle = function(vehicleId, options = {}) {
  const { notes = '', priority = 'medium', priceAlert = {} } = options;
  
  // Check if vehicle already exists
  const existingItem = this.items.find(item => 
    item.vehicle.toString() === vehicleId.toString()
  );

  if (existingItem) {
    // Update existing item
    existingItem.notes = notes;
    existingItem.priority = priority;
    existingItem.priceAlert = { ...existingItem.priceAlert, ...priceAlert };
    existingItem.addedAt = new Date();
  } else {
    // Add new item
    this.items.push({
      vehicle: vehicleId,
      notes,
      priority,
      priceAlert,
      addedAt: new Date()
    });
  }

  return this.save();
};

// Method to remove vehicle from wishlist
autoWishlistSchema.methods.removeVehicle = function(vehicleId) {
  this.items = this.items.filter(item => 
    item.vehicle.toString() !== vehicleId.toString()
  );
  return this.save();
};

// Method to request test drive
autoWishlistSchema.methods.requestTestDrive = function(vehicleId, preferredDate) {
  const item = this.items.find(item => 
    item.vehicle.toString() === vehicleId.toString()
  );
  
  if (item) {
    item.testDriveRequested = true;
    item.testDriveDate = preferredDate;
    return this.save();
  }
  
  throw new Error('Vehicle not found in wishlist');
};

// Method to set price alert
autoWishlistSchema.methods.setPriceAlert = function(vehicleId, targetPrice) {
  const item = this.items.find(item => 
    item.vehicle.toString() === vehicleId.toString()
  );
  
  if (item) {
    item.priceAlert = {
      enabled: true,
      targetPrice
    };
    return this.save();
  }
  
  throw new Error('Vehicle not found in wishlist');
};

// Method to clear all items
autoWishlistSchema.methods.clearItems = function() {
  this.items = [];
  this.totalValue = 0;
  return this.save();
};

// Method to generate share token
autoWishlistSchema.methods.generateShareToken = function() {
  if (!this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  return this.shareToken;
};

// Static method to find or create wishlist
autoWishlistSchema.statics.findOrCreate = async function(userId, dealerId) {
  let wishlist = await this.findOne({ user: userId, dealer: dealerId });
  
  if (!wishlist) {
    wishlist = new this({
      user: userId,
      dealer: dealerId,
      items: []
    });
    await wishlist.save();
  }
  
  return wishlist;
};

// Static method to get user's wishlists across all dealers
autoWishlistSchema.statics.getUserWishlists = function(userId) {
  return this.find({ user: userId })
    .populate('dealer', 'name slug businessInfo.logo')
    .populate('items.vehicle', 'make model year price images availability status')
    .sort({ updatedAt: -1 });
};

// Static method to get public wishlists
autoWishlistSchema.statics.getPublicWishlists = function(limit = 10) {
  return this.find({ isPublic: true })
    .populate('user', 'name')
    .populate('dealer', 'name slug businessInfo.logo')
    .populate('items.vehicle', 'make model year price images')
    .sort({ updatedAt: -1 })
    .limit(limit);
};

// Static method to find vehicles with price alerts
autoWishlistSchema.statics.findPriceAlerts = function() {
  return this.find({
    'items.priceAlert.enabled': true
  })
  .populate('user', 'name email')
  .populate('items.vehicle', 'make model year price')
  .populate('dealer', 'name');
};

module.exports = mongoose.model('AutoWishlist', autoWishlistSchema);
