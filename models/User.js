import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Social Media Schema
const socialMediaSchema = new mongoose.Schema({
  facebook: { type: String, trim: true },
  twitter: { type: String, trim: true },
  instagram: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  youtube: { type: String, trim: true },
  website: { type: String, trim: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    index: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    trim: true,
    required: [true, 'phone is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format']
  },
  avatar: {
    type: String,
    trim: true
  },
  role: { 
    type: String, 
    enum: {
      values: ['customer', 'seller', 'admin', 'owner', 'vendor'],
      message: 'Invalid role specified'
    },
    default: 'customer',
    index: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'admin', 'vendor_manage', 'booking_manage']
  }],
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },
  profile: {
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    socialLinks: socialMediaSchema
  },
  // Seller-specific data
  seller: {
    businessName: {
      type: String,
      trim: true
    },
    businessType: {
      type: String,
      trim: true
    },
    verified: { type: Boolean, default: false },
    rating: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    totalSales: { type: Number, default: 0, min: 0 },
    totalProducts: { type: Number, default: 0, min: 0 },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    settings: {
      autoRespond: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true },
      allowReviews: { type: Boolean, default: true }
    }
  },
  // Security features
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  lastLogin: Date,
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'inactive', 'suspended', 'pending'],
      message: 'Invalid status'
    },
    default: 'active',
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'seller.verified': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Constants for login attempts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Method to generate public JSON (without sensitive data)
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  
  // Remove sensitive information
  delete user.password;
  delete user.loginAttempts;
  delete user.lockUntil;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.__v;
  
  return user;
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password +loginAttempts +lockUntil');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account is temporarily locked');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
