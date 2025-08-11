const express = require('express');

const router = express.Router();

// TODO: Add ecommerce routes when implemented
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// router.use('/cart', cartRoutes);

module.exports = {
  router,
  name: 'ecommerce',
  version: '1.0.0',
  description: 'E-commerce module for product management, orders, and shopping cart'
};

