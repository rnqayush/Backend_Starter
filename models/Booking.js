import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Common booking fields
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  
  // Booking type and related entity
  bookingType: {
    type: String,
    enum: ['hotel', 'wedding'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true, // References Hotel._id or Wedding._id
  },
  entityName: {
    type: String,
    required: true, // Hotel name or Wedding vendor name
  },
  
  // Hotel-specific fields (when bookingType === 'hotel')
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  roomName: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  
  // Wedding-specific fields (when bookingType === 'wedding')
  eventDate: Date,
  eventTime: String,
  guestCount: Number,
  eventType: String,
  services: [String],
  
  // Common booking details
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  
  // Customer information
  customerInfo: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: true,
    },
    specialRequests: String,
  },
  
  // Payment information
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: String,
  transactionId: String,
  
  // Timestamps
  bookingDate: {
    type: Date,
    default: Date.now,
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
bookingSchema.index({ userId: 1, bookingType: 1 });
bookingSchema.index({ vendorId: 1, status: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ entityId: 1, bookingType: 1 });

// Virtual for booking duration (hotel bookings)
bookingSchema.virtual('nights').get(function() {
  if (this.bookingType === 'hotel' && this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Method to generate unique booking ID
bookingSchema.statics.generateBookingId = function(bookingType) {
  const prefix = bookingType === 'hotel' ? 'HTL' : 'WED';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
};

// Soft delete method
bookingSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Pre-save middleware to generate booking ID
bookingSchema.pre('save', function(next) {
  if (this.isNew && !this.bookingId) {
    this.bookingId = this.constructor.generateBookingId(this.bookingType);
  }
  next();
});

// Exclude soft deleted documents by default
bookingSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
