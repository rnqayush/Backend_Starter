import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/response.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// File model (we'll create this)
import File from '../models/File.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'src/public/uploads');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'text/plain': true,
    'video/mp4': true,
    'video/mpeg': true,
    'video/quicktime': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// @desc    Upload single file
// @route   POST /api/files/upload
// @access  Private
export const uploadSingleFile = [
  upload.single('file'),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const { category, description, isPublic = false } = req.body;

    // Create file record in database
    const fileRecord = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      category: category || 'general',
      description,
      isPublic: isPublic === 'true'
    });

    sendSuccess(res, {
      file: {
        id: fileRecord._id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        category: fileRecord.category,
        uploadedAt: fileRecord.createdAt
      }
    }, 'File uploaded successfully', 201);
  })
];

// @desc    Upload multiple files
// @route   POST /api/files/upload/multiple
// @access  Private
export const uploadMultipleFiles = [
  upload.array('files', 10), // Max 10 files
  asyncHandler(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No files uploaded', 400);
    }

    const { category, description, isPublic = false } = req.body;
    const uploadedFiles = [];

    for (const file of req.files) {
      const fileRecord = await File.create({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/${file.filename}`,
        uploadedBy: req.user.id,
        category: category || 'general',
        description,
        isPublic: isPublic === 'true'
      });

      uploadedFiles.push({
        id: fileRecord._id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url,
        size: fileRecord.size,
        mimetype: fileRecord.mimetype,
        category: fileRecord.category,
        uploadedAt: fileRecord.createdAt
      });
    }

    sendSuccess(res, {
      files: uploadedFiles,
      count: uploadedFiles.length
    }, 'Files uploaded successfully', 201);
  })
];

// @desc    Delete file
// @route   DELETE /api/files/:fileId
// @access  Private
export const deleteFile = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.fileId);

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Check if user owns the file or is admin
  if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this file', 403);
  }

  try {
    // Delete physical file
    await fs.unlink(file.path);
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }

  // Delete database record
  await File.findByIdAndDelete(req.params.fileId);

  sendSuccess(res, null, 'File deleted successfully');
});

// @desc    Get file metadata
// @route   GET /api/files/:fileId/metadata
// @access  Private
export const getFileMetadata = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.fileId).populate('uploadedBy', 'name email');

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Check if user can access this file
  if (!file.isPublic && file.uploadedBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to access this file', 403);
  }

  sendSuccess(res, {
    file: {
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      url: file.url,
      category: file.category,
      description: file.description,
      isPublic: file.isPublic,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.createdAt,
      downloads: file.downloads,
      lastAccessed: file.lastAccessed
    }
  }, 'File metadata retrieved successfully');
});

// @desc    Resize image
// @route   POST /api/files/resize
// @access  Private
export const resizeImage = asyncHandler(async (req, res, next) => {
  const { fileId, width, height, quality = 80 } = req.body;

  if (!fileId || (!width && !height)) {
    return sendError(res, 'File ID and dimensions are required', 400);
  }

  const file = await File.findById(fileId);

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Check if user owns the file
  if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this file', 403);
  }

  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    return sendError(res, 'File is not an image', 400);
  }

  try {
    const resizedFilename = `resized-${width}x${height}-${file.filename}`;
    const resizedPath = path.join(path.dirname(file.path), resizedFilename);

    await sharp(file.path)
      .resize(parseInt(width), parseInt(height), {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: parseInt(quality) })
      .toFile(resizedPath);

    // Get file stats
    const stats = await fs.stat(resizedPath);

    // Create new file record for resized image
    const resizedFileRecord = await File.create({
      filename: resizedFilename,
      originalName: `resized-${file.originalName}`,
      mimetype: 'image/jpeg',
      size: stats.size,
      path: resizedPath,
      url: `/uploads/${resizedFilename}`,
      uploadedBy: req.user.id,
      category: file.category,
      description: `Resized version of ${file.originalName}`,
      isPublic: file.isPublic,
      parentFile: file._id
    });

    sendSuccess(res, {
      file: {
        id: resizedFileRecord._id,
        filename: resizedFileRecord.filename,
        originalName: resizedFileRecord.originalName,
        url: resizedFileRecord.url,
        size: resizedFileRecord.size,
        dimensions: { width: parseInt(width), height: parseInt(height) }
      }
    }, 'Image resized successfully', 201);

  } catch (error) {
    console.error('Error resizing image:', error);
    return sendError(res, 'Error processing image', 500);
  }
});

// @desc    Optimize image
// @route   POST /api/files/optimize
// @access  Private
export const optimizeImage = asyncHandler(async (req, res, next) => {
  const { fileId, quality = 80 } = req.body;

  if (!fileId) {
    return sendError(res, 'File ID is required', 400);
  }

  const file = await File.findById(fileId);

  if (!file) {
    return sendError(res, 'File not found', 404);
  }

  // Check if user owns the file
  if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this file', 403);
  }

  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    return sendError(res, 'File is not an image', 400);
  }

  try {
    const optimizedFilename = `optimized-${file.filename}`;
    const optimizedPath = path.join(path.dirname(file.path), optimizedFilename);

    let sharpInstance = sharp(file.path);

    // Apply optimization based on image type
    if (file.mimetype === 'image/jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality), progressive: true });
    } else if (file.mimetype === 'image/png') {
      sharpInstance = sharpInstance.png({ quality: parseInt(quality), progressive: true });
    } else if (file.mimetype === 'image/webp') {
      sharpInstance = sharpInstance.webp({ quality: parseInt(quality) });
    }

    await sharpInstance.toFile(optimizedPath);

    // Get file stats
    const stats = await fs.stat(optimizedPath);
    const originalStats = await fs.stat(file.path);
    const compressionRatio = ((originalStats.size - stats.size) / originalStats.size * 100).toFixed(2);

    // Create new file record for optimized image
    const optimizedFileRecord = await File.create({
      filename: optimizedFilename,
      originalName: `optimized-${file.originalName}`,
      mimetype: file.mimetype,
      size: stats.size,
      path: optimizedPath,
      url: `/uploads/${optimizedFilename}`,
      uploadedBy: req.user.id,
      category: file.category,
      description: `Optimized version of ${file.originalName}`,
      isPublic: file.isPublic,
      parentFile: file._id
    });

    sendSuccess(res, {
      file: {
        id: optimizedFileRecord._id,
        filename: optimizedFileRecord.filename,
        originalName: optimizedFileRecord.originalName,
        url: optimizedFileRecord.url,
        size: optimizedFileRecord.size,
        originalSize: originalStats.size,
        compressionRatio: `${compressionRatio}%`
      }
    }, 'Image optimized successfully', 201);

  } catch (error) {
    console.error('Error optimizing image:', error);
    return sendError(res, 'Error processing image', 500);
  }
});

// @desc    Get media library
// @route   GET /api/media/library
// @access  Private
export const getMediaLibrary = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const category = req.query.category;
  const mimetype = req.query.mimetype;
  const search = req.query.search;

  const skip = (page - 1) * limit;

  // Build query
  let query = { uploadedBy: req.user.id };

  if (category) {
    query.category = category;
  }

  if (mimetype) {
    query.mimetype = new RegExp(mimetype, 'i');
  }

  if (search) {
    query.$or = [
      { originalName: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];
  }

  const files = await File.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('filename originalName mimetype size url category description isPublic createdAt downloads');

  const total = await File.countDocuments(query);

  sendSuccess(res, {
    files,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Media library retrieved successfully');
});

// @desc    Organize media (create folders, move files)
// @route   POST /api/media/organize
// @access  Private
export const organizeMedia = asyncHandler(async (req, res, next) => {
  const { action, fileIds, category, folder } = req.body;

  if (!action || !fileIds || !Array.isArray(fileIds)) {
    return sendError(res, 'Action and file IDs are required', 400);
  }

  const files = await File.find({
    _id: { $in: fileIds },
    uploadedBy: req.user.id
  });

  if (files.length !== fileIds.length) {
    return sendError(res, 'Some files not found or not authorized', 404);
  }

  let updateData = {};

  switch (action) {
    case 'categorize':
      if (!category) {
        return sendError(res, 'Category is required for categorize action', 400);
      }
      updateData.category = category;
      break;

    case 'move_to_folder':
      if (!folder) {
        return sendError(res, 'Folder is required for move action', 400);
      }
      updateData.folder = folder;
      break;

    default:
      return sendError(res, 'Invalid action', 400);
  }

  await File.updateMany(
    { _id: { $in: fileIds }, uploadedBy: req.user.id },
    updateData
  );

  sendSuccess(res, {
    updatedCount: files.length,
    action,
    updateData
  }, 'Files organized successfully');
});

// @desc    Delete media file
// @route   DELETE /api/media/:mediaId
// @access  Private
export const deleteMedia = asyncHandler(async (req, res, next) => {
  const file = await File.findById(req.params.mediaId);

  if (!file) {
    return sendError(res, 'Media file not found', 404);
  }

  // Check if user owns the file or is admin
  if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this file', 403);
  }

  try {
    // Delete physical file
    await fs.unlink(file.path);
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }

  // Delete database record
  await File.findByIdAndDelete(req.params.mediaId);

  sendSuccess(res, null, 'Media file deleted successfully');
});

// @desc    Update media metadata
// @route   PUT /api/media/:mediaId/metadata
// @access  Private
export const updateMediaMetadata = asyncHandler(async (req, res, next) => {
  const { description, category, isPublic, tags } = req.body;

  const file = await File.findById(req.params.mediaId);

  if (!file) {
    return sendError(res, 'Media file not found', 404);
  }

  // Check if user owns the file
  if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this file', 403);
  }

  // Update metadata
  if (description !== undefined) file.description = description;
  if (category !== undefined) file.category = category;
  if (isPublic !== undefined) file.isPublic = isPublic;
  if (tags !== undefined) file.tags = tags;

  await file.save();

  sendSuccess(res, {
    file: {
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      description: file.description,
      category: file.category,
      isPublic: file.isPublic,
      tags: file.tags
    }
  }, 'Media metadata updated successfully');
});

