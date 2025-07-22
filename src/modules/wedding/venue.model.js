import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
  // TODO: Implement venue schema for wedding module
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  // Add more fields as needed
}, {
  timestamps: true
});

export default mongoose.model('Venue', venueSchema);

