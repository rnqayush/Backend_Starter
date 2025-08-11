const express = require('express');
const {
  getDashboardStats,
  getSellerProfile,
  updateSellerProfile,
  getSalesReport,
  getInventoryAlerts
} = require('../controllers/sellerController');
const { auth } = require('../../../shared/middleware/auth');

const router = express.Router();

// All seller routes require authentication
router.use(auth);

// Seller dashboard and profile routes
router.get('/dashboard', getDashboardStats);
router.get('/profile', getSellerProfile);
router.put('/profile', updateSellerProfile);

// Seller analytics and reports
router.get('/sales-report', getSalesReport);
router.get('/inventory-alerts', getInventoryAlerts);

module.exports = router;

