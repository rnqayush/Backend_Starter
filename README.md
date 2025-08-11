# 🚀 Multi-Vendor Platform Backend

A comprehensive, scalable backend API for a multi-vendor platform supporting **Hotels**, **Ecommerce**, **Automobiles**, **Weddings**, and **Business Services**. Built with Node.js, Express, and MongoDB.

## 📋 **Table of Contents**

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Module Structure](#module-structure)
- [Authentication](#authentication)
- [File Upload](#file-upload)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ **Features**

### 🏨 **Hotel Management**
- Hotel registration and management
- Room inventory and availability
- Booking system with real-time updates
- Owner dashboard and analytics
- Dynamic pricing and promotions

### 🛒 **Ecommerce Platform**
- Multi-vendor product catalog
- Inventory management
- Shopping cart and checkout
- Order processing and tracking
- Seller dashboard and analytics

### 🚗 **Automobile Dealership**
- Vehicle inventory management
- Dealer profiles and verification
- Advanced search and filtering
- Financing options integration
- Vehicle history and documentation

### 💒 **Wedding Services**
- Vendor portfolio management
- Service booking system
- Gallery and testimonials
- Event planning tools
- Vendor discovery and matching

### 🏢 **Business Services**
- Business template management
- Service listings and portfolios
- Client management system
- Project tracking
- Professional networking

### 🔐 **Core Features**
- JWT-based authentication
- Role-based access control (Customer, Vendor, Admin)
- File upload with image processing
- Real-time notifications
- Advanced search and filtering
- Payment processing (Stripe integration)
- Email notifications
- Analytics and reporting
- SEO optimization
- Multi-language support

## 🏗️ **Architecture**

### **Modular Design**
```
Backend_Starter/
├── app.js                          # Main application entry point
├── src/
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── models/                     # Mongoose models
│   │   ├── User.js
│   │   ├── Hotel.js
│   │   ├── Automobile.js
│   │   ├── Ecommerce.js
│   │   ├── Wedding.js
│   │   ├── Business.js
│   │   └── Blog.js
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── utils/                      # Utility functions
│   │   ├── moduleRegistry.js       # Dynamic module loading
│   │   ├── responseHelper.js       # Standardized responses
│   │   └── validation.js           # Validation helpers
│   └── modules/                    # Business logic modules
│       ├── auth/                   # Authentication module
│       ├── hotel/                  # Hotel management
│       ├── ecommerce/              # Ecommerce platform
│       ├── automobile/             # Vehicle dealership
│       ├── wedding/                # Wedding services
│       ├── business/               # Business services
│       ├── blog/                   # Blog management
│       └── platform/               # Platform-wide features
├── uploads/                        # File upload directory
├── logs/                          # Application logs
└── scripts/                       # Database scripts
```

### **Dynamic Module Loading**
The system uses a **Module Registry** that automatically discovers and loads business modules, making it easy to add new verticals without modifying core application code.

## 🛠️ **Tech Stack**

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **File Upload**: Multer + Sharp (image processing)
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer
- **Payments**: Stripe
- **Cloud Storage**: AWS S3 / Cloudinary
- **Caching**: Redis
- **Logging**: Winston
- **Testing**: Jest + Supertest

### **DevOps & Tools**
- **Process Manager**: PM2
- **Containerization**: Docker
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + Lint-staged
- **Documentation**: JSDoc
- **Monitoring**: Winston + Morgan

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18.0.0 or higher
- MongoDB 5.0 or higher
- npm 8.0.0 or higher

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnqayush/Backend_Starter.git
   cd Backend_Starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 📚 **API Documentation**

### **Base URL**
```
http://localhost:5000/api
```

### **Authentication Endpoints**
```http
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
GET    /api/auth/me                # Get current user
PUT    /api/auth/profile           # Update profile
POST   /api/auth/forgot-password   # Forgot password
PUT    /api/auth/reset-password    # Reset password
```

### **Module Endpoints**
```http
# Hotel Management
GET    /api/hotel/hotels           # Get all hotels
POST   /api/hotel/hotels           # Create hotel
GET    /api/hotel/hotels/:id       # Get hotel by ID
PUT    /api/hotel/hotels/:id       # Update hotel
DELETE /api/hotel/hotels/:id       # Delete hotel
POST   /api/hotel/bookings         # Create booking
GET    /api/hotel/bookings         # Get bookings

# Ecommerce
GET    /api/ecommerce/products     # Get all products
POST   /api/ecommerce/products     # Create product
GET    /api/ecommerce/vendors      # Get all vendors
POST   /api/ecommerce/orders       # Create order
GET    /api/ecommerce/cart         # Get cart items

# Automobile
GET    /api/automobile/dealers     # Get all dealers
POST   /api/automobile/dealers     # Create dealer
GET    /api/automobile/vehicles    # Get all vehicles
POST   /api/automobile/vehicles    # Add vehicle
GET    /api/automobile/search      # Search vehicles

# Wedding Services
GET    /api/wedding/vendors        # Get wedding vendors
POST   /api/wedding/vendors        # Create vendor
GET    /api/wedding/services       # Get services
POST   /api/wedding/bookings       # Create booking

# Business Services
GET    /api/business/templates     # Get business templates
POST   /api/business/templates     # Create template
GET    /api/business/services      # Get services
POST   /api/business/projects      # Create project
```

### **Response Format**
All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🗄️ **Database Models**

### **User Model**
- Authentication and profile management
- Role-based access (Customer, Vendor, Admin)
- Business information for vendors
- Preferences and settings
- Activity tracking

### **Hotel Model**
- Hotel information and branding
- Room inventory with detailed specifications
- Amenities and services
- Booking management
- Reviews and ratings
- Dynamic page sections

### **Automobile Model (Dealer)**
- Dealer profile and verification
- Vehicle inventory with comprehensive details
- Financing options and warranties
- Service offerings
- Sales tracking and analytics

### **Ecommerce Models**
- Vendor profiles and store management
- Product catalog with variants
- Inventory tracking
- Order processing
- Payment integration

### **Wedding Model**
- Vendor portfolios and specializations
- Service packages and pricing
- Gallery and testimonials
- Booking and event management
- Client communication tools

### **Business Model**
- Business templates and customization
- Service listings and portfolios
- Client and project management
- Professional networking features

## 🔐 **Authentication**

### **JWT Implementation**
- Access tokens (7 days expiry)
- Refresh tokens (30 days expiry)
- Role-based middleware protection
- Secure password hashing with bcrypt

### **Protected Routes**
```javascript
// Protect routes with authentication
router.use(protect);

// Restrict to specific roles
router.use(restrictTo('admin', 'vendor'));

// Example usage
router.get('/dashboard', protect, restrictTo('vendor'), getDashboard);
```

### **Social Authentication**
- Google OAuth 2.0
- Facebook Login
- Passport.js integration

## 📁 **File Upload**

### **Supported Features**
- Image upload with automatic resizing
- Multiple file formats (JPEG, PNG, PDF, DOC)
- Cloud storage integration (AWS S3, Cloudinary)
- File validation and security checks
- Automatic thumbnail generation

### **Usage Example**
```javascript
// Single file upload
router.post('/upload', upload.single('image'), uploadController);

// Multiple files
router.post('/gallery', upload.array('images', 10), galleryController);
```

## ⚙️ **Environment Variables**

Create a `.env` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/multi_vendor_platform

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Cloud Storage (Optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your-bucket-name
```

## 📜 **Scripts**

```bash
# Development
npm run dev              # Start with nodemon
npm start               # Production start

# Testing
npm test                # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # Fix ESLint issues
npm run format          # Prettier formatting

# Database
npm run seed            # Seed database
npm run migrate         # Run migrations

# Docker
npm run docker:build    # Build Docker image
npm run docker:run      # Run container
```

## 🧪 **Testing**

### **Test Structure**
```
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── fixtures/           # Test data
└── helpers/            # Test utilities
```

### **Running Tests**
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- user.test.js
```

## 🚀 **Deployment**

### **Production Checklist**
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

### **Docker Deployment**
```bash
# Build image
docker build -t multi-vendor-backend .

# Run container
docker run -d \
  --name multi-vendor-api \
  -p 5000:5000 \
  --env-file .env \
  multi-vendor-backend
```

### **PM2 Deployment**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start app.js --name "multi-vendor-api"

# Monitor
pm2 monit

# Logs
pm2 logs multi-vendor-api
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Built with modern Node.js best practices
- Inspired by enterprise-level architecture patterns
- Designed for scalability and maintainability
- Community-driven development approach

---

## 📞 **Support**

For support, email support@multivendorplatform.com or create an issue in the GitHub repository.

## 🔗 **Links**

- [Frontend Repository](https://github.com/rnqayush/starter)
- [API Documentation](https://api.multivendorplatform.com/docs)
- [Live Demo](https://multivendorplatform.com)

---

**Made with ❤️ by the Multi-Vendor Platform Team**
