const mongoose = require('mongoose');
const slugify = require('slugify');

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: {
    type: String,
    required: [true, 'Room name is required'],
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Standard', 'Deluxe', 'Suite', 'Presidential'],
  },
  description: String,
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: Number,
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
  },
  size: String,
  bedType: String,
  bedConfiguration: String,
  amenities: [String],
  images: [String],
  availability: {
    isAvailable: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    blockedDates: [Date],
    checkin: Date,
    checkout: Date,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const amenityCategorySchema = new mongoose.Schema({
  name: String,
  items: [String],
});

const hotelSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
    },
    slug: { type: String, unique: true },
    description: String,
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    images: {
      main: String,
      gallery: [String],
      virtual_tour: String,
    },
    mainImage: String,
    rooms: [roomSchema],
    amenities: [String],
    services: [String],
    amenityCategories: [amenityCategorySchema],
    policies: {
      checkIn: String,
      checkOut: String,
      checkin: String,
      checkout: String,
      cancellation: String,
      petPolicy: String,
      children: String,
      pets: String,
      smokingPolicy: String,
    },
    pricing: {
      currency: { type: String, default: 'INR' },
      basePrice: { type: Number, required: true },
      startingPrice: Number,
      taxes: Number,
      serviceFees: Number,
      taxesIncluded: { type: Boolean, default: false },
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
      },
    ],
    features: [String],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'suspended'],
      default: 'draft',
    },
    analytics: {
      totalViews: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      lastViewedAt: Date,
      lastBookedAt: Date,
    },
    seo: {
      title: String,
      description: String,
      keywords: [String],
    },
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
    sectionVisibility: {
      hero: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      rooms: { type: Boolean, default: true },
      amenities: { type: Boolean, default: true },
      gallery: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      testimonials: { type: Boolean, default: true },
      footer: { type: Boolean, default: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Generate slug before saving
hotelSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Update average rating when reviews change
hotelSchema.pre('save', function (next) {
  if (this.isModified('reviews')) {
    if (this.reviews.length > 0) {
      const totalRating = this.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      this.rating.average = totalRating / this.reviews.length;
      this.rating.count = this.reviews.length;
      this.analytics.averageRating = this.rating.average;
    }
  }
  next();
});

// Indexes for better performance
hotelSchema.index({ business: 1, status: 1 });
hotelSchema.index({ slug: 1 });
hotelSchema.index({ 'address.city': 1, 'address.state': 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ featured: -1, 'rating.average': -1 });
hotelSchema.index({ 'pricing.basePrice': 1 });
hotelSchema.index({ 'pricing.startingPrice': 1 });

// Virtual for bookings
hotelSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'hotel',
});

module.exports = mongoose.model('Hotel', hotelSchema);
