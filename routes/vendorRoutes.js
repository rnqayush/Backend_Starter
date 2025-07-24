import express from 'express';
import { body } from 'express-validator';
import {
  registerVendor,
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorDashboard,
  getAllVendors,
  getVendorById,
} from '../controllers/vendorController.js';
import { protect } from '../middlewares/auth.js';
import { authorize, isAdmin } from '../middlewares/roleAuth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const registerVendorValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('businessName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('category')
    .isIn(['hotel', 'ecommerce', 'automobile', 'wedding'])
    .withMessage('Category must be hotel, ecommerce, automobile, or wedding'),
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
];

const loginVendorValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateVendorValidation = [
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
];

// Public routes
router.post('/register', registerVendorValidation, validateRequest, registerVendor);
router.post('/login', loginVendorValidation, validateRequest, loginVendor);
router.get('/:id', getVendorById);

// Protected routes
router.use(protect);

// Vendor-only routes
router.get('/profile', authorize('vendor'), getVendorProfile);
router.put('/profile', authorize('vendor'), updateVendorValidation, validateRequest, updateVendorProfile);
router.get('/dashboard', authorize('vendor'), getVendorDashboard);

// Admin-only routes
router.get('/all', isAdmin, getAllVendors);

export default router;

