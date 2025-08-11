const notFoundHandler = (req, res, next) => {
  console.log(
    `Route not found: ${req.method} ${req.originalUrl} from IP: ${req.ip}`
  );

  res.status(404).json({
    success: false,
    message: `Route not found - ${req.originalUrl}`,
    suggestion: 'Please check the API documentation for available endpoints',
    availableEndpoints: [
      'GET /api/auth/me - Get current user',
      'POST /api/auth/login - User login',
      'POST /api/auth/register - User registration',
      'GET /api/business/:slug - Get business by slug',
      'GET /api/hotels/business/:businessId - Get hotels',
      'GET /api/ecommerce/business/:businessId/products - Get products',
      'GET /api/automobiles/business/:businessId/vehicles - Get vehicles',
      'GET /health - Health check',
    ],
    timestamp: new Date().toISOString(),
  });
};

module.exports = notFoundHandler;
