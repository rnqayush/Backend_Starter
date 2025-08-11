const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  getSalesAnalytics
} = require('../controllers/orderController');
const { auth } = require('../../../shared/middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(auth);

// Customer order routes
router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);

// Seller order routes
router.get('/seller/orders', getSellerOrders);
router.get('/seller/analytics', getSalesAnalytics);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;

