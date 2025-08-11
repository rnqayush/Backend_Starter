const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String
  },
  type: {
    type: String
  },
  price: {
    type: Number
  },
  maxGuests: {
    type: Number
  },
  bedType: {
    type: String
  },
  area: {
    type: String
  },
  description: {
    type: String
  },
  images: [String],
  amenities: [String],
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  },
  available: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);

