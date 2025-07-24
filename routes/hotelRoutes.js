import express from 'express';
import { body } from 'express-validator';
import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getVendorHotels,
  getHotelStats,
} from '../controllers/hotelController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roleAuth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const createHotelValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('address.zipCode').notEmpty().withMessage('Zip code is required'),
  body('contactInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('contactInfo.email').isEmail().withMessage('Valid email is required'),
  body('starRating').isInt({ min: 1, max: 5 }).withMessage('Star rating must be between 1 and 5'),
  body('pricing.basePrice').isFloat({ min: 0 }).withMessage('Base price must be a positive number'),
];

// Public routes
router.get('/', getAllHotels);
router.get('/:id', getHotelById);

// Protected routes
router.use(protect);

// Vendor routes
router.post('/', authorize('vendor'), createHotelValidation, validateRequest, createHotel);
router.put('/:id', authorize('vendor'), updateHotel);
router.delete('/:id', authorize('vendor'), deleteHotel);
router.get('/vendor/my-hotels', authorize('vendor'), getVendorHotels);
router.get('/vendor/stats', authorize('vendor'), getHotelStats);

export default router;

