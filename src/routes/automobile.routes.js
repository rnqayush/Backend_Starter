import express from 'express';
import {
  getVehicles,
  createVehicle,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  addVehicleImages,
  deleteVehicleImage,
  getVehicleAnalytics,
  calculateEMI,
  compareVehicles,
  getPopularVehicles,
  searchVehicles
} from '../controllers/automobile/vehicleController.js';

import {
  createEnquiry,
  getEnquiries,
  getEnquiry,
  updateEnquiry,
  addCommunication,
  scheduleTestDrive,
  getOverdueEnquiries,
  getEnquiryStatistics,
  exportEnquiries
} from '../controllers/automobile/enquiryController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/vehicles', getVehicles);
router.get('/vehicles/popular', getPopularVehicles);
router.get('/vehicles/search', searchVehicles);
router.get('/vehicles/:id', getVehicle);
router.post('/vehicles/compare', compareVehicles);
router.post('/vehicles/:id/calculate-emi', calculateEMI);

// Protected routes
router.use(protect);

// Vehicle management (Dealers only)
router.route('/vehicles')
  .post(authorize('vendor'), createVehicle);

router.route('/vehicles/:id')
  .put(authorize('vendor'), updateVehicle)
  .delete(authorize('vendor'), deleteVehicle);

router.route('/vehicles/:id/images')
  .post(authorize('vendor'), addVehicleImages);

router.delete('/vehicles/:id/images/:imageId', authorize('vendor'), deleteVehicleImage);

router.get('/vehicles/:id/analytics', authorize('vendor'), getVehicleAnalytics);

// Enquiry management
router.route('/enquiries')
  .get(getEnquiries)
  .post(createEnquiry);

router.route('/enquiries/:id')
  .get(getEnquiry)
  .put(authorize('vendor'), updateEnquiry);

router.post('/enquiries/:id/respond', authorize('vendor'), addCommunication);
router.post('/enquiries/:id/schedule-test-drive', authorize('vendor'), scheduleTestDrive);

// Dealer dashboard routes
router.get('/enquiries/overdue', authorize('vendor'), getOverdueEnquiries);
router.get('/enquiries/statistics', authorize('vendor'), getEnquiryStatistics);
router.get('/enquiries/export', authorize('vendor'), exportEnquiries);

// Test drive management
router.get('/test-drives', authorize('vendor'), async (req, res) => {
  // Get all scheduled test drives for dealer
  const testDrives = await Enquiry.find({
    dealer: req.user.id,
    'testDrive.scheduled': true,
    'testDrive.completed': false
  })
    .populate('vehicle', 'make model year')
    .populate('customer', 'name phone email')
    .sort({ 'testDrive.scheduledDate': 1 });

  res.json({
    success: true,
    data: testDrives,
    message: 'Test drives retrieved successfully'
  });
});

router.put('/test-drives/:id', authorize('vendor'), async (req, res) => {
  const { completed, feedback, rating } = req.body;
  
  const enquiry = await Enquiry.findById(req.params.id);
  
  if (!enquiry || enquiry.dealer.toString() !== req.user.id) {
    return res.status(404).json({
      success: false,
      message: 'Test drive not found'
    });
  }

  if (completed) {
    enquiry.testDrive.completed = true;
    enquiry.testDrive.completedDate = new Date();
    enquiry.testDrive.feedback = feedback;
    enquiry.testDrive.rating = rating;
    
    // Update status if not already updated
    if (enquiry.status === 'test-drive-scheduled') {
      enquiry.status = 'negotiating';
    }
  }

  await enquiry.save();

  res.json({
    success: true,
    data: enquiry,
    message: 'Test drive updated successfully'
  });
});

// Dealer analytics
router.get('/analytics/dashboard', authorize('vendor'), async (req, res) => {
  const dealerId = req.user.id;
  
  // Get vehicle statistics
  const totalVehicles = await Vehicle.countDocuments({ dealer: dealerId });
  const publishedVehicles = await Vehicle.countDocuments({ 
    dealer: dealerId, 
    status: 'published' 
  });
  
  // Get enquiry statistics
  const totalEnquiries = await Enquiry.countDocuments({ dealer: dealerId });
  const newEnquiries = await Enquiry.countDocuments({ 
    dealer: dealerId, 
    status: 'new' 
  });
  
  // Get recent activity
  const recentEnquiries = await Enquiry.find({ dealer: dealerId })
    .populate('vehicle', 'make model year')
    .populate('customer', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get top performing vehicles
  const topVehicles = await Vehicle.find({ dealer: dealerId })
    .sort({ 'analytics.views': -1, 'analytics.enquiries': -1 })
    .limit(5)
    .select('make model year analytics');

  res.json({
    success: true,
    data: {
      summary: {
        totalVehicles,
        publishedVehicles,
        totalEnquiries,
        newEnquiries
      },
      recentEnquiries,
      topVehicles
    },
    message: 'Dashboard analytics retrieved successfully'
  });
});

// Vehicle inventory management
router.get('/inventory', authorize('vendor'), async (req, res) => {
  const vehicles = await Vehicle.find({ dealer: req.user.id })
    .sort({ createdAt: -1 })
    .select('make model year price availability status analytics createdAt');

  res.json({
    success: true,
    data: vehicles,
    message: 'Inventory retrieved successfully'
  });
});

router.put('/inventory/:id/availability', authorize('vendor'), async (req, res) => {
  const { status, quantity, expectedDelivery } = req.body;
  
  const vehicle = await Vehicle.findOne({
    _id: req.params.id,
    dealer: req.user.id
  });

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle not found'
    });
  }

  if (status) vehicle.availability.status = status;
  if (quantity !== undefined) vehicle.availability.quantity = quantity;
  if (expectedDelivery) vehicle.availability.expectedDelivery = expectedDelivery;

  await vehicle.save();

  res.json({
    success: true,
    data: vehicle,
    message: 'Vehicle availability updated successfully'
  });
});

export default router;

