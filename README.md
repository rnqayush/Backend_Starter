# 🚀 Express.js + MongoDB Multivendor Backend

A comprehensive, production-ready multivendor platform backend built with Express.js and MongoDB. Features clean MVC architecture, JWT authentication, role-based access control, and category-specific business logic.

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Password hashing using bcrypt
- Role-based access control (admin, vendor, customer)
- Protected routes with middleware
- Email verification system

### 👥 **User Management**
- Multi-role user system
- Comprehensive user profiles with preferences
- Business information management
- Subscription and analytics tracking
- Admin user management

### 🏪 **Vendor System**
- Vendor registration with business type validation
- Category-specific business logic (hotel, ecommerce, automobile, wedding)
- Product/service management per category
- Vendor dashboard with analytics
- Business verification system

### 📦 **Product Management** (Ecommerce)
- Complete product CRUD operations
- Inventory management with stock tracking
- Image and media management
- Product reviews and ratings
- SEO optimization fields
- Bulk operations support

### 🛒 **Order & Cart System**
- Shopping cart management
- Order processing and tracking
- Payment status management
- Return and refund processing
- Order analytics

### 🏨 **Hotel Management**
- Room management with availability
- Booking system
- Amenities and services
- Pricing and packages
- Guest management

### 🚗 **Automobile Management**
- Vehicle listings
- Specifications and features
- Booking and rental system
- Maintenance tracking

### 💒 **Wedding Services**
- Service packages
- Venue management
- Booking and event planning
- Vendor coordination

### 🛠️ **Technical Features**
- Clean MVC architecture
- Centralized error handling
- Response formatting utilities
- Async error handling
- File upload support
- Pagination and filtering
- Soft delete functionality
- Comprehensive logging

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # File upload configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── ecommerce/           # Ecommerce-specific controllers
│   ├── hotel/               # Hotel-specific controllers
│   ├── automobile/          # Automobile-specific controllers
│   └── wedding/             # Wedding-specific controllers
├── models/
│   ├── User.js              # User model
│   ├── ecommerce/           # Ecommerce models
│   ├── hotel/               # Hotel models
│   ├── automobile/          # Automobile models
│   └── wedding/             # Wedding models
├── routes/
│   ├── auth.routes.js       # Authentication routes
│   ├── user.routes.js       # User management routes
│   ├── ecommerce.routes.js  # Ecommerce routes
│   ├── hotel.routes.js      # Hotel routes
│   ├── automobile.routes.js # Automobile routes
│   └── wedding.routes.js    # Wedding routes
├── middlewares/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling middleware
│   ├── logger.js            # Logging middleware
│   └── upload.js            # File upload middleware
├── utils/
│   ├── asyncHandler.js      # Async error handler
│   ├── response.js          # Response formatter
│   ├── slugify.js           # URL slug generator
│   └── email.js             # Email utilities
└── server.js                # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnqayush/Backend_Starter.git
   cd Backend_Starter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Database
   MONGO_URI=mongodb://localhost:27017/multivendor_db
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_REFRESH_EXPIRE=30d
   
   # Email (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   FROM_EMAIL=noreply@yourapp.com
   FROM_NAME=YourApp
   
   # Cloudinary (Optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # Or run directly
   mongod --dbpath /data/db
   ```

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Test the API**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"OK","timestamp":"...","uptime":...}
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "vendor",
  "businessType": "ecommerce"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your_jwt_token>
```

### Vendor Endpoints

#### Create Product (Ecommerce)
```http
POST /api/ecommerce/products
Authorization: Bearer <vendor_token>
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "Product description",
  "category": "electronics",
  "sku": "PROD-001",
  "price": {
    "regular": 99.99
  },
  "inventory": {
    "quantity": 50
  },
  "storeName": "My Store"
}
```

#### Get Vendor Products
```http
GET /api/ecommerce/seller/products
Authorization: Bearer <vendor_token>
```

### Admin Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer <admin_token>
```

#### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

## 🏗️ Architecture

### MVC Pattern
- **Models**: Define data structure and business logic
- **Views**: JSON API responses (no traditional views)
- **Controllers**: Handle request/response logic

### Middleware Stack
1. **CORS**: Cross-origin resource sharing
2. **Body Parser**: JSON request parsing
3. **Logger**: Request logging with Morgan
4. **Auth**: JWT token validation
5. **Error Handler**: Centralized error management

### Database Design
- **Users**: Central user management with roles
- **Category-specific models**: Separate models for each business type
- **Relationships**: Proper referencing between models
- **Indexing**: Optimized queries with database indexes

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |

### Database Configuration
The application uses MongoDB with Mongoose ODM. Connection is established in `src/config/database.js`.

### File Upload Configuration
Cloudinary is used for file uploads. Configure in `src/config/cloudinary.js`.

## 🧪 Testing

### Manual Testing
Use the provided curl commands or tools like Postman to test the API endpoints.

### Health Check
```bash
curl http://localhost:5000/health
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "vendor",
    "businessType": "ecommerce"
  }'
```

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use a process manager like PM2

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment-specific Configurations
- **Development**: Hot reloading with nodemon
- **Production**: Optimized for performance and security
- **Testing**: Isolated test database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples

## 🎯 Roadmap

- [ ] WebSocket integration for real-time features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch
- [ ] Microservices architecture migration
- [ ] GraphQL API support

---

**Built with ❤️ using Express.js and MongoDB**

