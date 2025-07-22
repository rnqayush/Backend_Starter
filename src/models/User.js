import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'vendor', 'customer'],
    default: 'customer'
  },
  businessType: {
    type: String,
    enum: ['ecommerce', 'hotel', 'automobile', 'wedding', 'business'],
    required: function() {
      return this.role === 'vendor';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  lastLogin: {
    type: Date,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },
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
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' }
  },
  socialProfiles: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    website: String
  },
  // Business-specific fields for vendors
  businessInfo: {
    name: String,
    description: String,
    category: String,
    subcategory: String,
    website: String,
    phone: String,
    email: String,
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
    businessHours: {
      monday: { open: String, close: String, closed: { type: Boolean, default: false } },
      tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
      thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
      friday: { open: String, close: String, closed: { type: Boolean, default: false } },
      saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
      sunday: { open: String, close: String, closed: { type: Boolean, default: true } }
    },
    taxId: String,
    licenseNumber: String,
    isVerified: { type: Boolean, default: false },
    verificationDocuments: [{
      type: String,
      url: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date, default: Date.now }
    }],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    tags: [String],
    featured: { type: Boolean, default: false }
  },
  // Subscription info
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'expired'], default: 'active' },
    startDate: Date,
    endDate: Date,
    features: [String],
    paymentMethod: String,
    billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' }
  },
  // Analytics tracking
  analytics: {
    profileViews: { type: Number, default: 0 },
    lastProfileView: Date,
    totalLogins: { type: Number, default: 0 },
    averageSessionDuration: { type: Number, default: 0 },
    lastActivity: Date,
    deviceInfo: {
      lastDevice: String,
      lastBrowser: String,
      lastOS: String,
      lastIP: String
    }
  },
  // Security settings
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    backupCodes: [String],
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    passwordChangedAt: Date
  },
  // Notification preferences
  notificationSettings: {
    email: {
      marketing: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      bookingReminders: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true }
    },
    push: {
      marketing: { type: Boolean, default: false },
      orderUpdates: { type: Boolean, default: true },
      bookingReminders: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true }
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      bookingReminders: { type: Boolean, default: false },
      systemAlerts: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ businessType: 1 });
userSchema.index({ 'businessInfo.category': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ 'businessInfo.isVerified': 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'address.coordinates': '2dsphere' });
userSchema.index({ 'businessInfo.address.coordinates': '2dsphere' });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  
  // Set password changed timestamp
  if (!this.isNew) {
    this.security.passwordChangedAt = new Date();
  }
  
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verificationToken;
};

// Update login analytics
userSchema.methods.updateLoginAnalytics = function(deviceInfo = {}) {
  this.analytics.totalLogins += 1;
  this.lastLogin = new Date();
  this.analytics.lastActivity = new Date();
  
  if (deviceInfo.device) this.analytics.deviceInfo.lastDevice = deviceInfo.device;
  if (deviceInfo.browser) this.analytics.deviceInfo.lastBrowser = deviceInfo.browser;
  if (deviceInfo.os) this.analytics.deviceInfo.lastOS = deviceInfo.os;
  if (deviceInfo.ip) this.analytics.deviceInfo.lastIP = deviceInfo.ip;
};

// Increment profile views
userSchema.methods.incrementProfileViews = function() {
  this.analytics.profileViews += 1;
  this.analytics.lastProfileView = new Date();
};

// Handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    });
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { 'security.loginAttempts': 1, 'security.lockUntil': 1 }
  });
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.security.passwordChangedAt) {
    const changedTimestamp = parseInt(this.security.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

export default mongoose.model('User', userSchema);

