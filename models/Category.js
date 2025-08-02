/**
 * Category Model - Product/Service categories for multi-vendor platform
 */

import mongoose from 'mongoose';
import { BUSINESS_CATEGORIES, DEFAULTS } from '../config/constants.js';

const categorySchema = new mongoose.Schema({
  // Category identification
  categoryId: {
    type: String,
    unique: true,
    required: true,
    default: () => `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Basic information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },

  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format']
  },

  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    minlength: [10, 'Category description must be at least 10 characters'],
    maxlength: [500, 'Category description cannot exceed 500 characters']
  },

  // Business category context
  businessCategory: {
    type: String,
    required: [true, 'Business category is required'],
    enum: {
      values: Object.values(BUSINESS_CATEGORIES),
      message: 'Invalid business category'
    }
  },

  // Hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  level: {
    type: Number,
    default: 0,
    min: [0, 'Level cannot be negative'],
    max: [5, 'Maximum category depth is 5 levels']
  },

  path: {
    type: String,
    default: ''
  },

  // Visual elements
  image: {
    url: {
      type: String,
      required: [true, 'Category image URL is required']
    },
    alt: {
      type: String,
      required: [true, 'Category image alt text is required']
    },
    caption: String
  },

  icon: {
    type: String,
    default: 'category'
  },

  color: {
    type: String,
    default: '#6366f1',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
  },

  // SEO and metadata
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: String
  },

  // Category attributes/filters
  attributes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'range'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [{
      value: String,
      label: String,
      color: String
    }],
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      message: String
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],

  // Category-specific settings
  settings: {
    // Commission settings
    commission: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      },
      value: {
        type: Number,
        min: 0,
        default: 0
      }
    },

    // Pricing settings
    pricing: {
      allowNegotiation: {
        type: Boolean,
        default: false
      },
      requirePricing: {
        type: Boolean,
        default: true
      },
      priceRanges: [{
        min: Number,
        max: Number,
        label: String
      }]
    },

    // Listing requirements
    requirements: {
      minImages: {
        type: Number,
        default: 1,
        min: 0
      },
      maxImages: {
        type: Number,
        default: 10,
        min: 1
      },
      requiredFields: [{
        type: String
      }],
      approvalRequired: {
        type: Boolean,
        default: false
      }
    },

    // Display settings
    display: {
      showInMenu: {
        type: Boolean,
        default: true
      },
      showOnHomepage: {
        type: Boolean,
        default: false
      },
      featuredOrder: {
        type: Number,
        default: 0
      },
      gridLayout: {
        type: String,
        enum: ['grid', 'list', 'card'],
        default: 'grid'
      }
    }
  },

  // Statistics
  stats: {
    totalProducts: {
      type: Number,
      default: 0,
      min: 0
    },
    totalVendors: {
      type: Number,
      default: 0,
      min: 0
    },
    totalViews: {
      type: Number,
      default: 0,
      min: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Status and visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },

  isVisible: {
    type: Boolean,
    default: true
  },

  isFeatured: {
    type: Boolean,
    default: false
  },

  // Sorting and ordering
  sortOrder: {
    type: Number,
    default: 0
  },

  displayOrder: {
    type: Number,
    default: 0
  },

  // Localization
  translations: [{
    language: {
      type: String,
      required: true,
      default: DEFAULTS.LANGUAGE
    },
    name: String,
    description: String,
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String]
    }
  }],

  // Admin information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  metadata: {
    tags: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ businessCategory: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ isVisible: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });

// Compound indexes
categorySchema.index({ businessCategory: 1, status: 1, isVisible: 1 });
categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ businessCategory: 1, level: 1, sortOrder: 1 });

// Text index for search
categorySchema.index({
  name: 'text',
  description: 'text',
  'seo.keywords': 'text'
});

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  return this.path ? `${this.path}/${this.slug}` : this.slug;
});

// Virtual for children count
categorySchema.virtual('childrenCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  count: true
});

// Virtual for breadcrumb
categorySchema.virtual('breadcrumb').get(function() {
  if (!this.path) return [{ name: this.name, slug: this.slug }];
  
  const pathParts = this.path.split('/').filter(Boolean);
  return pathParts.map(slug => ({ slug })).concat([{ name: this.name, slug: this.slug }]);
});

// Pre-save middleware
categorySchema.pre('save', async function(next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Calculate level and path based on parent
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path}/${parent.slug}` : parent.slug;
    }
  } else {
    this.level = 0;
    this.path = '';
  }

  // Validate maximum depth
  if (this.level > 5) {
    throw new Error('Maximum category depth of 5 levels exceeded');
  }

  // Set default SEO values
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.name;
  }
  
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.description.substring(0, 160);
  }

  next();
});

// Pre-remove middleware
categorySchema.pre('remove', async function(next) {
  // Check if category has children
  const childrenCount = await this.constructor.countDocuments({ parent: this._id });
  if (childrenCount > 0) {
    throw new Error('Cannot delete category with subcategories');
  }

  // Check if category has products
  if (this.stats.totalProducts > 0) {
    throw new Error('Cannot delete category with products');
  }

  next();
});

// Static methods
categorySchema.statics.getHierarchy = async function(businessCategory, parentId = null) {
  const categories = await this.find({
    businessCategory,
    parent: parentId,
    status: 'active',
    isVisible: true
  })
  .sort({ sortOrder: 1, name: 1 })
  .lean();

  // Recursively get children
  for (let category of categories) {
    category.children = await this.getHierarchy(businessCategory, category._id);
  }

  return categories;
};

categorySchema.statics.getFlatList = async function(businessCategory, options = {}) {
  const query = { businessCategory, status: 'active' };
  
  if (options.isVisible !== undefined) {
    query.isVisible = options.isVisible;
  }
  
  if (options.level !== undefined) {
    query.level = options.level;
  }

  return await this.find(query)
    .populate('parent', 'name slug')
    .sort({ level: 1, sortOrder: 1, name: 1 })
    .lean();
};

categorySchema.statics.search = async function(searchTerm, businessCategory, options = {}) {
  const query = {
    $text: { $search: searchTerm },
    businessCategory,
    status: 'active',
    isVisible: true
  };

  return await this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20)
    .lean();
};

// Instance methods
categorySchema.methods.updateStats = async function() {
  // This would typically be called when products are added/removed
  // Implementation depends on your Product model structure
  
  // Example implementation:
  // const Product = mongoose.model('Product');
  // this.stats.totalProducts = await Product.countDocuments({ category: this._id });
  
  return await this.save();
};

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
  
  const findChildren = async (parentId) => {
    const children = await this.constructor.find({ parent: parentId });
    for (let child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };

  await findChildren(this._id);
  return descendants;
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
