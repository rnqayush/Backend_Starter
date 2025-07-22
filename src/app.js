import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import ecommerceRoutes from './routes/tenants/ecommerce.routes.js';
import automobileRoutes from './routes/tenants/automobile.routes.js';
import hotelRoutes from './routes/tenants/hotel.routes.js';
import weddingRoutes from './routes/tenants/wedding.routes.js';
import businessRoutes from './routes/tenants/business.routes.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('src/public'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ecommerce', ecommerceRoutes);
app.use('/api/automobile', automobileRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/wedding', weddingRoutes);
app.use('/api/business', businessRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;

