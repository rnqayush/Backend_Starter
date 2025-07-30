const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active', isActive: true })
      .populate('business', 'name slug')
      .select('-reviews');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Business Owner)
router.post('/', protect, authorize('business_owner', 'admin'), async (req, res) => {
  try {
    req.body.business = req.body.businessId || req.user.businesses[0];
    
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

