import express from 'express';
import {
  getHomepageContent,
  getCategoryStats,
  globalSearch
} from '../controllers/homepageController.js';

const router = express.Router();

// Public routes
router.get('/', getHomepageContent);
router.get('/stats', getCategoryStats);
router.get('/search', globalSearch);

export default router;

