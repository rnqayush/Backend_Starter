const express = require('express');

const router = express.Router();

// Import routes
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const categoryRoutes = require('./routes/categories');
const sellerRoutes = require('./routes/seller');

// Use routes
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/categories', categoryRoutes);
router.use('/seller', sellerRoutes);

// Module info route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce module is working!',
    module: 'ecommerce',
    version: '1.0.0',
    endpoints: {
      products: '/api/ecommerce/products',
      cart: '/api/ecommerce/cart',
      orders: '/api/ecommerce/orders',
      categories: '/api/ecommerce/categories',
      seller: '/api/ecommerce/seller'
    }
  });
});

module.exports = {
  router,
  name: 'ecommerce',
  version: '1.0.0',
  description: 'E-commerce module for product management, orders, and shopping cart'
};
