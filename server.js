const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import core modules
const database = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { resolveTenant } = require('./middleware/tenantResolver');

// Import routes
const authRoutes = require('./routes/auth');
const websiteRoutes = require('./routes/website');
const hotelRoutes = require('./routes/hotel');
const ecommerceRoutes = require('./routes/ecommerce');
const weddingRoutes = require('./routes/wedding');
const automobileRoutes = require('./routes/automobile');
const businessRoutes = require('./routes/business');

/**
 * Multi-Tenant Website Builder Backend Server
 * Modular architecture supporting Hotels, E-commerce, Weddings, Automobiles, and Business Services
 */
class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize middleware
   */
  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
          scriptSrc: ["'self'"],
        },
      },
    }));

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug']
    };
    this.app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        errorCode: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Trust proxy (for deployment behind reverse proxy)
    this.app.set('trust proxy', 1);

    // Tenant resolution middleware (applies to all routes)
    this.app.use(resolveTenant);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }

  /**
   * Initialize routes
   */
  initializeRoutes() {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/websites', websiteRoutes);

    // Business module routes
    this.app.use('/api/hotels', hotelRoutes);
    this.app.use('/api/ecommerce', ecommerceRoutes);
    this.app.use('/api/wedding', weddingRoutes);
    this.app.use('/api/automobile', automobileRoutes);
    this.app.use('/api/business', businessRoutes);

    // Tenant-specific routes (for public-facing websites)
    // this.app.use('/:slug', tenantRoutes);

    // API documentation (in development)
    if (process.env.NODE_ENV === 'development') {
      // Swagger documentation will be added here
      this.app.get('/api/docs', (req, res) => {
        res.json({
          message: 'API Documentation will be available here',
          endpoints: {
            auth: '/api/auth',
            websites: '/api/websites',
            hotels: '/api/hotels',
            ecommerce: '/api/ecommerce',
            wedding: '/api/wedding',
            automobile: '/api/automobile',
            business: '/api/business',
            health: '/health'
          }
        });
      });
    }

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Multi-Tenant Website Builder API',
        version: '1.0.0',
        documentation: process.env.NODE_ENV === 'development' ? '/api/docs' : null,
        health: '/health'
      });
    });
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Connect to database
      await database.connect();

      // Start server
      this.server = this.app.listen(this.port, () => {
        console.log(`
🚀 Multi-Tenant Website Builder Server Started!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Server running on port ${this.port}
📊 Database: ${database.isConnected() ? '✅ Connected' : '❌ Disconnected'}
🔗 API Base URL: http://localhost:${this.port}/api
📖 Health Check: http://localhost:${this.port}/health
${process.env.NODE_ENV === 'development' ? '📚 API Docs: http://localhost:' + this.port + '/api/docs' : ''}

🏢 Supported Business Modules:
   🏨 Hotels
   🛒 E-commerce
   💍 Weddings
   🚗 Automobiles
   🏢 Business Services
        `);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Setup graceful shutdown
   */
  setupGracefulShutdown() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      // Close server
      if (this.server) {
        this.server.close(async () => {
          console.log('🔌 HTTP server closed');
          
          // Close database connection
          await database.disconnect();
          
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        });
      }

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
  }
}

// Create and start server
const server = new Server();
server.start();

module.exports = server;
