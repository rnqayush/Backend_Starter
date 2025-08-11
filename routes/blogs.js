const express = require('express');
const router = express.Router();
// Placeholder for blog routes
router.get('/', (req, res) => {
  res.json({ success: true, data: { blogs: [] } });
});

module.exports = router;
