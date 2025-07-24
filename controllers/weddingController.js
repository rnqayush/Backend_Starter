import Wedding from '../models/Wedding.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Create new wedding service
// @route   POST /api/wedding
// @access  Private (Vendor)
export const createWeddingService = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'wedding' });
  
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json(
      formatResponse(false, 'Only approved wedding vendors can create services', null)
    );
  }

  const service = await Wedding.create({
    ...req.body,
    vendorId: vendor._id,
  });

  res.status(201).json(
    formatResponse(true, 'Wedding service created successfully', service)
  );
});

// @desc    Get all wedding services
// @route   GET /api/wedding
// @access  Public
export const getAllWeddingServices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    serviceType,
    city,
    state,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = { isActive: true };
  
  if (serviceType) filter.serviceType = serviceType;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  if (state) filter['location.state'] = new RegExp(state, 'i');
  
  if (minPrice || maxPrice) {
    filter['pricing.basePrice'] = {};
    if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
  }

  if (search) {
    filter.$or = [
      { serviceName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const services = await Wedding.find(filter)
    .populate('vendorId', 'businessName contactInfo rating')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit);

  const total = await Wedding.countDocuments(filter);

  res.status(200).json(
    formatResponse(true, 'Wedding services retrieved successfully', {
      services,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Get wedding service by ID
// @route   GET /api/wedding/:id
// @access  Public
export const getWeddingServiceById = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id)
    .populate('vendorId', 'businessName contactInfo rating')
    .populate('reviews');

  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  res.status(200).json(
    formatResponse(true, 'Wedding service retrieved successfully', service)
  );
});

// @desc    Update wedding service
// @route   PUT /api/wedding/:id
// @access  Private (Vendor - Owner only)
export const updateWeddingService = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update this service', null)
    );
  }

  const updatedService = await Wedding.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    formatResponse(true, 'Wedding service updated successfully', updatedService)
  );
});

// @desc    Delete wedding service
// @route   DELETE /api/wedding/:id
// @access  Private (Vendor - Owner only)
export const deleteWeddingService = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete this service', null)
    );
  }

  await service.softDelete();

  res.status(200).json(
    formatResponse(true, 'Wedding service deleted successfully', null)
  );
});

// @desc    Get vendor's wedding services
// @route   GET /api/wedding/vendor/my-services
// @access  Private (Vendor)
export const getVendorWeddingServices = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: pageLimit } = getPagination(page, limit);

  const services = await Wedding.find({ vendorId: vendor._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Wedding.countDocuments({ vendorId: vendor._id });

  res.status(200).json(
    formatResponse(true, 'Vendor wedding services retrieved successfully', {
      services,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Add testimonial to wedding service
// @route   POST /api/wedding/:id/testimonials
// @access  Private (Vendor)
export const addTestimonial = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to add testimonials to this service', null)
    );
  }

  service.testimonials.push(req.body);
  await service.save();

  res.status(201).json(
    formatResponse(true, 'Testimonial added successfully', service)
  );
});

// @desc    Update testimonial
// @route   PUT /api/wedding/:id/testimonials/:testimonialId
// @access  Private (Vendor)
export const updateTestimonial = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update testimonials for this service', null)
    );
  }

  const testimonial = service.testimonials.id(req.params.testimonialId);
  if (!testimonial) {
    return res.status(404).json(
      formatResponse(false, 'Testimonial not found', null)
    );
  }

  Object.assign(testimonial, req.body);
  await service.save();

  res.json(formatResponse(true, 'Testimonial updated successfully', service));
});

// @desc    Delete testimonial
// @route   DELETE /api/wedding/:id/testimonials/:testimonialId
// @access  Private (Vendor)
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete testimonials from this service', null)
    );
  }

  service.testimonials.pull(req.params.testimonialId);
  await service.save();

  res.json(formatResponse(true, 'Testimonial deleted successfully', service));
});

// @desc    Add FAQ to wedding service
// @route   POST /api/wedding/:id/faqs
// @access  Private (Vendor)
export const addFAQ = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to add FAQs to this service', null)
    );
  }

  service.faqs.push(req.body);
  await service.save();

  res.status(201).json(
    formatResponse(true, 'FAQ added successfully', service)
  );
});

// @desc    Update FAQ
// @route   PUT /api/wedding/:id/faqs/:faqId
// @access  Private (Vendor)
export const updateFAQ = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update FAQs for this service', null)
    );
  }

  const faq = service.faqs.id(req.params.faqId);
  if (!faq) {
    return res.status(404).json(
      formatResponse(false, 'FAQ not found', null)
    );
  }

  Object.assign(faq, req.body);
  await service.save();

  res.json(formatResponse(true, 'FAQ updated successfully', service));
});

// @desc    Delete FAQ
// @route   DELETE /api/wedding/:id/faqs/:faqId
// @access  Private (Vendor)
export const deleteFAQ = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete FAQs from this service', null)
    );
  }

  service.faqs.pull(req.params.faqId);
  await service.save();

  res.json(formatResponse(true, 'FAQ deleted successfully', service));
});

// @desc    Add offer to wedding service
// @route   POST /api/wedding/:id/offers
// @access  Private (Vendor)
export const addOffer = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to add offers to this service', null)
    );
  }

  service.offers.push(req.body);
  await service.save();

  res.status(201).json(
    formatResponse(true, 'Offer added successfully', service)
  );
});

// @desc    Update offer
// @route   PUT /api/wedding/:id/offers/:offerId
// @access  Private (Vendor)
export const updateOffer = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update offers for this service', null)
    );
  }

  const offer = service.offers.id(req.params.offerId);
  if (!offer) {
    return res.status(404).json(
      formatResponse(false, 'Offer not found', null)
    );
  }

  Object.assign(offer, req.body);
  await service.save();

  res.json(formatResponse(true, 'Offer updated successfully', service));
});

// @desc    Delete offer
// @route   DELETE /api/wedding/:id/offers/:offerId
// @access  Private (Vendor)
export const deleteOffer = asyncHandler(async (req, res) => {
  const service = await Wedding.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json(
      formatResponse(false, 'Wedding service not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || service.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete offers from this service', null)
    );
  }

  service.offers.pull(req.params.offerId);
  await service.save();

  res.json(formatResponse(true, 'Offer deleted successfully', service));
});
