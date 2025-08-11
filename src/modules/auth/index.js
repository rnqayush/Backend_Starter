const express = require('express');
const authRoutes = require('./routes/authRoutes');

/**
 * Authentication Module
 * Handles user authentication, authorization, and profile management
 */
class AuthModule {
  constructor() {
    this.name = 'auth';
    this.version = '1.0.0';
    this.description = 'Authentication and authorization module';
    this.routes = authRoutes;
  }

  /**
   * Initialize the auth module
   * @param {Object} app - Express app instance
   */
  init(app) {
    console.log(`🔐 Initializing ${this.name} module v${this.version}`);
    
    // Register auth routes
    app.use('/api/auth', this.routes);
    
    console.log(`✅ ${this.name} module initialized successfully`);
    
    return {
      name: this.name,
      version: this.version,
      description: this.description,
      routes: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'POST /api/auth/refresh-token',
        'GET /api/auth/profile',
        'PUT /api/auth/profile',
        'POST /api/auth/change-password',
        'POST /api/auth/forgot-password',
        'POST /api/auth/reset-password/:token',
        'GET /api/auth/verify-email/:token',
        'POST /api/auth/switch-role',
        'GET /api/auth/permissions',
        'DELETE /api/auth/account',
      ],
    };
  }

  /**
   * Get module health status
   */
  getHealth() {
    return {
      module: this.name,
      status: 'healthy',
      version: this.version,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new AuthModule();

