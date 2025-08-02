# Multi-Vendor Backend API

A comprehensive backend API for a multi-vendor e-commerce platform built with Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Admin, Vendor, Customer)
- ✅ Password hashing with bcrypt
- ✅ Account lockout after failed login attempts
- ✅ Input validation and sanitization

### User Management
- ✅ User profiles with comprehensive data
- ✅ Password change functionality
- ✅ Admin user management (CRUD operations)
- ✅ User statistics and analytics

### Multi-Vendor Support
- 🔄 Vendor registration and approval system (Coming Soon)
- 🔄 Vendor profiles with business information (Coming Soon)
- 🔄 Vendor dashboard and analytics (Coming Soon)

### Product Management
- 🔄 Product CRUD operations (Coming Soon)
- 🔄 Product categories and variants (Coming Soon)
- 🔄 Inventory management (Coming Soon)
- 🔄 Product search and filtering (Coming Soon)

### Security Features
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation with Joi
- ✅ XSS protection
- ✅ MongoDB injection prevention

## 📁 Project Structure

```
multi-vendor-backend/
│
├── config/
│   ├── db.js               # MongoDB connection setup
│   └── constants.js        # App-wide constants
│
├── controllers/
│   ├── auth.controller.js  # Authentication controllers
│   ├── vendor.controller.js # Vendor controllers (placeholder)
│   └── product.controller.js # Product controllers (placeholder)
│
├── middleware/
│   ├── auth.middleware.js  # Auth and role checks
│   ├── error.middleware.js # Error handling
│   └── validate.middleware.js # Input validation
│
├── models/
│   ├── User.model.js       # User schema
│   ├── Vendor.model.js     # Vendor schema
│   └── Product.model.js    # Product schema
│
├── routes/
│   ├── auth.routes.js      # Authentication routes
│   ├── vendor.routes.js    # Vendor routes (placeholder)
│   ├── product.routes.js   # Product routes (placeholder)
│   └── index.js            # Route aggregator
│
├── services/
│   └── auth.service.js     # Authentication business logic
│
├── utils/
│   ├── generateSlug.js     # Slug generator utilities
│   └── token.js            # JWT helpers
│
├── validators/
│   ├── auth.validator.js   # Authentication validation schemas
│   └── vendor.validator.js # Vendor validation schemas
│
├── .env                    # Environment variables
├── .gitignore
├── app.js                  # Entry point
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-vendor-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/multi-vendor-db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
   JWT_REFRESH_EXPIRE=30d
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "phone": "+1234567890",
  "role": "customer",
  "agreeToTerms": true
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123",
  "rememberMe": false
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "Password123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

### Admin Endpoints

#### Get All Users (Admin Only)
```http
GET /api/auth/users?page=1&limit=10&role=customer&status=active
Authorization: Bearer <admin_access_token>
```

#### Create User (Admin Only)
```http
POST /api/auth/users
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "vendor",
  "status": "active"
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers
- **Account Lockout**: Temporary lockout after failed attempts

## 🗃️ Database Schema

### User Model
- Personal information (name, email, phone)
- Authentication data (password, login attempts)
- Role-based permissions
- Account status and verification
- Address information
- Timestamps and metadata

### Vendor Model (Ready for Implementation)
- Business information
- Contact details
- Verification status
- Rating and statistics
- Settings and policies

### Product Model (Ready for Implementation)
- Product details and descriptions
- Pricing and inventory
- Images and specifications
- Categories and tags
- SEO optimization

## 🚦 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secrets
4. Configure CORS for production domains
5. Set up proper logging

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🔮 Roadmap

- [ ] Complete vendor management system
- [ ] Product management with image uploads
- [ ] Order management system
- [ ] Payment integration
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Analytics and reporting
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Docker containerization

## 📞 Support

For support, email support@example.com or create an issue in the repository.

---

**Built with ❤️ using Node.js, Express, and MongoDB**
