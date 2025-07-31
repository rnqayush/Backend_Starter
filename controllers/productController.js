const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Product Controller
 * Handles e-commerce product management operations
 */
class ProductController {
  /**
   * Create a new product
   * @route POST /api/products
   * @access Private
   */
  createProduct = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const productData = { ...req.body, website: req.website._id };
    const product = await Product.create(productData);
    await product.populate(['website', 'category']);

    successResponse(res, { product }, 'Product created successfully', 201);
  });

  /**
   * Get all products for a website
   * @route GET /api/products
   * @access Public
   */
  getProducts = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const status = req.query.status || 'active';
    const featured = req.query.featured;
    const inStock = req.query.inStock;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query = { website: req.website._id, status };
    
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (inStock === 'true') {
      query.$or = [
        { 'inventory.trackQuantity': false },
        { 'inventory.availableQuantity': { $gt: 0 } },
        { 'inventory.allowBackorder': true }
      ];
    }
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const products = await Product.find(query)
      .populate(['website', 'category'])
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalItems = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, products, pagination, 'Products retrieved successfully');
  });

  /**
   * Get product by ID or slug
   * @route GET /api/products/:identifier
   * @access Public
   */
  getProduct = asyncHandler(async (req, res, next) => {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let product = await Product.findById(identifier).populate(['website', 'category']);
    
    if (!product) {
      product = await Product.findOne({ 
        'seo.slug': identifier, 
        website: req.website._id 
      }).populate(['website', 'category']);
    }

    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    // Increment view count
    await product.incrementViews();

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
      website: req.website._id
    }).limit(4);

    successResponse(res, { product, relatedProducts }, 'Product retrieved successfully');
  });

  /**
   * Update product
   * @route PUT /api/products/:id
   * @access Private
   */
  updateProduct = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    if (product.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['website', 'category']);

    successResponse(res, { product: updatedProduct }, 'Product updated successfully');
  });

  /**
   * Delete product
   * @route DELETE /api/products/:id
   * @access Private
   */
  deleteProduct = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    if (product.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await Product.findByIdAndDelete(id);
    successResponse(res, null, 'Product deleted successfully');
  });

  /**
   * Search products
   * @route GET /api/products/search
   * @access Public
   */
  searchProducts = asyncHandler(async (req, res, next) => {
    const {
      q: searchTerm,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      tags,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      category,
      brand,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock === 'true',
      featured: featured === 'true',
      tags: tags ? tags.split(',') : undefined
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    let products = await Product.searchProducts(req.website._id, searchTerm, filters);

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        products = products.sort((a, b) => a.pricing.price - b.pricing.price);
        break;
      case 'price-high':
        products = products.sort((a, b) => b.pricing.price - a.pricing.price);
        break;
      case 'newest':
        products = products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popularity':
        products = products.sort((a, b) => b.analytics.popularityScore - a.analytics.popularityScore);
        break;
      case 'rating':
        products = products.sort((a, b) => b.reviews.averageRating - a.reviews.averageRating);
        break;
      default: // relevance - already sorted by text search relevance
        break;
    }

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedProducts = products.slice(skip, skip + parseInt(limit));
    const totalItems = products.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const pagination = { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalPages, 
      totalItems 
    };

    paginatedResponse(res, paginatedProducts, pagination, 'Products found');
  });

  /**
   * Get featured products
   * @route GET /api/products/featured
   * @access Public
   */
  getFeaturedProducts = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const products = await Product.getFeaturedProducts(req.website._id, limit);
    successResponse(res, { products }, 'Featured products retrieved successfully');
  });

  /**
   * Get best selling products
   * @route GET /api/products/bestsellers
   * @access Public
   */
  getBestSellers = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    
    const products = await Product.getBestSellers(req.website._id, limit);
    successResponse(res, { products }, 'Best selling products retrieved successfully');
  });

  /**
   * Update product inventory
   * @route PATCH /api/products/:id/inventory
   * @access Private
   */
  updateInventory = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { quantity, reason = 'manual' } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    if (product.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await product.updateInventory(parseInt(quantity), reason);
    successResponse(res, { product }, 'Inventory updated successfully');
  });

  /**
   * Add product review
   * @route POST /api/products/:id/reviews
   * @access Private
   */
  addReview = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400, 'INVALID_RATING'));
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    await product.addReview(rating, review);
    successResponse(res, { product }, 'Review added successfully');
  });

  /**
   * Get product analytics
   * @route GET /api/products/:id/analytics
   * @access Private
   */
  getProductAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
    }

    if (product.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const analytics = {
      views: product.analytics.views,
      purchases: product.analytics.purchases,
      revenue: product.analytics.revenue,
      conversionRate: product.analytics.conversionRate,
      averageRating: product.reviews.averageRating,
      totalReviews: product.reviews.totalReviews,
      inventory: {
        quantity: product.inventory.quantity,
        availableQuantity: product.inventory.availableQuantity,
        reservedQuantity: product.inventory.reservedQuantity,
        lowStock: product.lowStock
      },
      popularityScore: product.analytics.popularityScore,
      lastPurchase: product.analytics.lastPurchase
    };

    successResponse(res, { analytics }, 'Product analytics retrieved successfully');
  });

  /**
   * Bulk update products
   * @route PATCH /api/products/bulk
   * @access Private
   */
  bulkUpdateProducts = asyncHandler(async (req, res, next) => {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return next(new AppError('Product IDs array is required', 400, 'INVALID_PRODUCT_IDS'));
    }

    // Verify all products belong to the website
    const products = await Product.find({
      _id: { $in: productIds },
      website: req.website._id
    });

    if (products.length !== productIds.length) {
      return next(new AppError('Some products not found or access denied', 403, 'ACCESS_DENIED'));
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds }, website: req.website._id },
      updates,
      { runValidators: true }
    );

    successResponse(res, { 
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount 
    }, 'Products updated successfully');
  });

  /**
   * Get products by category
   * @route GET /api/products/category/:categoryId
   * @access Public
   */
  getProductsByCategory = asyncHandler(async (req, res, next) => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'name';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND'));
    }

    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const products = await Product.findByCategory(categoryId, 'active')
      .populate(['website', 'category'])
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalItems = await Product.countDocuments({ 
      category: categoryId, 
      status: 'active' 
    });
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, products, pagination, 'Products retrieved successfully');
  });
}

module.exports = new ProductController();

