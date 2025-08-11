const express = require('express');
const router = express.Router();
const auth = require('../../auth/middleware/auth');
const {
  addToWishlist,
  removeFromWishlist,
  getVendorWishlist,
  getAllUserWishlists,
  updateWishlist,
  clearWishlist,
  shareWishlist,
  getSharedWishlist,
  getPublicWishlists
} = require('../controllers/wishlistController');

// Public routes
router.get('/public', getPublicWishlists);
router.get('/shared/:shareToken', getSharedWishlist);

// Protected routes (require authentication)
router.use(auth);

// Wishlist management routes
router.get('/', getAllUserWishlists);
router.get('/vendor/:vendorSlug', getVendorWishlist);

// Item management routes (matching frontend expectations)
router.post('/add/:productId', addToWishlist);
router.delete('/remove/:productId', removeFromWishlist);

// Wishlist settings routes
router.put('/:wishlistId', updateWishlist);
router.delete('/:wishlistId/clear', clearWishlist);

// Sharing routes
router.post('/:wishlistId/share', shareWishlist);

module.exports = router;
