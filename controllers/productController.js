const Product = require('../models/Product');
const Order = require('../models/Order');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

class ProductController extends BaseController {
  constructor() {
    super(Product, 'Product');
    this.searchFields = ['name', 'description', 'category', 'tags'];
    this.populateFields = ['business'];
  }

  /**
   * Get products with advanced filtering
   */
  getProducts = asyncHandler(async (req, res) => {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      featured,
      brand,
      rating,
      sortBy = '-createdAt',
      page = 1,
      limit = 12
    } = req.query;

    let query = { status: 'active', isActive: true };

    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.salePrice'] = {};
      if (minPrice) query['pricing.salePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.salePrice'].$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      query['inventory.quantity'] = { $gt: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Brand filter
    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    const total = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('business', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews'); // Exclude reviews for list view

    return ResponseHandler.paginated(res, products, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Products retrieved successfully');
  });

  /**
   * Get product with reviews
   */
  getProductWithReviews = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('business', 'name slug contact')
      .populate('reviews.user', 'name');

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return ResponseHandler.success(res, product, 'Product retrieved successfully');
  });

  /**
   * Get products by category
   */
  getByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 12, sortBy = '-createdAt' } = req.query;

    const query = {
      category: { $regex: category, $options: 'i' },
      status: 'active',
      isActive: true
    };

    const total = await Product.countDocuments(query);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('business', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews');

    return ResponseHandler.paginated(res, products, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, `Products in ${category} category retrieved successfully`);
  });

  /**
   * Get featured products
   */
  getFeaturedProducts = asyncHandler(async (req, res) => {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      featured: true,
      status: 'active',
      isActive: true
    })
      .populate('business', 'name slug')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .select('-reviews');

    return ResponseHandler.success(res, products, 'Featured products retrieved successfully');
  });

  /**
   * Get related products
   */
  getRelatedProducts = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      $or: [
        { category: product.category },
        { tags: { $in: product.tags } },
        { brand: product.brand }
      ],
      status: 'active',
      isActive: true
    })
      .populate('business', 'name slug')
      .sort('-rating.average')
      .limit(parseInt(limit))
      .select('-reviews');

    return ResponseHandler.success(res, relatedProducts, 'Related products retrieved successfully');
  });

  /**
   * Update product inventory
   */
  updateInventory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await this.checkOwnership(product, req.user);

    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = product.inventory.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, product.inventory.quantity - quantity);
        break;
      default:
        newQuantity = quantity;
    }

    product.inventory.quantity = newQuantity;
    product.inventory.lastUpdated = new Date();

    // Update stock status
    if (newQuantity === 0) {
      product.inventory.stockStatus = 'out_of_stock';
    } else if (newQuantity <= product.inventory.lowStockThreshold) {
      product.inventory.stockStatus = 'low_stock';
    } else {
      product.inventory.stockStatus = 'in_stock';
    }

    await product.save();

    return ResponseHandler.updated(res, product, 'Inventory updated successfully');
  });

  /**
   * Add product review
   */
  addReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      customer: req.user.id,
      'items.product': id,
      status: 'delivered'
    });

    if (!hasPurchased) {
      throw new BadRequestError('You can only review products you have purchased');
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      throw new BadRequestError('You have already reviewed this product');
    }

    // Add review
    product.reviews.push({
      user: req.user.id,
      rating: parseInt(rating),
      comment,
      createdAt: new Date()
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    return ResponseHandler.created(res, product.reviews[product.reviews.length - 1], 'Review added successfully');
  });

  /**
   * Get product analytics
   */
  getProductAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await this.checkOwnership(product, req.user);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get sales statistics
    const salesStats = await Order.aggregate([
      {
        $match: {
          'items.product': product._id,
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.product': product._id
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          averageOrderValue: { $avg: { $multiply: ['$items.quantity', '$items.price'] } },
          uniqueCustomers: { $addToSet: '$customer' }
        }
      },
      {
        $project: {
          totalSales: 1,
          totalRevenue: 1,
          averageOrderValue: 1,
          uniqueCustomers: { $size: '$uniqueCustomers' }
        }
      }
    ]);

    // Get view statistics (if tracking is implemented)
    const viewStats = {
      totalViews: product.views || 0,
      conversionRate: salesStats[0] ? 
        ((salesStats[0].totalSales / (product.views || 1)) * 100).toFixed(2) : 0
    };

    const analytics = {
      salesStats: salesStats[0] || {
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        uniqueCustomers: 0
      },
      viewStats,
      inventoryStatus: {
        currentStock: product.inventory.quantity,
        stockStatus: product.inventory.stockStatus,
        lowStockThreshold: product.inventory.lowStockThreshold
      },
      rating: {
        average: product.rating.average,
        count: product.rating.count
      },
      period: { start, end }
    };

    return ResponseHandler.success(res, analytics, 'Product analytics retrieved successfully');
  });

  /**
   * Bulk update products
   */
  bulkUpdate = asyncHandler(async (req, res) => {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new BadRequestError('Product IDs array is required');
    }

    // Check ownership for all products
    const products = await Product.find({ _id: { $in: productIds } });
    
    for (const product of products) {
      await this.checkOwnership(product, req.user);
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      updates,
      { runValidators: true }
    );

    return ResponseHandler.success(res, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }, 'Products updated successfully');
  });

  /**
   * Get low stock products
   */
  getLowStockProducts = asyncHandler(async (req, res) => {
    const businessId = req.user.businesses[0]; // Assuming business owner

    const lowStockProducts = await Product.find({
      business: businessId,
      $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] },
      status: 'active'
    })
      .select('name sku inventory.quantity inventory.lowStockThreshold')
      .sort('inventory.quantity');

    return ResponseHandler.success(res, lowStockProducts, 'Low stock products retrieved successfully');
  });
}

module.exports = new ProductController();

