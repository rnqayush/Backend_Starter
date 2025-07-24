import express from 'express';
import { body } from 'express-validator';
import {
  adminLogin,
  getAdminDashboard,
  getAllVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  deleteVendor,
  getAllUsers,
} from '../controllers/adminController.js';
import { protect } from '../middlewares/auth.js';
import { isAdmin } from '../middlewares/roleAuth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const rejectVendorValidation = [
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
];

// Public routes
router.post('/login', loginValidation, validateRequest, adminLogin);

// Protected admin routes
router.use(protect);
router.use(isAdmin);

// Dashboard and stats
router.get('/dashboard', getAdminDashboard);

// Vendor management
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendorValidation, validateRequest, rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);
router.delete('/vendors/:id', deleteVendor);

// User management
router.get('/users', getAllUsers);

export default router;

