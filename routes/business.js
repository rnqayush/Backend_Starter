const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Placeholder routes - to be implemented
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Business management routes - coming soon'
  });
});

module.exports = router;

