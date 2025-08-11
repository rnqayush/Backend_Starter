const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Business = require('../models/Business');
const { validationResult } = require('express-validator');

// Get all products for a business
const getProductsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter
    const filter = { business: businessId, status: 'published' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'seo.keywords': { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter['pricing.price'] = {};
      if (minPrice) filter['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.price'].$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (inStock === 'true') {
      filter['inventory.quantity'] = { $gt: 0 };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('business', 'name slug type')
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// Get categories for a business
const getCategoriesByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const categories = await Category.find({
      business: businessId,
      status: 'active',
    }).sort({ order: 1, name: 1 });

    // Count products in each category
    const categoriesWithCount = await Promise.all(
      categories.map(async category => {
        const productCount = await Product.countDocuments({
          business: businessId,
          category: category._id,
          status: 'published',
        });
        return {
          ...category.toObject(),
          productCount,
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};

// Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('business', 'name slug type businessInfo branding')
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Increment view count
    product.analytics.views += 1;
    product.analytics.lastViewedAt = new Date();
    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const business = await Business.findById(req.body.business);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check if user owns the business
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create product for this business',
      });
    }

    const product = new Product({
      ...req.body,
      createdBy: req.user.id,
    });

    await product.save();
    await product.populate(['business', 'category']);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('business');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user owns the business
    if (
      product.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product',
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate(['business', 'category']);

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('business');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user owns the business
    if (
      product.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};

// Add product review
const addProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(review);

    // Update average rating
    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.rating = {
      average: totalRating / product.reviews.length,
      count: product.reviews.length,
    };

    await product.save();

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review added successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message,
    });
  }
};

// Create category
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const business = await Business.findById(req.body.business);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check if user owns the business
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create category for this business',
      });
    }

    const category = new Category({
      ...req.body,
      createdBy: req.user.id,
    });

    await category.save();

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message,
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      'business'
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if user owns the business
    if (
      category.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this category',
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message,
    });
  }
};

// Get ecommerce analytics
const getEcommerceAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Check if user owns the business
    if (
      business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this business',
      });
    }

    const totalProducts = await Product.countDocuments({
      business: businessId,
    });
    const publishedProducts = await Product.countDocuments({
      business: businessId,
      status: 'published',
    });
    const totalOrders = await Order.countDocuments({ business: businessId });
    const pendingOrders = await Order.countDocuments({
      business: businessId,
      status: 'pending',
    });

    const products = await Product.find({ business: businessId });
    const totalViews = products.reduce(
      (sum, product) => sum + product.analytics.views,
      0
    );

    const orders = await Order.find({
      business: businessId,
      status: 'completed',
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const analytics = {
      totalProducts,
      publishedProducts,
      totalOrders,
      pendingOrders,
      totalViews,
      totalRevenue,
      averageOrderValue:
        totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
    };

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ecommerce analytics',
      error: error.message,
    });
  }
};

// Search products across all businesses
const searchProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      location,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      const categories = await Category.find({
        name: { $regex: category, $options: 'i' },
      });
      filter.category = { $in: categories.map(c => c._id) };
    }

    if (minPrice || maxPrice) {
      filter['pricing.price'] = {};
      if (minPrice) filter['pricing.price'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.price'].$lte = Number(maxPrice);
    }

    if (rating) {
      filter['rating.average'] = { $gte: Number(rating) };
    }

    if (location) {
      const businesses = await Business.find({
        $or: [
          { 'businessInfo.address.city': { $regex: location, $options: 'i' } },
          { 'businessInfo.address.state': { $regex: location, $options: 'i' } },
        ],
      });
      const businessIds = businesses.map(b => b._id);
      filter.business = { $in: businessIds };
    }

    const products = await Product.find(filter)
      .populate('business', 'name slug type businessInfo')
      .populate('category', 'name slug')
      .sort({ featured: -1, 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / limit),
          total,
        },
        filters: { search, category, minPrice, maxPrice, rating, location },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message,
    });
  }
};

module.exports = {
  getProductsByBusiness,
  getCategoriesByBusiness,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  createCategory,
  updateCategory,
  getEcommerceAnalytics,
  searchProducts,
};
