const express = require('express');
const vehicleController = require('../../controllers/Automobile/vehicleController');
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', vehicleController.getAllVehicles);
router.get('/search', vehicleController.searchVehicles);
router.get('/featured', vehicleController.getFeaturedVehicles);
router.get('/recent', vehicleController.getRecentListings);
router.get('/makes', vehicleController.getPopularMakes);
router.get('/:id', vehicleController.getVehicleById);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate);

// Customer routes
router.post('/:id/inquiry', vehicleController.submitInquiry);

// Dealer routes
router.get('/dealer/my-vehicles', authMiddleware.authorize('auto_dealer', 'admin'), vehicleController.getMyVehicles);
router.get('/dealer/dashboard', authMiddleware.authorize('auto_dealer', 'admin'), vehicleController.getDealerDashboard);
router.post('/', authMiddleware.authorize('auto_dealer', 'admin'), vehicleController.createVehicle);
router.put('/:id', authMiddleware.authorize('auto_dealer', 'admin'), vehicleController.updateVehicle);
router.delete('/:id', authMiddleware.authorize('auto_dealer', 'admin'), vehicleController.deleteVehicle);
router.patch('/:id/status', authMiddleware.authorize('auto_dealer', 'admin'), vehicleController.updateVehicleStatus);

module.exports = router;
