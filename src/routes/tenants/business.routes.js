import express from 'express';
import { protect, authorize } from '../../middlewares/auth.js';
import { checkTenantAccess } from '../../middlewares/rbac.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Placeholder routes for business module
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Business API working',
    module: 'business'
  });
});

// TODO: Add actual business routes
// router.use('/services', serviceRoutes);
// router.use('/portfolio', portfolioRoutes);
// router.use('/testimonials', testimonialRoutes);
// router.use('/contacts', contactRoutes);

export default router;

