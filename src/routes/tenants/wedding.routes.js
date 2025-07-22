import express from 'express';
import { protect, authorize } from '../../middlewares/auth.js';
import { checkTenantAccess } from '../../middlewares/rbac.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Placeholder routes for wedding module
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Wedding API working',
    module: 'wedding'
  });
});

// TODO: Add actual wedding routes
// router.use('/venues', venueRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/packages', packageRoutes);
// router.use('/vendors', vendorRoutes);

export default router;

