import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // TODO: Implement product schema for ecommerce module
  name: {
    type: String,
    required: true
  },
  // Add more fields as needed
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);

