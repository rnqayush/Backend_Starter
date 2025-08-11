const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  duration: String,
  includes: [String],
  popular: { type: Boolean, default: false },
});

const portfolioItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: String,
  date: Date,
  client: String,
  url: String,
});

const serviceSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
    },
    description: String,
    category: {
      type: String,
      required: true,
    },
    subcategory: String,
    pricing: {
      type: {
        type: String,
        enum: ['fixed', 'hourly', 'package', 'quote'],
        default: 'fixed',
      },
      amount: Number,
      currency: { type: String, default: 'USD' },
      unit: String, // per hour, per day, etc.
    },
    packages: [packageSchema],
    duration: {
      min: Number, // in minutes
      max: Number,
      typical: Number,
    },
    availability: {
      daysOfWeek: [
        {
          type: String,
          enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
        },
      ],
      timeSlots: [
        {
          start: String,
          end: String,
        },
      ],
      bookingAdvance: {
        min: Number, // minimum days in advance
        max: Number, // maximum days in advance
      },
      blockedDates: [Date],
    },
    location: {
      type: {
        type: String,
        enum: ['onsite', 'offsite', 'both'],
        default: 'onsite',
      },
      address: String,
      city: String,
      state: String,
      country: String,
      radius: Number, // service radius in km
    },
    images: {
      main: String,
      gallery: [String],
    },
    portfolio: [portfolioItemSchema],
    features: [String],
    requirements: [String],
    policies: {
      cancellation: String,
      refund: String,
      rescheduling: String,
    },
    staff: [
      {
        name: String,
        role: String,
        bio: String,
        image: String,
        experience: String,
      },
    ],
    equipment: [String],
    certifications: [String],
    tags: [String],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    bookingCount: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
serviceSchema.index({ business: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ 'location.city': 1 });
serviceSchema.index({ featured: 1 });
serviceSchema.index({ active: 1 });
serviceSchema.index({ tags: 1 });

// Virtual for bookings
serviceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service',
});

module.exports = mongoose.model('Service', serviceSchema);
