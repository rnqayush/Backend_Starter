const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: String,
  avatar: String,
  role: { 
    type: String, 
    enum: ['customer', 'seller', 'admin', 'owner'], 
    default: 'customer' 
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' },
    timezone: String
  },
  profile: {
    bio: String,
    location: String,
    website: String,
    socialLinks: SocialMediaSchema
  },
  // Seller-specific data
  seller: {
    businessName: String,
    businessType: String,
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    joinedDate: Date,
    settings: {
      autoRespond: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true },
      allowReviews: { type: Boolean, default: true }
    }
  },
  lastLogin: Date,
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model("User", userSchema);
