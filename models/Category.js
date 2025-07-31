const mongoose = require('mongoose');

/**
 * Category Model
 * Represents product categories in an e-commerce website
 */
const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 5 // Maximum 5 levels deep
  },
  path: {
    type: String,
    index: true
  }, // e.g., "electronics/computers/laptops"
  
  // Display
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Media
  image: {
    url: { type: String },
    alt: { type: String }
  },
  icon: {
    type: String // Icon class or URL
  },
  
  // SEO
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true
  },
  isVisible: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Display Settings
  displaySettings: {
    showInMenu: { type: Boolean, default: true },
    showOnHomepage: { type: Boolean, default: false },
    featuredOrder: { type: Number, default: 0 },
    productsPerPage: { type: Number, default: 20 },
    defaultSort: {
      type: String,
      enum: ['name', 'price-low', 'price-high', 'newest', 'popularity', 'rating'],
      default: 'name'
    }
  },
  
  // Analytics
  stats: {
    productCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastActivity: { type: Date }
  },
  
  // Custom Fields
  customFields: [{
    name: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'date', 'url', 'email'],
      default: 'text'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
categorySchema.index({ website: 1, status: 1 });
categorySchema.index({ website: 1, parent: 1 });
categorySchema.index({ website: 1, level: 1 });
categorySchema.index({ website: 1, slug: 1 }, { unique: true });
categorySchema.index({ path: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for full path name
categorySchema.virtual('fullPath').get(function() {
  return this.path ? this.path.split('/').join(' > ') : this.name;
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products in this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Methods
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      ancestors.unshift(current);
    } else {
      break;
    }
  }
  
  return ancestors;
};

categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (categoryId) => {
    const children = await this.constructor.find({ parent: categoryId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

categorySchema.methods.updatePath = async function() {
  const ancestors = await this.getAncestors();
  const pathParts = ancestors.map(ancestor => ancestor.slug);
  pathParts.push(this.slug);
  this.path = pathParts.join('/');
  
  // Update level
  this.level = ancestors.length;
  
  return this.save();
};

categorySchema.methods.updateStats = async function() {
  const Product = mongoose.model('Product');
  
  // Get all descendant categories
  const descendants = await this.getDescendants();
  const categoryIds = [this._id, ...descendants.map(d => d._id)];
  
  // Count products in this category and all subcategories
  const productCount = await Product.countDocuments({
    category: { $in: categoryIds },
    status: 'active'
  });
  
  // Calculate other stats from products
  const products = await Product.find({
    category: { $in: categoryIds },
    status: 'active'
  });
  
  let totalViews = 0;
  let totalSales = 0;
  let totalRevenue = 0;
  let lastActivity = null;
  
  products.forEach(product => {
    totalViews += product.analytics.views || 0;
    totalSales += product.analytics.purchases || 0;
    totalRevenue += product.analytics.revenue || 0;
    
    if (product.analytics.lastPurchase && (!lastActivity || product.analytics.lastPurchase > lastActivity)) {
      lastActivity = product.analytics.lastPurchase;
    }
  });
  
  this.stats = {
    productCount,
    totalViews,
    totalSales,
    totalRevenue,
    lastActivity
  };
  
  return this.save();
};

categorySchema.methods.move = async function(newParentId) {
  const oldParent = this.parent;
  this.parent = newParentId;
  
  await this.updatePath();
  
  // Update paths for all descendants
  const descendants = await this.getDescendants();
  for (const descendant of descendants) {
    await descendant.updatePath();
  }
  
  return this;
};

// Static methods
categorySchema.statics.findByWebsite = function(websiteId, status = 'active') {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findRootCategories = function(websiteId) {
  return this.find({
    website: websiteId,
    parent: null,
    status: 'active',
    isVisible: true
  }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.findByParent = function(parentId) {
  return this.find({
    parent: parentId,
    status: 'active',
    isVisible: true
  }).sort({ sortOrder: 1, name: 1 });
};

categorySchema.statics.buildCategoryTree = async function(websiteId, parentId = null) {
  const categories = await this.find({
    website: websiteId,
    parent: parentId,
    status: 'active',
    isVisible: true
  }).sort({ sortOrder: 1, name: 1 });
  
  const tree = [];
  
  for (const category of categories) {
    const categoryObj = category.toObject();
    categoryObj.children = await this.buildCategoryTree(websiteId, category._id);
    tree.push(categoryObj);
  }
  
  return tree;
};

categorySchema.statics.findBySlug = function(websiteId, slug) {
  return this.findOne({
    website: websiteId,
    slug,
    status: 'active'
  });
};

categorySchema.statics.findByPath = function(websiteId, path) {
  return this.findOne({
    website: websiteId,
    path,
    status: 'active'
  });
};

categorySchema.statics.getFeaturedCategories = function(websiteId, limit = 10) {
  return this.find({
    website: websiteId,
    status: 'active',
    isVisible: true,
    'displaySettings.showOnHomepage': true
  }).sort({ 'displaySettings.featuredOrder': 1 }).limit(limit);
};

// Pre-save middleware
categorySchema.pre('save', async function(next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Update path when parent changes
  if (this.isModified('parent') || this.isModified('slug')) {
    await this.updatePath();
  }
  
  next();
});

// Post-save middleware
categorySchema.post('save', async function(doc) {
  // Update parent category stats
  if (doc.parent) {
    const parent = await this.constructor.findById(doc.parent);
    if (parent) {
      await parent.updateStats();
    }
  }
});

// Pre-remove middleware
categorySchema.pre('remove', async function(next) {
  // Move children to parent or root level
  const children = await this.constructor.find({ parent: this._id });
  
  for (const child of children) {
    child.parent = this.parent;
    await child.save();
  }
  
  // Update products in this category to uncategorized or move to parent
  const Product = mongoose.model('Product');
  await Product.updateMany(
    { category: this._id },
    { category: this.parent || null }
  );
  
  next();
});

module.exports = mongoose.model('Category', categorySchema);

