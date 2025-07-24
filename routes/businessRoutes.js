import express from 'express';
import {
  createBusiness,
  getBusinessByVendor,
  getMyBusiness,
  updateBusiness,
  updateBusinessSection,
  addService,
  updateService,
  deleteService,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  addGalleryItem,
  deleteGalleryItem,
  togglePublishBusiness,
  deleteBusiness,
  getAllBusinesses,
} from '../controllers/businessController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBusinesses);
router.get('/vendor/:vendorId', getBusinessByVendor);

// Protected routes (require authentication)
router.use(protect);

// Business CRUD
router.post('/', createBusiness);
router.get('/my-business', getMyBusiness);
router.put('/:id', updateBusiness);
router.delete('/:id', deleteBusiness);

// Section-specific updates
router.put('/:id/section/:sectionName', updateBusinessSection);

// Services management
router.post('/:id/services', addService);
router.put('/:id/services/:serviceId', updateService);
router.delete('/:id/services/:serviceId', deleteService);

// Team management
router.post('/:id/team', addTeamMember);
router.put('/:id/team/:memberId', updateTeamMember);
router.delete('/:id/team/:memberId', deleteTeamMember);

// Gallery management
router.post('/:id/gallery', addGalleryItem);
router.delete('/:id/gallery/:type/:itemId', deleteGalleryItem);

// Publish/Unpublish
router.put('/:id/publish', togglePublishBusiness);

export default router;
