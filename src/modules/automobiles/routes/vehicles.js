const express = require('express');
const router = express.Router();
const auth = require('../../auth/middleware/auth');
const {
  getVehicleById,
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehiclesByDealer,
  recordInquiry,
  getVehicleStats
} = require('../controllers/vehicleController');

// Public routes
router.get('/', getAllVehicles);
router.get('/:vehicleId', getVehicleById);
router.get('/stats/:dealerSlug', getVehicleStats);

// Public inquiry route (can be used by non-authenticated users)
router.post('/:vehicleId/inquiry', recordInquiry);

// Protected routes (require authentication)
router.use(auth);

// Vehicle management routes
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Dealer-specific vehicle routes
router.get('/dealer/my-vehicles', getVehiclesByDealer);

module.exports = router;
