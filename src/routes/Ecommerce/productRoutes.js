const express = require('express');
const productController = require('../../controllers/Ecommerce/productController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/featured', productController.getFeaturedProducts);
router.get('/best-sellers', productController.getBestSellers);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/on-sale', productController.getProductsOnSale);
router.get('/:id', productController.getProductById);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

// Seller routes
router.get('/seller/my-products', authMiddleware.authorize('seller', 'admin'), productController.getMyProducts);
router.get('/seller/dashboard', authMiddleware.authorize('seller', 'admin'), productController.getSellerDashboard);
router.post('/', authMiddleware.authorize('seller', 'admin'), productController.createProduct);
router.put('/:id', authMiddleware.authorize('seller', 'admin'), productController.updateProduct);
router.delete('/:id', authMiddleware.authorize('seller', 'admin'), productController.deleteProduct);
router.patch('/:id/stock', authMiddleware.authorize('seller', 'admin'), productController.updateStock);

module.exports = router;
