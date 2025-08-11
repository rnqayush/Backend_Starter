const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    url: String,
    alt: String
  },
  icon: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1, status: 1 });
categorySchema.index({ featured: -1, sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ status: 'active' })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  
  const categoryMap = {};
  const rootCategories = [];
  
  // Create a map of all categories
  categories.forEach(category => {
    categoryMap[category._id] = { ...category, children: [] };
  });
  
  // Build the tree structure
  categories.forEach(category => {
    if (category.parent) {
      if (categoryMap[category.parent]) {
        categoryMap[category.parent].children.push(categoryMap[category._id]);
      }
    } else {
      rootCategories.push(categoryMap[category._id]);
    }
  });
  
  return rootCategories;
};

module.exports = mongoose.model('Category', categorySchema);

