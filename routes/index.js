/**
 * Main Routes Index - Combine all routes
 */

import express from 'express';
import authRoutes from './auth.routes.js';
import vendorRoutes from './vendor.routes.js';
import hotelRoutes from './hotel.routes.js';
import productRoutes from './product.routes.js';
import bookingRoutes from './booking.routes.js';

const router = express.Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/vendors', vendorRoutes);
router.use('/hotels', hotelRoutes);
router.use('/products', productRoutes);
router.use('/bookings', bookingRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Multi-Vendor Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Welcome to Multi-Vendor Backend API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      vendors: '/api/vendors',
      hotels: '/api/hotels',
      products: '/api/products',
      bookings: '/api/bookings'
    },
    features: [
      'Multi-vendor support',
      'Hotel management',
      'Ecommerce products',
      'Wedding services',
      'Automobile listings',
      'Business services',
      'Booking system',
      'Payment integration',
      'Review system',
      'Analytics dashboard'
    ]
  });
});

export default router;
