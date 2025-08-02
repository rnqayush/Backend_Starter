/**
 * Upload Middleware - Handle file uploads with multer
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { FILE_LIMITS } from '../config/constants.js';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Organize files by type and date
    const today = new Date().toISOString().split('T')[0];
    
    switch (file.fieldname) {
      case 'productImages':
        uploadPath += `products/${today}/`;
        break;
      case 'vendorImages':
        uploadPath += `vendors/${today}/`;
        break;
      case 'hotelImages':
        uploadPath += `hotels/${today}/`;
        break;
      case 'reviewImages':
        uploadPath += `reviews/${today}/`;
        break;
      case 'documents':
        uploadPath += `documents/${today}/`;
        break;
      case 'avatars':
        uploadPath += `avatars/${today}/`;
        break;
      default:
        uploadPath += `misc/${today}/`;
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);
    
    cb(null, `${baseName}_${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    ...FILE_LIMITS.ALLOWED_IMAGE_TYPES,
    ...FILE_LIMITS.ALLOWED_VIDEO_TYPES,
    ...FILE_LIMITS.ALLOWED_DOCUMENT_TYPES
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: FILE_LIMITS.MAX_IMAGE_SIZE, // Default to image size limit
    files: 10 // Maximum 10 files per request
  }
});

// Middleware for different upload types
export const uploadProductImages = upload.array('productImages', 10);
export const uploadVendorImages = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);
export const uploadHotelImages = upload.array('hotelImages', 20);
export const uploadReviewImages = upload.array('reviewImages', 5);
export const uploadDocuments = upload.array('documents', 5);
export const uploadAvatar = upload.single('avatar');
export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);

// Custom upload middleware with size limits based on file type
export const createUploadMiddleware = (fieldName, maxCount = 1, fileType = 'image') => {
  let sizeLimit;
  
  switch (fileType) {
    case 'image':
      sizeLimit = FILE_LIMITS.MAX_IMAGE_SIZE;
      break;
    case 'video':
      sizeLimit = FILE_LIMITS.MAX_VIDEO_SIZE;
      break;
    case 'document':
      sizeLimit = FILE_LIMITS.MAX_DOCUMENT_SIZE;
      break;
    default:
      sizeLimit = FILE_LIMITS.MAX_IMAGE_SIZE;
  }
  
  const uploadInstance = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      let allowedTypes;
      
      switch (fileType) {
        case 'image':
          allowedTypes = FILE_LIMITS.ALLOWED_IMAGE_TYPES;
          break;
        case 'video':
          allowedTypes = FILE_LIMITS.ALLOWED_VIDEO_TYPES;
          break;
        case 'document':
          allowedTypes = FILE_LIMITS.ALLOWED_DOCUMENT_TYPES;
          break;
        default:
          allowedTypes = FILE_LIMITS.ALLOWED_IMAGE_TYPES;
      }
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed for ${fileType} uploads`), false);
      }
    },
    limits: {
      fileSize: sizeLimit,
      files: maxCount
    }
  });
  
  return maxCount === 1 ? uploadInstance.single(fieldName) : uploadInstance.array(fieldName, maxCount);
};

// Error handling middleware for multer errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in multipart form';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      default:
        message = error.message;
    }
    
    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
      error: error.code
    });
  }
  
  if (error.message.includes('File type') && error.message.includes('not allowed')) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message
    });
  }
  
  next(error);
};

// Utility function to get file URL
export const getFileUrl = (req, filePath) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Utility function to delete file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to process uploaded files
export const processUploadedFiles = (req, files) => {
  if (!files || files.length === 0) return [];
  
  return files.map(file => ({
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url: getFileUrl(req, file.path)
  }));
};

// Middleware to clean up files on error
export const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If there's an error and files were uploaded, clean them up
    if (res.statusCode >= 400 && req.files) {
      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      files.forEach(file => {
        if (file.path) {
          deleteFile(file.path);
        }
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

export default {
  uploadProductImages,
  uploadVendorImages,
  uploadHotelImages,
  uploadReviewImages,
  uploadDocuments,
  uploadAvatar,
  uploadSingle,
  uploadMultiple,
  createUploadMiddleware,
  handleUploadError,
  getFileUrl,
  deleteFile,
  processUploadedFiles,
  cleanupOnError
};
