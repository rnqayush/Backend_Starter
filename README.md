# Multi-Tenant Website Builder Backend

A comprehensive, modular backend system for a multi-tenant website builder platform that supports multiple business verticals including Hotels, E-commerce, Weddings, Automobiles, and Business Services.

## 🏗️ Architecture Overview

This backend follows a **modular monolith** architecture pattern, providing:

- **Multi-tenant support** with slug-based tenant resolution
- **Modular business modules** for different industry verticals
- **Scalable authentication and authorization** system
- **RESTful API design** with comprehensive error handling
- **Database-agnostic design** with MongoDB as the primary database

## 🚀 Features

### Core Features
- ✅ **User Authentication & Authorization** (JWT-based)
- ✅ **Multi-tenant Architecture** (slug/subdomain-based)
- ✅ **Website Management System** (create, configure, manage websites)
- ✅ **Role-based Access Control** (user, admin, moderator)
- ✅ **Email Verification & Password Reset**
- ✅ **Rate Limiting & Security Middleware**
- ✅ **Comprehensive Error Handling**
- ✅ **Database Connection Management**

### Business Modules (Planned)
- 🏨 **Hotel Management** - Room bookings, amenities, reservations
- 🛒 **E-commerce** - Product catalog, orders, inventory management
- 💍 **Wedding Services** - Vendor portfolios, service bookings
- 🚗 **Automobile Dealerships** - Vehicle listings, dealer management
- 🏢 **Business Services** - General business templates, appointments

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **MongoDB** >= 4.4
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend_Starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/website_builder_dev
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   # ... other configuration
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

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
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | User logout | Private |
| GET | `/auth/me` | Get user profile | Private |
| PUT | `/auth/me` | Update user profile | Private |
| PUT | `/auth/change-password` | Change password | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password/:token` | Reset password | Public |
| GET | `/auth/verify-email/:token` | Verify email | Public |
| POST | `/auth/resend-verification` | Resend verification email | Private |

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🏢 Multi-Tenant Architecture

The system supports multiple tenant resolution methods:

### 1. Slug-based URLs
```
https://yourplatform.com/luxury-hotel-downtown
```

### 2. Subdomain-based URLs
```
https://luxury-hotel-downtown.yourplatform.com
```

### 3. Custom Domain
```
https://luxuryhotel.com
```

### 4. Header-based (for API calls)
```bash
curl -H "X-Tenant-Slug: luxury-hotel-downtown" \
     https://api.yourplatform.com/api/bookings
```

## 📁 Project Structure

```
Backend_Starter/
├── config/
│   └── database.js              # Database configuration
├── controllers/
│   └── authController.js        # Authentication controller
├── middleware/
│   ├── auth.js                  # Authentication middleware
│   ├── tenantResolver.js        # Tenant resolution middleware
│   └── errorHandler.js          # Error handling middleware
├── models/
│   ├── User.js                  # User model
│   └── Website.js               # Website model
├── modules/                     # Business modules (planned)
│   ├── hotels/
│   ├── ecommerce/
│   ├── weddings/
│   ├── automobiles/
│   └── business/
├── routes/
│   └── auth.js                  # Authentication routes
├── utils/
│   └── jwt.js                   # JWT utilities
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── README.md                    # This file
└── server.js                    # Main server file
```

## 🔐 Security Features

- **JWT Authentication** with access and refresh tokens
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **Helmet.js** for security headers
- **CORS** configuration
- **Input Validation** using express-validator
- **Account Lockout** after failed login attempts
- **Email Verification** for new accounts

## 🗄️ Database Schema

### User Model
- Basic information (name, email, password)
- Profile data (avatar, phone, bio)
- Role-based permissions
- Account status and verification
- Subscription information
- User preferences

### Website Model
- Basic website information
- Tenant identification (slug, domain)
- Website type (business module)
- Owner relationship
- Configuration settings
- Theme and appearance
- Contact information
- Feature toggles
- Analytics and statistics

## 🚦 Development Workflow

### Running in Development
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Database Seeding
```bash
npm run seed
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE",
  "stack": "Error stack (development only)"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests** for individual functions
- **Integration Tests** for API endpoints
- **Database Tests** with test database

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring and Logging

- **Morgan** for HTTP request logging
- **Console logging** for application events
- **Error tracking** with stack traces
- **Health check** endpoint at `/health`

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production MongoDB URI
- [ ] Set secure JWT secrets
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment (Coming Soon)
```dockerfile
# Dockerfile will be added for containerized deployment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@yourplatform.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication system
- ✅ Multi-tenant architecture
- ✅ Website management

### Phase 2 (Next)
- 🏨 Hotel management module
- 🛒 E-commerce module
- 💍 Wedding services module

### Phase 3 (Future)
- 🚗 Automobile module
- 🏢 Business services module
- 📊 Advanced analytics
- 💳 Payment processing
- 📧 Email marketing integration

---

**Built with ❤️ for the multi-tenant website builder platform**

