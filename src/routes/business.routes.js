import express from 'express';
import {
  updateHeroSection,
  updateAboutSection,
  updateServicesSection,
  addService,
  updateService,
  deleteService,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  updateContactSection,
  addGalleryImages,
  updateGalleryImage,
  deleteGalleryImage,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  updateSkillsAndExperience,
  getWebsiteContent
} from '../controllers/business/websiteContentController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Protected routes - Website management (must come before public domain route)
router.use(protect);

router.get('/', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Website listing functionality coming soon'
  });
});

router.post('/', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Website creation functionality coming soon'
  });
});

router.get('/:id', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Website details functionality coming soon'
  });
});

router.put('/:id', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Website update functionality coming soon'
  });
});

router.delete('/:id', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    message: 'Website deletion functionality coming soon'
  });
});

// ===== BUSINESS CONTENT MANAGEMENT =====

// Get all website content
router.get('/:id/content', getWebsiteContent);

// Hero Section
router.put('/:id/content/hero', authorize('vendor'), updateHeroSection);

// About Section
router.put('/:id/content/about', authorize('vendor'), updateAboutSection);

// Services Section
router.put('/:id/content/services', authorize('vendor'), updateServicesSection);
router.route('/:id/content/services')
  .post(authorize('vendor'), addService);

router.route('/:id/content/services/:serviceId')
  .put(authorize('vendor'), updateService)
  .delete(authorize('vendor'), deleteService);

// Team Section
router.route('/:id/content/team')
  .post(authorize('vendor'), addTeamMember);

router.route('/:id/content/team/:memberId')
  .put(authorize('vendor'), updateTeamMember)
  .delete(authorize('vendor'), deleteTeamMember);

// Contact Section
router.put('/:id/content/contact', authorize('vendor'), updateContactSection);

// Gallery Section
router.route('/:id/content/gallery')
  .post(authorize('vendor'), addGalleryImages);

router.route('/:id/content/gallery/:imageId')
  .put(authorize('vendor'), updateGalleryImage)
  .delete(authorize('vendor'), deleteGalleryImage);

// ===== FREELANCE SPECIFIC FEATURES =====

// Portfolio Management (for freelancers)
router.route('/:id/content/portfolio')
  .post(authorize('vendor'), addPortfolioItem);

router.route('/:id/content/portfolio/:portfolioId')
  .put(authorize('vendor'), updatePortfolioItem)
  .delete(authorize('vendor'), deletePortfolioItem);

// Skills and Experience (for freelancers)
router.put('/:id/content/skills', authorize('vendor'), updateSkillsAndExperience);

// Page management
router.get('/:id/pages', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Page management functionality coming soon'
  });
});

router.post('/:id/pages', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Page creation functionality coming soon'
  });
});

router.put('/:id/pages/:pageId', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Page update functionality coming soon'
  });
});

// Template management
router.get('/templates', async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'modern-business',
        name: 'Modern Business',
        category: 'business',
        preview: '/templates/modern-business/preview.jpg',
        description: 'Clean and modern template for businesses'
      },
      {
        id: 'creative-agency',
        name: 'Creative Agency',
        category: 'agency',
        preview: '/templates/creative-agency/preview.jpg',
        description: 'Creative template for agencies and freelancers'
      },
      {
        id: 'freelancer-portfolio',
        name: 'Freelancer Portfolio',
        category: 'freelancer',
        preview: '/templates/freelancer-portfolio/preview.jpg',
        description: 'Professional portfolio template for freelancers'
      }
    ],
    message: 'Template listing functionality coming soon'
  });
});

// Website analytics
router.get('/:id/analytics', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {
      views: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      bounceRate: 0,
      averageSessionDuration: 0
    },
    message: 'Website analytics functionality coming soon'
  });
});

// SEO management
router.get('/:id/seo', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'SEO management functionality coming soon'
  });
});

router.put('/:id/seo', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'SEO update functionality coming soon'
  });
});

// Website publishing
router.post('/:id/publish', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    message: 'Website publishing functionality coming soon'
  });
});

router.post('/:id/unpublish', authorize('vendor'), async (req, res) => {
  res.json({
    success: true,
    message: 'Website unpublishing functionality coming soon'
  });
});

// ===== PUBLIC ROUTES =====

// Create a separate router instance for public routes (no auth required)
const publicRouter = express.Router();

// Public route - Website viewing by domain (must use specific pattern to avoid conflicts)
publicRouter.get('/view/:domain', async (req, res) => {
  res.json({
    success: true,
    data: {},
    message: 'Website viewing functionality coming soon'
  });
});

// Export both routers - main app should mount public routes separately
export { publicRouter };

export default router;
