const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['standard', 'deluxe', 'suite', 'presidential', 'family', 'single', 'double']
  },
  description: {
    type: String,
    required: [true, 'Room description is required']
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: [1, 'Maximum guests must be at least 1']
  },
  size: {
    type: String, // e.g., "450 sq ft"
    trim: true
  },
  bedType: {
    type: String,
    enum: ['single', 'double', 'queen', 'king', 'twin', 'sofa-bed']
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  amenities: [String],
  features: [String],
  availability: {
    type: String,
    enum: ['available', 'booked', 'maintenance', 'unavailable'],
    default: 'available'
  },
  roomNumber: {
    type: String,
    trim: true
  },
  floor: Number,
  view: {
    type: String,
    enum: ['city', 'ocean', 'garden', 'mountain', 'pool', 'courtyard']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Hotel slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    default: 'hotel',
    immutable: true
  },
  
  // Owner information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Hotel owner is required']
  },
  
  // Business information
  businessInfo: {
    logo: String,
    coverImage: String,
    establishedYear: Number,
    licenseNumber: String,
    taxId: String,
    website: String,
    email: {
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    }
  },

  // Location information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      default: 'United States'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },

  // Hotel details
  starRating: {
    type: Number,
    min: [1, 'Star rating must be at least 1'],
    max: [5, 'Star rating cannot exceed 5']
  },
  checkInTime: {
    type: String,
    default: '3:00 PM'
  },
  checkOutTime: {
    type: String,
    default: '11:00 AM'
  },
  
  // Pricing
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },

  // Rooms
  rooms: [roomSchema],
  totalRooms: {
    type: Number,
    default: 0
  },

  // Amenities and services
  amenities: {
    categories: [{
      name: String,
      items: [String]
    }]
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Policies
  policies: {
    cancellation: String,
    checkIn: String,
    checkOut: String,
    pets: String,
    smoking: String,
    children: String,
    extraBeds: String,
    ageRestriction: String
  },

  // Media
  images: [{
    url: String,
    alt: String,
    category: {
      type: String,
      enum: ['exterior', 'lobby', 'room', 'amenity', 'dining', 'other']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  virtualTour: String,

  // Reviews and ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    },
    breakdown: {
      cleanliness: { type: Number, default: 0 },
      comfort: { type: Number, default: 0 },
      location: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      value: { type: Number, default: 0 }
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],

  // Bookings
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],

  // Status and visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },

  // SEO and content
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // Page sections for dynamic rendering
  sections: {
    hero: {
      isVisible: { type: Boolean, default: true },
      title: String,
      subtitle: String,
      backgroundImage: String,
      ctaText: String
    },
    about: {
      isVisible: { type: Boolean, default: true },
      title: String,
      content: String,
      images: [String]
    },
    rooms: {
      isVisible: { type: Boolean, default: true },
      title: String,
      subtitle: String
    },
    amenities: {
      isVisible: { type: Boolean, default: true },
      title: String,
      subtitle: String
    },
    gallery: {
      isVisible: { type: Boolean, default: true },
      title: String
    },
    location: {
      isVisible: { type: Boolean, default: true },
      title: String,
      description: String
    },
    contact: {
      isVisible: { type: Boolean, default: true },
      title: String
    }
  },
  sectionOrder: [{
    type: String,
    enum: ['hero', 'about', 'rooms', 'amenities', 'gallery', 'location', 'contact']
  }],

  // Theme customization
  theme: {
    primaryColor: {
      type: String,
      default: '#1e40af'
    },
    secondaryColor: {
      type: String,
      default: '#3b82f6'
    },
    backgroundColor: {
      type: String,
      default: '#f8fafc'
    },
    textColor: {
      type: String,
      default: '#1f2937'
    }
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  
  // Social media
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String,
    youtube: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
hotelSchema.index({ slug: 1 });
hotelSchema.index({ owner: 1 });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ 'address.state': 1 });
hotelSchema.index({ status: 1, isPublished: 1 });
hotelSchema.index({ 'rating.average': -1 });
hotelSchema.index({ startingPrice: 1 });
hotelSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for available rooms
hotelSchema.virtual('availableRooms').get(function() {
  return this.rooms.filter(room => room.availability === 'available' && room.isActive);
});

// Virtual for room types
hotelSchema.virtual('roomTypes').get(function() {
  const types = [...new Set(this.rooms.map(room => room.type))];
  return types;
});

// Update total rooms count when rooms are modified
hotelSchema.pre('save', function(next) {
  this.totalRooms = this.rooms.length;
  next();
});

// Update slug from name if not provided
hotelSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Method to calculate average rating
hotelSchema.methods.calculateAverageRating = function() {
  if (this.rating.count === 0) {
    this.rating.average = 0;
    return 0;
  }
  
  const { cleanliness, comfort, location, service, value } = this.rating.breakdown;
  const average = (cleanliness + comfort + location + service + value) / 5;
  this.rating.average = Math.round(average * 10) / 10; // Round to 1 decimal place
  
  return this.rating.average;
};

// Method to add a room
hotelSchema.methods.addRoom = function(roomData) {
  this.rooms.push(roomData);
  this.totalRooms = this.rooms.length;
  return this.save();
};

// Method to remove a room
hotelSchema.methods.removeRoom = function(roomId) {
  this.rooms.id(roomId).remove();
  this.totalRooms = this.rooms.length;
  return this.save();
};

// Method to update room availability
hotelSchema.methods.updateRoomAvailability = function(roomId, availability) {
  const room = this.rooms.id(roomId);
  if (room) {
    room.availability = availability;
    return this.save();
  }
  throw new Error('Room not found');
};

module.exports = mongoose.model('Hotel', hotelSchema);
