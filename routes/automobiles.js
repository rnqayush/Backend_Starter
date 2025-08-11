const express = require('express');
const router = express.Router();
const {
  getVehiclesByBusiness,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getVehicleAnalytics,
  submitInquiry,
} = require('../controllers/automobilesController');
const { authenticate } = require('../middleware/auth');

// @route   GET /api/automobiles/search
router.get('/search', searchVehicles);

// @route   GET /api/automobiles/business/:businessId
router.get('/business/:businessId', getVehiclesByBusiness);

// @route   GET /api/automobiles/business/:businessId/analytics
router.get(
  '/business/:businessId/analytics',
  authenticate,
  getVehicleAnalytics
);

// @route   GET /api/automobiles/:id
router.get('/:id', getVehicle);

// @route   POST /api/automobiles
router.post('/', authenticate, createVehicle);

// @route   PUT /api/automobiles/:id
router.put('/:id', authenticate, updateVehicle);

// @route   DELETE /api/automobiles/:id
router.delete('/:id', authenticate, deleteVehicle);

// @route   POST /api/automobiles/:id/inquiry
router.post('/:id/inquiry', submitInquiry);

module.exports = router;
