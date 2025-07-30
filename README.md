# Multi-Business Platform Backend

A comprehensive Node.js/Express/MongoDB backend system supporting multiple business types including hotels, ecommerce, weddings, automobiles, and business websites.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture** - Support for 5 different business types
- **JWT Authentication** - Secure user authentication with role-based access
- **File Upload System** - Image and document management
- **Real-time Notifications** - Socket.io integration
- **Email System** - Automated email notifications
- **Search & Analytics** - Advanced search and business analytics
- **API Documentation** - Swagger/OpenAPI documentation

### Business Types Supported

#### 🏨 Hotels
- Room management and availability
- Booking system with calendar integration
- Pricing and seasonal rates
- Guest management
- Hotel analytics dashboard

#### 🛒 Ecommerce
- Product catalog management
- Inventory tracking
- Order processing
- Shopping cart functionality
- Seller dashboard with analytics

#### 💒 Wedding Vendors
- Vendor portfolio management
- Service packages and pricing
- Booking calendar
- Client communication tools
- Event management

#### 🚗 Automobile Dealers
- Vehicle inventory management
- Detailed vehicle specifications
- Pricing and financing options
- Dealer dashboard
- Lead management

#### 💼 Business Websites
- Portfolio management
- Content management system
- Blog functionality
- Business profile customization
- SEO optimization

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcryptjs
- **File Upload:** Multer with Sharp for image processing
- **Email:** Nodemailer
- **Real-time:** Socket.io
- **Documentation:** Swagger/OpenAPI
- **Security:** Helmet, CORS, Rate limiting, XSS protection

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnqayush/Backend_Starter.git
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
   - MongoDB connection string
   - JWT secret
   - Email service credentials
   - File upload settings
   - Payment gateway keys (Stripe)

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/multi-business-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
FILE_UPLOAD_PATH=./uploads

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Frontend URL
CLIENT_URL=http://localhost:3000
```

## 📚 API Documentation

Once the server is running, visit:
- **Development:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/health

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **customer** - Regular users who can make bookings/purchases
- **business_owner** - Can manage their business listings
- **admin** - Platform administrators
- **super_admin** - Full system access

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/forgotpassword` - Forgot password
- `PUT /api/auth/resetpassword/:token` - Reset password

### Hotels
- `GET /api/hotels` - Get all hotels
- `POST /api/hotels` - Create hotel (business owner)
- `GET /api/hotels/:id` - Get hotel details
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Products (Ecommerce)
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Wedding Vendors
- `GET /api/weddings` - Get all vendors
- `POST /api/weddings` - Create vendor profile
- `GET /api/weddings/:id` - Get vendor details
- `PUT /api/weddings/:id` - Update vendor
- `DELETE /api/weddings/:id` - Delete vendor

### Business Management
- `GET /api/business` - Get businesses
- `POST /api/business` - Create business
- `GET /api/business/:slug` - Get business by slug
- `PUT /api/business/:id` - Update business
- `DELETE /api/business/:id` - Delete business

### Media & File Upload
- `POST /api/media/upload` - Upload files
- `DELETE /api/media/:id` - Delete file
- `GET /api/media/business/:businessId` - Get business media

### Search & Analytics
- `GET /api/search` - Global search
- `GET /api/analytics/dashboard` - Business analytics
- `GET /api/analytics/reports` - Generate reports

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "multi-business-api"
pm2 startup
pm2 save
```

### Using Docker
```bash
# Build image
docker build -t multi-business-api .

# Run container
docker run -p 5000:5000 --env-file .env multi-business-api
```

## 📁 Project Structure

```
├── config/
│   └── database.js          # Database configuration
├── controllers/             # Route controllers
│   ├── authController.js
│   ├── hotelController.js
│   ├── productController.js
│   └── ...
├── middleware/              # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── upload.js
├── models/                  # Mongoose models
│   ├── User.js
│   ├── Business.js
│   ├── Hotel.js
│   └── ...
├── routes/                  # API routes
│   ├── auth.js
│   ├── hotels.js
│   ├── products.js
│   └── ...
├── utils/                   # Utility functions
│   ├── sendEmail.js
│   ├── socketHandler.js
│   └── ...
├── uploads/                 # File uploads directory
├── tests/                   # Test files
├── docs/                    # API documentation
├── server.js               # Main server file
└── package.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@yourdomain.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release with full multi-business platform support
- Authentication system with JWT
- Hotel booking system
- Ecommerce functionality
- Wedding vendor management
- Automobile listings
- Business website builder
- File upload system
- Real-time notifications
- API documentation

