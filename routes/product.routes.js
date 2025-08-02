/**
 * Product Routes
 */

import express from 'express';
import {
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
} from '../controllers/product.controller.js';
import { 
  verifyToken, 
  requireVendor,
  optionalAuth 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/sale', getProductsOnSale);
router.get('/search', searchProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/vendor/:vendorId', getProductsByVendor);
router.get('/:id', optionalAuth, getProduct);

// Protected routes - require authentication
router.use(verifyToken);

// Product management (vendor only)
router.post('/', requireVendor, createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Stock management
router.patch('/:id/stock', updateStock);

export default router;
