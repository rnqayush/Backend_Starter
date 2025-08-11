const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Business = require('../models/Business');

// @desc    Get all hotels for a business
// @route   GET /api/hotels/business/:businessId
// @access  Public
const getHotelsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const hotels = await Hotel.find({ business: businessId }).populate(
      'business',
      'name slug branding'
    );

    res.json({
      success: true,
      data: { hotels },
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      'business',
      'name slug branding contact'
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    res.json({
      success: true,
      data: { hotel },
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private
const createHotel = async (req, res) => {
  try {
    // Verify business ownership
    const business = await Business.findById(req.body.business);
    if (!business || business.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create hotel for this business',
      });
    }

    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { hotel },
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during hotel creation',
    });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('business');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Check ownership
    if (
      hotel.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this hotel',
      });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: { hotel: updatedHotel },
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during hotel update',
    });
  }
};

// @desc    Add room to hotel
// @route   POST /api/hotels/:id/rooms
// @access  Private
const addRoom = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('business');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Check ownership
    if (
      hotel.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add rooms to this hotel',
      });
    }

    hotel.rooms.push(req.body);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      data: { hotel },
    });
  } catch (error) {
    console.error('Add room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during room addition',
    });
  }
};

// @desc    Update room
// @route   PUT /api/hotels/:hotelId/rooms/:roomId
// @access  Private
const updateRoom = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId).populate('business');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Check ownership
    if (
      hotel.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update rooms in this hotel',
      });
    }

    const room = hotel.rooms.id(req.params.roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    Object.assign(room, req.body);
    await hotel.save();

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { hotel },
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during room update',
    });
  }
};

// @desc    Delete room
// @route   DELETE /api/hotels/:hotelId/rooms/:roomId
// @access  Private
const deleteRoom = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId).populate('business');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Check ownership
    if (
      hotel.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete rooms from this hotel',
      });
    }

    hotel.rooms.pull(req.params.roomId);
    await hotel.save();

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during room deletion',
    });
  }
};

// @desc    Search hotels
// @route   GET /api/hotels/search
// @access  Public
const searchHotels = async (req, res) => {
  try {
    const {
      city,
      checkIn,
      checkOut,
      guests,
      minPrice,
      maxPrice,
      amenities,
      starRating,
    } = req.query;

    let query = {};

    if (city) {
      query.$or = [
        { 'address.city': { $regex: city, $options: 'i' } },
        { 'address.state': { $regex: city, $options: 'i' } },
        { name: { $regex: city, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    if (starRating) {
      query.starRating = { $gte: parseInt(starRating) };
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      query.amenities = { $in: amenityList };
    }

    const hotels = await Hotel.find(query)
      .populate('business', 'name slug branding')
      .sort({ 'rating.average': -1 });

    res.json({
      success: true,
      data: {
        hotels,
        count: hotels.length,
      },
    });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during hotel search',
    });
  }
};

// @desc    Get hotel bookings
// @route   GET /api/hotels/:id/bookings
// @access  Private
const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('business');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Check ownership
    if (
      hotel.business.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bookings for this hotel',
      });
    }

    const bookings = await Booking.find({
      hotel: req.params.id,
    }).populate('user', 'name email');

    res.json({
      success: true,
      data: { bookings },
    });
  } catch (error) {
    console.error('Get hotel bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getHotelsByBusiness,
  getHotelById,
  createHotel,
  updateHotel,
  addRoom,
  updateRoom,
  deleteRoom,
  searchHotels,
  getHotelBookings,
};
