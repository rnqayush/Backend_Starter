import mongoose from 'mongoose';

const weddingSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'venue', 'catering', 'photography', 'videography', 'decoration',
      'music_dj', 'flowers', 'makeup', 'mehendi', 'transportation',
      'invitation', 'planning', 'other'
    ],
  },
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [200, 'Service name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters'],
  },
  // Venue-specific fields
  venue: {
    capacity: {
      min: Number,
      max: Number,
    },
    type: {
      type: String,
      enum: ['indoor', 'outdoor', 'both'],
    },
    amenities: [{
      type: String,
      enum: [
        'parking', 'air_conditioning', 'sound_system', 'lighting',
        'stage', 'dance_floor', 'bridal_room', 'catering_kitchen',
        'decoration_allowed', 'alcohol_allowed', 'wheelchair_accessible'
      ],
    }],
  },
  // Catering-specific fields
  catering: {
    cuisineTypes: [{
      type: String,
      enum: ['indian', 'chinese', 'continental', 'italian', 'mexican', 'thai', 'other'],
    }],
    serviceStyle: {
      type: String,
      enum: ['buffet', 'plated', 'family_style', 'cocktail'],
    },
    dietaryOptions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher'],
    }],
    guestCapacity: {
      min: Number,
      max: Number,
    },
  },
  // Photography/Videography fields
  media: {
    packages: [{
      name: String,
      description: String,
      duration: String, // e.g., "8 hours", "full day"
      deliverables: [String],
      price: Number,
    }],
    equipment: [String],
    style: [String], // e.g., "candid", "traditional", "cinematic"
  },
  location: {
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: String,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    serviceAreas: [String], // Cities/areas where service is available
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    priceType: {
      type: String,
      enum: ['fixed', 'per_person', 'per_hour', 'per_day', 'package'],
      default: 'fixed',
    },
    packages: [{
      name: String,
      description: String,
      price: Number,
      inclusions: [String],
      duration: String,
    }],
    advancePayment: {
      percentage: { type: Number, min: 0, max: 100 },
      amount: Number,
    },
  },
  availability: {
    bookingAdvance: { type: Number, default: 30 }, // days in advance
    unavailableDates: [Date],
    seasonalPricing: [{
      season: String,
      startDate: Date,
      endDate: Date,
      priceMultiplier: { type: Number, default: 1 },
    }],
  },
  portfolio: {
    images: [{
      url: { type: String, required: true },
      caption: String,
      category: String, // e.g., "ceremony", "reception", "decoration"
      isPrimary: { type: Boolean, default: false },
    }],
    videos: [{
      url: String,
      thumbnail: String,
      title: String,
      duration: String,
    }],
  },
  policies: {
    cancellation: String,
    refund: String,
    overtime: String,
    equipment: String,
    weather: String, // for outdoor events
  },
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    verified: { type: Boolean, default: false },
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
  // Testimonials section
  testimonials: [{
    clientName: {
      type: String,
      required: true,
      maxlength: [100, 'Client name cannot exceed 100 characters'],
    },
    clientImage: String,
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    testimonial: {
      type: String,
      required: true,
      maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
    },
    eventDate: Date,
    eventType: String, // e.g., 'wedding', 'engagement', 'reception'
    date: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  }],
  // FAQ section
  faqs: [{
    question: {
      type: String,
      required: true,
      maxlength: [200, 'Question cannot exceed 200 characters'],
    },
    answer: {
      type: String,
      required: true,
      maxlength: [1000, 'Answer cannot exceed 1000 characters'],
    },
    category: String, // e.g., 'booking', 'pricing', 'services'
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }],
  // Offers section
  offers: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Offer title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Offer description cannot exceed 500 characters'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'package_deal'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    terms: [String], // Terms and conditions
    minBookingAmount: Number,
    maxDiscount: Number, // For percentage discounts
    applicableServices: [String], // Which services this offer applies to
    isActive: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  }],
  tags: [String],
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes
weddingSchema.index({ vendorId: 1 });
weddingSchema.index({ serviceType: 1 });
weddingSchema.index({ 'location.city': 1 });
weddingSchema.index({ 'location.state': 1 });
weddingSchema.index({ 'pricing.basePrice': 1 });
weddingSchema.index({ 'rating.average': -1 });
weddingSchema.index({ tags: 1 });
weddingSchema.index({ isActive: 1 });
weddingSchema.index({ isDeleted: 1 });

// Virtual for service areas string
weddingSchema.virtual('serviceAreasString').get(function() {
  return this.location.serviceAreas.join(', ');
});

// Virtual for full address
weddingSchema.virtual('fullAddress').get(function() {
  const addr = this.location.address;
  return `${addr.street ? addr.street + ', ' : ''}${addr.city}, ${addr.state} ${addr.zipCode || ''}, ${addr.country}`.trim();
});

// Pre-find middleware to exclude deleted services
weddingSchema.pre(/^find/, function(next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Method to soft delete
weddingSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

// Method to check availability for a date
weddingSchema.methods.isAvailableOn = function(date) {
  const checkDate = new Date(date);
  return !this.availability.unavailableDates.some(unavailableDate => 
    unavailableDate.toDateString() === checkDate.toDateString()
  );
};

// Method to add unavailable date
weddingSchema.methods.addUnavailableDate = function(date) {
  if (!this.availability.unavailableDates.includes(date)) {
    this.availability.unavailableDates.push(date);
    return this.save();
  }
  return Promise.resolve(this);
};

const Wedding = mongoose.model('Wedding', weddingSchema);

export default Wedding;
