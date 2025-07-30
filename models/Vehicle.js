const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.ObjectId,
    ref: 'Business',
    required: true
  },
  make: {
    type: String,
    required: [true, 'Please add vehicle make'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Please add vehicle model'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Please add vehicle year'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  category: {
    type: String,
    required: [true, 'Please specify vehicle category'],
    enum: ['car', 'truck', 'suv', 'motorcycle', 'van', 'bus', 'other']
  },
  condition: {
    type: String,
    required: [true, 'Please specify vehicle condition'],
    enum: ['new', 'used', 'certified_pre_owned']
  },
  vin: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'Please add a valid VIN']
  },
  mileage: {
    type: Number,
    min: 0
  },
  exterior: {
    color: String,
    images: [String]
  },
  interior: {
    color: String,
    material: String,
    images: [String]
  },
  engine: {
    type: String,
    size: String,
    cylinders: Number,
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid', 'other']
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt']
    }
  },
  features: [String],
  pricing: {
    price: {
      type: Number,
      required: [true, 'Please add vehicle price'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    negotiable: {
      type: Boolean,
      default: true
    },
    financing: {
      available: {
        type: Boolean,
        default: false
      },
      downPayment: Number,
      monthlyPayment: Number,
      term: Number
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved', 'pending'],
      default: 'available'
    },
    location: String
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehicle', VehicleSchema);

