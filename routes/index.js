const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const vendorRoutes = require('./vendor.routes');
const productRoutes = require('./product.routes');

// API Routes
router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/products', productRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Vendor Backend API',
    version: '1.0.0',
    documentation: '/api/docs', // Future documentation endpoint
    endpoints: {
      auth: '/api/auth',
      vendors: '/api/vendors',
      products: '/api/products',
      health: '/api/health'
    }
  });
});

module.exports = router;
