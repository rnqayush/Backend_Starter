import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Product from '../../models/ecommerce/Product.js';
import { generateSlug } from '../../utils/slugify.js';

// @desc    Get all products with filters
// @route   GET /api/ecommerce/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = Product.searchProducts(req.query);

  // Sort options
  let sortBy = { createdAt: -1 };
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'price-low':
        sortBy = { 'price.regular': 1 };
        break;
      case 'price-high':
        sortBy = { 'price.regular': -1 };
        break;
      case 'name-asc':
        sortBy = { name: 1 };
        break;
      case 'name-desc':
        sortBy = { name: -1 };
        break;
      case 'rating':
        sortBy = { averageRating: -1 };
        break;
      case 'popular':
        sortBy = { 'analytics.views': -1 };
        break;
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }
  }

  const products = await searchQuery
    .populate('seller', 'name businessInfo')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select('-reviews -__v');

  const total = await Product.countDocuments(searchQuery.getQuery());

  // Get categories for filters
  const categories = await Product.distinct('category', { status: 'published' });
  const brands = await Product.distinct('brand', { status: 'published' });

  sendSuccess(res, {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: {
      categories,
      brands,
      applied: req.query
    }
  }, 'Products retrieved successfully');
});

// @desc    Create new product
// @route   POST /api/ecommerce/products
// @access  Private (Seller only)
export const createProduct = asyncHandler(async (req, res, next) => {
  // Check if user is a seller
  if (req.user.role !== 'vendor' || req.user.businessType !== 'ecommerce') {
    return sendError(res, 'Only e-commerce sellers can create products', 403);
  }

  const productData = {
    ...req.body,
    seller: req.user.id,
    storeName: req.user.businessInfo?.name || req.user.name
  };

  // Generate slug if not provided
  if (!productData.slug) {
    productData.slug = generateSlug(productData.name);
  }

  // Generate SKU if not provided
  if (!productData.sku) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    productData.sku = `PRD-${timestamp}-${random}`;
  }

  const product = await Product.create(productData);

  sendSuccess(res, {
    product
  }, 'Product created successfully', 201);
});

// @desc    Get single product
// @route   GET /api/ecommerce/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name businessInfo rating')
    .populate('reviews.customer', 'name avatar');

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Increment view count
  await product.incrementViews();

  // Get related products
  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: 'published'
  })
    .limit(8)
    .select('name price images averageRating totalReviews')
    .populate('seller', 'name');

  sendSuccess(res, {
    product,
    relatedProducts
  }, 'Product retrieved successfully');
});

// @desc    Update product
// @route   PUT /api/ecommerce/products/:id
// @access  Private (Seller only)
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user owns this product or is admin
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this product', 403);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, {
    product
  }, 'Product updated successfully');
});

// @desc    Delete product
// @route   DELETE /api/ecommerce/products/:id
// @access  Private (Seller only)
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user owns this product or is admin
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this product', 403);
  }

  await Product.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Product deleted successfully');
});

// @desc    Add product images
// @route   POST /api/ecommerce/products/:id/images
// @access  Private (Seller only)
export const addProductImages = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user owns this product
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this product', 403);
  }

  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return sendError(res, 'Images array is required', 400);
  }

  // Add images to product
  images.forEach((image, index) => {
    product.images.push({
      url: image.url,
      alt: image.alt || product.name,
      isPrimary: product.images.length === 0 && index === 0,
      sortOrder: product.images.length + index
    });
  });

  await product.save();

  sendSuccess(res, {
    product: {
      id: product._id,
      images: product.images
    }
  }, 'Images added successfully');
});

// @desc    Delete product image
// @route   DELETE /api/ecommerce/products/:id/images/:imageId
// @access  Private (Seller only)
export const deleteProductImage = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user owns this product
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this product', 403);
  }

  // Remove image from array
  product.images = product.images.filter(img => img._id.toString() !== req.params.imageId);
  
  // If we removed the primary image, make the first remaining image primary
  if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  sendSuccess(res, {
    product: {
      id: product._id,
      images: product.images
    }
  }, 'Image deleted successfully');
});

// @desc    Add product review
// @route   POST /api/ecommerce/products/:id/reviews
// @access  Private (Customer only)
export const addProductReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user already reviewed this product
  const existingReview = product.reviews.find(
    review => review.customer.toString() === req.user.id
  );

  if (existingReview) {
    return sendError(res, 'You have already reviewed this product', 400);
  }

  const reviewData = {
    customer: req.user.id,
    rating: Number(rating),
    title,
    comment,
    verified: false // TODO: Check if user actually purchased this product
  };

  await product.addReview(reviewData);

  const updatedProduct = await Product.findById(req.params.id)
    .populate('reviews.customer', 'name avatar');

  sendSuccess(res, {
    product: updatedProduct,
    review: reviewData
  }, 'Review added successfully');
});

// @desc    Get product reviews
// @route   GET /api/ecommerce/products/:id/reviews
// @access  Public
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const product = await Product.findById(req.params.id)
    .populate({
      path: 'reviews.customer',
      select: 'name avatar'
    });

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Sort reviews by date (newest first)
  const sortedReviews = product.reviews.sort((a, b) => b.createdAt - a.createdAt);
  
  // Paginate reviews
  const paginatedReviews = sortedReviews.slice(skip, skip + limit);
  
  // Calculate rating distribution
  const ratingDistribution = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  };
  
  product.reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  sendSuccess(res, {
    reviews: paginatedReviews,
    pagination: {
      page,
      limit,
      total: product.reviews.length,
      pages: Math.ceil(product.reviews.length / limit)
    },
    summary: {
      averageRating: product.averageRating,
      totalReviews: product.totalReviews,
      ratingDistribution
    }
  }, 'Product reviews retrieved successfully');
});

// @desc    Get seller products
// @route   GET /api/ecommerce/seller/products
// @access  Private (Seller only)
export const getSellerProducts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'ecommerce') {
    return sendError(res, 'Only e-commerce sellers can access this endpoint', 403);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { seller: req.user.id };

  // Status filter
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Search filter
  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { sku: new RegExp(req.query.search, 'i') }
    ];
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-reviews -__v');

  const total = await Product.countDocuments(query);

  // Get seller statistics
  const stats = await Product.aggregate([
    { $match: { seller: mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        publishedProducts: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalViews: { $sum: '$analytics.views' },
        totalPurchases: { $sum: '$analytics.purchases' },
        averageRating: { $avg: '$averageRating' }
      }
    }
  ]);

  sendSuccess(res, {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    statistics: stats[0] || {}
  }, 'Seller products retrieved successfully');
});

// @desc    Get product analytics
// @route   GET /api/ecommerce/products/:id/analytics
// @access  Private (Seller only)
export const getProductAnalytics = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user owns this product
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view analytics for this product', 403);
  }

  sendSuccess(res, {
    analytics: product.analytics,
    performance: {
      conversionRate: product.analytics.conversionRate,
      viewToCartRate: product.analytics.views > 0 ? 
        ((product.analytics.addedToCart / product.analytics.views) * 100).toFixed(2) : 0,
      cartToPurchaseRate: product.analytics.addedToCart > 0 ? 
        ((product.analytics.purchases / product.analytics.addedToCart) * 100).toFixed(2) : 0
    },
    inventory: {
      currentStock: product.inventory.quantity,
      isLowStock: product.isLowStock,
      isInStock: product.isInStock
    },
    reviews: {
      averageRating: product.averageRating,
      totalReviews: product.totalReviews
    }
  }, 'Product analytics retrieved successfully');
});

// @desc    Update product inventory
// @route   PUT /api/ecommerce/products/:id/inventory
// @access  Private (Seller only)
export const updateProductInventory = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  // Check if user owns this product
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this product', 403);
  }

  const { quantity, lowStockThreshold, trackQuantity, allowBackorder } = req.body;

  if (quantity !== undefined) product.inventory.quantity = quantity;
  if (lowStockThreshold !== undefined) product.inventory.lowStockThreshold = lowStockThreshold;
  if (trackQuantity !== undefined) product.inventory.trackQuantity = trackQuantity;
  if (allowBackorder !== undefined) product.inventory.allowBackorder = allowBackorder;

  await product.save();

  sendSuccess(res, {
    product: {
      id: product._id,
      inventory: product.inventory,
      isInStock: product.isInStock,
      isLowStock: product.isLowStock
    }
  }, 'Product inventory updated successfully');
});

// @desc    Bulk update products
// @route   PUT /api/ecommerce/products/bulk
// @access  Private (Seller only)
export const bulkUpdateProducts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'ecommerce') {
    return sendError(res, 'Only e-commerce sellers can perform bulk updates', 403);
  }

  const { productIds, updates } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return sendError(res, 'Product IDs array is required', 400);
  }

  // Verify all products belong to the seller
  const products = await Product.find({
    _id: { $in: productIds },
    seller: req.user.id
  });

  if (products.length !== productIds.length) {
    return sendError(res, 'Some products not found or not owned by you', 403);
  }

  // Perform bulk update
  const result = await Product.updateMany(
    { _id: { $in: productIds }, seller: req.user.id },
    updates,
    { runValidators: true }
  );

  sendSuccess(res, {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount
  }, 'Products updated successfully');
});

// @desc    Get featured products
// @route   GET /api/ecommerce/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 12;
  const category = req.query.category;

  let query = { 
    status: 'published', 
    featured: true 
  };

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .populate('seller', 'name businessInfo')
    .sort({ 'analytics.views': -1, createdAt: -1 })
    .limit(limit)
    .select('-reviews -__v');

  sendSuccess(res, {
    products,
    category: category || 'all'
  }, 'Featured products retrieved successfully');
});

// @desc    Search products
// @route   GET /api/ecommerce/products/search
// @access  Public
export const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, ...filters } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!q) {
    return sendError(res, 'Search query is required', 400);
  }

  // Build search query
  const searchQuery = Product.searchProducts({ ...filters, search: q });

  const products = await searchQuery
    .populate('seller', 'name businessInfo')
    .sort({ 'analytics.views': -1 })
    .skip(skip)
    .limit(limit)
    .select('-reviews -__v');

  const total = await Product.countDocuments(searchQuery.getQuery());

  sendSuccess(res, {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    searchQuery: q,
    filters
  }, 'Product search completed successfully');
});

