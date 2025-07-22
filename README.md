# Multivendor Backend Platform

A production-ready multi-tenant backend platform built with Node.js, Express.js, and MongoDB. This platform serves multiple business verticals including ecommerce, automobile, hotel, wedding, and business websites.

## 🚀 Features

- **Multi-tenant Architecture**: Support for multiple business verticals
- **JWT Authentication**: Secure user authentication and authorization
- **Role-based Access Control**: Admin, vendor, and user roles
- **Modular Structure**: Clean separation of concerns with MVC architecture
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Centralized error handling with detailed logging
- **Database**: MongoDB with Mongoose ODM
- **ES6 Modules**: Modern JavaScript with import/export syntax

## 🏗️ Architecture

```
/src
├── /config/                  → Environment & DB connection setup
├── /middlewares/            → Global middlewares (auth, error handler, RBAC)
├── /utils/                  → Utility functions (logger, slugify, response)
├── /services/               → Reusable logic (email, payments)
├── /controllers/            → Shared/general controllers (auth, users, files)
├── /models/                 → Shared Mongoose models (User, Role, Notification)
├── /routes/                 → API routes grouped by function
│   ├── auth.routes.js
│   ├── user.routes.js
│   └── tenants/
│       ├── ecommerce.routes.js
│       ├── automobile.routes.js
│       ├── hotel.routes.js
│       ├── wedding.routes.js
│       └── business.routes.js
├── /modules/                → Business verticals (each has model/controller/service)
│   ├── /ecommerce/
│   ├── /automobile/
│   ├── /hotel/
│   ├── /wedding/
│   └── /business/
├── /public/                 → Static files (placeholder for S3 integration)
├── app.js                   → Express app configuration
└── server.js                → Application entry point
```

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
   MONGO_URI=mongodb://localhost:27017/multivendor_platform
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   BCRYPT_SALT_ROUNDS=12
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### 🔐 Authentication & User Management

#### Core Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/me` - Get current user profile

#### User Profile Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload user avatar
- `DELETE /api/users/avatar` - Delete user avatar
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences
- `POST /api/users/change-password` - Change password
- `POST /api/users/switch-role` - Switch user role
- `GET /api/users/roles` - Get available roles
- `GET /api/users/analytics` - Get user analytics

### 📁 File Management & CDN

#### File Upload & Management
- `POST /api/files/upload` - Upload single file
- `POST /api/files/upload/multiple` - Upload multiple files
- `DELETE /api/files/:fileId` - Delete file
- `GET /api/files/:fileId/metadata` - Get file metadata
- `POST /api/files/resize` - Resize image
- `POST /api/files/optimize` - Optimize image

#### Media Library
- `GET /api/files/media/library` - Get media library (paginated)
- `POST /api/files/media/organize` - Organize media files
- `DELETE /api/files/media/:mediaId` - Delete media file
- `PUT /api/files/media/:mediaId/metadata` - Update media metadata

### 🚗 Automobile Module

#### Vehicle Management
- `GET /api/automobiles/vehicles` - List vehicles with filters
- `POST /api/automobiles/vehicles` - Create new vehicle (Dealer)
- `GET /api/automobiles/vehicles/:id` - Get vehicle details
- `PUT /api/automobiles/vehicles/:id` - Update vehicle (Dealer)
- `DELETE /api/automobiles/vehicles/:id` - Delete vehicle (Dealer)
- `POST /api/automobiles/vehicles/:id/images` - Add vehicle images
- `DELETE /api/automobiles/vehicles/:id/images/:imageId` - Delete vehicle image
- `GET /api/automobiles/vehicles/:id/analytics` - Get vehicle analytics
- `POST /api/automobiles/vehicles/:id/calculate-emi` - Calculate EMI
- `POST /api/automobiles/vehicles/compare` - Compare vehicles
- `GET /api/automobiles/vehicles/popular` - Get popular vehicles
- `GET /api/automobiles/vehicles/search` - Search vehicles

#### Enquiry Management
- `POST /api/automobiles/enquiries` - Create enquiry
- `GET /api/automobiles/enquiries` - List enquiries
- `GET /api/automobiles/enquiries/:id` - Get enquiry details
- `PUT /api/automobiles/enquiries/:id` - Update enquiry (Dealer)
- `POST /api/automobiles/enquiries/:id/respond` - Respond to enquiry
- `POST /api/automobiles/enquiries/:id/schedule-test-drive` - Schedule test drive
- `GET /api/automobiles/enquiries/overdue` - Get overdue enquiries
- `GET /api/automobiles/enquiries/statistics` - Get enquiry statistics
- `GET /api/automobiles/enquiries/export` - Export enquiries

#### Test Drive & Analytics
- `GET /api/automobiles/test-drives` - List test drives (Dealer)
- `PUT /api/automobiles/test-drives/:id` - Update test drive status
- `GET /api/automobiles/analytics/dashboard` - Dealer dashboard analytics
- `GET /api/automobiles/inventory` - Vehicle inventory management
- `PUT /api/automobiles/inventory/:id/availability` - Update vehicle availability

### 🛒 E-commerce Module (Coming Soon)
- Product management
- Shopping cart & checkout
- Order management
- Seller dashboard
- Reviews & ratings

### 🏨 Hotel Module (Coming Soon)
- Hotel & room management
- Booking system
- Pricing management
- Guest management

### 💒 Wedding Module (Coming Soon)
- Vendor management
- Portfolio management
- Service booking
- Event planning

### 🏢 Business Website Builder (Coming Soon)
- Template management
- Website creation
- Content management
- Analytics

### 🔍 Search & Discovery (Coming Soon)
- Universal search
- Location-based services
- Auto-complete suggestions

### 📱 Notification System (Coming Soon)
- Push notifications
- Email services
- SMS notifications

### 💳 Payment Processing (Coming Soon)
- Payment gateway integration
- Subscription management
- Refund processing

### 📊 Analytics & Reporting (Coming Soon)
- Platform analytics
- Business intelligence
- Report exports

### 👨‍💼 Admin Panel (Coming Soon)
- User management
- Content moderation
- Platform settings

### 🏥 Health & Infrastructure
- `GET /health` - Application health status
- `GET /api/health/database` - Database connectivity
- `GET /api/health/redis` - Cache connectivity (when implemented)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Admin**: Full system access
- **Vendor**: Access to their business module and data
- **User**: Basic user access

## 🧪 Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "vendor",
    "businessType": "ecommerce"
  }'

# Test module endpoints
curl http://localhost:5000/api/ecommerce/ping \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🔧 Development

### Adding New Modules

1. Create a new directory in `/src/modules/`
2. Add model, controller, and service files
3. Create routes in `/src/routes/tenants/`
4. Register routes in `/src/app.js`

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/multivendor_platform` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` |

## 📦 Dependencies

### Production Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT implementation
- **cors**: CORS middleware
- **helmet**: Security headers
- **morgan**: HTTP request logger
- **express-validator**: Request validation
- **express-rate-limit**: Rate limiting
- **compression**: Response compression
- **slugify**: URL-friendly strings

### Development Dependencies
- **nodemon**: Development server with auto-restart

## 🚧 Roadmap

- [ ] Implement business logic for each module
- [ ] Add comprehensive API documentation with Swagger
- [ ] Implement file upload with S3 integration
- [ ] Add comprehensive testing suite
- [ ] Implement caching with Redis
- [ ] Add database seeders
- [ ] Implement real-time features with Socket.io
- [ ] Add CI/CD pipeline
- [ ] Docker containerization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions, please create an issue in the repository.
