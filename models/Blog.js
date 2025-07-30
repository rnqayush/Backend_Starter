const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a blog title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Please add blog content']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  featuredImage: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please specify blog category']
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  comments: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Generate slug from title
BlogSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);

