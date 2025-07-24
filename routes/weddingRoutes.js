import express from 'express';
import { body } from 'express-validator';
import {
  createWeddingService,
  getAllWeddingServices,
  getWeddingServiceById,
  updateWeddingService,
  deleteWeddingService,
  getVendorWeddingServices,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  addOffer,
  updateOffer,
  deleteOffer,
} from '../controllers/weddingController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roleAuth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const createWeddingServiceValidation = [
  body('serviceType')
    .isIn(['venue', 'catering', 'photography', 'videography', 'decoration', 'music_dj', 'flowers', 'makeup', 'mehendi', 'transportation', 'invitation', 'planning', 'other'])
    .withMessage('Invalid service type'),
  body('serviceName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Service name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
];

// Public routes
router.get('/', getAllWeddingServices);
router.get('/:id', getWeddingServiceById);

// Protected routes
router.use(protect);

// Vendor routes
router.post('/', authorize('vendor'), createWeddingServiceValidation, validateRequest, createWeddingService);
router.put('/:id', authorize('vendor'), updateWeddingService);
router.delete('/:id', authorize('vendor'), deleteWeddingService);
router.get('/vendor/my-services', authorize('vendor'), getVendorWeddingServices);

// Testimonials management
router.post('/:id/testimonials', authorize('vendor'), addTestimonial);
router.put('/:id/testimonials/:testimonialId', authorize('vendor'), updateTestimonial);
router.delete('/:id/testimonials/:testimonialId', authorize('vendor'), deleteTestimonial);

// FAQ management
router.post('/:id/faqs', authorize('vendor'), addFAQ);
router.put('/:id/faqs/:faqId', authorize('vendor'), updateFAQ);
router.delete('/:id/faqs/:faqId', authorize('vendor'), deleteFAQ);

// Offers management
router.post('/:id/offers', authorize('vendor'), addOffer);
router.put('/:id/offers/:offerId', authorize('vendor'), updateOffer);
router.delete('/:id/offers/:offerId', authorize('vendor'), deleteOffer);

export default router;
