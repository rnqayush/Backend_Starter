const express = require('express');
const router = express.Router();
const auth = require('../../auth/middleware/auth');
const {
  getDealerBySlug,
  saveCompleteData,
  getAllDealers,
  createDealer,
  updateDealer,
  deleteDealer,
  getDashboardStats
} = require('../controllers/dealerController');

// Public routes
router.get('/', getAllDealers);
router.get('/:slug', getDealerBySlug);

// Protected routes (require authentication)
router.use(auth);

// Dealer management routes
router.post('/', createDealer);
router.put('/:id', updateDealer);
router.delete('/:id', deleteDealer);

// Frontend-specific routes (matching Redux slice expectations)
router.post('/:slug/save', saveCompleteData);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
