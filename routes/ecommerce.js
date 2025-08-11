const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ecommerceController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  validateProduct,
  validateReview,
  validateObjectId,
  validatePagination,
} = require('../middleware/validation');

// @route   GET /api/ecommerce/business/:businessId/products
router.get(
  '/business/:businessId/products',
  validateObjectId('businessId'),
  validatePagination,
  getProductsByBusiness
);

// @route   GET /api/ecommerce/business/:businessId/categories
router.get(
  '/business/:businessId/categories',
  validateObjectId('businessId'),
  getCategoriesByBusiness
);

// @route   GET /api/ecommerce/search
router.get('/search', searchProducts);

// @route   GET /api/ecommerce/business/:businessId/analytics
router.get(
  '/business/:businessId/analytics',
  authenticate,
  validateObjectId('businessId'),
  getEcommerceAnalytics
);

// @route   GET /api/ecommerce/products/:id
router.get('/products/:id', validateObjectId('id'), optionalAuth, getProduct);

// @route   POST /api/ecommerce/categories
router.post('/categories', authenticate, createCategory);

// @route   PUT /api/ecommerce/categories/:id
router.put(
  '/categories/:id',
  authenticate,
  validateObjectId('id'),
  updateCategory
);

// @route   POST /api/ecommerce/products
router.post('/products', authenticate, validateProduct, createProduct);

// @route   PUT /api/ecommerce/products/:id
router.put(
  '/products/:id',
  authenticate,
  validateObjectId('id'),
  updateProduct
);

// @route   DELETE /api/ecommerce/products/:id
router.delete(
  '/products/:id',
  authenticate,
  validateObjectId('id'),
  deleteProduct
);

// @route   POST /api/ecommerce/products/:id/reviews
router.post(
  '/products/:id/reviews',
  authenticate,
  validateObjectId('id'),
  validateReview,
  addProductReview
);

module.exports = router;
