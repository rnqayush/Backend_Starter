/**
 * Product Controller - Handle ecommerce product operations
 */

import Product from '../models/Product.js';
import Vendor from '../models/Vendor.js';
import { catchAsync } from '../middleware/error.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { BUSINESS_CATEGORIES, AVAILABILITY_STATUS, RESPONSE_MESSAGES, PAGINATION } from '../config/constants.js';
import { generateProductSlug, generateUniqueSlug } from '../utils/generateSlug.js';

// Create a new product
export const createProduct = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    shortDescription,
    category,
    subcategory,
    tags,
    pricing,
    media,
    specifications,
    availability,
    shipping,
    variants,
    sku,
    barcode
  } = req.body;

  // Verify vendor exists and belongs to user
  const vendor = await Vendor.findOne({ 
    owner: req.user._id, 
    category: BUSINESS_CATEGORIES.ECOMMERCE 
  });
  
  if (!vendor) {
    return next(new AppError('Ecommerce vendor profile required', 400, 'VENDOR_NOT_FOUND'));
  }

  // Generate unique slug
  const baseSlug = generateProductSlug(name, category, specifications?.brand);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (slug) => await Product.findOne({ vendor: vendor._id, slug })
  );

  // Create product
  const product = await Product.create({
    name,
    slug,
    description,
    shortDescription,
    vendor: vendor._id,
    categoryId: null, // TODO: Implement category model
    category,
    subcategory,
    tags: tags || [],
    pricing,
    media,
    specifications: specifications || {},
    availability: availability || { quantity: 0 },
    shipping: shipping || {},
    variants: variants || [],
    sku,
    barcode
  });

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    message: RESPONSE_MESSAGES.CREATED,
    data: {
      product
    }
  });
});

// Get all products with filtering
export const getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    featured,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (brand) query['specifications.brand'] = new RegExp(brand, 'i');
  if (minPrice || maxPrice) {
    query['pricing.price'] = {};
    if (minPrice) query['pricing.price'].$gte = parseFloat(minPrice);
    if (maxPrice) query['pricing.price'].$lte = parseFloat(maxPrice);
  }
  if (inStock === 'true') {
    query['availability.status'] = { $in: [AVAILABILITY_STATUS.IN_STOCK, AVAILABILITY_STATUS.LIMITED_STOCK] };
  }
  if (onSale === 'true') query['pricing.onSale'] = true;
  if (featured !== undefined) query.isFeatured = featured === 'true';

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
      { 'specifications.brand': { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination and sorting
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const products = await Product.find(query)
    .populate('vendor', 'name slug rating reviewCount')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-analytics.revenue -analytics.conversionRate');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get product by ID or slug
export const getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Try to find by ID first, then by slug
  let product = await Product.findOne({ 
    $or: [{ _id: id }, { slug: id }],
    isActive: true 
  }).populate('vendor', 'name slug rating reviewCount address theme');

  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Increment views if not owner
  if (!req.user || product.vendor.owner?.toString() !== req.user._id.toString()) {
    await product.incrementViews();
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      product: req.user && product.vendor.owner?.toString() === req.user._id.toString() 
        ? product 
        : product.toPublicJSON()
    }
  });
});

// Update product
export const updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find product
  const product = await Product.findById(id).populate('vendor');
  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Check ownership
  if (product.vendor.owner.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Prevent updating certain fields
  delete updates.vendor;
  delete updates.analytics;
  delete updates.createdAt;
  delete updates.updatedAt;

  // If name or category is being updated, regenerate slug
  if (updates.name || updates.category || updates.specifications?.brand) {
    const name = updates.name || product.name;
    const category = updates.category || product.category;
    const brand = updates.specifications?.brand || product.specifications?.brand;
    
    const baseSlug = generateProductSlug(name, category, brand);
    const newSlug = await generateUniqueSlug(
      baseSlug,
      async (slug) => await Product.findOne({ 
        vendor: product.vendor._id, 
        slug, 
        _id: { $ne: product._id } 
      })
    );
    updates.slug = newSlug;
  }

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate('vendor', 'name slug');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.UPDATED,
    data: {
      product: updatedProduct
    }
  });
});

// Delete product
export const deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find product
  const product = await Product.findById(id).populate('vendor');
  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Check ownership
  if (product.vendor.owner.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Soft delete
  await Product.findByIdAndUpdate(id, { isActive: false });

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.DELETED,
    data: null
  });
});

// Get products by vendor
export const getProductsByVendor = catchAsync(async (req, res, next) => {
  const { vendorId } = req.params;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    inStock,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = { 
    vendor: vendorId, 
    isActive: true 
  };

  if (category) query.category = category;
  if (inStock === 'true') {
    query['availability.status'] = { $in: [AVAILABILITY_STATUS.IN_STOCK, AVAILABILITY_STATUS.LIMITED_STOCK] };
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const products = await Product.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-analytics.revenue -analytics.conversionRate');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get products by category
export const getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    subcategory,
    sortBy = 'popularity',
    sortOrder = 'desc'
  } = req.query;

  const query = { 
    category, 
    isActive: true 
  };

  if (subcategory) query.subcategory = subcategory;

  const skip = (page - 1) * limit;
  let sortOptions = { 'reviews.rating': -1, 'analytics.totalSales': -1 };
  
  if (sortBy === 'price') sortOptions = { 'pricing.price': sortOrder === 'desc' ? -1 : 1 };
  if (sortBy === 'name') sortOptions = { name: 1 };
  if (sortBy === 'newest') sortOptions = { createdAt: -1 };

  const products = await Product.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-analytics.revenue -analytics.conversionRate');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      products,
      category,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Update product stock
export const updateStock = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, operation = 'set' } = req.body;

  // Find product
  const product = await Product.findById(id).populate('vendor');
  if (!product) {
    return next(new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND'));
  }

  // Check ownership
  if (product.vendor.owner.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Update stock
  await product.updateStock(quantity, operation);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Stock updated successfully',
    data: {
      product: {
        id: product._id,
        name: product.name,
        availability: product.availability
      }
    }
  });
});

// Get featured products
export const getFeaturedProducts = catchAsync(async (req, res, next) => {
  const { 
    limit = 10,
    category 
  } = req.query;

  const query = { 
    isFeatured: true, 
    isActive: true 
  };

  if (category) query.category = category;

  const products = await Product.find(query)
    .populate('vendor', 'name slug')
    .sort({ 'reviews.rating': -1, 'analytics.totalSales': -1 })
    .limit(parseInt(limit))
    .select('-analytics.revenue -analytics.conversionRate');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      products
    }
  });
});

// Get products on sale
export const getProductsOnSale = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    sortBy = 'discountPercentage'
  } = req.query;

  const query = { 
    'pricing.onSale': true, 
    isActive: true 
  };

  if (category) query.category = category;

  const skip = (page - 1) * limit;
  let sortOptions = { 'pricing.discountPercentage': -1 };
  
  if (sortBy === 'price') sortOptions = { 'pricing.salePrice': 1 };
  if (sortBy === 'rating') sortOptions = { 'reviews.rating': -1 };

  const products = await Product.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-analytics.revenue -analytics.conversionRate');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Search products
export const searchProducts = catchAsync(async (req, res, next) => {
  const {
    q: searchTerm,
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    minPrice,
    maxPrice,
    sortBy = 'relevance'
  } = req.query;

  if (!searchTerm) {
    return next(new AppError('Search term is required', 400, 'SEARCH_TERM_REQUIRED'));
  }

  const query = {
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      { 'specifications.brand': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query['pricing.price'] = {};
    if (minPrice) query['pricing.price'].$gte = parseFloat(minPrice);
    if (maxPrice) query['pricing.price'].$lte = parseFloat(maxPrice);
  }

  const skip = (page - 1) * limit;
  
  let sortOptions = { 'reviews.rating': -1, 'analytics.totalSales': -1 };
  if (sortBy === 'price') sortOptions = { 'pricing.price': 1 };
  if (sortBy === 'name') sortOptions = { name: 1 };
  if (sortBy === 'newest') sortOptions = { createdAt: -1 };

  const products = await Product.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-analytics.revenue -analytics.conversionRate');

  const total = await Product.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      products,
      searchTerm,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export default {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByVendor,
  getProductsByCategory,
  updateStock,
  getFeaturedProducts,
  getProductsOnSale,
  searchProducts
};
