# Backend_Starter - Multivendor Platform API

A comprehensive Express.js + MongoDB backend for a multivendor platform with clean MVC architecture, JWT authentication, and role-based access control.

## 🚀 Features

### Core Features
- **Clean MVC Architecture** with organized folders (controllers, models, routes, middlewares, config, utils)
- **JWT-based Authentication** with bcrypt password hashing
- **Role-based Access Control** (customer, vendor, admin)
- **MongoDB Integration** with Mongoose ODM
- **ES6 Modules** support
- **Comprehensive Error Handling** with centralized middleware
- **API Response Formatting** with consistent structure
- **Request Logging** with Morgan
- **Rate Limiting** for API protection
- **CORS Configuration** for cross-origin requests

### User Management
- **Customer Registration/Login** with profile management
- **Vendor Registration/Login** with business profile management
- **Admin Authentication** with vendor management capabilities
- **Password Change** functionality
- **Profile Updates** for all user types

### Vendor Management
- **Vendor Registration** with business details
- **Vendor Approval System** (admin approval required)
- **Vendor Status Management** (pending, approved, rejected, suspended)
- **Category-based Vendor Classification** (hotel, ecommerce, automobile, wedding)

### Category-Specific Modules
- **Hotel Management** - Create, manage hotel listings with amenities, pricing, location
- **Ecommerce Products** - Product catalog with inventory, pricing, specifications
- **Automobile Listings** - Vehicle listings for sale/rent with detailed specifications
- **Wedding Services** - Wedding venue and service management with capacity, features

### Advanced Features
- **Pagination & Filtering** on all listing endpoints
- **Soft Delete Support** with isDeleted flag
- **Timestamps** on all records
- **Global Search** functionality across categories
- **Dashboard Statistics** for vendors and admins
- **Homepage Content** with category stats

## 📁 Project Structure

```
Backend_Starter/
├── config/
│   ├── config.js          # Environment configuration
│   └── database.js        # MongoDB connection setup
├── controllers/
│   ├── adminController.js      # Admin management
│   ├── authController.js       # Authentication
│   ├── automobileController.js # Vehicle listings
│   ├── ecommerceController.js  # Product management
│   ├── homepageController.js   # Homepage & search
│   ├── hotelController.js      # Hotel management
│   ├── vendorController.js     # Vendor operations
│   └── weddingController.js    # Wedding services
├── middlewares/
│   ├── auth.js            # JWT authentication middleware
│   ├── errorHandler.js    # Global error handling
│   ├── logger.js          # Request logging
│   ├── roleAuth.js        # Role-based authorization
│   └── validateRequest.js # Request validation
├── models/
│   ├── Automobile.js      # Vehicle model
│   ├── Ecommerce.js       # Product model
│   ├── Hotel.js           # Hotel model
│   ├── User.js            # User model
│   ├── Vendor.js          # Vendor model
│   └── Wedding.js         # Wedding service model
├── routes/
│   ├── adminRoutes.js     # Admin endpoints
│   ├── authRoutes.js      # Authentication endpoints
│   ├── automobileRoutes.js # Vehicle endpoints
│   ├── ecommerceRoutes.js  # Product endpoints
│   ├── homepageRoutes.js   # Homepage endpoints
│   ├── hotelRoutes.js      # Hotel endpoints
│   ├── testRoutes.js       # Health check endpoints
│   ├── vendorRoutes.js     # Vendor endpoints
│   └── weddingRoutes.js    # Wedding endpoints
├── utils/
│   ├── asyncHandler.js    # Async error handling
│   └── responseFormatter.js # API response formatting
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env.example           # Environment variables template
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/rnqayush/Backend_Starter.git
cd Backend_Starter
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/multivendor_platform

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production
JWT_REFRESH_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Start MongoDB
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# Or start manually
sudo mongod --fork --logpath /var/log/mongodb.log --dbpath /var/lib/mongodb

# On macOS with Homebrew
brew services start mongodb-community

# On Windows
net start MongoDB
```

### 5. Start the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check Endpoints
- `GET /api/test/ping` - API ping test
- `GET /api/test/health` - Server health check
- `GET /api/test/db` - Database connection test

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - User logout (protected)

### Vendor Endpoints
- `POST /api/vendor/register` - Vendor registration
- `POST /api/vendor/login` - Vendor login
- `GET /api/vendor/profile` - Get vendor profile (protected)
- `PUT /api/vendor/profile` - Update vendor profile (protected)
- `GET /api/vendor/dashboard` - Vendor dashboard (protected)
- `GET /api/vendor` - Get all vendors (public)
- `GET /api/vendor/:id` - Get vendor by ID (public)

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Admin dashboard (protected)
- `GET /api/admin/vendors` - Get all vendors (protected)
- `PUT /api/admin/vendors/:id/approve` - Approve vendor (protected)
- `PUT /api/admin/vendors/:id/reject` - Reject vendor (protected)
- `PUT /api/admin/vendors/:id/suspend` - Suspend vendor (protected)
- `DELETE /api/admin/vendors/:id` - Delete vendor (protected)
- `GET /api/admin/users` - Get all users (protected)

### Category-Specific Endpoints

#### Hotel Management
- `POST /api/hotel` - Create hotel (vendor only)
- `GET /api/hotel` - Get all hotels (public)
- `GET /api/hotel/:id` - Get hotel by ID (public)
- `PUT /api/hotel/:id` - Update hotel (vendor only)
- `DELETE /api/hotel/:id` - Delete hotel (vendor only)
- `GET /api/hotel/vendor/my-hotels` - Get vendor's hotels (protected)
- `GET /api/hotel/vendor/stats` - Get hotel statistics (protected)

#### Ecommerce Products
- `POST /api/ecommerce` - Create product (vendor only)
- `GET /api/ecommerce` - Get all products (public)
- `GET /api/ecommerce/:id` - Get product by ID (public)
- `PUT /api/ecommerce/:id` - Update product (vendor only)
- `DELETE /api/ecommerce/:id` - Delete product (vendor only)
- `GET /api/ecommerce/vendor/my-products` - Get vendor's products (protected)

#### Automobile Listings
- `POST /api/automobile` - Create vehicle listing (vendor only)
- `GET /api/automobile` - Get all vehicles (public)
- `GET /api/automobile/:id` - Get vehicle by ID (public)
- `PUT /api/automobile/:id` - Update vehicle (vendor only)
- `DELETE /api/automobile/:id` - Delete vehicle (vendor only)
- `GET /api/automobile/vendor/my-vehicles` - Get vendor's vehicles (protected)

#### Wedding Services
- `POST /api/wedding` - Create wedding service (vendor only)
- `GET /api/wedding` - Get all wedding services (public)
- `GET /api/wedding/:id` - Get wedding service by ID (public)
- `PUT /api/wedding/:id` - Update wedding service (vendor only)
- `DELETE /api/wedding/:id` - Delete wedding service (vendor only)
- `GET /api/wedding/vendor/my-services` - Get vendor's services (protected)

### Homepage & Search
- `GET /api/homepage` - Get homepage content
- `GET /api/homepage/stats` - Get category statistics
- `GET /api/homepage/search` - Global search across categories

## 🧪 Testing

### Run API Tests
```bash
# Install axios for testing
npm install axios

# Run comprehensive API tests
node comprehensive_api_test.js
```

The test script will:
- Test all endpoints systematically
- Generate authentication tokens
- Test CRUD operations for each category
- Generate a detailed test report (`api_test_report.json`)

### Test Results Summary
- **Total Tests**: 31 endpoints
- **Success Rate**: ~71% (22/31 passing)
- **Coverage**: All major functionality tested

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available configuration options including:
- Server settings (port, environment)
- Database connection
- JWT configuration
- CORS settings
- Rate limiting
- Email configuration
- File upload settings
- Payment gateway integration
- Redis caching
- SMS configuration

### Database Indexes
The application automatically creates indexes for:
- User email (unique)
- Vendor email (unique)
- Product SKU (unique)
- SEO slugs
- Search optimization

## 🚦 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  \"success\": true,
  \"message\": \"Operation successful\",
  \"data\": {
    // Response data
  },
  \"timestamp\": \"2025-07-24T16:00:00.000Z\"
}
```

### Error Response
```json
{
  \"success\": false,
  \"message\": \"Error description\",
  \"error\": {
    // Error details
  },
  \"timestamp\": \"2025-07-24T16:00:00.000Z\"
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure
- **Access Token**: 7 days expiry
- **Refresh Token**: 30 days expiry
- **Cookie Expiry**: 7 days

### Role-based Access
- **Customer**: Basic user access
- **Vendor**: Can manage their listings (requires approval)
- **Admin**: Full system access

### Protected Routes
Routes are protected using middleware:
- `auth` - Requires valid JWT token
- `roleAuth(['vendor'])` - Requires specific role
- `roleAuth(['admin'])` - Admin only access

## 📊 Features Status

### ✅ Implemented Features
- User authentication and authorization
- Vendor registration and management
- Category-specific CRUD operations
- Admin panel functionality
- API documentation and testing
- Error handling and logging
- Database integration
- Role-based access control

### 🔄 Known Issues (To Fix)
1. **Database Connection Test**: `/test/db` endpoint needs mongoose connection check
2. **Vendor Routes**: Profile and dashboard routes have URL parameter conflicts
3. **Admin Credentials**: Default admin user needs to be seeded
4. **Search Indexes**: Text indexes need to be created for global search
5. **Vendor Approval**: New vendors need admin approval before creating listings

### 🚀 Future Enhancements
- File upload functionality
- Email notifications
- Payment gateway integration
- Real-time notifications
- Advanced search filters
- API rate limiting per user
- Caching with Redis
- Comprehensive test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: [your-email@example.com]

---

**Happy Coding! 🚀**

