const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

// Get all hotels
const getAllHotels = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, city } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'sections.about.content': { $regex: search, $options: 'i' } }
      ];
    }

    if (city) {
      query['sections.contact.info'] = {
        $elemMatch: {
          label: 'Address',
          value: { $regex: city, $options: 'i' }
        }
      };
    }

    const hotels = await Hotel.find(query)
      .populate('owner', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get hotel by ID or slug
const getHotel = async (req, res) => {
  try {
    const { id } = req.params;
    let hotel;

    // Check if it's ObjectId or slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      hotel = await Hotel.findById(id).populate('owner', 'name email');
    } else {
      hotel = await Hotel.findOne({ slug: id }).populate('owner', 'name email');
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Get hotel rooms
    const rooms = await Room.find({ hotel: hotel._id, isActive: true });

    res.json({
      success: true,
      data: {
        hotel,
        rooms
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create hotel
const createHotel = async (req, res) => {
  try {
    const hotelData = {
      ...req.body,
      owner: req.user.id
    };

    const hotel = await Hotel.create(hotelData);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { hotel }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update hotel
const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    
    let hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership or admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this hotel'
      });
    }

    hotel = await Hotel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: { hotel }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete hotel
const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership or admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hotel'
      });
    }

    // Soft delete
    await Hotel.findByIdAndUpdate(id, { isActive: false });

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel
};

