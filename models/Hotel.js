import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    website: String,
  },
  amenities: [{
    type: String,
    enum: [
      'wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar',
      'room_service', 'laundry', 'concierge', 'business_center',
      'pet_friendly', 'air_conditioning', 'elevator', 'wheelchair_accessible'
    ],
  }],
  starRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  images: [{
    url: { type: String, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false },
  }],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HotelRoom',
  }],
  policies: {
    checkIn: { type: String, default: '15:00' },
    checkOut: { type: String, default: '11:00' },
    cancellation: String,
    petPolicy: String,
    smokingPolicy: { type: String, enum: ['allowed', 'not_allowed', 'designated_areas'] },
  },
  pricing: {
    currency: { type: String, default: 'USD' },
    basePrice: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
  },
  availability: {
    isActive: { type: Boolean, default: true },
    seasonalClosure: {
      from: Date,
      to: Date,
    },
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes
hotelSchema.index({ vendorId: 1 });
hotelSchema.index({ 'address.city': 1 });
hotelSchema.index({ 'address.state': 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ 'rating.average': -1 });
hotelSchema.index({ 'pricing.basePrice': 1 });
hotelSchema.index({ isDeleted: 1 });

// Virtual for full address
hotelSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}, ${this.address.country}`;
});

// Pre-find middleware to exclude deleted hotels
hotelSchema.pre(/^find/, function(next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Method to soft delete
hotelSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.availability.isActive = false;
  return this.save();
};

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;

