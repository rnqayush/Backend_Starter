const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Vehicle name is required'],
    },
    make: {
      type: String,
      required: [true, 'Vehicle make is required'],
    },
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      min: [1900, 'Year must be after 1900'],
      max: [
        new Date().getFullYear() + 2,
        'Year cannot be more than 2 years in the future',
      ],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VehicleCategory',
      required: true,
    },
    condition: {
      type: String,
      required: [true, 'Vehicle condition is required'],
      enum: ['new', 'used', 'certified'],
    },
    description: String,
    specifications: {
      engine: {
        type: String,
        displacement: String,
        fuelType: {
          type: String,
          enum: ['gasoline', 'diesel', 'hybrid', 'electric', 'cng', 'lpg'],
        },
        transmission: {
          type: String,
          enum: ['manual', 'automatic', 'cvt'],
        },
        power: String,
        torque: String,
      },
      performance: {
        topSpeed: String,
        acceleration: String,
        fuelEconomy: {
          city: String,
          highway: String,
          combined: String,
        },
      },
      dimensions: {
        length: String,
        width: String,
        height: String,
        wheelbase: String,
        groundClearance: String,
        bootSpace: String,
        seatingCapacity: Number,
      },
      features: [String],
      safety: [String],
      technology: [String],
    },
    pricing: {
      price: {
        type: Number,
        required: [true, 'Vehicle price is required'],
        min: [0, 'Price cannot be negative'],
      },
      originalPrice: Number,
      onSale: { type: Boolean, default: false },
      downPayment: Number,
      monthlyPayment: Number,
      currency: { type: String, default: 'USD' },
    },
    images: {
      main: String,
      gallery: [String],
      exterior: [String],
      interior: [String],
    },
    availability: {
      status: {
        type: String,
        enum: ['available', 'sold', 'reserved', 'maintenance'],
        default: 'available',
      },
      location: String,
      lastUpdated: { type: Date, default: Date.now },
    },
    mileage: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
    },
    color: {
      exterior: String,
      interior: String,
    },
    vin: {
      type: String,
      unique: true,
      sparse: true,
    },
    licensePlate: String,
    history: {
      previousOwners: { type: Number, default: 0 },
      accidents: { type: Number, default: 0 },
      serviceRecords: [String],
      warranty: {
        hasWarranty: Boolean,
        warrantyExpiry: Date,
        warrantyDetails: String,
      },
    },
    financing: {
      available: { type: Boolean, default: true },
      loanTerm: [Number],
      interestRate: Number,
      monthlyPayments: [
        {
          term: Number,
          amount: Number,
        },
      ],
    },
    dealer: {
      contact: {
        name: String,
        phone: String,
        email: String,
      },
      location: String,
      dealerId: String,
    },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    tags: [String],
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
vehicleSchema.index({ business: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ condition: 1 });
vehicleSchema.index({ 'pricing.price': 1 });
vehicleSchema.index({ 'availability.status': 1 });
vehicleSchema.index({ featured: 1 });

// Virtual for age
vehicleSchema.virtual('age').get(function () {
  return new Date().getFullYear() - this.year;
});

// Method to increment view count
vehicleSchema.methods.incrementViews = function () {
  this.viewCount += 1;
  return this.save();
};

// Method to increment inquiry count
vehicleSchema.methods.incrementInquiries = function () {
  this.inquiryCount += 1;
  return this.save();
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
