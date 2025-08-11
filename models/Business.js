const mongoose = require('mongoose');
const slugify = require('slugify');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Business type is required'],
      enum: ['hotel', 'ecommerce', 'automobile', 'wedding', 'business'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessInfo: {
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      contact: {
        phone: String,
        email: String,
        website: String,
      },
      hours: {
        monday: { open: String, close: String, closed: Boolean },
        tuesday: { open: String, close: String, closed: Boolean },
        wednesday: { open: String, close: String, closed: Boolean },
        thursday: { open: String, close: String, closed: Boolean },
        friday: { open: String, close: String, closed: Boolean },
        saturday: { open: String, close: String, closed: Boolean },
        sunday: { open: String, close: String, closed: Boolean },
      },
      socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String,
      },
    },
    branding: {
      logo: String,
      coverImage: String,
      primaryColor: { type: String, default: '#1e40af' },
      secondaryColor: { type: String, default: '#3b82f6' },
      fontFamily: { type: String, default: 'Inter' },
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
      customMetaTags: [String],
    },
    settings: {
      isPublished: { type: Boolean, default: false },
      allowBookings: { type: Boolean, default: true },
      allowOrders: { type: Boolean, default: true },
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      maintenanceMode: { type: Boolean, default: false },
    },
    analytics: {
      totalViews: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      lastAnalyticsUpdate: Date,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'professional', 'enterprise'],
        default: 'free',
      },
      features: [String],
      limits: {
        products: Number,
        storage: Number,
        bandwidth: Number,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
businessSchema.index({ slug: 1 });
businessSchema.index({ type: 1 });
businessSchema.index({ owner: 1 });
businessSchema.index({ 'settings.isPublished': 1 });

// Virtual for business-specific data
businessSchema.virtual('hotels', {
  ref: 'Hotel',
  localField: '_id',
  foreignField: 'business',
});

businessSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'business',
});

businessSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'business',
});

businessSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'business',
});

// Pre-save middleware to generate slug
businessSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  // Check for existing slugs and append number if needed
  while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

// Method to increment analytics
businessSchema.methods.incrementViews = function () {
  this.analytics.totalViews += 1;
  this.analytics.lastAnalyticsUpdate = new Date();
  return this.save();
};

businessSchema.methods.incrementBookings = function () {
  this.analytics.totalBookings += 1;
  this.analytics.lastAnalyticsUpdate = new Date();
  return this.save();
};

businessSchema.methods.incrementOrders = function (amount = 0) {
  this.analytics.totalOrders += 1;
  this.analytics.totalRevenue += amount;
  this.analytics.lastAnalyticsUpdate = new Date();
  return this.save();
};

module.exports = mongoose.model('Business', businessSchema);
