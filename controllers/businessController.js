import Business from '../models/Business.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Create new business website
// @route   POST /api/business
// @access  Private (Vendor)
export const createBusiness = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json(
      formatResponse(false, 'Only approved business vendors can create websites', null)
    );
  }

  // Check if business already exists for this vendor
  const existingBusiness = await Business.findOne({ vendorId: vendor._id });
  if (existingBusiness) {
    return res.status(400).json(
      formatResponse(false, 'Business website already exists for this vendor', null)
    );
  }

  const business = await Business.create({
    ...req.body,
    vendorId: vendor._id,
  });

  res.status(201).json(
    formatResponse(true, 'Business website created successfully', business)
  );
});

// @desc    Get business website by vendor
// @route   GET /api/business/vendor/:vendorId
// @access  Public
export const getBusinessByVendor = asyncHandler(async (req, res) => {
  const business = await Business.findOne({ 
    vendorId: req.params.vendorId,
    isPublished: true 
  }).populate('vendorId', 'businessName contactInfo');

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  res.json(formatResponse(true, 'Business website retrieved successfully', business));
});

// @desc    Get my business website
// @route   GET /api/business/my-business
// @access  Private (Vendor)
export const getMyBusiness = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ vendorId: vendor._id });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  res.json(formatResponse(true, 'Business website retrieved successfully', business));
});

// @desc    Update business website
// @route   PUT /api/business/:id
// @access  Private (Vendor)
export const updateBusiness = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  const updatedBusiness = await Business.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(formatResponse(true, 'Business website updated successfully', updatedBusiness));
});

// @desc    Update specific section of business website
// @route   PUT /api/business/:id/section/:sectionName
// @access  Private (Vendor)
export const updateBusinessSection = asyncHandler(async (req, res) => {
  const { sectionName } = req.params;
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  // Validate section name
  const validSections = ['heroSection', 'aboutSection', 'servicesSection', 'teamSection', 'contactSection', 'gallerySection', 'settings'];
  if (!validSections.includes(sectionName)) {
    return res.status(400).json(
      formatResponse(false, 'Invalid section name', null)
    );
  }

  const updateData = { [sectionName]: req.body };
  const updatedBusiness = await Business.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json(formatResponse(true, `${sectionName} updated successfully`, updatedBusiness));
});

// @desc    Add service to services section
// @route   POST /api/business/:id/services
// @access  Private (Vendor)
export const addService = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  business.servicesSection.services.push(req.body);
  await business.save();

  res.status(201).json(formatResponse(true, 'Service added successfully', business));
});

// @desc    Update service in services section
// @route   PUT /api/business/:id/services/:serviceId
// @access  Private (Vendor)
export const updateService = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  const service = business.servicesSection.services.id(req.params.serviceId);
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Service not found', null)
    );
  }

  Object.assign(service, req.body);
  await business.save();

  res.json(formatResponse(true, 'Service updated successfully', business));
});

// @desc    Delete service from services section
// @route   DELETE /api/business/:id/services/:serviceId
// @access  Private (Vendor)
export const deleteService = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  business.servicesSection.services.pull(req.params.serviceId);
  await business.save();

  res.json(formatResponse(true, 'Service deleted successfully', business));
});

// @desc    Add team member
// @route   POST /api/business/:id/team
// @access  Private (Vendor)
export const addTeamMember = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  business.teamSection.members.push(req.body);
  await business.save();

  res.status(201).json(formatResponse(true, 'Team member added successfully', business));
});

// @desc    Update team member
// @route   PUT /api/business/:id/team/:memberId
// @access  Private (Vendor)
export const updateTeamMember = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  const member = business.teamSection.members.id(req.params.memberId);
  if (!member) {
    return res.status(404).json(
      formatResponse(false, 'Team member not found', null)
    );
  }

  Object.assign(member, req.body);
  await business.save();

  res.json(formatResponse(true, 'Team member updated successfully', business));
});

// @desc    Delete team member
// @route   DELETE /api/business/:id/team/:memberId
// @access  Private (Vendor)
export const deleteTeamMember = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  business.teamSection.members.pull(req.params.memberId);
  await business.save();

  res.json(formatResponse(true, 'Team member deleted successfully', business));
});

// @desc    Add gallery image/video
// @route   POST /api/business/:id/gallery
// @access  Private (Vendor)
export const addGalleryItem = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  const { type, ...itemData } = req.body;
  
  if (type === 'image') {
    business.gallerySection.images.push(itemData);
  } else if (type === 'video') {
    business.gallerySection.videos.push(itemData);
  } else {
    return res.status(400).json(
      formatResponse(false, 'Invalid gallery item type', null)
    );
  }

  await business.save();

  res.status(201).json(formatResponse(true, 'Gallery item added successfully', business));
});

// @desc    Delete gallery item
// @route   DELETE /api/business/:id/gallery/:type/:itemId
// @access  Private (Vendor)
export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { type, itemId } = req.params;
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  if (type === 'image') {
    business.gallerySection.images.pull(itemId);
  } else if (type === 'video') {
    business.gallerySection.videos.pull(itemId);
  } else {
    return res.status(400).json(
      formatResponse(false, 'Invalid gallery item type', null)
    );
  }

  await business.save();

  res.json(formatResponse(true, 'Gallery item deleted successfully', business));
});

// @desc    Publish/Unpublish business website
// @route   PUT /api/business/:id/publish
// @access  Private (Vendor)
export const togglePublishBusiness = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  await business.togglePublish();

  const message = business.isPublished ? 'Business website published successfully' : 'Business website unpublished successfully';
  res.json(formatResponse(true, message, business));
});

// @desc    Delete business website
// @route   DELETE /api/business/:id
// @access  Private (Vendor)
export const deleteBusiness = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'business' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Business vendor not found', null)
    );
  }

  const business = await Business.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!business) {
    return res.status(404).json(
      formatResponse(false, 'Business website not found', null)
    );
  }

  await business.softDelete();

  res.json(formatResponse(true, 'Business website deleted successfully', null));
});

// @desc    Get all published business websites
// @route   GET /api/business
// @access  Public
export const getAllBusinesses = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    city,
    state,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = { isActive: true, isPublished: true };
  
  if (city) filter['contactSection.address.city'] = new RegExp(city, 'i');
  if (state) filter['contactSection.address.state'] = new RegExp(state, 'i');
  if (search) {
    filter.$or = [
      { businessName: new RegExp(search, 'i') },
      { 'heroSection.title': new RegExp(search, 'i') },
      { 'aboutSection.description': new RegExp(search, 'i') },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const businesses = await Business.find(filter)
    .populate('vendorId', 'businessName contactInfo')
    .sort(sortOptions)
    .skip(skip)
    .limit(pageLimit);

  const total = await Business.countDocuments(filter);

  res.json(formatResponse(true, 'Businesses retrieved successfully', {
    businesses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / pageLimit),
      totalItems: total,
      itemsPerPage: pageLimit,
    },
  }));
});
