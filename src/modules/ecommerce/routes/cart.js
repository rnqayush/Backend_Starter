const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  getCartSummary
} = require('../controllers/cartController');
const { auth } = require('../../../shared/middleware/auth');

const router = express.Router();

// Cart routes (support both authenticated and guest users)
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/add', addToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/clear', clearCart);

// Protected routes (require authentication)
router.post('/merge', auth, mergeCart);

module.exports = router;

