import express from 'express';
import {
  createFreelance,
  getFreelanceByVendor,
  getMyFreelance,
  updateFreelance,
  updateFreelanceSection,
  addSkillCategory,
  updateSkillCategory,
  addWorkExperience,
  updateWorkExperience,
  addPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  addTestimonial,
  updateTestimonial,
  updateAvailability,
  togglePublishFreelance,
  deleteFreelance,
  getAllFreelancers,
} from '../controllers/freelanceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllFreelancers);
router.get('/vendor/:vendorId', getFreelanceByVendor);

// Protected routes (require authentication)
router.use(protect);

// Freelance CRUD
router.post('/', createFreelance);
router.get('/my-portfolio', getMyFreelance);
router.put('/:id', updateFreelance);
router.delete('/:id', deleteFreelance);

// Section-specific updates
router.put('/:id/section/:sectionName', updateFreelanceSection);

// Skills management
router.post('/:id/skills/categories', addSkillCategory);
router.put('/:id/skills/categories/:categoryId', updateSkillCategory);

// Experience management
router.post('/:id/experience/work', addWorkExperience);
router.put('/:id/experience/work/:experienceId', updateWorkExperience);

// Portfolio management
router.post('/:id/portfolio/projects', addPortfolioProject);
router.put('/:id/portfolio/projects/:projectId', updatePortfolioProject);
router.delete('/:id/portfolio/projects/:projectId', deletePortfolioProject);

// Testimonials management
router.post('/:id/portfolio/testimonials', addTestimonial);
router.put('/:id/portfolio/testimonials/:testimonialId', updateTestimonial);

// Availability management
router.put('/:id/availability', updateAvailability);

// Publish/Unpublish
router.put('/:id/publish', togglePublishFreelance);

export default router;
