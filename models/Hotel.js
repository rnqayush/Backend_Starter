/**
 * Hotel Model - For hotel management
 * Based on frontend hotel data structure
 */

import mongoose from 'mongoose';
import { DEFAULTS } from '../config/constants.js';

// Room schema
const roomSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative']
  },
  maxGuests: {
    type: Number,
    required: [true, 'Max guests is required'],
    min: [1, 'Max guests must be at least 1'],
    max: [20, 'Max guests cannot exceed 20']
  },
  bedType: {
    type: String,
    required: [true, 'Bed type is required'],
    trim: true
  },
  area: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  available: {
    type: Boolean,
    default: true,
    index: true
  },
  // Room-specific settings
  smokingAllowed: {
    type: Boolean,
    default: false
  },
  petFriendly: {
    type: Boolean,
    default: false
  },
  accessibility: {
    wheelchairAccessible: { type: Boolean, default: false },
    hearingAccessible: { type: Boolean, default: false },
    visualAccessible: { type: Boolean, default: false }
  }
}, { _id: false });

// Amenity category schema
const amenityCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  items: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Contact info schema
const contactInfoSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  }
}, { _id: false });

// Social link schema
const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  }
}, { _id: false });

// Gallery item schema
const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, { _id: false });

// Testimonial schema
const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  }
}, { _id: false });

// Quick info schema
const quickInfoSchema = new mongoose.Schema({
  icon: {
    type: String,
    required: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

// Section schemas for different parts of the hotel page
const heroSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  backgroundImage: { type: String, trim: true },
  ctaText: { type: String, trim: true },
  quickInfo: [quickInfoSchema]
}, { _id: false });

const aboutSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image: { type: String, trim: true },
  features: [{ type: String, trim: true }]
}, { _id: false });

const featuresSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  items: [galleryItemSchema]
}, { _id: false });

const gallerySectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  images: [{ type: String, trim: true }]
}, { _id: false });

const amenitiesSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  categories: [amenityCategorySchema]
}, { _id: false });

const testimonialsSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  items: [testimonialSchema]
}, { _id: false });

const contactSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  info: [contactInfoSchema]
}, { _id: false });

const footerSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, trim: true },
  supportContact: {
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  socialLinks: [socialLinkSchema]
}, { _id: false });

// Main Hotel Schema
const hotelSchema = new mongoose.Schema({
  // Basic Information
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters'],
    index: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'],
    index: true
  },
  
  // Vendor Reference
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor is required'],
    index: true
  },
  
  // Location Information
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    index: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^[1-9][0-9]{5}$/, 'Invalid pincode format']
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  website: {
    type: String,
    trim: true
  },
  
  // Hotel Details
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Ratings and Reviews
  rating: {
    type: Number,
    default: DEFAULTS.RATING,
    min: 0,
    max: 5,
    index: true
  },
  starRating: {
    type: Number,
    required: [true, 'Star rating is required'],
    min: 1,
    max: 5,
    index: true
  },
  
  // Media
  image: {
    type: String,
    required: [true, 'Main image is required'],
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  
  // Check-in/Check-out
  checkInTime: {
    type: String,
    required: [true, 'Check-in time is required'],
    trim: true,
    default: '3:00 PM'
  },
  checkOutTime: {
    type: String,
    required: [true, 'Check-out time is required'],
    trim: true,
    default: '12:00 PM'
  },
  
  // Policies
  policies: [{
    type: String,
    trim: true
  }],
  
  // Pricing
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Starting price cannot be negative'],
    index: true
  },
  
  // Room Information
  totalRooms: {
    type: Number,
    required: [true, 'Total rooms is required'],
    min: [1, 'Total rooms must be at least 1']
  },
  availableRooms: {
    type: Number,
    required: [true, 'Available rooms is required'],
    min: [0, 'Available rooms cannot be negative']
  },
  rooms: [roomSchema],
  
  // Owner Information
  ownerId: {
    type: String,
    required: [true, 'Owner ID is required'],
    trim: true,
    index: true
  },
  
  // Page Sections
  sections: {
    hero: { type: heroSectionSchema, required: true },
    about: { type: aboutSectionSchema, required: true },
    features: { type: featuresSectionSchema, required: true },
    gallery: { type: gallerySectionSchema, required: true },
    amenities: { type: amenitiesSectionSchema, required: true },
    testimonials: { type: testimonialsSectionSchema, required: true },
    contact: { type: contactSectionSchema, required: true },
    footer: { type: footerSectionSchema, required: true }
  },
  
  // Section Configuration
  sectionOrder: [{
    type: String,
    enum: ['hero', 'about', 'features', 'gallery', 'amenities', 'testimonials', 'contact', 'footer']
  }],
  sectionVisibility: {
    hero: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    features: { type: Boolean, default: true },
    gallery: { type: Boolean, default: true },
    amenities: { type: Boolean, default: true },
    testimonials: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
    footer: { type: Boolean, default: true }
  },
  
  // Hotel Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics
  analytics: {
    totalViews: { type: Number, default: 0, min: 0 },
    totalBookings: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    occupancyRate: { type: Number, default: 0, min: 0, max: 100 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
hotelSchema.index({ city: 1, isActive: 1 });
hotelSchema.index({ rating: -1, starRating: -1 });
hotelSchema.index({ startingPrice: 1, rating: -1 });
hotelSchema.index({ isFeatured: -1, rating: -1 });
hotelSchema.index({ vendor: 1, isActive: 1 });
hotelSchema.index({ createdAt: -1 });

// Virtual for occupancy percentage
hotelSchema.virtual('occupancyPercentage').get(function() {
  if (this.totalRooms === 0) return 0;
  return Math.round(((this.totalRooms - this.availableRooms) / this.totalRooms) * 100);
});

// Virtual for available room types
hotelSchema.virtual('availableRoomTypes').get(function() {
  return [...new Set(this.rooms.filter(room => room.available).map(room => room.type))];
});

// Virtual for price range
hotelSchema.virtual('priceRange').get(function() {
  if (!this.rooms || this.rooms.length === 0) {
    return { min: this.startingPrice, max: this.startingPrice };
  }
  
  const prices = this.rooms.map(room => room.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
});

// Virtual for display rating
hotelSchema.virtual('displayRating').get(function() {
  return Math.round(this.rating * 10) / 10;
});

// Pre-save middleware
hotelSchema.pre('save', function(next) {
  // Update available rooms count based on room availability
  this.availableRooms = this.rooms.filter(room => room.available).length;
  
  // Update starting price based on minimum room price
  if (this.rooms && this.rooms.length > 0) {
    const availableRooms = this.rooms.filter(room => room.available);
    if (availableRooms.length > 0) {
      this.startingPrice = Math.min(...availableRooms.map(room => room.price));
    }
  }
  
  // Set default section order if not provided
  if (!this.sectionOrder || this.sectionOrder.length === 0) {
    this.sectionOrder = ['hero', 'about', 'features', 'gallery', 'amenities', 'testimonials', 'contact', 'footer'];
  }
  
  next();
});

// Static methods
hotelSchema.statics.findByCity = function(city, options = {}) {
  const query = { 
    city: new RegExp(city, 'i'), 
    isActive: true 
  };
  return this.find(query, null, options);
};

hotelSchema.statics.findByPriceRange = function(minPrice, maxPrice, options = {}) {
  const query = { 
    startingPrice: { $gte: minPrice, $lte: maxPrice },
    isActive: true 
  };
  return this.find(query, null, options);
};

hotelSchema.statics.findByStarRating = function(starRating, options = {}) {
  const query = { 
    starRating: starRating,
    isActive: true 
  };
  return this.find(query, null, options);
};

hotelSchema.statics.findFeatured = function(options = {}) {
  const query = { 
    isFeatured: true, 
    isActive: true 
  };
  return this.find(query, null, options);
};

hotelSchema.statics.searchHotels = function(searchTerm, options = {}) {
  const query = {
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } },
          { city: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };
  return this.find(query, null, options);
};

// Instance methods
hotelSchema.methods.updateRating = async function(newRating) {
  // This would typically be called after a new review is added
  // Implementation would calculate average from all reviews
  const currentTotal = this.rating * this.analytics.totalBookings;
  this.analytics.totalBookings += 1;
  this.rating = (currentTotal + newRating) / this.analytics.totalBookings;
  return this.save();
};

hotelSchema.methods.updateRoomAvailability = async function(roomId, available) {
  const room = this.rooms.id(roomId);
  if (room) {
    room.available = available;
    return this.save();
  }
  throw new Error('Room not found');
};

hotelSchema.methods.addRoom = async function(roomData) {
  // Generate new room ID
  const maxId = this.rooms.length > 0 ? Math.max(...this.rooms.map(r => r.id)) : 0;
  roomData.id = maxId + 1;
  
  this.rooms.push(roomData);
  this.totalRooms = this.rooms.length;
  return this.save();
};

hotelSchema.methods.removeRoom = async function(roomId) {
  this.rooms = this.rooms.filter(room => room.id !== roomId);
  this.totalRooms = this.rooms.length;
  return this.save();
};

hotelSchema.methods.incrementViews = async function() {
  this.analytics.totalViews += 1;
  return this.save();
};

hotelSchema.methods.recordBooking = async function(bookingAmount) {
  this.analytics.totalBookings += 1;
  this.analytics.revenue += bookingAmount;
  return this.save();
};

hotelSchema.methods.toPublicJSON = function() {
  const hotel = this.toObject();
  
  // Remove sensitive information
  delete hotel.analytics.revenue;
  delete hotel.ownerId;
  
  return hotel;
};

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
