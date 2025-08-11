const express = require('express');
const router = express.Router();
// Placeholder for platform routes
router.get('/categories', (req, res) => {
  res.json({ success: true, data: { categories: [] } });
});

module.exports = router;
