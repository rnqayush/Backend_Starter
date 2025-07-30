const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, ForbiddenError } = require('../utils/customErrors');

/**
 * Base Controller class with common CRUD operations
 * All other controllers should extend this class
 */
class BaseController {
  constructor(model, modelName = 'Resource') {
    this.model = model;
    this.modelName = modelName;
  }

  /**
   * Get all resources with pagination, filtering, and sorting
   */
  getAll = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      fields,
      search,
      ...filters
    } = req.query;

    // Build query
    let query = this.model.find();

    // Apply filters
    if (Object.keys(filters).length > 0) {
      // Handle special filter operators
      const queryStr = JSON.stringify(filters);
      const formattedQuery = queryStr.replace(/\b(gte|gt|lte|lt|in|nin|ne)\b/g, match => `$${match}`);
      query = query.find(JSON.parse(formattedQuery));
    }

    // Apply search if provided
    if (search && this.searchFields) {
      const searchQuery = {
        $or: this.searchFields.map(field => ({
          [field]: { $regex: search, $options: 'i' }
        }))
      };
      query = query.find(searchQuery);
    }

    // Apply field selection
    if (fields) {
      const selectedFields = fields.split(',').join(' ');
      query = query.select(selectedFields);
    }

    // Apply sorting
    query = query.sort(sort);

    // Get total count for pagination
    const total = await this.model.countDocuments(query.getQuery());

    // Apply pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(parseInt(limit));

    // Apply population if defined
    if (this.populateFields) {
      this.populateFields.forEach(field => {
        query = query.populate(field);
      });
    }

    const resources = await query;

    return ResponseHandler.paginated(res, resources, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, `${this.modelName}s retrieved successfully`);
  });

  /**
   * Get single resource by ID
   */
  getById = asyncHandler(async (req, res) => {
    let query = this.model.findById(req.params.id);

    // Apply population if defined
    if (this.populateFields) {
      this.populateFields.forEach(field => {
        query = query.populate(field);
      });
    }

    const resource = await query;

    if (!resource) {
      throw new NotFoundError(`${this.modelName} not found`);
    }

    // Check ownership if method is defined
    if (this.checkOwnership) {
      await this.checkOwnership(resource, req.user);
    }

    return ResponseHandler.success(res, resource, `${this.modelName} retrieved successfully`);
  });

  /**
   * Create new resource
   */
  create = asyncHandler(async (req, res) => {
    // Add user reference if authenticated
    if (req.user) {
      req.body.createdBy = req.user.id;
      
      // Add business reference for business owners
      if (req.user.role === 'business_owner' && req.user.businesses && req.user.businesses.length > 0) {
        req.body.business = req.body.business || req.user.businesses[0];
      }
    }

    // Apply pre-create hook if defined
    if (this.preCreate) {
      await this.preCreate(req.body, req.user);
    }

    const resource = await this.model.create(req.body);

    // Apply post-create hook if defined
    if (this.postCreate) {
      await this.postCreate(resource, req.user);
    }

    return ResponseHandler.created(res, resource, `${this.modelName} created successfully`);
  });

  /**
   * Update resource by ID
   */
  update = asyncHandler(async (req, res) => {
    let resource = await this.model.findById(req.params.id);

    if (!resource) {
      throw new NotFoundError(`${this.modelName} not found`);
    }

    // Check ownership if method is defined
    if (this.checkOwnership) {
      await this.checkOwnership(resource, req.user);
    }

    // Apply pre-update hook if defined
    if (this.preUpdate) {
      await this.preUpdate(req.body, resource, req.user);
    }

    resource = await this.model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Apply post-update hook if defined
    if (this.postUpdate) {
      await this.postUpdate(resource, req.user);
    }

    return ResponseHandler.updated(res, resource, `${this.modelName} updated successfully`);
  });

  /**
   * Delete resource by ID
   */
  delete = asyncHandler(async (req, res) => {
    const resource = await this.model.findById(req.params.id);

    if (!resource) {
      throw new NotFoundError(`${this.modelName} not found`);
    }

    // Check ownership if method is defined
    if (this.checkOwnership) {
      await this.checkOwnership(resource, req.user);
    }

    // Apply pre-delete hook if defined
    if (this.preDelete) {
      await this.preDelete(resource, req.user);
    }

    await resource.deleteOne();

    // Apply post-delete hook if defined
    if (this.postDelete) {
      await this.postDelete(resource, req.user);
    }

    return ResponseHandler.deleted(res, `${this.modelName} deleted successfully`);
  });

  /**
   * Get resources by business ID (for multi-tenant support)
   */
  getByBusiness = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Check if user has access to this business
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const total = await this.model.countDocuments({ business: businessId });
    const skip = (page - 1) * limit;

    let query = this.model.find({ business: businessId })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Apply population if defined
    if (this.populateFields) {
      this.populateFields.forEach(field => {
        query = query.populate(field);
      });
    }

    const resources = await query;

    return ResponseHandler.paginated(res, resources, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, `${this.modelName}s for business retrieved successfully`);
  });

  /**
   * Default ownership check - can be overridden in child classes
   */
  checkOwnership = async (resource, user) => {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    // Check if user owns the resource directly
    if (resource.createdBy && resource.createdBy.toString() === user.id) {
      return true;
    }

    // Check if user owns the business that owns the resource
    if (resource.business && user.businesses && user.businesses.includes(resource.business.toString())) {
      return true;
    }

    throw new ForbiddenError('Access denied to this resource');
  };
}

module.exports = BaseController;

