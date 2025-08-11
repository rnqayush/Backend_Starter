const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Get all products with filtering, sorting, and pagination
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      brand,
      rating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active',
      featured
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter['price.regular'] = {};
      if (minPrice) filter['price.regular'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.regular'].$lte = parseFloat(maxPrice);
    }
    
    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }
    
    if (rating) {
      filter['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('seller', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product by ID or slug
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a valid ObjectId or treat as slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };
    
    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('seller', 'firstName lastName email phone')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products from same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      status: 'active'
    })
    .limit(4)
    .select('name slug price images rating')
    .lean();

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product (Protected - Seller only)
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      seller: req.user.id
    };

    // Generate SKU if not provided
    if (!productData.sku) {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      productData.sku = `PRD${timestamp}${random}`;
    }

    const product = new Product(productData);
    await product.save();

    await product.populate('category', 'name slug');
    await product.populate('seller', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product (Protected - Seller only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find product and check ownership
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns this product or is admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update product
    Object.assign(product, updates);
    await product.save();

    await product.populate('category', 'name slug');
    await product.populate('seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product (Protected - Seller only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Get products by seller (Protected)
const getSellerProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { seller: req.user.id };
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller products',
      error: error.message
    });
  }
};

// Update product inventory (Protected - Seller only)
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, lowStockThreshold, trackQuantity, allowBackorder } = req.body;

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update inventory
    if (quantity !== undefined) product.inventory.quantity = quantity;
    if (lowStockThreshold !== undefined) product.inventory.lowStockThreshold = lowStockThreshold;
    if (trackQuantity !== undefined) product.inventory.trackQuantity = trackQuantity;
    if (allowBackorder !== undefined) product.inventory.allowBackorder = allowBackorder;

    await product.save();

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      data: {
        inventory: product.inventory,
        stockStatus: product.stockStatus
      }
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message
    });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          products: [],
          suggestions: []
        }
      });
    }

    const searchQuery = {
      $text: { $search: q },
      status: 'active'
    };

    const products = await Product.find(searchQuery)
      .populate('category', 'name slug')
      .select('name slug price images rating brand')
      .limit(parseInt(limit))
      .lean();

    // Get search suggestions based on product names and brands
    const suggestions = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $project: {
          suggestions: {
            $concatArrays: [
              [{ $toLower: '$name' }],
              [{ $toLower: '$brand' }]
            ]
          }
        }
      },
      { $unwind: '$suggestions' },
      { $match: { suggestions: { $regex: q, $options: 'i' } } },
      { $group: { _id: '$suggestions' } },
      { $limit: 5 },
      { $project: { _id: 0, suggestion: '$_id' } }
    ]);

    res.json({
      success: true,
      data: {
        products,
        suggestions: suggestions.map(s => s.suggestion)
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateInventory,
  searchProducts
};

