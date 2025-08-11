const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  updateInventory,
  searchProducts
} = require('../controllers/productController');
const { auth } = require('../../../shared/middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Protected routes (require authentication)
router.post('/', auth, createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);
router.get('/seller/my-products', auth, getSellerProducts);
router.patch('/:id/inventory', auth, updateInventory);

module.exports = router;

