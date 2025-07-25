import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import HotelContent from '../../models/hotel/HotelContent.js';
import Hotel from '../../models/hotel/Hotel.js';

// @desc    Get all hotel content for a specific hotel
// @route   GET /api/hotel/:hotelId/content
// @access  Public
export const getHotelContent = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const { contentType, category } = req.query;

  // Build query
  let query = { hotel: hotelId };
  if (contentType) query.contentType = contentType;
  if (category) query.category = category;

  const content = await HotelContent.find(query)
    .populate('hotel', 'name slug')
    .populate('owner', 'name businessInfo')
    .sort({ priority: -1, createdAt: -1 });

  sendSuccess(res, {
    data: content,
    message: 'Hotel content retrieved successfully'
  });
});

// @desc    Get hotel content by ID
// @route   GET /api/hotel/content/:id
// @access  Public
export const getHotelContentById = asyncHandler(async (req, res, next) => {
  const content = await HotelContent.findById(req.params.id)
    .populate('hotel', 'name slug')
    .populate('owner', 'name businessInfo');

  if (!content) {
    return sendError(res, 'Hotel content not found', 404);
  }

  sendSuccess(res, {
    data: content,
    message: 'Hotel content retrieved successfully'
  });
});

// @desc    Create new hotel content
// @route   POST /api/hotel/:hotelId/content
// @access  Private (Vendor only)
export const createHotelContent = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;

  // Verify hotel exists and user owns it
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to add content to this hotel', 403);
  }

  const contentData = {
    ...req.body,
    hotel: hotelId,
    owner: req.user.id
  };

  const content = await HotelContent.create(contentData);
  await content.populate('hotel', 'name slug');
  await content.populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: content,
    message: 'Hotel content created successfully'
  }, 201);
});

// @desc    Update hotel content
// @route   PUT /api/hotel/content/:id
// @access  Private (Vendor only)
export const updateHotelContent = asyncHandler(async (req, res, next) => {
  let content = await HotelContent.findById(req.params.id);

  if (!content) {
    return sendError(res, 'Hotel content not found', 404);
  }

  // Check ownership
  if (content.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this content', 403);
  }

  content = await HotelContent.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('hotel', 'name slug').populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: content,
    message: 'Hotel content updated successfully'
  });
});

// @desc    Delete hotel content
// @route   DELETE /api/hotel/content/:id
// @access  Private (Vendor only)
export const deleteHotelContent = asyncHandler(async (req, res, next) => {
  const content = await HotelContent.findById(req.params.id);

  if (!content) {
    return sendError(res, 'Hotel content not found', 404);
  }

  // Check ownership
  if (content.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this content', 403);
  }

  await content.deleteOne();

  sendSuccess(res, {
    data: {},
    message: 'Hotel content deleted successfully'
  });
});

// @desc    Get content by type for a hotel
// @route   GET /api/hotel/:hotelId/content/:contentType
// @access  Public
export const getContentByType = asyncHandler(async (req, res, next) => {
  const { hotelId, contentType } = req.params;

  const content = await HotelContent.find({
    hotel: hotelId,
    contentType: contentType
  })
    .populate('hotel', 'name slug')
    .populate('owner', 'name businessInfo')
    .sort({ priority: -1, createdAt: -1 });

  sendSuccess(res, {
    data: content,
    message: `Hotel ${contentType} content retrieved successfully`
  });
});

// @desc    Update content priority/order
// @route   PATCH /api/hotel/content/:id/priority
// @access  Private (Vendor only)
export const updateContentPriority = asyncHandler(async (req, res, next) => {
  const { priority } = req.body;

  let content = await HotelContent.findById(req.params.id);

  if (!content) {
    return sendError(res, 'Hotel content not found', 404);
  }

  // Check ownership
  if (content.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this content', 403);
  }

  content = await HotelContent.findByIdAndUpdate(
    req.params.id,
    { priority },
    { new: true, runValidators: true }
  ).populate('hotel', 'name slug').populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: content,
    message: 'Content priority updated successfully'
  });
});

// @desc    Toggle content status (active/inactive)
// @route   PATCH /api/hotel/content/:id/status
// @access  Private (Vendor only)
export const toggleContentStatus = asyncHandler(async (req, res, next) => {
  let content = await HotelContent.findById(req.params.id);

  if (!content) {
    return sendError(res, 'Hotel content not found', 404);
  }

  // Check ownership
  if (content.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this content', 403);
  }

  content = await HotelContent.findByIdAndUpdate(
    req.params.id,
    { status: content.status === 'active' ? 'inactive' : 'active' },
    { new: true, runValidators: true }
  ).populate('hotel', 'name slug').populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: content,
    message: `Content ${content.status === 'active' ? 'activated' : 'deactivated'} successfully`
  });
});
