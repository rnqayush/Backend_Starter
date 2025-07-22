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

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `GET /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Business Modules
- `GET /api/ecommerce/ping` - Test ecommerce module
- `GET /api/automobile/ping` - Test automobile module
- `GET /api/hotel/ping` - Test hotel module
- `GET /api/wedding/ping` - Test wedding module
- `GET /api/business/ping` - Test business module

### Health Check
- `GET /health` - Application health status

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

