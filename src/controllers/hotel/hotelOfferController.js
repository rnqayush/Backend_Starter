import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import HotelOffer from '../../models/hotel/HotelOffer.js';
import Hotel from '../../models/hotel/Hotel.js';

// @desc    Get all hotel offers
// @route   GET /api/hotel/offers
// @access  Public
export const getHotelOffers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build query
  let query = { status: 'active' };
  
  // Filter by hotel if specified
  if (req.query.hotel) {
    query.hotel = req.query.hotel;
  }

  // Filter by offer type
  if (req.query.offerType) {
    query.offerType = req.query.offerType;
  }

  // Filter by validity
  if (req.query.validOnly === 'true') {
    const now = new Date();
    query.validFrom = { $lte: now };
    query.validUntil = { $gte: now };
  }

  // Sort options
  let sortBy = { priority: -1, createdAt: -1 };
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'discount-high':
        sortBy = { 'discount.value': -1 };
        break;
      case 'discount-low':
        sortBy = { 'discount.value': 1 };
        break;
      case 'expiry':
        sortBy = { validUntil: 1 };
        break;
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      default:
        sortBy = { priority: -1, createdAt: -1 };
    }
  }

  const offers = await HotelOffer.find(query)
    .populate('hotel', 'name slug images location')
    .populate('owner', 'name businessInfo')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  const total = await HotelOffer.countDocuments(query);

  sendSuccess(res, {
    data: {
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    },
    message: 'Hotel offers retrieved successfully'
  });
});

// @desc    Get hotel offers for a specific hotel
// @route   GET /api/hotel/:hotelId/offers
// @access  Public
export const getHotelOffersByHotel = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const { status = 'active' } = req.query;

  const offers = await HotelOffer.find({
    hotel: hotelId,
    status: status
  })
    .populate('hotel', 'name slug')
    .populate('owner', 'name businessInfo')
    .sort({ priority: -1, createdAt: -1 });

  sendSuccess(res, {
    data: offers,
    message: 'Hotel offers retrieved successfully'
  });
});

// @desc    Get hotel offer by ID
// @route   GET /api/hotel/offers/:id
// @access  Public
export const getHotelOfferById = asyncHandler(async (req, res, next) => {
  const offer = await HotelOffer.findById(req.params.id)
    .populate('hotel', 'name slug images location')
    .populate('owner', 'name businessInfo');

  if (!offer) {
    return sendError(res, 'Hotel offer not found', 404);
  }

  // Increment view count
  await HotelOffer.findByIdAndUpdate(req.params.id, {
    $inc: { 'analytics.views': 1 }
  });

  sendSuccess(res, {
    data: offer,
    message: 'Hotel offer retrieved successfully'
  });
});

// @desc    Create new hotel offer
// @route   POST /api/hotel/:hotelId/offers
// @access  Private (Vendor only)
export const createHotelOffer = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;

  // Verify hotel exists and user owns it
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to create offers for this hotel', 403);
  }

  const offerData = {
    ...req.body,
    hotel: hotelId,
    owner: req.user.id
  };

  const offer = await HotelOffer.create(offerData);
  await offer.populate('hotel', 'name slug');
  await offer.populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: offer,
    message: 'Hotel offer created successfully'
  }, 201);
});

// @desc    Update hotel offer
// @route   PUT /api/hotel/offers/:id
// @access  Private (Vendor only)
export const updateHotelOffer = asyncHandler(async (req, res, next) => {
  let offer = await HotelOffer.findById(req.params.id);

  if (!offer) {
    return sendError(res, 'Hotel offer not found', 404);
  }

  // Check ownership
  if (offer.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this offer', 403);
  }

  offer = await HotelOffer.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('hotel', 'name slug').populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: offer,
    message: 'Hotel offer updated successfully'
  });
});

// @desc    Delete hotel offer
// @route   DELETE /api/hotel/offers/:id
// @access  Private (Vendor only)
export const deleteHotelOffer = asyncHandler(async (req, res, next) => {
  const offer = await HotelOffer.findById(req.params.id);

  if (!offer) {
    return sendError(res, 'Hotel offer not found', 404);
  }

  // Check ownership
  if (offer.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to delete this offer', 403);
  }

  await offer.deleteOne();

  sendSuccess(res, {
    data: {},
    message: 'Hotel offer deleted successfully'
  });
});

// @desc    Get vendor's hotel offers
// @route   GET /api/hotel/vendor/my-offers
// @access  Private (Vendor only)
export const getVendorOffers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = { owner: req.user.id };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by hotel
  if (req.query.hotel) {
    query.hotel = req.query.hotel;
  }

  const offers = await HotelOffer.find(query)
    .populate('hotel', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await HotelOffer.countDocuments(query);

  sendSuccess(res, {
    data: {
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    },
    message: 'Vendor offers retrieved successfully'
  });
});

// @desc    Toggle offer status
// @route   PATCH /api/hotel/offers/:id/status
// @access  Private (Vendor only)
export const toggleOfferStatus = asyncHandler(async (req, res, next) => {
  let offer = await HotelOffer.findById(req.params.id);

  if (!offer) {
    return sendError(res, 'Hotel offer not found', 404);
  }

  // Check ownership
  if (offer.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to update this offer', 403);
  }

  offer = await HotelOffer.findByIdAndUpdate(
    req.params.id,
    { status: offer.status === 'active' ? 'inactive' : 'active' },
    { new: true, runValidators: true }
  ).populate('hotel', 'name slug').populate('owner', 'name businessInfo');

  sendSuccess(res, {
    data: offer,
    message: `Offer ${offer.status === 'active' ? 'activated' : 'deactivated'} successfully`
  });
});

// @desc    Get offer analytics
// @route   GET /api/hotel/offers/:id/analytics
// @access  Private (Vendor only)
export const getOfferAnalytics = asyncHandler(async (req, res, next) => {
  const offer = await HotelOffer.findById(req.params.id);

  if (!offer) {
    return sendError(res, 'Hotel offer not found', 404);
  }

  // Check ownership
  if (offer.owner.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to view analytics for this offer', 403);
  }

  sendSuccess(res, {
    data: {
      analytics: offer.analytics,
      performance: {
        conversionRate: offer.analytics.bookings > 0 ? 
          (offer.analytics.bookings / offer.analytics.views * 100).toFixed(2) : 0,
        clickThroughRate: offer.analytics.clicks > 0 ? 
          (offer.analytics.clicks / offer.analytics.views * 100).toFixed(2) : 0
      }
    },
    message: 'Offer analytics retrieved successfully'
  });
});
