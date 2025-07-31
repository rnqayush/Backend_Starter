const Category = require('../models/Category');
const Product = require('../models/Product');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Category Controller
 * Handles e-commerce category management operations
 */
class CategoryController {
  /**
   * Create a new category
   * @route POST /api/categories
   * @access Private
   */
  createCategory = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const categoryData = { ...req.body, website: req.website._id };
    const category = await Category.create(categoryData);
    await category.populate('website', 'name slug');

    successResponse(res, { category }, 'Category created successfully', 201);
  });

  /**
   * Get all categories for a website
   * @route GET /api/categories
   * @access Public
   */
  getCategories = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status || 'active';
    const parent = req.query.parent;
    const tree = req.query.tree === 'true';

    if (tree) {
      // Return hierarchical tree structure
      const categoryTree = await Category.buildCategoryTree(req.website._id);
      return successResponse(res, { categories: categoryTree }, 'Category tree retrieved successfully');
    }

    const query = { website: req.website._id, status };
    if (parent) {
      query.parent = parent === 'null' ? null : parent;
    }

    const skip = (page - 1) * limit;
    const categories = await Category.find(query)
      .populate(['website', 'parent'])
      .sort({ sortOrder: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Category.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, categories, pagination, 'Categories retrieved successfully');
  });

  /**
   * Get category by ID or slug
   * @route GET /api/categories/:identifier
   * @access Public
   */
  getCategory = asyncHandler(async (req, res, next) => {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let category = await Category.findById(identifier)
      .populate(['website', 'parent']);
    
    if (!category) {
      category = await Category.findBySlug(req.website._id, identifier);
      if (category) {
        await category.populate(['website', 'parent']);
      }
    }

    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    // Get subcategories
    const subcategories = await Category.findByParent(category._id);
    
    // Get products in this category (limited)
    const products = await Product.findByCategory(category._id, 'active')
      .limit(12)
      .populate('category');

    successResponse(res, { 
      category, 
      subcategories, 
      products 
    }, 'Category retrieved successfully');
  });

  /**
   * Update category
   * @route PUT /api/categories/:id
   * @access Private
   */
  updateCategory = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    if (category.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Prevent circular references
    if (req.body.parent && req.body.parent === id) {
      return next(new AppError('Category cannot be its own parent', 400, 'CIRCULAR_REFERENCE'));
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['website', 'parent']);

    successResponse(res, { category: updatedCategory }, 'Category updated successfully');
  });

  /**
   * Delete category
   * @route DELETE /api/categories/:id
   * @access Private
   */
  deleteCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    if (category.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return next(new AppError('Cannot delete category with products. Move products first.', 400, 'CATEGORY_HAS_PRODUCTS'));
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      return next(new AppError('Cannot delete category with subcategories. Move subcategories first.', 400, 'CATEGORY_HAS_SUBCATEGORIES'));
    }

    await Category.findByIdAndDelete(id);
    successResponse(res, null, 'Category deleted successfully');
  });

  /**
   * Get root categories (no parent)
   * @route GET /api/categories/root
   * @access Public
   */
  getRootCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.findRootCategories(req.website._id);
    successResponse(res, { categories }, 'Root categories retrieved successfully');
  });

  /**
   * Get featured categories
   * @route GET /api/categories/featured
   * @access Public
   */
  getFeaturedCategories = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const categories = await Category.getFeaturedCategories(req.website._id, limit);
    successResponse(res, { categories }, 'Featured categories retrieved successfully');
  });

  /**
   * Move category to different parent
   * @route PATCH /api/categories/:id/move
   * @access Private
   */
  moveCategory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { newParentId } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    if (category.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Validate new parent exists and belongs to same website
    if (newParentId) {
      const newParent = await Category.findById(newParentId);
      if (!newParent || newParent.website.toString() !== req.website._id.toString()) {
        return next(new AppError('Invalid parent category', 400, 'INVALID_PARENT'));
      }

      // Prevent circular references
      const descendants = await category.getDescendants();
      const descendantIds = descendants.map(d => d._id.toString());
      if (descendantIds.includes(newParentId)) {
        return next(new AppError('Cannot move category to its own descendant', 400, 'CIRCULAR_REFERENCE'));
      }
    }

    await category.move(newParentId);
    await category.populate(['website', 'parent']);

    successResponse(res, { category }, 'Category moved successfully');
  });

  /**
   * Get category analytics
   * @route GET /api/categories/:id/analytics
   * @access Private
   */
  getCategoryAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    if (category.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Update stats before returning
    await category.updateStats();

    const analytics = {
      productCount: category.stats.productCount,
      totalViews: category.stats.totalViews,
      totalSales: category.stats.totalSales,
      totalRevenue: category.stats.totalRevenue,
      lastActivity: category.stats.lastActivity,
      level: category.level,
      path: category.path
    };

    successResponse(res, { analytics }, 'Category analytics retrieved successfully');
  });

  /**
   * Reorder categories
   * @route PATCH /api/categories/reorder
   * @access Private
   */
  reorderCategories = asyncHandler(async (req, res, next) => {
    const { categoryOrders } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(categoryOrders)) {
      return next(new AppError('Category orders must be an array', 400, 'INVALID_INPUT'));
    }

    // Verify all categories belong to the website
    const categoryIds = categoryOrders.map(item => item.id);
    const categories = await Category.find({
      _id: { $in: categoryIds },
      website: req.website._id
    });

    if (categories.length !== categoryIds.length) {
      return next(new AppError('Some categories not found or access denied', 403, 'ACCESS_DENIED'));
    }

    // Update sort orders
    const updatePromises = categoryOrders.map(({ id, sortOrder }) =>
      Category.findByIdAndUpdate(id, { sortOrder }, { new: true })
    );

    await Promise.all(updatePromises);

    successResponse(res, null, 'Categories reordered successfully');
  });

  /**
   * Get category breadcrumb
   * @route GET /api/categories/:id/breadcrumb
   * @access Public
   */
  getCategoryBreadcrumb = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    const ancestors = await category.getAncestors();
    const breadcrumb = [...ancestors, category];

    successResponse(res, { breadcrumb }, 'Category breadcrumb retrieved successfully');
  });

  /**
   * Search categories
   * @route GET /api/categories/search
   * @access Public
   */
  searchCategories = asyncHandler(async (req, res, next) => {
    const { q: searchTerm, level, parent } = req.query;

    const query = { 
      website: req.website._id, 
      status: 'active',
      isVisible: true
    };

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (level !== undefined) {
      query.level = parseInt(level);
    }

    if (parent) {
      query.parent = parent === 'null' ? null : parent;
    }

    const categories = await Category.find(query)
      .populate(['website', 'parent'])
      .sort({ sortOrder: 1, name: 1 })
      .limit(50);

    successResponse(res, { categories }, 'Categories found');
  });

  /**
   * Bulk update categories
   * @route PATCH /api/categories/bulk
   * @access Private
   */
  bulkUpdateCategories = asyncHandler(async (req, res, next) => {
    const { categoryIds, updates } = req.body;

    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return next(new AppError('Category IDs array is required', 400, 'INVALID_CATEGORY_IDS'));
    }

    // Verify all categories belong to the website
    const categories = await Category.find({
      _id: { $in: categoryIds },
      website: req.website._id
    });

    if (categories.length !== categoryIds.length) {
      return next(new AppError('Some categories not found or access denied', 403, 'ACCESS_DENIED'));
    }

    const result = await Category.updateMany(
      { _id: { $in: categoryIds }, website: req.website._id },
      updates,
      { runValidators: true }
    );

    successResponse(res, { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount 
    }, 'Categories updated successfully');
  });
}

module.exports = new CategoryController();

