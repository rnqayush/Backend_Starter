import express from 'express';
import {
  getVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor,
  updateBasicInfo,
  addMedia,
  updateMedia,
  deleteMedia,
  addService,
  updateService,
  deleteService,
  addPackage,
  updatePackage,
  deletePackage,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  getOffers,
  addOffer,
  updateOffer,
  deleteOffer,
  getVendorDashboard
} from '../controllers/wedding/vendorController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes - Wedding Vendor Directory
router.get('/vendors', getVendors);
router.get('/vendors/search', getVendors); // Same as getVendors with filters
router.get('/vendors/:id', getVendor);
router.get('/vendors/:id/faqs', getFAQs);
router.get('/vendors/:id/offers', getOffers);

// Protected routes
router.use(protect);

// ===== VENDOR MANAGEMENT =====
router.route('/vendors')
  .post(authorize('vendor'), createVendor);

router.route('/vendors/:id')
  .put(authorize('vendor'), updateVendor)
  .delete(authorize('vendor'), deleteVendor);

// ===== BASIC INFORMATION CRUD =====
router.put('/vendors/:id/basic-info', authorize('vendor'), updateBasicInfo);

// ===== PHOTO AND MEDIA CRUD =====
router.route('/vendors/:id/media')
  .post(authorize('vendor'), addMedia);

router.route('/vendors/:id/media/:mediaId')
  .put(authorize('vendor'), updateMedia)
  .delete(authorize('vendor'), deleteMedia);

// ===== SERVICES OFFERED CRUD =====
router.route('/vendors/:id/services')
  .post(authorize('vendor'), addService);

router.route('/vendors/:id/services/:serviceId')
  .put(authorize('vendor'), updateService)
  .delete(authorize('vendor'), deleteService);

// ===== PACKAGES AND PRICING CRUD =====
router.route('/vendors/:id/packages')
  .post(authorize('vendor'), addPackage);

router.route('/vendors/:id/packages/:packageId')
  .put(authorize('vendor'), updatePackage)
  .delete(authorize('vendor'), deletePackage);

// ===== TESTIMONIALS CRUD =====
router.route('/vendors/:id/testimonials')
  .post(authorize('vendor'), addTestimonial);

router.route('/vendors/:id/testimonials/:testimonialId')
  .put(authorize('vendor'), updateTestimonial)
  .delete(authorize('vendor'), deleteTestimonial);

// ===== FAQ CRUD =====
router.route('/vendors/:id/faqs')
  .post(authorize('vendor'), addFAQ);

router.route('/vendors/:id/faqs/:faqId')
  .put(authorize('vendor'), updateFAQ)
  .delete(authorize('vendor'), deleteFAQ);

// ===== OFFERS CRUD =====
router.route('/vendors/:id/offers')
  .post(authorize('vendor'), addOffer);

router.route('/vendors/:id/offers/:offerId')
  .put(authorize('vendor'), updateOffer)
  .delete(authorize('vendor'), deleteOffer);

// ===== VENDOR DASHBOARD =====
router.get('/vendor/dashboard', authorize('vendor'), getVendorDashboard);

// Booking management (placeholder for future implementation)
router.get('/bookings', async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Wedding booking management functionality coming soon'
  });
});

router.post('/bookings', async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Wedding booking creation functionality coming soon'
  });
});

export default router;
