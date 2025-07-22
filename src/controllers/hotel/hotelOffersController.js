import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Hotel from '../../models/hotel/Hotel.js';

// First, let me update the Hotel model to include offers
// This will be done by adding offers field to the Hotel schema

// @desc    Get hotel offers
// @route   GET /api/hotels/:id/offers
// @access  Public
export const getHotelOffers = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id).select('offers');

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  // Filter active offers
  const activeOffers = hotel.offers ? hotel.offers.filter(offer => 
    offer.isActive && 
    new Date() >= offer.validFrom && 
    new Date() <= offer.validUntil
  ) : [];

  sendSuccess(res, {
    offers: activeOffers
  }, 'Hotel offers retrieved successfully');
});

// @desc    Get all hotel offers (including inactive)
// @route   GET /api/hotels/:id/offers/all
// @access  Private (Hotel Owner only)
export const getAllHotelOffers = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view all offers', 403);
  }

  sendSuccess(res, {
    offers: hotel.offers || []
  }, 'All hotel offers retrieved successfully');
});

// @desc    Add hotel offer
// @route   POST /api/hotels/:id/offers
// @access  Private (Hotel Owner only)
export const addHotelOffer = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to add offers to this hotel', 403);
  }

  if (!hotel.offers) {
    hotel.offers = [];
  }

  const offerData = {
    title: req.body.title,
    description: req.body.description,
    discountType: req.body.discountType, // 'percentage', 'fixed', 'package', 'free-nights'
    discountValue: req.body.discountValue,
    validFrom: req.body.validFrom,
    validUntil: req.body.validUntil,
    terms: req.body.terms || [],
    applicableRoomTypes: req.body.applicableRoomTypes || [],
    minimumStay: req.body.minimumStay || 1,
    maximumStay: req.body.maximumStay,
    advanceBookingDays: req.body.advanceBookingDays || 0,
    maxRedemptions: req.body.maxRedemptions,
    currentRedemptions: 0,
    blackoutDates: req.body.blackoutDates || [],
    isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    priority: req.body.priority || 0
  };

  hotel.offers.push(offerData);
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      offers: hotel.offers
    }
  }, 'Hotel offer added successfully');
});

// @desc    Update hotel offer
// @route   PUT /api/hotels/:id/offers/:offerId
// @access  Private (Hotel Owner only)
export const updateHotelOffer = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update offers for this hotel', 403);
  }

  const offer = hotel.offers.id(req.params.offerId);
  if (!offer) {
    return sendError(res, 'Offer not found', 404);
  }

  Object.assign(offer, req.body);
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      offers: hotel.offers
    }
  }, 'Hotel offer updated successfully');
});

// @desc    Delete hotel offer
// @route   DELETE /api/hotels/:id/offers/:offerId
// @access  Private (Hotel Owner only)
export const deleteHotelOffer = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete offers from this hotel', 403);
  }

  hotel.offers.pull(req.params.offerId);
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      offers: hotel.offers
    }
  }, 'Hotel offer deleted successfully');
});

// @desc    Toggle offer status
// @route   PUT /api/hotels/:id/offers/:offerId/toggle
// @access  Private (Hotel Owner only)
export const toggleOfferStatus = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify offers for this hotel', 403);
  }

  const offer = hotel.offers.id(req.params.offerId);
  if (!offer) {
    return sendError(res, 'Offer not found', 404);
  }

  offer.isActive = !offer.isActive;
  await hotel.save();

  sendSuccess(res, {
    hotel: {
      id: hotel._id,
      offer: {
        id: offer._id,
        title: offer.title,
        isActive: offer.isActive
      }
    }
  }, `Offer ${offer.isActive ? 'activated' : 'deactivated'} successfully`);
});

// @desc    Get offer analytics
// @route   GET /api/hotels/:id/offers/:offerId/analytics
// @access  Private (Hotel Owner only)
export const getOfferAnalytics = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view offer analytics', 403);
  }

  const offer = hotel.offers.id(req.params.offerId);
  if (!offer) {
    return sendError(res, 'Offer not found', 404);
  }

  const analytics = {
    totalRedemptions: offer.currentRedemptions,
    maxRedemptions: offer.maxRedemptions,
    redemptionRate: offer.maxRedemptions ? 
      ((offer.currentRedemptions / offer.maxRedemptions) * 100).toFixed(2) : 'Unlimited',
    daysActive: Math.ceil((new Date() - offer.validFrom) / (1000 * 60 * 60 * 24)),
    daysRemaining: Math.ceil((offer.validUntil - new Date()) / (1000 * 60 * 60 * 24)),
    isExpired: new Date() > offer.validUntil,
    isActive: offer.isActive
  };

  sendSuccess(res, {
    offer: {
      id: offer._id,
      title: offer.title,
      analytics
    }
  }, 'Offer analytics retrieved successfully');
});

// @desc    Apply offer to booking (validation)
// @route   POST /api/hotels/:id/offers/:offerId/validate
// @access  Public
export const validateOffer = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  const offer = hotel.offers.id(req.params.offerId);
  if (!offer) {
    return sendError(res, 'Offer not found', 404);
  }

  const { checkIn, checkOut, roomType, totalAmount } = req.body;

  // Validation checks
  const validationResult = {
    isValid: true,
    errors: [],
    discountAmount: 0,
    finalAmount: totalAmount
  };

  // Check if offer is active
  if (!offer.isActive) {
    validationResult.isValid = false;
    validationResult.errors.push('Offer is not active');
  }

  // Check date validity
  const now = new Date();
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (now < offer.validFrom || now > offer.validUntil) {
    validationResult.isValid = false;
    validationResult.errors.push('Offer is not valid for the current date');
  }

  // Check blackout dates
  const isBlackedOut = offer.blackoutDates.some(blackout => {
    return (checkInDate <= blackout.endDate && checkOutDate >= blackout.startDate);
  });

  if (isBlackedOut) {
    validationResult.isValid = false;
    validationResult.errors.push('Offer is not valid for selected dates (blackout period)');
  }

  // Check minimum/maximum stay
  const stayDuration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  
  if (stayDuration < offer.minimumStay) {
    validationResult.isValid = false;
    validationResult.errors.push(`Minimum stay of ${offer.minimumStay} nights required`);
  }

  if (offer.maximumStay && stayDuration > offer.maximumStay) {
    validationResult.isValid = false;
    validationResult.errors.push(`Maximum stay of ${offer.maximumStay} nights allowed`);
  }

  // Check advance booking requirement
  const advanceBookingDays = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));
  if (advanceBookingDays < offer.advanceBookingDays) {
    validationResult.isValid = false;
    validationResult.errors.push(`Must book at least ${offer.advanceBookingDays} days in advance`);
  }

  // Check room type applicability
  if (offer.applicableRoomTypes.length > 0 && !offer.applicableRoomTypes.includes(roomType)) {
    validationResult.isValid = false;
    validationResult.errors.push('Offer is not applicable to selected room type');
  }

  // Check redemption limit
  if (offer.maxRedemptions && offer.currentRedemptions >= offer.maxRedemptions) {
    validationResult.isValid = false;
    validationResult.errors.push('Offer redemption limit reached');
  }

  // Calculate discount if valid
  if (validationResult.isValid) {
    switch (offer.discountType) {
      case 'percentage':
        validationResult.discountAmount = (totalAmount * offer.discountValue) / 100;
        break;
      case 'fixed':
        validationResult.discountAmount = offer.discountValue;
        break;
      case 'free-nights':
        // Calculate based on average nightly rate
        const avgNightlyRate = totalAmount / stayDuration;
        validationResult.discountAmount = avgNightlyRate * offer.discountValue;
        break;
      default:
        validationResult.discountAmount = 0;
    }

    validationResult.finalAmount = Math.max(0, totalAmount - validationResult.discountAmount);
  }

  sendSuccess(res, {
    offer: {
      id: offer._id,
      title: offer.title,
      description: offer.description
    },
    validation: validationResult
  }, 'Offer validation completed');
});

