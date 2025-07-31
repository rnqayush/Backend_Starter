const express = require('express');
const { body, param, query } = require('express-validator');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * E-commerce Routes
 * Handles product, category, and order management
 */

// Product validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description.short')
    .notEmpty()
    .isLength({ max: 500 })
    .withMessage('Short description is required and cannot exceed 500 characters'),
  body('sku')
    .notEmpty()
    .withMessage('SKU is required'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('pricing.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('pricing.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
];

// Category validation rules
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID')
];

// Order validation rules
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('customerInfo.firstName')
    .notEmpty()
    .withMessage('First name is required'),
  body('customerInfo.lastName')
    .notEmpty()
    .withMessage('Last name is required'),
  body('customerInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('billingAddress.address1')
    .notEmpty()
    .withMessage('Billing address is required'),
  body('billingAddress.city')
    .notEmpty()
    .withMessage('Billing city is required'),
  body('payment.method')
    .isIn(['credit-card', 'debit-card', 'paypal', 'stripe', 'bank-transfer', 'cash-on-delivery'])
    .withMessage('Invalid payment method')
];

// =============================================================================
// PRODUCT ROUTES
// =============================================================================

/**
 * @route   GET /api/ecommerce/products
 * @desc    Get all products
 * @access  Public
 */
router.get('/products', productController.getProducts);

/**
 * @route   GET /api/ecommerce/products/search
 * @desc    Search products
 * @access  Public
 */
router.get('/products/search', productController.searchProducts);

/**
 * @route   GET /api/ecommerce/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/products/featured', productController.getFeaturedProducts);

/**
 * @route   GET /api/ecommerce/products/bestsellers
 * @desc    Get best selling products
 * @access  Public
 */
router.get('/products/bestsellers', productController.getBestSellers);

/**
 * @route   GET /api/ecommerce/products/category/:categoryId
 * @desc    Get products by category
 * @access  Public
 */
router.get('/products/category/:categoryId', [
  param('categoryId').isMongoId().withMessage('Invalid category ID')
], productController.getProductsByCategory);

/**
 * @route   GET /api/ecommerce/products/:identifier
 * @desc    Get product by ID or slug
 * @access  Public
 */
router.get('/products/:identifier', productController.getProduct);

/**
 * @route   POST /api/ecommerce/products
 * @desc    Create a new product
 * @access  Private
 */
router.post('/products', authenticate, createProductValidation, productController.createProduct);

/**
 * @route   PUT /api/ecommerce/products/:id
 * @desc    Update product
 * @access  Private
 */
router.put('/products/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid product ID'),
  ...updateProductValidation
], productController.updateProduct);

/**
 * @route   DELETE /api/ecommerce/products/:id
 * @desc    Delete product
 * @access  Private
 */
router.delete('/products/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid product ID')
], productController.deleteProduct);

/**
 * @route   PATCH /api/ecommerce/products/:id/inventory
 * @desc    Update product inventory
 * @access  Private
 */
router.patch('/products/:id/inventory', authenticate, [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt().withMessage('Quantity must be an integer')
], productController.updateInventory);

/**
 * @route   POST /api/ecommerce/products/:id/reviews
 * @desc    Add product review
 * @access  Private
 */
router.post('/products/:id/reviews', authenticate, [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], productController.addReview);

/**
 * @route   GET /api/ecommerce/products/:id/analytics
 * @desc    Get product analytics
 * @access  Private
 */
router.get('/products/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid product ID')
], productController.getProductAnalytics);

/**
 * @route   PATCH /api/ecommerce/products/bulk
 * @desc    Bulk update products
 * @access  Private
 */
router.patch('/products/bulk', authenticate, [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required')
], productController.bulkUpdateProducts);

// =============================================================================
// CATEGORY ROUTES
// =============================================================================

/**
 * @route   GET /api/ecommerce/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', categoryController.getCategories);

/**
 * @route   GET /api/ecommerce/categories/root
 * @desc    Get root categories
 * @access  Public
 */
router.get('/categories/root', categoryController.getRootCategories);

/**
 * @route   GET /api/ecommerce/categories/featured
 * @desc    Get featured categories
 * @access  Public
 */
router.get('/categories/featured', categoryController.getFeaturedCategories);

/**
 * @route   GET /api/ecommerce/categories/search
 * @desc    Search categories
 * @access  Public
 */
router.get('/categories/search', categoryController.searchCategories);

/**
 * @route   GET /api/ecommerce/categories/:identifier
 * @desc    Get category by ID or slug
 * @access  Public
 */
router.get('/categories/:identifier', categoryController.getCategory);

/**
 * @route   GET /api/ecommerce/categories/:id/breadcrumb
 * @desc    Get category breadcrumb
 * @access  Public
 */
router.get('/categories/:id/breadcrumb', [
  param('id').isMongoId().withMessage('Invalid category ID')
], categoryController.getCategoryBreadcrumb);

/**
 * @route   POST /api/ecommerce/categories
 * @desc    Create a new category
 * @access  Private
 */
router.post('/categories', authenticate, createCategoryValidation, categoryController.createCategory);

/**
 * @route   PUT /api/ecommerce/categories/:id
 * @desc    Update category
 * @access  Private
 */
router.put('/categories/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid category ID'),
  ...createCategoryValidation
], categoryController.updateCategory);

/**
 * @route   DELETE /api/ecommerce/categories/:id
 * @desc    Delete category
 * @access  Private
 */
router.delete('/categories/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid category ID')
], categoryController.deleteCategory);

/**
 * @route   PATCH /api/ecommerce/categories/:id/move
 * @desc    Move category to different parent
 * @access  Private
 */
router.patch('/categories/:id/move', authenticate, [
  param('id').isMongoId().withMessage('Invalid category ID'),
  body('newParentId').optional().isMongoId().withMessage('Invalid parent ID')
], categoryController.moveCategory);

/**
 * @route   GET /api/ecommerce/categories/:id/analytics
 * @desc    Get category analytics
 * @access  Private
 */
router.get('/categories/:id/analytics', authenticate, [
  param('id').isMongoId().withMessage('Invalid category ID')
], categoryController.getCategoryAnalytics);

/**
 * @route   PATCH /api/ecommerce/categories/reorder
 * @desc    Reorder categories
 * @access  Private
 */
router.patch('/categories/reorder', authenticate, [
  body('categoryOrders').isArray().withMessage('Category orders array is required')
], categoryController.reorderCategories);

/**
 * @route   PATCH /api/ecommerce/categories/bulk
 * @desc    Bulk update categories
 * @access  Private
 */
router.patch('/categories/bulk', authenticate, [
  body('categoryIds').isArray({ min: 1 }).withMessage('Category IDs array is required')
], categoryController.bulkUpdateCategories);

// =============================================================================
// ORDER ROUTES
// =============================================================================

/**
 * @route   GET /api/ecommerce/orders
 * @desc    Get all orders
 * @access  Private
 */
router.get('/orders', authenticate, orderController.getOrders);

/**
 * @route   GET /api/ecommerce/orders/search
 * @desc    Search orders
 * @access  Private
 */
router.get('/orders/search', authenticate, orderController.searchOrders);

/**
 * @route   GET /api/ecommerce/orders/stats
 * @desc    Get order statistics
 * @access  Private
 */
router.get('/orders/stats', authenticate, orderController.getOrderStats);

/**
 * @route   GET /api/ecommerce/orders/customer/:customerId
 * @desc    Get customer orders
 * @access  Private
 */
router.get('/orders/customer/:customerId', authenticate, [
  param('customerId').isMongoId().withMessage('Invalid customer ID')
], orderController.getCustomerOrders);

/**
 * @route   GET /api/ecommerce/orders/:identifier
 * @desc    Get order by ID or order number
 * @access  Private/Public (with email verification)
 */
router.get('/orders/:identifier', optionalAuth, orderController.getOrder);

/**
 * @route   POST /api/ecommerce/orders
 * @desc    Create a new order
 * @access  Private/Public (for guest orders)
 */
router.post('/orders', optionalAuth, createOrderValidation, orderController.createOrder);

/**
 * @route   PATCH /api/ecommerce/orders/:id/status
 * @desc    Update order status
 * @access  Private
 */
router.patch('/orders/:id/status', authenticate, [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status')
], orderController.updateOrderStatus);

/**
 * @route   PATCH /api/ecommerce/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private/Public (customer can cancel their own)
 */
router.patch('/orders/:id/cancel', optionalAuth, [
  param('id').isMongoId().withMessage('Invalid order ID')
], orderController.cancelOrder);

/**
 * @route   POST /api/ecommerce/orders/:id/refund
 * @desc    Process refund
 * @access  Private
 */
router.post('/orders/:id/refund', authenticate, [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('amount').isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
  body('reason').notEmpty().withMessage('Refund reason is required')
], orderController.processRefund);

/**
 * @route   POST /api/ecommerce/orders/:id/notes
 * @desc    Add order note
 * @access  Private
 */
router.post('/orders/:id/notes', authenticate, [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('note').notEmpty().withMessage('Note is required')
], orderController.addOrderNote);

/**
 * @route   PATCH /api/ecommerce/orders/:id/shipping
 * @desc    Update shipping information
 * @access  Private
 */
router.patch('/orders/:id/shipping', authenticate, [
  param('id').isMongoId().withMessage('Invalid order ID')
], orderController.updateShipping);

module.exports = router;

