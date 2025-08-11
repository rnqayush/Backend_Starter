const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({ success: true, data: { users: [] } });
});

module.exports = router;
