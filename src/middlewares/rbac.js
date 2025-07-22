// Role-Based Access Control middleware

export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Permission '${permission}' required`
      });
    }

    next();
  };
};

export const checkTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // For now, basic tenant access check
  // This will be expanded based on your multi-tenant requirements
  const tenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId;
  
  if (tenantId && req.user.tenantId !== tenantId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this tenant'
    });
  }

  next();
};

