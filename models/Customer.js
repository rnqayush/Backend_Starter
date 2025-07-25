import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Optional - customer might not have a user account
  },
  
  // Basic customer information
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[\+]?[1-9][\d]{0,15}$/.test(v);
      },
      message: 'Please enter a valid phone number',
    },
  },
  
  // Address information
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  
  // Customer type and domain
  customerType: {
    type: String,
    enum: ['automobile', 'ecommerce', 'hotel', 'wedding'],
    required: true,
  },
  
  // Customer status and classification
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'VIP', 'Blacklisted'],
    default: 'Active',
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze',
  },
  
  // Purchase history and statistics
  totalPurchases: {
    type: Number,
    default: 0,
    min: [0, 'Total purchases cannot be negative'],
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total spent cannot be negative'],
  },
  averageOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Average order value cannot be negative'],
  },
  lastPurchaseDate: Date,
  firstPurchaseDate: Date,
  
  // Customer preferences (domain-specific)
  preferences: {
    // Automobile preferences
    budget: {
      min: Number,
      max: Number,
    },
    vehicleCategories: [String],
    preferredFeatures: [String],
    
    // E-commerce preferences
    productCategories: [String],
    brands: [String],
    priceRange: {
      min: Number,
      max: Number,
    },
    
    // Communication preferences
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    marketingEmails: {
      type: Boolean,
      default: true,
    },
  },
  
  // Customer rating and feedback
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0,
  },
  
  // Notes and comments from vendor
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
  tags: [String], // For categorization and filtering
  
  // Purchase history references
  orders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'orders.orderType',
    },
    orderType: {
      type: String,
      enum: ['AutomobileOrder', 'EcommerceOrder', 'Booking'],
    },
    orderDate: Date,
    orderValue: Number,
  }],
  
  // Customer lifecycle
  acquisitionSource: {
    type: String,
    enum: ['Website', 'Referral', 'Social Media', 'Advertisement', 'Walk-in', 'Phone', 'Other'],
    default: 'Website',
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  
  // Loyalty program
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: [0, 'Loyalty points cannot be negative'],
  },
  loyaltyTier: {
    type: String,
    enum: ['None', 'Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'None',
  },
  
  // Communication history
  lastContactDate: Date,
  nextFollowUpDate: Date,
  communicationHistory: [{
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Email', 'Phone', 'SMS', 'In-Person', 'Chat'],
    },
    subject: String,
    notes: String,
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // Customer verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDate: Date,
  
  // Privacy and consent
  gdprConsent: {
    type: Boolean,
    default: false,
  },
  marketingConsent: {
    type: Boolean,
    default: false,
  },
  dataProcessingConsent: {
    type: Boolean,
    default: false,
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
customerSchema.index({ vendorId: 1, customerType: 1 });
customerSchema.index({ email: 1, vendorId: 1 }, { unique: true });
customerSchema.index({ phone: 1, vendorId: 1 });
customerSchema.index({ status: 1, tier: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ lastPurchaseDate: -1 });

// Virtual for full address
customerSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  return parts.join(', ');
});

// Virtual for customer lifetime value
customerSchema.virtual('lifetimeValue').get(function() {
  return this.totalSpent;
});

// Virtual for days since last purchase
customerSchema.virtual('daysSinceLastPurchase').get(function() {
  if (!this.lastPurchaseDate) return null;
  const diffTime = Math.abs(new Date() - this.lastPurchaseDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add a purchase
customerSchema.methods.addPurchase = function(orderValue, orderId, orderType) {
  this.totalPurchases += 1;
  this.totalSpent += orderValue;
  this.averageOrderValue = this.totalSpent / this.totalPurchases;
  this.lastPurchaseDate = new Date();
  
  if (!this.firstPurchaseDate) {
    this.firstPurchaseDate = new Date();
  }
  
  // Add to orders history
  this.orders.push({
    orderId,
    orderType,
    orderDate: new Date(),
    orderValue,
  });
  
  // Update tier based on total spent
  this.updateTier();
  
  return this.save();
};

// Method to update customer tier
customerSchema.methods.updateTier = function() {
  if (this.totalSpent >= 100000) {
    this.tier = 'Platinum';
    this.status = 'VIP';
  } else if (this.totalSpent >= 50000) {
    this.tier = 'Gold';
  } else if (this.totalSpent >= 20000) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }
};

// Method to add loyalty points
customerSchema.methods.addLoyaltyPoints = function(points) {
  this.loyaltyPoints += points;
  
  // Update loyalty tier
  if (this.loyaltyPoints >= 10000) {
    this.loyaltyTier = 'Platinum';
  } else if (this.loyaltyPoints >= 5000) {
    this.loyaltyTier = 'Gold';
  } else if (this.loyaltyPoints >= 2000) {
    this.loyaltyTier = 'Silver';
  } else if (this.loyaltyPoints >= 500) {
    this.loyaltyTier = 'Bronze';
  }
  
  return this.save();
};

// Method to add communication record
customerSchema.methods.addCommunication = function(type, subject, notes, contactedBy) {
  this.communicationHistory.push({
    type,
    subject,
    notes,
    contactedBy,
  });
  this.lastContactDate = new Date();
  return this.save();
};

// Soft delete method
customerSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Exclude soft deleted documents by default
customerSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Ensure email is unique per vendor
customerSchema.pre('save', async function(next) {
  if (this.isModified('email') || this.isModified('vendorId')) {
    const existingCustomer = await this.constructor.findOne({
      vendorId: this.vendorId,
      email: this.email,
      _id: { $ne: this._id },
      isDeleted: { $ne: true }
    });
    
    if (existingCustomer) {
      const error = new Error('Customer with this email already exists for this vendor');
      error.code = 'DUPLICATE_CUSTOMER_EMAIL';
      return next(error);
    }
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
