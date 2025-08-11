const express = require('express');
const router = express.Router();
const {
  getBusinessBySlug,
  createBusiness,
  updateBusiness,
  getMyBusinesses,
  deleteBusiness,
  getBusinessAnalytics,
} = require('../controllers/businessController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validateBusiness,
  validateObjectId,
} = require('../middleware/validation');

// @route   GET /api/business/:slug
router.get('/:slug', getBusinessBySlug);

// @route   POST /api/business
router.post('/', authenticate, validateBusiness, createBusiness);

// @route   GET /api/business/my-businesses
router.get('/my/businesses', authenticate, getMyBusinesses);

// @route   PUT /api/business/:id
router.put('/:id', authenticate, validateObjectId('id'), updateBusiness);

// @route   DELETE /api/business/:id
router.delete('/:id', authenticate, validateObjectId('id'), deleteBusiness);

// @route   GET /api/business/:id/analytics
router.get(
  '/:id/analytics',
  authenticate,
  validateObjectId('id'),
  getBusinessAnalytics
);

module.exports = router;
