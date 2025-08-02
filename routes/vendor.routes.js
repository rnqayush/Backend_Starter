/**
 * Vendor Routes
 */

import express from 'express';
import {
  createVendor,
  getAllVendors,
  getVendor,
  updateVendor,
  deleteVendor,
  getVendorDashboard,
  updateVendorStatus,
  getVendorsByCategory,
  getFeaturedVendors,
  searchVendors
} from '../controllers/vendor.controller.js';
import { 
  verifyToken, 
  requireRole, 
  requireVendor, 
  requireAdmin,
  optionalAuth 
} from '../middleware/auth.middleware.js';
import { 
  validateVendor, 
  validateVendorUpdateData 
} from '../validators/vendor.validator.js';

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getAllVendors);
router.get('/featured', getFeaturedVendors);
router.get('/search', searchVendors);
router.get('/category/:category', getVendorsByCategory);
router.get('/:id', optionalAuth, getVendor);

// Protected routes - require authentication
router.use(verifyToken);

// Vendor creation and management
router.post('/', validateVendor, createVendor);
router.get('/dashboard/stats', requireVendor, getVendorDashboard);
router.put('/:id', validateVendorUpdateData, updateVendor);
router.delete('/:id', updateVendor); // Soft delete

// Admin only routes
router.patch('/:id/status', requireAdmin, updateVendorStatus);

export default router;
