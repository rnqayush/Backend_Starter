import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import WeddingVendor from '../../models/wedding/Vendor.js';
import { generateSlug } from '../../utils/slugify.js';

// @desc    Get all wedding vendors with filters
// @route   GET /api/weddings/vendors
// @access  Public
export const getVendors = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = WeddingVendor.searchVendors(req.query);

  // Sort options
  let sortBy = { createdAt: -1 };
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'price-low':
        sortBy = { 'pricing.startingPrice': 1 };
        break;
      case 'price-high':
        sortBy = { 'pricing.startingPrice': -1 };
        break;
      case 'rating':
        sortBy = { 'analytics.averageRating': -1 };
        break;
      case 'popular':
        sortBy = { 'analytics.views': -1 };
        break;
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }
  }

  const vendors = await searchQuery
    .populate('owner', 'name businessInfo')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select('-reviews -__v');

  const total = await WeddingVendor.countDocuments(searchQuery.getQuery());

  sendSuccess(res, {
    vendors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: req.query
  }, 'Wedding vendors retrieved successfully');
});

// @desc    Create new wedding vendor
// @route   POST /api/weddings/vendors
// @access  Private (Vendor only)
export const createVendor = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'wedding') {
    return sendError(res, 'Only wedding vendors can create vendor profiles', 403);
  }

  const vendorData = {
    ...req.body,
    owner: req.user.id
  };

  // Generate slug if not provided
  if (!vendorData.slug) {
    vendorData.slug = generateSlug(vendorData.businessName);
  }

  const vendor = await WeddingVendor.create(vendorData);

  sendSuccess(res, {
    vendor
  }, 'Wedding vendor created successfully', 201);
});

// @desc    Get single wedding vendor
// @route   GET /api/weddings/vendors/:id
// @access  Public
export const getVendor = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id)
    .populate('owner', 'name businessInfo rating')
    .populate('reviews.client', 'name avatar');

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  // Increment view count
  await vendor.incrementViews();

  sendSuccess(res, {
    vendor
  }, 'Wedding vendor retrieved successfully');
});

// @desc    Update wedding vendor
// @route   PUT /api/weddings/vendors/:id
// @access  Private (Vendor only)
export const updateVendor = asyncHandler(async (req, res, next) => {
  let vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  // Check if user owns this vendor profile or is admin
  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this vendor profile', 403);
  }

  vendor = await WeddingVendor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, {
    vendor
  }, 'Wedding vendor updated successfully');
});

// @desc    Delete wedding vendor
// @route   DELETE /api/weddings/vendors/:id
// @access  Private (Vendor only)
export const deleteVendor = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  // Check if user owns this vendor profile or is admin
  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this vendor profile', 403);
  }

  await WeddingVendor.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Wedding vendor deleted successfully');
});

// ===== BASIC INFORMATION CRUD =====

// @desc    Update basic information
// @route   PUT /api/weddings/vendors/:id/basic-info
// @access  Private (Vendor only)
export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this vendor profile', 403);
  }

  const { businessName, description, tagline, category, subcategories, specializations, location, contact, businessInfo } = req.body;

  // Update basic information
  if (businessName) vendor.businessName = businessName;
  if (description) vendor.description = description;
  if (tagline) vendor.tagline = tagline;
  if (category) vendor.category = category;
  if (subcategories) vendor.subcategories = subcategories;
  if (specializations) vendor.specializations = specializations;
  if (location) vendor.location = { ...vendor.location, ...location };
  if (contact) vendor.contact = { ...vendor.contact, ...contact };
  if (businessInfo) vendor.businessInfo = { ...vendor.businessInfo, ...businessInfo };

  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      basicInfo: {
        businessName: vendor.businessName,
        description: vendor.description,
        tagline: vendor.tagline,
        category: vendor.category,
        subcategories: vendor.subcategories,
        specializations: vendor.specializations,
        location: vendor.location,
        contact: vendor.contact,
        businessInfo: vendor.businessInfo
      }
    }
  }, 'Basic information updated successfully');
});

// ===== PHOTO AND MEDIA CRUD =====

// @desc    Add photos to portfolio
// @route   POST /api/weddings/vendors/:id/media
// @access  Private (Vendor only)
export const addMedia = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const { images, videos, albums } = req.body;

  // Add images
  if (images && Array.isArray(images)) {
    images.forEach((image, index) => {
      vendor.portfolio.images.push({
        url: image.url,
        alt: image.alt || vendor.businessName,
        category: image.category || 'wedding',
        event: image.event,
        isPrimary: vendor.portfolio.images.length === 0 && index === 0,
        sortOrder: vendor.portfolio.images.length + index
      });
    });
  }

  // Add videos
  if (videos && Array.isArray(videos)) {
    videos.forEach(video => {
      vendor.portfolio.videos.push(video);
    });
  }

  // Add albums
  if (albums && Array.isArray(albums)) {
    albums.forEach(album => {
      vendor.portfolio.albums.push(album);
    });
  }

  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      portfolio: vendor.portfolio
    }
  }, 'Media added successfully');
});

// @desc    Update media item
// @route   PUT /api/weddings/vendors/:id/media/:mediaId
// @access  Private (Vendor only)
export const updateMedia = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const { mediaType } = req.query; // 'image', 'video', or 'album'
  const mediaId = req.params.mediaId;

  let mediaItem;
  if (mediaType === 'image') {
    mediaItem = vendor.portfolio.images.id(mediaId);
  } else if (mediaType === 'video') {
    mediaItem = vendor.portfolio.videos.id(mediaId);
  } else if (mediaType === 'album') {
    mediaItem = vendor.portfolio.albums.id(mediaId);
  }

  if (!mediaItem) {
    return sendError(res, 'Media item not found', 404);
  }

  // Update media item
  Object.assign(mediaItem, req.body);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      portfolio: vendor.portfolio
    }
  }, 'Media updated successfully');
});

// @desc    Delete media item
// @route   DELETE /api/weddings/vendors/:id/media/:mediaId
// @access  Private (Vendor only)
export const deleteMedia = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const { mediaType } = req.query;
  const mediaId = req.params.mediaId;

  if (mediaType === 'image') {
    vendor.portfolio.images.pull(mediaId);
  } else if (mediaType === 'video') {
    vendor.portfolio.videos.pull(mediaId);
  } else if (mediaType === 'album') {
    vendor.portfolio.albums.pull(mediaId);
  }

  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      portfolio: vendor.portfolio
    }
  }, 'Media deleted successfully');
});

// ===== SERVICES OFFERED CRUD =====

// @desc    Add service
// @route   POST /api/weddings/vendors/:id/services
// @access  Private (Vendor only)
export const addService = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const serviceData = req.body;
  vendor.services.push(serviceData);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      services: vendor.services
    }
  }, 'Service added successfully');
});

// @desc    Update service
// @route   PUT /api/weddings/vendors/:id/services/:serviceId
// @access  Private (Vendor only)
export const updateService = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const service = vendor.services.id(req.params.serviceId);
  if (!service) {
    return sendError(res, 'Service not found', 404);
  }

  Object.assign(service, req.body);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      services: vendor.services
    }
  }, 'Service updated successfully');
});

// @desc    Delete service
// @route   DELETE /api/weddings/vendors/:id/services/:serviceId
// @access  Private (Vendor only)
export const deleteService = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  vendor.services.pull(req.params.serviceId);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      services: vendor.services
    }
  }, 'Service deleted successfully');
});

// ===== PACKAGES AND PRICING CRUD =====

// @desc    Add package
// @route   POST /api/weddings/vendors/:id/packages
// @access  Private (Vendor only)
export const addPackage = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const packageData = req.body;
  vendor.packages.push(packageData);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      packages: vendor.packages
    }
  }, 'Package added successfully');
});

// @desc    Update package
// @route   PUT /api/weddings/vendors/:id/packages/:packageId
// @access  Private (Vendor only)
export const updatePackage = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const packageItem = vendor.packages.id(req.params.packageId);
  if (!packageItem) {
    return sendError(res, 'Package not found', 404);
  }

  Object.assign(packageItem, req.body);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      packages: vendor.packages
    }
  }, 'Package updated successfully');
});

// @desc    Delete package
// @route   DELETE /api/weddings/vendors/:id/packages/:packageId
// @access  Private (Vendor only)
export const deletePackage = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  vendor.packages.pull(req.params.packageId);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      packages: vendor.packages
    }
  }, 'Package deleted successfully');
});

// ===== TESTIMONIALS CRUD =====

// @desc    Add testimonial (Admin/Vendor only)
// @route   POST /api/weddings/vendors/:id/testimonials
// @access  Private (Vendor only)
export const addTestimonial = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to add testimonials', 403);
  }

  const testimonialData = {
    ...req.body,
    client: req.body.clientId || req.user.id
  };

  vendor.reviews.push(testimonialData);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      reviews: vendor.reviews
    }
  }, 'Testimonial added successfully');
});

// @desc    Update testimonial
// @route   PUT /api/weddings/vendors/:id/testimonials/:testimonialId
// @access  Private (Vendor only)
export const updateTestimonial = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update testimonials', 403);
  }

  const testimonial = vendor.reviews.id(req.params.testimonialId);
  if (!testimonial) {
    return sendError(res, 'Testimonial not found', 404);
  }

  Object.assign(testimonial, req.body);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      reviews: vendor.reviews
    }
  }, 'Testimonial updated successfully');
});

// @desc    Delete testimonial
// @route   DELETE /api/weddings/vendors/:id/testimonials/:testimonialId
// @access  Private (Vendor only)
export const deleteTestimonial = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete testimonials', 403);
  }

  vendor.reviews.pull(req.params.testimonialId);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      reviews: vendor.reviews
    }
  }, 'Testimonial deleted successfully');
});

// ===== FAQ CRUD =====

// @desc    Get vendor FAQs
// @route   GET /api/weddings/vendors/:id/faqs
// @access  Public
export const getFAQs = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id).select('faqs');

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  sendSuccess(res, {
    faqs: vendor.faqs || []
  }, 'FAQs retrieved successfully');
});

// @desc    Add FAQ
// @route   POST /api/weddings/vendors/:id/faqs
// @access  Private (Vendor only)
export const addFAQ = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  if (!vendor.faqs) {
    vendor.faqs = [];
  }

  const faqData = {
    question: req.body.question,
    answer: req.body.answer,
    category: req.body.category,
    order: req.body.order || vendor.faqs.length,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  };

  vendor.faqs.push(faqData);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      faqs: vendor.faqs
    }
  }, 'FAQ added successfully');
});

// @desc    Update FAQ
// @route   PUT /api/weddings/vendors/:id/faqs/:faqId
// @access  Private (Vendor only)
export const updateFAQ = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const faq = vendor.faqs.id(req.params.faqId);
  if (!faq) {
    return sendError(res, 'FAQ not found', 404);
  }

  Object.assign(faq, req.body);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      faqs: vendor.faqs
    }
  }, 'FAQ updated successfully');
});

// @desc    Delete FAQ
// @route   DELETE /api/weddings/vendors/:id/faqs/:faqId
// @access  Private (Vendor only)
export const deleteFAQ = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  vendor.faqs.pull(req.params.faqId);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      faqs: vendor.faqs
    }
  }, 'FAQ deleted successfully');
});

// ===== OFFERS CRUD =====

// @desc    Get vendor offers
// @route   GET /api/weddings/vendors/:id/offers
// @access  Public
export const getOffers = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id).select('offers');

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  sendSuccess(res, {
    offers: vendor.offers || []
  }, 'Offers retrieved successfully');
});

// @desc    Add offer
// @route   POST /api/weddings/vendors/:id/offers
// @access  Private (Vendor only)
export const addOffer = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  if (!vendor.offers) {
    vendor.offers = [];
  }

  const offerData = {
    title: req.body.title,
    description: req.body.description,
    discountType: req.body.discountType, // 'percentage', 'fixed', 'package'
    discountValue: req.body.discountValue,
    validFrom: req.body.validFrom,
    validUntil: req.body.validUntil,
    terms: req.body.terms,
    applicableServices: req.body.applicableServices,
    maxRedemptions: req.body.maxRedemptions,
    currentRedemptions: 0,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  };

  vendor.offers.push(offerData);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      offers: vendor.offers
    }
  }, 'Offer added successfully');
});

// @desc    Update offer
// @route   PUT /api/weddings/vendors/:id/offers/:offerId
// @access  Private (Vendor only)
export const updateOffer = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  const offer = vendor.offers.id(req.params.offerId);
  if (!offer) {
    return sendError(res, 'Offer not found', 404);
  }

  Object.assign(offer, req.body);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      offers: vendor.offers
    }
  }, 'Offer updated successfully');
});

// @desc    Delete offer
// @route   DELETE /api/weddings/vendors/:id/offers/:offerId
// @access  Private (Vendor only)
export const deleteOffer = asyncHandler(async (req, res, next) => {
  const vendor = await WeddingVendor.findById(req.params.id);

  if (!vendor) {
    return sendError(res, 'Wedding vendor not found', 404);
  }

  if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this vendor profile', 403);
  }

  vendor.offers.pull(req.params.offerId);
  await vendor.save();

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      offers: vendor.offers
    }
  }, 'Offer deleted successfully');
});

// @desc    Get vendor dashboard
// @route   GET /api/weddings/vendors/dashboard
// @access  Private (Vendor only)
export const getVendorDashboard = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'wedding') {
    return sendError(res, 'Only wedding vendors can access vendor dashboard', 403);
  }

  const vendor = await WeddingVendor.findOne({ owner: req.user.id });

  if (!vendor) {
    return sendError(res, 'Vendor profile not found', 404);
  }

  // Get analytics data
  const analytics = {
    totalViews: vendor.analytics.views,
    totalInquiries: vendor.analytics.inquiries,
    totalBookings: vendor.analytics.bookings,
    conversionRate: vendor.analytics.conversionRate,
    averageRating: vendor.analytics.averageRating,
    totalRevenue: vendor.analytics.totalRevenue,
    totalServices: vendor.services.length,
    activeServices: vendor.services.filter(s => s.isActive).length,
    totalPackages: vendor.packages.length,
    activePackages: vendor.packages.filter(p => p.isActive).length,
    totalReviews: vendor.reviews.length,
    portfolioImages: vendor.portfolio.images.length,
    portfolioVideos: vendor.portfolio.videos.length
  };

  sendSuccess(res, {
    vendor: {
      id: vendor._id,
      businessName: vendor.businessName,
      category: vendor.category,
      status: vendor.status,
      verified: vendor.verified,
      featured: vendor.featured
    },
    analytics
  }, 'Vendor dashboard data retrieved successfully');
});

