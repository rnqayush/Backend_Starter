import express from 'express';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileMetadata,
  resizeImage,
  optimizeImage,
  getMediaLibrary,
  organizeMedia,
  deleteMedia,
  updateMediaMetadata
} from '../controllers/fileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// File upload routes
router.post('/upload', uploadSingleFile);
router.post('/upload/multiple', uploadMultipleFiles);

// File management routes
router.route('/:fileId')
  .delete(deleteFile);

router.get('/:fileId/metadata', getFileMetadata);

// Image processing routes
router.post('/resize', resizeImage);
router.post('/optimize', optimizeImage);

// Media library routes
router.get('/media/library', getMediaLibrary);
router.post('/media/organize', organizeMedia);
router.delete('/media/:mediaId', deleteMedia);
router.put('/media/:mediaId/metadata', updateMediaMetadata);

export default router;

