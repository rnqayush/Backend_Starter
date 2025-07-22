import express from 'express';

// Product Controllers
import {
  getProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
  addProductReview,
  getProductReviews,
  getSellerProducts,
  getProductAnalytics,
  updateProductInventory,
  bulkUpdateProducts,
  getFeaturedProducts,
  searchProducts
} from '../controllers/ecommerce/productController.js';

// Order Controllers
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  requestReturn,
  processRefund,
  getOrderAnalytics,
  exportOrders,
  getSellerDashboard
} from '../controllers/ecommerce/orderController.js';

// Cart Controllers
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  calculateShipping,
  getCartSummary,
  validateCart,
  getAbandonedCarts,
  cleanupExpiredCarts
} from '../controllers/ecommerce/cartController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/products', getProducts);
router.get('/products/featured', getFeaturedProducts);
router.get('/products/search', searchProducts);
router.get('/products/:id', getProduct);
router.get('/products/:id/reviews', getProductReviews);

// Protected routes
router.use(protect);

// Product management (Sellers only)
router.route('/products')
  .post(authorize('vendor'), createProduct);

router.route('/products/:id')
  .put(authorize('vendor'), updateProduct)
  .delete(authorize('vendor'), deleteProduct);

router.route('/products/:id/images')
  .post(authorize('vendor'), addProductImages);

router.delete('/products/:id/images/:imageId', authorize('vendor'), deleteProductImage);

router.post('/products/:id/reviews', addProductReview);
router.get('/products/:id/analytics', authorize('vendor'), getProductAnalytics);
router.put('/products/:id/inventory', authorize('vendor'), updateProductInventory);
router.put('/products/bulk', authorize('vendor'), bulkUpdateProducts);

// Seller routes
router.get('/seller/products', authorize('vendor'), getSellerProducts);
router.get('/seller/dashboard', authorize('vendor'), getSellerDashboard);

// Cart management
router.route('/cart')
  .get(getCart)
  .delete(clearCart);

router.route('/cart/items')
  .post(addToCart);

router.route('/cart/items/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

router.post('/cart/coupons', applyCoupon);
router.delete('/cart/coupons/:code', removeCoupon);
router.post('/cart/shipping', calculateShipping);
router.get('/cart/summary', getCartSummary);
router.post('/cart/validate', validateCart);

// Order management
router.route('/orders')
  .get(getOrders)
  .post(createOrder);

router.route('/orders/:id')
  .get(getOrder);

router.put('/orders/:id/status', authorize('vendor'), updateOrderStatus);
router.put('/orders/:id/payment', authorize('vendor'), updatePaymentStatus);
router.put('/orders/:id/cancel', cancelOrder);
router.post('/orders/:id/return', requestReturn);
router.post('/orders/:id/refund', authorize('vendor'), processRefund);

// Analytics and reporting
router.get('/orders/analytics', authorize('vendor'), getOrderAnalytics);
router.get('/orders/export', authorize('vendor'), exportOrders);

// Admin routes
router.get('/carts/abandoned', authorize('admin'), getAbandonedCarts);
router.delete('/carts/cleanup', authorize('admin'), cleanupExpiredCarts);

// Category and brand management
router.get('/categories', async (req, res) => {
  const Product = (await import('../models/ecommerce/Product.js')).default;
  
  const categories = await Product.aggregate([
    { $match: { status: 'published' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        subcategories: { $addToSet: '$subcategory' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: categories,
    message: 'Categories retrieved successfully'
  });
});

router.get('/brands', async (req, res) => {
  const Product = (await import('../models/ecommerce/Product.js')).default;
  
  const brands = await Product.aggregate([
    { $match: { status: 'published', brand: { $ne: null, $ne: '' } } },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 },
        categories: { $addToSet: '$category' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.json({
    success: true,
    data: brands,
    message: 'Brands retrieved successfully'
  });
});

// Wishlist management
router.get('/wishlist', async (req, res) => {
  // TODO: Implement wishlist functionality
  res.json({
    success: true,
    data: [],
    message: 'Wishlist functionality coming soon'
  });
});

router.post('/wishlist/:productId', async (req, res) => {
  // TODO: Add to wishlist
  res.json({
    success: true,
    message: 'Product added to wishlist'
  });
});

router.delete('/wishlist/:productId', async (req, res) => {
  // TODO: Remove from wishlist
  res.json({
    success: true,
    message: 'Product removed from wishlist'
  });
});

// Inventory management for sellers
router.get('/inventory', authorize('vendor'), async (req, res) => {
  const Product = (await import('../models/ecommerce/Product.js')).default;
  
  const products = await Product.find({ seller: req.user.id })
    .select('name sku inventory status analytics createdAt')
    .sort({ createdAt: -1 });

  const lowStockProducts = products.filter(p => p.isLowStock);
  const outOfStockProducts = products.filter(p => !p.isInStock);

  res.json({
    success: true,
    data: {
      products,
      summary: {
        total: products.length,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length
      }
    },
    message: 'Inventory retrieved successfully'
  });
});

router.put('/inventory/:id/stock', authorize('vendor'), async (req, res) => {
  const Product = (await import('../models/ecommerce/Product.js')).default;
  const { quantity, operation = 'set' } = req.body;
  
  const product = await Product.findOne({
    _id: req.params.id,
    seller: req.user.id
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (operation === 'set') {
    product.inventory.quantity = quantity;
  } else if (operation === 'add') {
    product.inventory.quantity += quantity;
  } else if (operation === 'subtract') {
    product.inventory.quantity = Math.max(0, product.inventory.quantity - quantity);
  }

  await product.save();

  res.json({
    success: true,
    data: {
      product: {
        id: product._id,
        name: product.name,
        inventory: product.inventory,
        isInStock: product.isInStock,
        isLowStock: product.isLowStock
      }
    },
    message: 'Inventory updated successfully'
  });
});

// Sales analytics for sellers
router.get('/analytics/sales', authorize('vendor'), async (req, res) => {
  const Order = (await import('../models/ecommerce/Order.js')).default;
  const { period = '30d' } = req.query;
  
  let dateFilter = {};
  const now = new Date();
  
  switch (period) {
    case '7d':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case '30d':
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      break;
    case '90d':
      dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
      break;
    case '1y':
      dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
      break;
  }

  const analytics = await Order.aggregate([
    { 
      $match: { 
        'items.seller': mongoose.Types.ObjectId(req.user.id),
        placedAt: dateFilter
      } 
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: {
          year: { $year: '$placedAt' },
          month: { $month: '$placedAt' },
          day: { $dayOfMonth: '$placedAt' }
        },
        revenue: { $sum: '$items.subtotal' },
        orders: { $sum: 1 },
        items: { $sum: '$items.quantity' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      analytics,
      period
    },
    message: 'Sales analytics retrieved successfully'
  });
});

export default router;

