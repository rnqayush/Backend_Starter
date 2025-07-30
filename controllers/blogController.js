const Blog = require('../models/Blog');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

class BlogController extends BaseController {
  constructor() {
    super(Blog, 'Blog');
    this.searchFields = ['title', 'content', 'excerpt', 'tags'];
    this.populateFields = ['business', 'author'];
  }

  /**
   * Get published blogs
   */
  getPublishedBlogs = asyncHandler(async (req, res) => {
    const {
      category,
      tags,
      author,
      businessId,
      page = 1,
      limit = 10,
      sortBy = '-publishedAt'
    } = req.query;

    let query = { status: 'published', isActive: true };

    // Category filter
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    // Business filter
    if (businessId) {
      query.business = businessId;
    }

    const total = await Blog.countDocuments(query);
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('business', 'name slug')
      .populate('author', 'name')
      .select('-content') // Exclude full content for list view
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, blogs, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Published blogs retrieved successfully');
  });

  /**
   * Get blog by slug
   */
  getBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published', isActive: true })
      .populate('business', 'name slug')
      .populate('author', 'name');

    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }

    // Increment view count
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    return ResponseHandler.success(res, blog, 'Blog post retrieved successfully');
  });

  /**
   * Get business blogs (for business owners)
   */
  getBusinessBlogs = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    let query = { business: businessId };
    if (status) query.status = status;

    const total = await Blog.countDocuments(query);
    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, blogs, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Business blogs retrieved successfully');
  });

  /**
   * Create blog post
   */
  createBlog = asyncHandler(async (req, res) => {
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      businessId,
      status = 'draft',
      seo
    } = req.body;

    // Check if slug is unique
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      throw new BadRequestError('Blog slug already exists');
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      business: businessId,
      author: req.user.id,
      status,
      seo,
      publishedAt: status === 'published' ? new Date() : null
    });

    await blog.populate(['business', 'author']);

    return ResponseHandler.created(res, blog, 'Blog post created successfully');
  });

  /**
   * Update blog post
   */
  updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }

    await this.checkOwnership(blog, req.user);

    // If publishing for the first time, set publishedAt
    if (updateData.status === 'published' && blog.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    // If slug is being updated, check uniqueness
    if (updateData.slug && updateData.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: updateData.slug });
      if (existingBlog) {
        throw new BadRequestError('Blog slug already exists');
      }
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate(['business', 'author']);

    return ResponseHandler.updated(res, updatedBlog, 'Blog post updated successfully');
  });

  /**
   * Delete blog post
   */
  deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }

    await this.checkOwnership(blog, req.user);

    await blog.deleteOne();

    return ResponseHandler.deleted(res, 'Blog post deleted successfully');
  });

  /**
   * Get related blogs
   */
  getRelatedBlogs = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const blog = await Blog.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog post not found');
    }

    const relatedBlogs = await Blog.find({
      _id: { $ne: id },
      status: 'published',
      isActive: true,
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } },
        { business: blog.business }
      ]
    })
      .populate('business', 'name slug')
      .populate('author', 'name')
      .select('-content')
      .sort('-publishedAt')
      .limit(parseInt(limit));

    return ResponseHandler.success(res, relatedBlogs, 'Related blogs retrieved successfully');
  });

  /**
   * Get blog categories
   */
  getCategories = asyncHandler(async (req, res) => {
    const { businessId } = req.query;

    let query = { status: 'published', isActive: true };
    if (businessId) query.business = businessId;

    const categories = await Blog.distinct('category', query);

    return ResponseHandler.success(res, categories, 'Blog categories retrieved successfully');
  });

  /**
   * Get popular tags
   */
  getPopularTags = asyncHandler(async (req, res) => {
    const { businessId, limit = 20 } = req.query;

    let query = { status: 'published', isActive: true };
    if (businessId) query.business = businessId;

    const tags = await Blog.aggregate([
      { $match: query },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    return ResponseHandler.success(res, tags, 'Popular tags retrieved successfully');
  });

  /**
   * Get blog analytics
   */
  getBlogAnalytics = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Overall statistics
    const blogStats = await Blog.aggregate([
      { $match: { business: businessId } },
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          publishedBlogs: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftBlogs: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          totalViews: { $sum: '$views' },
          averageViews: { $avg: '$views' }
        }
      }
    ]);

    // Most viewed blogs
    const topBlogs = await Blog.find({
      business: businessId,
      status: 'published'
    })
      .select('title slug views publishedAt')
      .sort('-views')
      .limit(10);

    // Publishing trends
    const publishingTrends = await Blog.aggregate([
      {
        $match: {
          business: businessId,
          status: 'published',
          publishedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' }
          },
          posts: { $sum: 1 },
          views: { $sum: '$views' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const analytics = {
      summary: blogStats[0] || {
        totalBlogs: 0,
        publishedBlogs: 0,
        draftBlogs: 0,
        totalViews: 0,
        averageViews: 0
      },
      topBlogs,
      publishingTrends,
      period: { start, end }
    };

    return ResponseHandler.success(res, analytics, 'Blog analytics retrieved successfully');
  });

  /**
   * Bulk update blog status
   */
  bulkUpdateStatus = asyncHandler(async (req, res) => {
    const { blogIds, status } = req.body;

    if (!blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      throw new BadRequestError('Blog IDs array is required');
    }

    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    // Check ownership for all blogs
    const blogs = await Blog.find({ _id: { $in: blogIds } });
    
    for (const blog of blogs) {
      await this.checkOwnership(blog, req.user);
    }

    const updateData = { status };
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const result = await Blog.updateMany(
      { _id: { $in: blogIds } },
      updateData
    );

    return ResponseHandler.success(res, {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    }, 'Blogs updated successfully');
  });
}

module.exports = new BlogController();

