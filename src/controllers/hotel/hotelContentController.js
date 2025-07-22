import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Hotel from '../../models/hotel/Hotel.js';

// ===== HOTEL CONTENT MANAGEMENT =====

// @desc    Update hotel content
// @route   PUT /api/hotels/:id/content
// @access  Private (Hotel Owner only)
export const updateHotelContent = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this hotel content', 403);
  }

  const { 
    description, 
    shortDescription, 
    amenities, 
    policies, 
    location,
    seo 
  } = req.body;

  // Update content fields
  if (description) hotel.description = description;
  if (shortDescription) hotel.shortDescription = shortDescription;
  if (amenities) hotel.amenities = { ...hotel.amenities, ...amenities };
  if (policies) hotel.policies = { ...hotel.policies, ...policies };
  if (location) hotel.location = { ...hotel.location, ...location };
  if (seo) hotel.seo = { ...hotel.seo, ...seo };

  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      content: {
        description: hotel.description,
        shortDescription: hotel.shortDescription,
        amenities: hotel.amenities,
        policies: hotel.policies,
        location: hotel.location,
        seo: hotel.seo
      }
    }
  }, 'Hotel content updated successfully');
});

// @desc    Add hotel images
// @route   POST /api/hotels/:id/images
// @access  Private (Hotel Owner only)
export const addHotelImages = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this hotel', 403);
  }

  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return sendError(res, 'Images array is required', 400);
  }

  // Add images to hotel
  images.forEach((image, index) => {
    hotel.images.push({
      url: image.url,
      alt: image.alt || hotel.name,
      category: image.category || 'exterior',
      isPrimary: hotel.images.length === 0 && index === 0,
      sortOrder: hotel.images.length + index
    });
  });

  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      images: hotel.images
    }
  }, 'Hotel images added successfully');
});

// @desc    Update hotel image
// @route   PUT /api/hotels/:id/images/:imageId
// @access  Private (Hotel Owner only)
export const updateHotelImage = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this hotel', 403);
  }

  const image = hotel.images.id(req.params.imageId);
  if (!image) {
    return sendError(res, 'Image not found', 404);
  }

  Object.assign(image, req.body);
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      images: hotel.images
    }
  }, 'Hotel image updated successfully');
});

// @desc    Delete hotel image
// @route   DELETE /api/hotels/:id/images/:imageId
// @access  Private (Hotel Owner only)
export const deleteHotelImage = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this hotel', 403);
  }

  // Remove image from array
  hotel.images = hotel.images.filter(img => img._id.toString() !== req.params.imageId);
  
  // If we removed the primary image, make the first remaining image primary
  if (hotel.images.length > 0 && !hotel.images.some(img => img.isPrimary)) {
    hotel.images[0].isPrimary = true;
  }

  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      images: hotel.images
    }
  }, 'Hotel image deleted successfully');
});

// @desc    Add hotel videos
// @route   POST /api/hotels/:id/videos
// @access  Private (Hotel Owner only)
export const addHotelVideos = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this hotel', 403);
  }

  const { videos } = req.body;

  if (!videos || !Array.isArray(videos)) {
    return sendError(res, 'Videos array is required', 400);
  }

  // Add videos to hotel
  videos.forEach(video => {
    hotel.videos.push(video);
  });

  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      videos: hotel.videos
    }
  }, 'Hotel videos added successfully');
});

// @desc    Update hotel video
// @route   PUT /api/hotels/:id/videos/:videoId
// @access  Private (Hotel Owner only)
export const updateHotelVideo = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this hotel', 403);
  }

  const video = hotel.videos.id(req.params.videoId);
  if (!video) {
    return sendError(res, 'Video not found', 404);
  }

  Object.assign(video, req.body);
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      videos: hotel.videos
    }
  }, 'Hotel video updated successfully');
});

// @desc    Delete hotel video
// @route   DELETE /api/hotels/:id/videos/:videoId
// @access  Private (Hotel Owner only)
export const deleteHotelVideo = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this hotel', 403);
  }

  hotel.videos.pull(req.params.videoId);
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      videos: hotel.videos
    }
  }, 'Hotel video deleted successfully');
});

// @desc    Update hotel amenities
// @route   PUT /api/hotels/:id/amenities
// @access  Private (Hotel Owner only)
export const updateAmenities = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this hotel', 403);
  }

  const { general, room, dining, recreation } = req.body;

  if (general) hotel.amenities.general = general;
  if (room) hotel.amenities.room = room;
  if (dining) hotel.amenities.dining = dining;
  if (recreation) hotel.amenities.recreation = recreation;

  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      amenities: hotel.amenities
    }
  }, 'Hotel amenities updated successfully');
});

// @desc    Update hotel policies
// @route   PUT /api/hotels/:id/policies
// @access  Private (Hotel Owner only)
export const updatePolicies = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this hotel', 403);
  }

  const { checkIn, checkOut, cancellation, children, pets, smoking, payment } = req.body;

  if (checkIn) hotel.policies.checkIn = { ...hotel.policies.checkIn, ...checkIn };
  if (checkOut) hotel.policies.checkOut = { ...hotel.policies.checkOut, ...checkOut };
  if (cancellation) hotel.policies.cancellation = cancellation;
  if (children) hotel.policies.children = { ...hotel.policies.children, ...children };
  if (pets) hotel.policies.pets = { ...hotel.policies.pets, ...pets };
  if (smoking) hotel.policies.smoking = { ...hotel.policies.smoking, ...smoking };
  if (payment) hotel.policies.payment = { ...hotel.policies.payment, ...payment };

  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      policies: hotel.policies
    }
  }, 'Hotel policies updated successfully');
});

// @desc    Get hotel content
// @route   GET /api/hotels/:id/content
// @access  Public
export const getHotelContent = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id).select('description shortDescription amenities policies location images videos seo');

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  sendSuccess(res, {
    content: {
      description: hotel.description,
      shortDescription: hotel.shortDescription,
      amenities: hotel.amenities,
      policies: hotel.policies,
      location: hotel.location,
      images: hotel.images,
      videos: hotel.videos,
      seo: hotel.seo
    }
  }, 'Hotel content retrieved successfully');
});

