const mongoose = require('mongoose');

const WeddingVendorSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.ObjectId,
    ref: 'Business',
    required: true
  },
  vendorType: {
    type: String,
    required: [true, 'Please specify vendor type'],
    enum: ['photographer', 'videographer', 'decorator', 'caterer', 'venue', 'dj', 'band', 'makeup_artist', 'mehendi_artist', 'florist', 'wedding_planner', 'other']
  },
  specialties: [String],
  portfolio: {
    images: [String],
    videos: [String],
    description: String
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    duration: String,
    includes: [String],
    excludes: [String]
  }],
  packages: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    services: [String],
    duration: String,
    guestLimit: Number,
    isPopular: {
      type: Boolean,
      default: false
    }
  }],
  experience: {
    yearsInBusiness: Number,
    eventsCompleted: {
      type: Number,
      default: 0
    },
    awards: [String]
  },
  availability: {
    calendar: [{
      date: Date,
      isAvailable: {
        type: Boolean,
        default: true
      },
      timeSlots: [{
        startTime: String,
        endTime: String,
        isBooked: {
          type: Boolean,
          default: false
        }
      }]
    }],
    advanceBookingDays: {
      type: Number,
      default: 30
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    eventType: String,
    eventDate: Date,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  analytics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    responseTime: {
      type: Number,
      default: 24
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WeddingVendor', WeddingVendorSchema);

