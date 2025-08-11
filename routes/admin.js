const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Business = require('../models/Business');

// Admin only routes
router.use(authenticate);
router.use(authorize('admin'));

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const publishedBusinesses = await Business.countDocuments({
      'settings.isPublished': true,
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBusinesses,
        publishedBusinesses,
        activeUsers: totalUsers, // Placeholder
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
