import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters'],
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Standard', 'Deluxe', 'Suite', 'Premium', 'Executive', 'Presidential'],
  },
  description: {
    type: String,
    required: [true, 'Room description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Room price is required'],
    min: [0, 'Price cannot be negative'],
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative'],
  },
  maxGuests: {
    type: Number,
    required: [true, 'Maximum guests is required'],
    min: [1, 'Room must accommodate at least 1 guest'],
    max: [20, 'Room cannot accommodate more than 20 guests'],
  },
  bedType: {
    type: String,
    required: [true, 'Bed type is required'],
    enum: ['Single', 'Double', 'Queen', 'King Size', 'Twin Beds', 'Bunk Beds'],
  },
  size: {
    type: String,
    required: [true, 'Room size is required'],
    // e.g., "25 sqm", "400 sq ft"
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Please provide a valid image URL',
    },
  }],
  amenities: [{
    type: String,
    enum: [
      'Ocean View', 'City View', 'Mountain View', 'Garden View',
      'WiFi', 'AC', 'TV', 'Mini Bar', 'Room Service', 'Balcony',
      'Jacuzzi', 'Fireplace', 'Kitchen', 'Workspace', 'Safe',
      'Hair Dryer', 'Bathrobe', 'Slippers', 'Coffee Machine',
      'Refrigerator', 'Microwave', 'Dishwasher', 'Washing Machine'
    ],
  }],
  availability: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'out_of_order'],
    default: 'available',
  },
  floor: {
    type: Number,
    min: [0, 'Floor cannot be negative'],
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
  },
  
  // Booking settings
  minStay: {
    type: Number,
    default: 1,
    min: [1, 'Minimum stay must be at least 1 night'],
  },
  maxStay: {
    type: Number,
    default: 30,
    min: [1, 'Maximum stay must be at least 1 night'],
  },
  
  // Pricing options
  weekendPricing: {
    enabled: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0, 'Weekend price cannot be negative'],
    },
  },
  seasonalPricing: [{
    name: String,
    startDate: Date,
    endDate: Date,
    price: {
      type: Number,
      min: [0, 'Seasonal price cannot be negative'],
    },
  }],
  
  // Room features
  smokingAllowed: {
    type: Boolean,
    default: false,
  },
  petFriendly: {
    type: Boolean,
    default: false,
  },
  accessibleRoom: {
    type: Boolean,
    default: false,
  },
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
}, {
  timestamps: true,
});

// Indexes for better query performance
roomSchema.index({ hotelId: 1, availability: 1 });
roomSchema.index({ hotelId: 1, type: 1 });
roomSchema.index({ hotelId: 1, price: 1 });
roomSchema.index({ roomNumber: 1, hotelId: 1 }, { unique: true });

// Virtual for discounted price
roomSchema.virtual('discountedPrice').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.price;
  }
  return null;
});

// Virtual for discount percentage
roomSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to check availability for date range
roomSchema.methods.isAvailableForDates = async function(checkIn, checkOut) {
  if (this.availability !== 'available') {
    return false;
  }
  
  // Check for existing bookings (this would require the Booking model)
  const Booking = mongoose.model('Booking');
  const conflictingBookings = await Booking.find({
    roomId: this._id,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      {
        checkIn: { $lte: checkIn },
        checkOut: { $gt: checkIn }
      },
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gte: checkOut }
      },
      {
        checkIn: { $gte: checkIn },
        checkOut: { $lte: checkOut }
      }
    ]
  });
  
  return conflictingBookings.length === 0;
};

// Method to get current price (considering seasonal/weekend pricing)
roomSchema.methods.getCurrentPrice = function(date = new Date()) {
  // Check seasonal pricing first
  for (const seasonal of this.seasonalPricing) {
    if (date >= seasonal.startDate && date <= seasonal.endDate) {
      return seasonal.price;
    }
  }
  
  // Check weekend pricing
  if (this.weekendPricing.enabled) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      return this.weekendPricing.price;
    }
  }
  
  return this.price;
};

// Soft delete method
roomSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Exclude soft deleted documents by default
roomSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Ensure room number is unique within hotel
roomSchema.pre('save', async function(next) {
  if (this.isModified('roomNumber') || this.isModified('hotelId')) {
    const existingRoom = await this.constructor.findOne({
      hotelId: this.hotelId,
      roomNumber: this.roomNumber,
      _id: { $ne: this._id },
      isDeleted: { $ne: true }
    });
    
    if (existingRoom) {
      const error = new Error('Room number already exists in this hotel');
      error.code = 'DUPLICATE_ROOM_NUMBER';
      return next(error);
    }
  }
  next();
});

const Room = mongoose.model('Room', roomSchema);

export default Room;
