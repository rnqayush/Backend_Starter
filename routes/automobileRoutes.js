import express from 'express';
import { body } from 'express-validator';
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVendorVehicles,
} from '../controllers/automobileController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roleAuth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const createVehicleValidation = [
  body('type')
    .isIn(['car', 'motorcycle', 'truck', 'suv', 'van', 'bus', 'other'])
    .withMessage('Invalid vehicle type'),
  body('listingType')
    .isIn(['sale', 'rent', 'lease'])
    .withMessage('Invalid listing type'),
  body('make')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Make must be between 2 and 50 characters'),
  body('model')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Model must be between 2 and 50 characters'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid year'),
  body('condition')
    .isIn(['new', 'used', 'certified_pre_owned', 'salvage'])
    .withMessage('Invalid condition'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
];

// Public routes
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);

// Protected routes
router.use(protect);

// Vendor routes
router.post('/', authorize('vendor'), createVehicleValidation, validateRequest, createVehicle);
router.put('/:id', authorize('vendor'), updateVehicle);
router.delete('/:id', authorize('vendor'), deleteVehicle);
router.get('/vendor/my-vehicles', authorize('vendor'), getVendorVehicles);

export default router;

