const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class MediaController extends BaseController {
  constructor() {
    super(null, 'Media'); // No specific model for media
    this.setupMulter();
  }

  /**
   * Setup multer for file uploads
   */
  setupMulter() {
    // Configure multer for memory storage
    this.upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 10 // Maximum 10 files at once
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new BadRequestError('Invalid file type. Only images, PDFs, and documents are allowed.'));
        }
      }
    });
  }

  /**
   * Upload single file
   */
  uploadSingle = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const { businessId, category = 'general', alt = '', description = '' } = req.body;

    // Check if user has access to this business
    if (businessId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const fileInfo = await this.processAndSaveFile(req.file, {
      businessId,
      category,
      alt,
      description,
      uploadedBy: req.user.id
    });

    return ResponseHandler.created(res, fileInfo, 'File uploaded successfully');
  });

  /**
   * Upload multiple files
   */
  uploadMultiple = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new BadRequestError('No files uploaded');
    }

    const { businessId, category = 'general' } = req.body;

    // Check if user has access to this business
    if (businessId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        const fileInfo = await this.processAndSaveFile(file, {
          businessId,
          category,
          uploadedBy: req.user.id
        });
        uploadedFiles.push(fileInfo);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    return ResponseHandler.created(res, uploadedFiles, `${uploadedFiles.length} files uploaded successfully`);
  });

  /**
   * Process and save file
   */
  processAndSaveFile = async (file, metadata) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    
    // Create directory structure
    const businessDir = metadata.businessId ? `business-${metadata.businessId}` : 'general';
    const categoryDir = metadata.category || 'general';
    const fullDir = path.join(uploadPath, businessDir, categoryDir);
    
    await fs.mkdir(fullDir, { recursive: true });

    const filePath = path.join(fullDir, fileName);
    const relativePath = path.join(businessDir, categoryDir, fileName);

    // Process image files
    if (this.isImageFile(file.mimetype)) {
      const processedImage = await this.processImage(file.buffer, fileExtension);
      await fs.writeFile(filePath, processedImage.buffer);

      // Generate thumbnails for images
      const thumbnailPath = path.join(fullDir, `thumb_${fileName}`);
      const thumbnailRelativePath = path.join(businessDir, categoryDir, `thumb_${fileName}`);
      
      const thumbnail = await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      await fs.writeFile(thumbnailPath, thumbnail);

      return {
        id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        originalName: file.originalname,
        fileName,
        filePath: relativePath,
        thumbnailPath: thumbnailRelativePath,
        mimeType: file.mimetype,
        size: processedImage.info.size,
        dimensions: {
          width: processedImage.info.width,
          height: processedImage.info.height
        },
        url: `/uploads/${relativePath}`,
        thumbnailUrl: `/uploads/${thumbnailRelativePath}`,
        category: metadata.category,
        alt: metadata.alt,
        description: metadata.description,
        businessId: metadata.businessId,
        uploadedBy: metadata.uploadedBy,
        uploadedAt: new Date(),
        type: 'image'
      };
    } else {
      // Handle non-image files
      await fs.writeFile(filePath, file.buffer);

      return {
        id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
        originalName: file.originalname,
        fileName,
        filePath: relativePath,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${relativePath}`,
        category: metadata.category,
        description: metadata.description,
        businessId: metadata.businessId,
        uploadedBy: metadata.uploadedBy,
        uploadedAt: new Date(),
        type: this.getFileType(file.mimetype)
      };
    }
  };

  /**
   * Process image with optimization
   */
  processImage = async (buffer, extension) => {
    let processor = sharp(buffer);

    // Auto-orient based on EXIF data
    processor = processor.rotate();

    // Optimize based on file type
    switch (extension) {
      case '.jpg':
      case '.jpeg':
        processor = processor.jpeg({ quality: 85, progressive: true });
        break;
      case '.png':
        processor = processor.png({ compressionLevel: 8 });
        break;
      case '.webp':
        processor = processor.webp({ quality: 85 });
        break;
      default:
        processor = processor.jpeg({ quality: 85 });
    }

    const { data, info } = await processor.toBuffer({ resolveWithObject: true });
    
    return { buffer: data, info };
  };

  /**
   * Get business media files
   */
  getBusinessMedia = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { category, type, page = 1, limit = 20 } = req.query;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    // This would typically query a database table for media files
    // For now, we'll return a placeholder response
    const mediaFiles = await this.getMediaFromFileSystem(businessId, { category, type });

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = mediaFiles.slice(startIndex, endIndex);

    return ResponseHandler.paginated(res, paginatedFiles, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: mediaFiles.length
    }, 'Business media files retrieved successfully');
  });

  /**
   * Delete media file
   */
  deleteMedia = asyncHandler(async (req, res) => {
    const { businessId, fileName } = req.params;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const businessDir = `business-${businessId}`;
    
    // Find and delete the file
    const deleted = await this.deleteFileFromFileSystem(uploadPath, businessDir, fileName);

    if (!deleted) {
      throw new NotFoundError('Media file not found');
    }

    return ResponseHandler.deleted(res, 'Media file deleted successfully');
  });

  /**
   * Get media file info
   */
  getMediaInfo = asyncHandler(async (req, res) => {
    const { businessId, fileName } = req.params;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const businessDir = `business-${businessId}`;
    
    const fileInfo = await this.getFileInfoFromFileSystem(uploadPath, businessDir, fileName);

    if (!fileInfo) {
      throw new NotFoundError('Media file not found');
    }

    return ResponseHandler.success(res, fileInfo, 'Media file info retrieved successfully');
  });

  /**
   * Resize image
   */
  resizeImage = asyncHandler(async (req, res) => {
    const { businessId, fileName } = req.params;
    const { width, height, quality = 85 } = req.query;

    if (!width && !height) {
      throw new BadRequestError('Width or height parameter is required');
    }

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const uploadPath = process.env.FILE_UPLOAD_PATH || './uploads';
    const businessDir = `business-${businessId}`;
    const filePath = path.join(uploadPath, businessDir, fileName);

    try {
      const fileBuffer = await fs.readFile(filePath);
      
      let resizer = sharp(fileBuffer);
      
      if (width && height) {
        resizer = resizer.resize(parseInt(width), parseInt(height), { fit: 'cover' });
      } else if (width) {
        resizer = resizer.resize(parseInt(width));
      } else if (height) {
        resizer = resizer.resize(null, parseInt(height));
      }

      const resizedBuffer = await resizer
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();

      res.set('Content-Type', 'image/jpeg');
      res.send(resizedBuffer);
    } catch (error) {
      throw new NotFoundError('Image file not found');
    }
  });

  /**
   * Helper methods
   */
  isImageFile = (mimetype) => {
    return mimetype.startsWith('image/');
  };

  getFileType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('document') || mimetype.includes('word')) return 'document';
    return 'other';
  };

  // Placeholder methods for file system operations
  getMediaFromFileSystem = async (businessId, filters) => {
    // This would scan the file system and return file information
    // For now, return empty array
    return [];
  };

  deleteFileFromFileSystem = async (uploadPath, businessDir, fileName) => {
    try {
      const filePath = path.join(uploadPath, businessDir, fileName);
      await fs.unlink(filePath);
      
      // Also try to delete thumbnail if it exists
      const thumbnailPath = path.join(uploadPath, businessDir, `thumb_${fileName}`);
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Thumbnail might not exist, ignore error
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  getFileInfoFromFileSystem = async (uploadPath, businessDir, fileName) => {
    try {
      const filePath = path.join(uploadPath, businessDir, fileName);
      const stats = await fs.stat(filePath);
      
      return {
        fileName,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: `/uploads/${businessDir}/${fileName}`
      };
    } catch (error) {
      return null;
    }
  };
}

module.exports = new MediaController();

