import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  // TODO: Implement room schema for hotel module
  roomNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  // Add more fields as needed
}, {
  timestamps: true
});

export default mongoose.model('Room', roomSchema);

