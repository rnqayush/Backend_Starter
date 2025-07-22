import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // TODO: Implement service schema for business module
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Add more fields as needed
}, {
  timestamps: true
});

export default mongoose.model('Service', serviceSchema);

