const mongoose = require('mongoose');
const Product = require('../../models/Product');
const Order = require('../../models/Order');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class ProductController {
  // Get all products with filtering and pagination
  async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        minPrice,
        maxPrice,
        brand,
        rating,
        inStock,
        featured,
        onSale,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query;

      // Build filter query
      const filter = { status: 'active', visibility: 'public' };

      if (category) {
        filter.category = category;
      }

      if (brand) {
        filter.brand = new RegExp(brand, 'i');
      }

      if (rating) {
        filter['reviews.averageRating'] = { $gte: parseFloat(rating) };
      }

      if (inStock === 'true') {
        filter.$or = [
          { 'inventory.trackInventory': false },
          { 'inventory.stockQuantity': { $gt: 0 } },
          { 'inventory.allowBackorders': true },
        ];
      }

      if (featured === 'true') {
        filter['marketing.featured'] = true;
      }

      if (onSale === 'true') {
        filter['pricing.salePrice'] = { $exists: true, $gt: 0 };
      }

      // Price filtering
      if (minPrice || maxPrice) {
        filter['pricing.basePrice'] = {};
        if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
        if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
      }

      // Search functionality
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      if (search) {
        sort.score = { $meta: 'textScore' };
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const products = await Product.find(filter)
        .populate('sellerId', 'name seller.businessName seller.rating')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-inventory.costPrice'); // Hide cost price from public

      const total = await Product.countDocuments(filter);

      return successResponse(res, 'Products retrieved successfully', {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        filters: {
          category,
          minPrice,
          maxPrice,
          brand,
          rating,
          inStock,
          featured,
          onSale,
          search,
        },
      });
    } catch (error) {
      console.error('Get products error:', error);
      return errorResponse(res, 'Failed to retrieve products', 500);
    }
  }

  // Get single product by ID or slug
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      // Try to find by ID first, then by slug
      let product = await Product.findById(id)
        .populate('sellerId', 'name seller.businessName seller.rating seller.verified avatar');
      
      if (!product) {
        product = await Product.findOne({ slug: id, status: 'active' })
          .populate('sellerId', 'name seller.businessName seller.rating seller.verified avatar');
      }

      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      // Increment view count
      await product.incrementView();

      // Get related products
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        status: 'active',
        visibility: 'public',
      })
        .limit(8)
        .select('name pricing images reviews slug');

      // Remove cost price from response
      const productResponse = product.toObject();
      if (productResponse.pricing && productResponse.pricing.costPrice) {
        delete productResponse.pricing.costPrice;
      }

      return successResponse(res, 'Product retrieved successfully', {
        product: productResponse,
        relatedProducts,
      });
    } catch (error) {
      console.error('Get product error:', error);
      return errorResponse(res, 'Failed to retrieve product', 500);
    }
  }

  // Create new product (sellers only)
  async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        sellerId: req.user.id,
        storeName: req.user.seller?.businessName || `${req.user.name}'s Store`,
      };

      const product = new Product(productData);
      await product.save();

      return successResponse(res, 'Product created successfully', { product }, 201);
    } catch (error) {
      console.error('Create product error:', error);
      if (error.code === 11000) {
        return errorResponse(res, 'Product with this SKU already exists', 400);
      }
      return errorResponse(res, error.message || 'Failed to create product', 500);
    }
  }

  // Update product (seller only)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if product exists and user owns it
      const product = await Product.findById(id);
      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. You can only update your own products', 403);
      }

      // Track price changes
      if (updateData.pricing && updateData.pricing.basePrice !== product.pricing.basePrice) {
        if (!product.pricing.priceHistory) {
          product.pricing.priceHistory = [];
        }
        product.pricing.priceHistory.push({
          price: product.pricing.basePrice,
          date: new Date(),
          reason: 'Price update',
        });
      }

      updateData.lastModified = new Date();

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('sellerId', 'name seller.businessName');

      return successResponse(res, 'Product updated successfully', { product: updatedProduct });
    } catch (error) {
      console.error('Update product error:', error);
      return errorResponse(res, error.message || 'Failed to update product', 500);
    }
  }

  // Delete product (seller only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;

      // Check if product exists and user owns it
      const product = await Product.findById(id);
      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. You can only delete your own products', 403);
      }

      // Check for active orders
      const activeOrders = await Order.countDocuments({
        'items.productId': id,
        status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] },
      });

      if (activeOrders > 0) {
        return errorResponse(res, 'Cannot delete product with active orders', 400);
      }

      // Soft delete - mark as archived instead of removing
      product.status = 'archived';
      product.lastModified = new Date();
      await product.save();

      return successResponse(res, 'Product deleted successfully');
    } catch (error) {
      console.error('Delete product error:', error);
      return errorResponse(res, 'Failed to delete product', 500);
    }
  }

  // Get products by seller (seller dashboard)
  async getMyProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        category,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query;

      const filter = { sellerId: req.user.id };

      if (status) {
        filter.status = status;
      }

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { 'inventory.sku': new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
        ];
      }

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(filter);

      // Get summary statistics
      const stats = await this.getSellerProductStats(req.user.id);

      return successResponse(res, 'Your products retrieved successfully', {
        products,
        stats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Get my products error:', error);
      return errorResponse(res, 'Failed to retrieve your products', 500);
    }
  }

  // Update product stock
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation = 'set' } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return errorResponse(res, 'Product not found', 404);
      }

      if (product.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied', 403);
      }

      await product.updateStock(quantity, operation);

      return successResponse(res, 'Stock updated successfully', {
        product: {
          id: product._id,
          name: product.name,
          stockQuantity: product.inventory.stockQuantity,
          stockStatus: product.inventory.stockStatus,
        },
      });
    } catch (error) {
      console.error('Update stock error:', error);
      return errorResponse(res, 'Failed to update stock', 500);
    }
  }

  // Get product categories
  async getCategories(req, res) {
    try {
      const categories = await Product.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgPrice: { $avg: '$pricing.basePrice' },
          }
        },
        { $sort: { count: -1 } }
      ]);

      return successResponse(res, 'Categories retrieved successfully', { categories });
    } catch (error) {
      console.error('Get categories error:', error);
      return errorResponse(res, 'Failed to retrieve categories', 500);
    }
  }

  // Get featured products
  async getFeaturedProducts(req, res) {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.getFeaturedProducts(parseInt(limit));

      return successResponse(res, 'Featured products retrieved successfully', { products });
    } catch (error) {
      console.error('Get featured products error:', error);
      return errorResponse(res, 'Failed to retrieve featured products', 500);
    }
  }

  // Get best sellers
  async getBestSellers(req, res) {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.getBestSellers(parseInt(limit));

      return successResponse(res, 'Best sellers retrieved successfully', { products });
    } catch (error) {
      console.error('Get best sellers error:', error);
      return errorResponse(res, 'Failed to retrieve best sellers', 500);
    }
  }

  // Get new arrivals
  async getNewArrivals(req, res) {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.getNewArrivals(parseInt(limit));

      return successResponse(res, 'New arrivals retrieved successfully', { products });
    } catch (error) {
      console.error('Get new arrivals error:', error);
      return errorResponse(res, 'Failed to retrieve new arrivals', 500);
    }
  }

  // Get products on sale
  async getProductsOnSale(req, res) {
    try {
      const { limit = 8 } = req.query;

      const products = await Product.getProductsOnSale(parseInt(limit));

      return successResponse(res, 'Products on sale retrieved successfully', { products });
    } catch (error) {
      console.error('Get products on sale error:', error);
      return errorResponse(res, 'Failed to retrieve products on sale', 500);
    }
  }

  // Search products
  async searchProducts(req, res) {
    try {
      const { q: searchTerm, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

      if (!searchTerm) {
        return errorResponse(res, 'Search term is required', 400);
      }

      const filters = { status: 'active', visibility: 'public' };

      if (category) {
        filters.category = category;
      }

      if (minPrice || maxPrice) {
        filters['pricing.basePrice'] = {};
        if (minPrice) filters['pricing.basePrice'].$gte = parseFloat(minPrice);
        if (maxPrice) filters['pricing.basePrice'].$lte = parseFloat(maxPrice);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.searchProducts(searchTerm, filters)
        .populate('sellerId', 'name seller.businessName')
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments({
        $text: { $search: searchTerm },
        ...filters,
      });

      return successResponse(res, 'Search completed successfully', {
        products,
        searchTerm,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Search products error:', error);
      return errorResponse(res, 'Search failed', 500);
    }
  }

  // Get seller dashboard statistics
  async getSellerDashboard(req, res) {
    try {
      const sellerId = req.user.id;

      const [
        productStats,
        orderStats,
        recentOrders,
        lowStockProducts,
        topProducts
      ] = await Promise.all([
        this.getSellerProductStats(sellerId),
        this.getSellerOrderStats(sellerId),
        Order.getRecentOrders(sellerId, 5),
        this.getLowStockProducts(sellerId),
        this.getTopSellingProducts(sellerId)
      ]);

      return successResponse(res, 'Dashboard data retrieved successfully', {
        productStats,
        orderStats,
        recentOrders,
        lowStockProducts,
        topProducts,
      });
    } catch (error) {
      console.error('Get seller dashboard error:', error);
      return errorResponse(res, 'Failed to retrieve dashboard data', 500);
    }
  }

  // Helper methods
  async getSellerProductStats(sellerId) {
    const stats = await Product.aggregate([
      { $match: { sellerId: mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$inventory.stockStatus', 'out_of_stock'] }, 1, 0] }
          },
          totalViews: { $sum: '$stats.viewCount' },
          totalSales: { $sum: '$stats.totalSales' },
          totalRevenue: { $sum: '$stats.totalRevenue' },
          averageRating: { $avg: '$reviews.averageRating' },
        }
      }
    ]);

    return stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      draftProducts: 0,
      outOfStockProducts: 0,
      totalViews: 0,
      totalSales: 0,
      totalRevenue: 0,
      averageRating: 0,
    };
  }

  async getSellerOrderStats(sellerId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await Order.getOrderStats(sellerId, thirtyDaysAgo, new Date());
    return stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      cancelledOrders: 0,
    };
  }

  async getLowStockProducts(sellerId) {
    return await Product.find({
      sellerId,
      status: 'active',
      'inventory.trackInventory': true,
      $expr: { $lte: ['$inventory.stockQuantity', '$inventory.lowStockThreshold'] }
    })
      .select('name inventory.stockQuantity inventory.lowStockThreshold images')
      .limit(10);
  }

  async getTopSellingProducts(sellerId) {
    return await Product.find({
      sellerId,
      status: 'active',
      'stats.totalSales': { $gt: 0 }
    })
      .select('name stats.totalSales stats.totalRevenue images pricing')
      .sort({ 'stats.totalSales': -1 })
      .limit(5);
  }
}

module.exports = new ProductController();
