import Freelance from '../models/Freelance.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Create new freelance portfolio
// @route   POST /api/freelance
// @access  Private (Vendor)
export const createFreelance = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json(
      formatResponse(false, 'Only approved freelance vendors can create portfolios', null)
    );
  }

  // Check if freelance portfolio already exists for this vendor
  const existingFreelance = await Freelance.findOne({ vendorId: vendor._id });
  if (existingFreelance) {
    return res.status(400).json(
      formatResponse(false, 'Freelance portfolio already exists for this vendor', null)
    );
  }

  const freelance = await Freelance.create({
    ...req.body,
    vendorId: vendor._id,
  });

  res.status(201).json(
    formatResponse(true, 'Freelance portfolio created successfully', freelance)
  );
});

// @desc    Get freelance portfolio by vendor
// @route   GET /api/freelance/vendor/:vendorId
// @access  Public
export const getFreelanceByVendor = asyncHandler(async (req, res) => {
  const freelance = await Freelance.findOne({ 
    vendorId: req.params.vendorId,
    isPublished: true 
  }).populate('vendorId', 'businessName contactInfo');

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  res.json(formatResponse(true, 'Freelance portfolio retrieved successfully', freelance));
});

// @desc    Get my freelance portfolio
// @route   GET /api/freelance/my-portfolio
// @access  Private (Vendor)
export const getMyFreelance = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ vendorId: vendor._id });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  res.json(formatResponse(true, 'Freelance portfolio retrieved successfully', freelance));
});

// @desc    Update freelance portfolio
// @route   PUT /api/freelance/:id
// @access  Private (Vendor)
export const updateFreelance = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  const updatedFreelance = await Freelance.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json(formatResponse(true, 'Freelance portfolio updated successfully', updatedFreelance));
});

// @desc    Update specific section of freelance portfolio
// @route   PUT /api/freelance/:id/section/:sectionName
// @access  Private (Vendor)
export const updateFreelanceSection = asyncHandler(async (req, res) => {
  const { sectionName } = req.params;
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  // Validate section name
  const validSections = [
    'personalInfo', 'heroSection', 'aboutSection', 'servicesSection', 
    'contactSection', 'gallerySection', 'skillsSection', 'experienceSection', 
    'portfolioSection', 'pricing', 'settings', 'availability'
  ];
  if (!validSections.includes(sectionName)) {
    return res.status(400).json(
      formatResponse(false, 'Invalid section name', null)
    );
  }

  const updateData = { [sectionName]: req.body };
  const updatedFreelance = await Freelance.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json(formatResponse(true, `${sectionName} updated successfully`, updatedFreelance));
});

// @desc    Add skill category
// @route   POST /api/freelance/:id/skills/categories
// @access  Private (Vendor)
export const addSkillCategory = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  freelance.skillsSection.categories.push(req.body);
  await freelance.save();

  res.status(201).json(formatResponse(true, 'Skill category added successfully', freelance));
});

// @desc    Update skill category
// @route   PUT /api/freelance/:id/skills/categories/:categoryId
// @access  Private (Vendor)
export const updateSkillCategory = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  const category = freelance.skillsSection.categories.id(req.params.categoryId);
  if (!category) {
    return res.status(404).json(
      formatResponse(false, 'Skill category not found', null)
    );
  }

  Object.assign(category, req.body);
  await freelance.save();

  res.json(formatResponse(true, 'Skill category updated successfully', freelance));
});

// @desc    Add work experience
// @route   POST /api/freelance/:id/experience/work
// @access  Private (Vendor)
export const addWorkExperience = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  freelance.experienceSection.workExperience.push(req.body);
  await freelance.save();

  res.status(201).json(formatResponse(true, 'Work experience added successfully', freelance));
});

// @desc    Update work experience
// @route   PUT /api/freelance/:id/experience/work/:experienceId
// @access  Private (Vendor)
export const updateWorkExperience = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  const experience = freelance.experienceSection.workExperience.id(req.params.experienceId);
  if (!experience) {
    return res.status(404).json(
      formatResponse(false, 'Work experience not found', null)
    );
  }

  Object.assign(experience, req.body);
  await freelance.save();

  res.json(formatResponse(true, 'Work experience updated successfully', freelance));
});

// @desc    Add portfolio project
// @route   POST /api/freelance/:id/portfolio/projects
// @access  Private (Vendor)
export const addPortfolioProject = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  freelance.portfolioSection.projects.push(req.body);
  await freelance.save();

  res.status(201).json(formatResponse(true, 'Portfolio project added successfully', freelance));
});

// @desc    Update portfolio project
// @route   PUT /api/freelance/:id/portfolio/projects/:projectId
// @access  Private (Vendor)
export const updatePortfolioProject = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  const project = freelance.portfolioSection.projects.id(req.params.projectId);
  if (!project) {
    return res.status(404).json(
      formatResponse(false, 'Portfolio project not found', null)
    );
  }

  Object.assign(project, req.body);
  await freelance.save();

  res.json(formatResponse(true, 'Portfolio project updated successfully', freelance));
});

// @desc    Delete portfolio project
// @route   DELETE /api/freelance/:id/portfolio/projects/:projectId
// @access  Private (Vendor)
export const deletePortfolioProject = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  freelance.portfolioSection.projects.pull(req.params.projectId);
  await freelance.save();

  res.json(formatResponse(true, 'Portfolio project deleted successfully', freelance));
});

// @desc    Add testimonial
// @route   POST /api/freelance/:id/portfolio/testimonials
// @access  Private (Vendor)
export const addTestimonial = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  freelance.portfolioSection.testimonials.push(req.body);
  await freelance.save();

  res.status(201).json(formatResponse(true, 'Testimonial added successfully', freelance));
});

// @desc    Update testimonial
// @route   PUT /api/freelance/:id/portfolio/testimonials/:testimonialId
// @access  Private (Vendor)
export const updateTestimonial = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  const testimonial = freelance.portfolioSection.testimonials.id(req.params.testimonialId);
  if (!testimonial) {
    return res.status(404).json(
      formatResponse(false, 'Testimonial not found', null)
    );
  }

  Object.assign(testimonial, req.body);
  await freelance.save();

  res.json(formatResponse(true, 'Testimonial updated successfully', freelance));
});

// @desc    Update availability status
// @route   PUT /api/freelance/:id/availability
// @access  Private (Vendor)
export const updateAvailability = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  const { status, nextAvailableDate } = req.body;
  await freelance.updateAvailability(status, nextAvailableDate);

  res.json(formatResponse(true, 'Availability updated successfully', freelance));
});

// @desc    Publish/Unpublish freelance portfolio
// @route   PUT /api/freelance/:id/publish
// @access  Private (Vendor)
export const togglePublishFreelance = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  await freelance.togglePublish();

  const message = freelance.isPublished ? 'Freelance portfolio published successfully' : 'Freelance portfolio unpublished successfully';
  res.json(formatResponse(true, message, freelance));
});

// @desc    Delete freelance portfolio
// @route   DELETE /api/freelance/:id
// @access  Private (Vendor)
export const deleteFreelance = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'freelance' });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Freelance vendor not found', null)
    );
  }

  const freelance = await Freelance.findOne({ 
    _id: req.params.id, 
    vendorId: vendor._id 
  });

  if (!freelance) {
    return res.status(404).json(
      formatResponse(false, 'Freelance portfolio not found', null)
    );
  }

  await freelance.softDelete();

  res.json(formatResponse(true, 'Freelance portfolio deleted successfully', null));
});

// @desc    Get all published freelance portfolios
// @route   GET /api/freelance
// @access  Public
export const getAllFreelancers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    city,
    state,
    skills,
    availability,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = { isActive: true, isPublished: true };
  
  if (city) filter['contactSection.address.city'] = new RegExp(city, 'i');
  if (state) filter['contactSection.address.state'] = new RegExp(state, 'i');
  if (availability) filter['availability.status'] = availability;
  if (skills) {
    filter['skillsSection.categories.skills.name'] = new RegExp(skills, 'i');
  }
  if (search) {
    filter.$or = [
      { 'personalInfo.firstName': new RegExp(search, 'i') },
      { 'personalInfo.lastName': new RegExp(search, 'i') },
      { 'personalInfo.title': new RegExp(search, 'i') },
      { 'heroSection.title': new RegExp(search, 'i') },
      { 'aboutSection.description': new RegExp(search, 'i') },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const { skip, limit: pageLimit } = getPagination(page, limit);

  const freelancers = await Freelance.find(filter)
    .populate('vendorId', 'businessName contactInfo')
    .sort(sortOptions)
    .skip(skip)
    .limit(pageLimit);

  const total = await Freelance.countDocuments(filter);

  res.json(formatResponse(true, 'Freelancers retrieved successfully', {
    freelancers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / pageLimit),
      totalItems: total,
      itemsPerPage: pageLimit,
    },
  }));
});
