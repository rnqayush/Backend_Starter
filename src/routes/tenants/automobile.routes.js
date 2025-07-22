import express from 'express';
import { protect, authorize } from '../../middlewares/auth.js';
import { checkTenantAccess } from '../../middlewares/rbac.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Placeholder routes for automobile module
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Automobile API working',
    module: 'automobile'
  });
});

// TODO: Add actual automobile routes
// router.use('/vehicles', vehicleRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/services', serviceRoutes);
// router.use('/dealers', dealerRoutes);

export default router;

