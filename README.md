# Multivendor Backend API

A comprehensive Express.js + MongoDB backend for a multivendor platform supporting multiple business categories including hotels, ecommerce, automobiles, and wedding services.

## 🚀 Features

- **Clean MVC Architecture** with organized folder structure
- **JWT Authentication** with role-based access control
- **Multi-category Support** (Hotel, Ecommerce, Automobile, Wedding)
- **Vendor Management** with approval system
- **Admin Dashboard** with comprehensive controls
- **Pagination & Filtering** for all listing endpoints
- **Soft Delete** functionality across all models
- **Input Validation** using express-validator
- **Error Handling** with centralized middleware
- **Security** with helmet, CORS, and rate limiting
- **Logging** with Morgan middleware
- **ES6 Modules** support

## 📁 Project Structure

```
Backend_Starter/
├── config/
│   ├── database.js          # MongoDB connection
│   └── config.js            # Environment configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── vendorController.js  # Vendor management
│   ├── adminController.js   # Admin operations
│   ├── hotelController.js   # Hotel category
│   ├── ecommerceController.js # Ecommerce category
│   ├── automobileController.js # Automobile category
│   └── weddingController.js # Wedding category
├── middlewares/
│   ├── auth.js              # JWT authentication
│   ├── roleAuth.js          # Role-based authorization
│   ├── errorHandler.js      # Error handling
│   ├── logger.js            # Request logging
│   └── validateRequest.js   # Input validation
├── models/
│   ├── User.js              # User model
│   ├── Vendor.js            # Vendor model
│   ├── Hotel.js             # Hotel model
│   ├── Ecommerce.js         # Ecommerce model
│   ├── Automobile.js        # Automobile model
│   └── Wedding.js           # Wedding model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── vendorRoutes.js      # Vendor routes
│   ├── adminRoutes.js       # Admin routes
│   ├── hotelRoutes.js       # Hotel routes
│   ├── ecommerceRoutes.js   # Ecommerce routes
│   ├── automobileRoutes.js  # Automobile routes
│   ├── weddingRoutes.js     # Wedding routes
│   └── testRoutes.js        # Test/health routes
├── utils/
│   ├── responseFormatter.js # API response formatting
│   ├── asyncHandler.js      # Async error handling
│   └── pagination.js        # Pagination utilities
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Application entry point
└── README.md                # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd Backend_Starter
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/multivendor_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Admin Configuration
ADMIN_EMAIL=admin@multivendor.com
ADMIN_PASSWORD=admin123

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start the server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/profile` | Update profile | Private |
| PUT | `/auth/change-password` | Change password | Private |
| POST | `/auth/logout` | Logout user | Private |

### Vendor Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/vendor/register` | Register as vendor | Public |
| POST | `/vendor/login` | Vendor login | Public |
| GET | `/vendor/profile` | Get vendor profile | Vendor |
| PUT | `/vendor/profile` | Update vendor profile | Vendor |
| GET | `/vendor/dashboard` | Vendor dashboard | Vendor |
| GET | `/vendor/:id` | Get vendor by ID | Public |

### Admin Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/admin/login` | Admin login | Public |
| GET | `/admin/dashboard` | Admin dashboard | Admin |
| GET | `/admin/vendors` | Get all vendors | Admin |
| PUT | `/admin/vendors/:id/approve` | Approve vendor | Admin |
| PUT | `/admin/vendors/:id/reject` | Reject vendor | Admin |
| PUT | `/admin/vendors/:id/suspend` | Suspend vendor | Admin |
| DELETE | `/admin/vendors/:id` | Delete vendor | Admin |
| GET | `/admin/users` | Get all users | Admin |

### Category-Specific Endpoints

Each category (hotel, ecommerce, automobile, wedding) follows the same pattern:

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/{category}` | Get all items | Public |
| GET | `/{category}/:id` | Get item by ID | Public |
| POST | `/{category}` | Create new item | Vendor |
| PUT | `/{category}/:id` | Update item | Vendor (Owner) |
| DELETE | `/{category}/:id` | Delete item | Vendor (Owner) |
| GET | `/{category}/vendor/my-{items}` | Get vendor's items | Vendor |

### Test Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/test/ping` | API status check | Public |
| GET | `/test/health` | Health check | Public |
| GET | `/test/db` | Database connection test | Public |

## 🔐 User Roles

### Customer
- Basic user registration and authentication
- Can browse all categories
- Can view vendor profiles

### Vendor
- Register with business details
- Create and manage category-specific listings
- Access to vendor dashboard
- Requires admin approval

### Admin
- Full system access
- Vendor approval/rejection
- User management
- System statistics

## 🏷️ Categories

### Hotel
- Hotel listings with rooms, amenities, pricing
- Location-based search
- Star rating system
- Booking policies

### Ecommerce
- Product catalog with inventory management
- Category and subcategory organization
- SKU management
- Shipping configuration

### Automobile
- Vehicle listings (sale/rent/lease)
- Make, model, year filtering
- Condition and feature specifications
- Location-based search

### Wedding
- Wedding service providers
- Multiple service types (venue, catering, photography, etc.)
- Portfolio management
- Availability calendar

## 🔍 Query Parameters

Most listing endpoints support these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search term
- `sortBy` - Field to sort by
- `sortOrder` - Sort direction (asc/desc)
- Category-specific filters (price, location, etc.)

## 📝 Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    // Response data
  },
  "meta": {
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

## 🛡️ Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **CORS** configuration for cross-origin requests
- **Helmet** for security headers
- **Input Validation** for all endpoints
- **Soft Delete** to maintain data integrity

## 🚦 Error Handling

The API includes comprehensive error handling:

- **Validation Errors** (400) - Invalid input data
- **Authentication Errors** (401) - Invalid or missing token
- **Authorization Errors** (403) - Insufficient permissions
- **Not Found Errors** (404) - Resource not found
- **Server Errors** (500) - Internal server errors

## 📊 Logging

Request logging includes:
- HTTP method and URL
- Response status and time
- User information (if authenticated)
- Error details in development mode

## 🧪 Testing

Test the API using the provided endpoints:

```bash
# Test API status
curl http://localhost:5000/api/test/ping

# Test database connection
curl http://localhost:5000/api/test/db

# Test health check
curl http://localhost:5000/api/test/health
```

## 🚀 Deployment

### Environment Variables for Production
Ensure these are set in production:
- `NODE_ENV=production`
- `MONGODB_URI` - Production database URL
- `JWT_SECRET` - Strong secret key
- `FRONTEND_URL` - Production frontend URL

### PM2 Deployment
```bash
npm install -g pm2
pm2 start server.js --name "multivendor-api"
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Happy Coding! 🎉**

