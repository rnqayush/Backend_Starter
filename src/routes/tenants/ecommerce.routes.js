import express from 'express';
import { protect, authorize } from '../../middlewares/auth.js';
import { checkTenantAccess } from '../../middlewares/rbac.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Placeholder routes for ecommerce module
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Ecommerce API working',
    module: 'ecommerce'
  });
});

// TODO: Add actual ecommerce routes
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/inventory', inventoryRoutes);

export default router;

