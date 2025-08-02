/**
 * Review Model - Customer reviews and ratings for vendors/products/services
 */

import mongoose from 'mongoose';
import { BUSINESS_CATEGORIES, DEFAULTS } from '../config/constants.js';

const reviewSchema = new mongoose.Schema({
  // Review identification
  reviewId: {
    type: String,
    unique: true,
    required: true,
    default: () => `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // What is being reviewed
  reviewType: {
    type: String,
    required: [true, 'Review type is required'],
    enum: {
      values: ['vendor', 'product', 'hotel', 'booking', 'order'],
      message: 'Invalid review type'
    }
  },

  // Reference to the item being reviewed
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'targetModel'
  },

  targetModel: {
    type: String,
    required: true,
    enum: ['Vendor', 'Product', 'Hotel', 'Booking', 'Order']
  },

  // Business category context
  businessCategory: {
    type: String,
    required: [true, 'Business category is required'],
    enum: {
      values: Object.values(BUSINESS_CATEGORIES),
      message: 'Invalid business category'
    }
  },

  // Reviewer information
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer is required']
  },

  reviewerName: {
    type: String,
    required: [true, 'Reviewer name is required'],
    trim: true,
    maxlength: [100, 'Reviewer name cannot exceed 100 characters']
  },

  // Review content
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v) || (v % 0.5 === 0);
      },
      message: 'Rating must be a whole number or half number (e.g., 4.5)'
    }
  },

  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    minlength: [5, 'Review title must be at least 5 characters'],
    maxlength: [200, 'Review title cannot exceed 200 characters']
  },

  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Review comment must be at least 10 characters'],
    maxlength: [2000, 'Review comment cannot exceed 2000 characters']
  },

  // Review media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Review verification
  isVerified: {
    type: Boolean,
    default: false
  },

  verificationMethod: {
    type: String,
    enum: ['purchase', 'booking', 'manual', 'none'],
    default: 'none'
  },

  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },

  // Moderation
  moderationNotes: {
    type: String,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },

  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  moderatedAt: {
    type: Date
  },

  // Helpfulness tracking
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },

  unhelpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },

  totalVotes: {
    type: Number,
    default: 0,
    min: 0
  },

  // Response from vendor/business
  vendorResponse: {
    message: {
      type: String,
      maxlength: [1000, 'Vendor response cannot exceed 1000 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },

  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceType: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reviewSchema.index({ targetId: 1, targetModel: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ businessCategory: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerified: 1 });

// Compound indexes
reviewSchema.index({ targetId: 1, status: 1, rating: -1 });
reviewSchema.index({ businessCategory: 1, status: 1, createdAt: -1 });

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  if (this.totalVotes === 0) return 0;
  return (this.helpfulVotes / this.totalVotes) * 100;
});

// Virtual for review age
reviewSchema.virtual('reviewAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Update total votes
  this.totalVotes = this.helpfulVotes + this.unhelpfulVotes;
  
  // Auto-approve verified reviews from verified purchases
  if (this.isVerified && this.verificationMethod === 'purchase' && this.status === 'pending') {
    this.status = 'approved';
  }
  
  next();
});

// Static methods
reviewSchema.statics.getAverageRating = async function(targetId, targetModel) {
  const result = await this.aggregate([
    {
      $match: {
        targetId: new mongoose.Types.ObjectId(targetId),
        targetModel: targetModel,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const data = result[0];
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[Math.floor(rating)]++;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

reviewSchema.statics.getRecentReviews = async function(targetId, targetModel, limit = 5) {
  return await this.find({
    targetId: new mongoose.Types.ObjectId(targetId),
    targetModel: targetModel,
    status: 'approved'
  })
  .populate('reviewer', 'name avatar')
  .sort({ createdAt: -1 })
  .limit(limit)
  .lean();
};

// Instance methods
reviewSchema.methods.markHelpful = async function(userId) {
  // In a real implementation, you'd track who voted to prevent duplicate votes
  this.helpfulVotes += 1;
  return await this.save();
};

reviewSchema.methods.markUnhelpful = async function(userId) {
  // In a real implementation, you'd track who voted to prevent duplicate votes
  this.unhelpfulVotes += 1;
  return await this.save();
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;
