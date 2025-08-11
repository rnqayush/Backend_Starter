const express = require('express');
const {
  getAllRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');
const { auth } = require('../../../shared/middleware/auth');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', getAllRooms);

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Public
router.get('/:id', getRoom);

// @route   POST /api/rooms
// @desc    Create room
// @access  Private (Hotel Owner/Admin)
router.post('/', auth, createRoom);

// @route   PUT /api/rooms/:id
// @desc    Update room
// @access  Private (Owner/Admin)
router.put('/:id', auth, updateRoom);

// @route   DELETE /api/rooms/:id
// @desc    Delete room
// @access  Private (Owner/Admin)
router.delete('/:id', auth, deleteRoom);

module.exports = router;
