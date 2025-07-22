import express from 'express';
import { protect, authorize } from '../../middlewares/auth.js';
import { checkTenantAccess } from '../../middlewares/rbac.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Placeholder routes for hotel module
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Hotel API working',
    module: 'hotel'
  });
});

// TODO: Add actual hotel routes
// router.use('/rooms', roomRoutes);
// router.use('/bookings', bookingRoutes);
// router.use('/amenities', amenityRoutes);
// router.use('/guests', guestRoutes);

export default router;

