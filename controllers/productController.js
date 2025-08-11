const Product = require('../models/Product');
const Category = require('../models/Category');
const Business = require('../models/Business');
const Order = require('../models/Order');

// @desc    Get products for a business
// @route   GET /api/ecommerce/business/:businessId/products
// @access  Public
const getProductsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const {
      category,
      featured,
      onSale,
      availability,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = req.query;

    let query = {
      business: businessId,
      status: 'published',
    };

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (onSale === 'true') {
      query['pricing.onSale'] = true;
    }

    if (availability) {
      query['availability.status'] = availability;
    }

    if (minPrice || maxPrice) {
      query['pricing.price'] = {};
      if (minPrice) query['pricing.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.price'].$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    let sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('business', 'name slug branding')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: totalPages,
          total: totalProducts,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/ecommerce/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('business', 'name slug branding contact')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Increment view count
    await product.incrementViews();

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'published',
    }).limit(4);

    res.json({
      success: true,
      data: {
        product,
        relatedProducts,
      },
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create product
// @route   POST /api/ecommerce/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    // Verify business ownership
    const business = await Business.findById(req.body.business);
    if (!business || business.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create products for this business',
      });
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product creation',
    });
  }
};

// @desc    Update product
// @route   PUT /api/ecommerce/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('business');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check ownership
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
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct },
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product update',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/ecommerce/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('business');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check ownership
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
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product deletion',
    });
  }
};

// @desc    Add product review
// @route   POST /api/ecommerce/products/:id/reviews
// @access  Private
const addProductReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      'items.product': req.params.id,
      status: 'delivered',
    });

    const review = {
      user: req.user.id,
      rating,
      title,
      comment,
      verified: !!hasPurchased,
    };

    product.reviews.push(review);
    product.calculateRating();
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { product },
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during review addition',
    });
  }
};

// @desc    Get product categories for business
// @route   GET /api/ecommerce/business/:businessId/categories
// @access  Public
const getCategoriesByBusiness = async (req, res) => {
  try {
    const categories = await Category.find({
      business: req.params.businessId,
      isActive: true,
    }).populate('productsCount');

    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getProductsByBusiness,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getCategoriesByBusiness,
};
