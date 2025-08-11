const express = require('express');
const router = express.Router();
const auth = require('../../auth/middleware/auth');
const {
  getVendorBySlug,
  saveCompleteData,
  publishChanges,
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getDashboardStats
} = require('../controllers/vendorController');

// Public routes
router.get('/', getAllVendors);
router.get('/:slug', getVendorBySlug);

// Protected routes (require authentication)
router.use(auth);

// Vendor management routes
router.post('/', createVendor);
router.put('/:id', updateVendor);
router.delete('/:id', deleteVendor);

// Frontend-specific routes (matching Redux slice expectations)
router.post('/:slug/save', saveCompleteData);
router.post('/:slug/publish', publishChanges);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
