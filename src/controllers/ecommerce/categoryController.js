import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import mongoose from 'mongoose';

// Create Category model
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: String,
  image: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

const Category = mongoose.model('Category', categorySchema);

// @desc    Get all categories
// @route   GET /api/ecommerce/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  let query = { isActive: true };

  // Filter by parent (for subcategories)
  if (req.query.parent) {
    query.parent = req.query.parent === 'null' ? null : req.query.parent;
  }

  // Search filter
  if (req.query.search) {
    query.name = new RegExp(req.query.search, 'i');
  }

  const categories = await Category.find(query)
    .populate('parent', 'name slug')
    .populate('children')
    .sort({ sortOrder: 1, name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Category.countDocuments(query);

  sendSuccess(res, {
    categories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Categories retrieved successfully');
});

// @desc    Create category
// @route   POST /api/ecommerce/categories
// @access  Private (Admin/Seller)
export const createCategory = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
    return sendError(res, 'Not authorized to create categories', 403);
  }

  const categoryData = {
    ...req.body,
    createdBy: req.user.id
  };

  // Generate slug if not provided
  if (!categoryData.slug) {
    categoryData.slug = categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  // Set level based on parent
  if (categoryData.parent) {
    const parentCategory = await Category.findById(categoryData.parent);
    if (parentCategory) {
      categoryData.level = parentCategory.level + 1;
    }
  }

  const category = await Category.create(categoryData);

  sendSuccess(res, {
    category
  }, 'Category created successfully', 201);
});

// @desc    Update category
// @route   PUT /api/ecommerce/categories/:id
// @access  Private (Admin/Seller)
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 'Category not found', 404);
  }

  if (req.user.role !== 'admin' && category.createdBy.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this category', 403);
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('parent', 'name slug').populate('children');

  sendSuccess(res, {
    category: updatedCategory
  }, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/ecommerce/categories/:id
// @access  Private (Admin/Seller)
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 'Category not found', 404);
  }

  if (req.user.role !== 'admin' && category.createdBy.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this category', 403);
  }

  // Check if category has children
  const childrenCount = await Category.countDocuments({ parent: req.params.id });
  if (childrenCount > 0) {
    return sendError(res, 'Cannot delete category with subcategories', 400);
  }

  // Check if category has products
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({ category: category.name });
  if (productCount > 0) {
    return sendError(res, 'Cannot delete category with products', 400);
  }

  await Category.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Category deleted successfully');
});

// @desc    Get category tree
// @route   GET /api/ecommerce/categories/tree
// @access  Public
export const getCategoryTree = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .populate('children')
    .sort({ sortOrder: 1, name: 1 });

  // Build tree structure
  const buildTree = (categories, parentId = null) => {
    return categories
      .filter(cat => (cat.parent?.toString() || null) === parentId)
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(categories, cat._id.toString())
      }));
  };

  const tree = buildTree(categories);

  sendSuccess(res, {
    categoryTree: tree
  }, 'Category tree retrieved successfully');
});

