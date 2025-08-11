const express = require('express');
const router = express.Router();
// Placeholder for wedding routes
router.get('/business/:businessId/services', (req, res) => {
  res.json({ success: true, data: { services: [] } });
});

module.exports = router;
