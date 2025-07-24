import mongoose from 'mongoose';

const automobileSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['car', 'motorcycle', 'truck', 'suv', 'van', 'bus', 'other'],
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['sale', 'rent', 'lease'],
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters'],
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters'],
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
  },
  condition: {
    type: String,
    required: [true, 'Vehicle condition is required'],
    enum: ['new', 'used', 'certified_pre_owned', 'salvage'],
  },
  mileage: {
    value: { type: Number, min: 0 },
    unit: { type: String, enum: ['km', 'miles'], default: 'km' },
  },
  engine: {
    type: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg'] },
    displacement: Number, // in cc or liters
    power: Number, // in HP or kW
    transmission: { type: String, enum: ['manual', 'automatic', 'cvt', 'semi_automatic'] },
  },
  features: [{
    type: String,
    enum: [
      'air_conditioning', 'power_steering', 'power_windows', 'central_locking',
      'abs', 'airbags', 'bluetooth', 'gps', 'sunroof', 'leather_seats',
      'heated_seats', 'cruise_control', 'parking_sensors', 'backup_camera',
      'keyless_entry', 'push_start', 'alloy_wheels', 'fog_lights'
    ],
  }],
  exterior: {
    color: { type: String, required: true },
    bodyType: { type: String, enum: ['sedan', 'hatchback', 'coupe', 'convertible', 'wagon', 'suv', 'pickup', 'van'] },
  },
  interior: {
    color: String,
    material: { type: String, enum: ['fabric', 'leather', 'vinyl', 'synthetic'] },
    seatingCapacity: { type: Number, min: 1, max: 50 },
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    negotiable: { type: Boolean, default: true },
    // For rentals
    dailyRate: Number,
    weeklyRate: Number,
    monthlyRate: Number,
    securityDeposit: Number,
  },
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  images: [{
    url: { type: String, required: true },
    caption: String,
    isPrimary: { type: Boolean, default: false },
  }],
  documents: {
    registration: {
      number: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false },
    },
    insurance: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
      verified: { type: Boolean, default: false },
    },
    inspection: {
      lastDate: Date,
      nextDue: Date,
      certified: { type: Boolean, default: false },
    },
  },
  availability: {
    isAvailable: { type: Boolean, default: true },
    availableFrom: Date,
    availableUntil: Date,
  },
  contactInfo: {
    showPhone: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: true },
    preferredContact: { type: String, enum: ['phone', 'email', 'both'], default: 'both' },
  },
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'inactive', 'pending'],
    default: 'active',
  },
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes
automobileSchema.index({ vendorId: 1 });
automobileSchema.index({ type: 1 });
automobileSchema.index({ listingType: 1 });
automobileSchema.index({ make: 1, model: 1 });
automobileSchema.index({ year: 1 });
automobileSchema.index({ condition: 1 });
automobileSchema.index({ 'pricing.basePrice': 1 });
automobileSchema.index({ 'location.city': 1 });
automobileSchema.index({ status: 1 });
automobileSchema.index({ isDeleted: 1 });

// Virtual for vehicle title
automobileSchema.virtual('title').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for age
automobileSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Pre-find middleware to exclude deleted vehicles
automobileSchema.pre(/^find/, function(next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Method to soft delete
automobileSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.status = 'inactive';
  return this.save();
};

// Method to mark as sold/rented
automobileSchema.methods.markAsSold = function() {
  this.status = this.listingType === 'rent' ? 'rented' : 'sold';
  this.availability.isAvailable = false;
  return this.save();
};

// Method to increment views
automobileSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

const Automobile = mongoose.model('Automobile', automobileSchema);

export default Automobile;

