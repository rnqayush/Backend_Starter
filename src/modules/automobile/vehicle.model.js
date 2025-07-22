import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  // TODO: Implement vehicle schema for automobile module
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  // Add more fields as needed
}, {
  timestamps: true
});

export default mongoose.model('Vehicle', vehicleSchema);

