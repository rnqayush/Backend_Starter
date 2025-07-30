const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('business', 'name')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    req.body.customer = req.user.id;
    
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

