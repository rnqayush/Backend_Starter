import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'avatar', 'product', 'gallery', 'document', 'video', 'audio'],
    default: 'general'
  },
  folder: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  alt: {
    type: String,
    default: null
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  downloads: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  parentFile: {
    type: mongoose.Schema.ObjectId,
    ref: 'File',
    default: null
  },
  // Image-specific metadata
  imageMetadata: {
    width: Number,
    height: Number,
    format: String,
    hasAlpha: Boolean,
    orientation: Number
  },
  // Video-specific metadata
  videoMetadata: {
    duration: Number,
    width: Number,
    height: Number,
    framerate: Number,
    bitrate: Number
  },
  // Processing status
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'completed'
    },
    progress: {
      type: Number,
      default: 100
    },
    error: String
  },
  // CDN/Storage info
  storage: {
    provider: {
      type: String,
      enum: ['local', 's3', 'cloudinary', 'gcs'],
      default: 'local'
    },
    bucket: String,
    key: String,
    region: String,
    cdnUrl: String
  },
  // Access control
  accessControl: {
    allowedRoles: [String],
    allowedUsers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    expiresAt: Date
  },
  // Virus scan results
  virusScan: {
    status: {
      type: String,
      enum: ['pending', 'clean', 'infected', 'error'],
      default: 'pending'
    },
    scannedAt: Date,
    engine: String,
    signature: String
  }
}, {
  timestamps: true
});

// Indexes
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ mimetype: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ 'storage.provider': 1 });

// Virtual for file type
fileSchema.virtual('fileType').get(function() {
  if (this.mimetype.startsWith('image/')) return 'image';
  if (this.mimetype.startsWith('video/')) return 'video';
  if (this.mimetype.startsWith('audio/')) return 'audio';
  if (this.mimetype === 'application/pdf') return 'pdf';
  if (this.mimetype.includes('document') || this.mimetype.includes('text')) return 'document';
  return 'other';
});

// Virtual for human readable file size
fileSchema.virtual('humanSize').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to increment download count
fileSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  this.lastAccessed = new Date();
  return this.save();
};

// Method to check if user can access file
fileSchema.methods.canAccess = function(user) {
  // Public files can be accessed by anyone
  if (this.isPublic) return true;
  
  // Owner can always access
  if (this.uploadedBy.toString() === user._id.toString()) return true;
  
  // Admin can access everything
  if (user.role === 'admin') return true;
  
  // Check access control rules
  if (this.accessControl.allowedRoles && this.accessControl.allowedRoles.includes(user.role)) {
    return true;
  }
  
  if (this.accessControl.allowedUsers && this.accessControl.allowedUsers.includes(user._id)) {
    return true;
  }
  
  // Check if access has expired
  if (this.accessControl.expiresAt && this.accessControl.expiresAt < new Date()) {
    return false;
  }
  
  return false;
};

// Static method to get files by category
fileSchema.statics.getByCategory = function(category, userId, options = {}) {
  const query = { category };
  
  if (userId) {
    query.$or = [
      { uploadedBy: userId },
      { isPublic: true }
    ];
  } else {
    query.isPublic = true;
  }
  
  return this.find(query, null, options);
};

// Static method to search files
fileSchema.statics.search = function(searchTerm, userId, options = {}) {
  const query = {
    $and: [
      {
        $or: [
          { originalName: new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') },
          { tags: new RegExp(searchTerm, 'i') }
        ]
      }
    ]
  };
  
  if (userId) {
    query.$and.push({
      $or: [
        { uploadedBy: userId },
        { isPublic: true }
      ]
    });
  } else {
    query.$and.push({ isPublic: true });
  }
  
  return this.find(query, null, options);
};

export default mongoose.model('File', fileSchema);

