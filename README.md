# 🚀 StoreBuilder Backend API

Complete backend solution for the StoreBuilder multi-tenant platform supporting Hotels, E-commerce, Automobiles, Wedding Services, and Business websites.

## 🌟 Features

- **Multi-Tenant Architecture** - Support for 5 different business types
- **RESTful API** - Clean, consistent API endpoints
- **JWT Authentication** - Secure user authentication and authorization
- **MongoDB Integration** - Scalable database with Mongoose ODM
- **File Upload Support** - Image and document upload handling
- **Role-Based Access Control** - User, Vendor, and Admin roles
- **Comprehensive Validation** - Request validation and error handling
- **Business Analytics** - Track views, bookings, orders, and revenue

## 🏗️ Architecture

### Database Models

```
User → Business → [Hotels|Products|Vehicles|Services]
     ↓
   Bookings/Orders/Reviews
```

### Business Types

- **Hotels** - Room management, bookings, amenities
- **E-commerce** - Products, categories, orders, inventory
- **Automobiles** - Vehicle listings, specifications, inquiries
- **Wedding Services** - Vendor portfolios, service bookings
- **Business Services** - Professional services, appointments

## 🚀 Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on: http://localhost:5000

## 📊 Database Seeding

Run the seed script to populate your database with sample data:

```bash
npm run seed
```

This creates:

- ✅ 3 users (admin, vendor, regular user)
- ✅ 2 businesses (hotel + ecommerce)
- ✅ 1 hotel with rooms
- ✅ 2 product categories
- ✅ 2 sample products

### Test Credentials

```
Admin:  admin@storebuilder.com / admin123
Vendor: jane@business.com / password123
User:   john@example.com / password123
```

## 🔌 API Endpoints

### Authentication

```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
GET  /api/auth/me          - Get current user
GET  /api/auth/verify      - Verify JWT token
PUT  /api/auth/profile     - Update profile
```

### Business Management

```
GET  /api/business/:slug            - Get business by slug
POST /api/business                  - Create business
PUT  /api/business/:id             - Update business
GET  /api/business/my/businesses   - Get user's businesses
GET  /api/business/:id/analytics   - Get business analytics
```

### Hotels

```
GET  /api/hotels/business/:businessId    - Get hotels for business
GET  /api/hotels/:id                     - Get hotel details
POST /api/hotels                         - Create hotel
PUT  /api/hotels/:id                     - Update hotel
POST /api/hotels/:id/rooms               - Add room
PUT  /api/hotels/:hotelId/rooms/:roomId  - Update room
GET  /api/hotels/search                  - Search hotels
```

### E-commerce

```
GET  /api/ecommerce/business/:businessId/products    - Get products
GET  /api/ecommerce/business/:businessId/categories  - Get categories
GET  /api/ecommerce/products/:id                     - Get product details
POST /api/ecommerce/products                         - Create product
PUT  /api/ecommerce/products/:id                     - Update product
POST /api/ecommerce/products/:id/reviews             - Add review
```

## �� Authentication

### JWT Token Usage

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { data } = await response.json();
const { user, token } = data;

// Use token in subsequent requests
const authResponse = await fetch('/api/business/my/businesses', {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

### Role-Based Access

- **User** - Can view public content, make bookings/orders
- **Vendor** - Can manage their businesses and content
- **Admin** - Full access to all resources

## 🗃️ Data Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['user', 'vendor', 'admin'],
  avatar: String,
  profile: { bio, location, phone, socialLinks },
  subscription: { plan, status, expiresAt }
}
```

### Business Model

```javascript
{
  name: String,
  slug: String (unique),
  type: ['hotel', 'ecommerce', 'automobile', 'wedding', 'business'],
  owner: ObjectId (User),
  businessInfo: { address, contact, hours, socialMedia },
  branding: { logo, coverImage, colors, fonts },
  settings: { isPublished, currency, language },
  analytics: { totalViews, totalBookings, totalRevenue }
}
```

### Product Model (E-commerce)

```javascript
{
  business: ObjectId (Business),
  name: String,
  description: String,
  category: ObjectId (Category),
  pricing: { price, originalPrice, onSale },
  inventory: { quantity, trackQuantity },
  images: { main, gallery },
  featured: Boolean,
  status: ['draft', 'published', 'archived']
}
```

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get business (using slug from seeded data)
curl http://localhost:5000/api/business/grand-palace-hotel
```

### Frontend Integration

```javascript
// Replace your frontend API calls with backend endpoints
const API_BASE_URL = 'http://localhost:5000/api';

// Get hotel data (matches your DummyData format)
const getHotelData = async slug => {
  const response = await fetch(`${API_BASE_URL}/business/${slug}`);
  const data = await response.json();
  return data.data; // Returns business with hotels
};

// Get ecommerce products
const getProducts = async (businessId, filters = {}) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(
    `${API_BASE_URL}/ecommerce/business/${businessId}/products?${queryParams}`
  );
  const data = await response.json();
  return data.data.products;
};
```

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/storebuilder
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### Database Configuration

The backend automatically connects to MongoDB using the `MONGODB_URI` environment variable. Make sure MongoDB is running before starting the server.

## 📈 Analytics & Monitoring

### Business Analytics

Each business tracks:

- Total page views
- Total bookings/orders
- Total revenue
- Last analytics update

### Health Monitoring

- Health check endpoint: `GET /health`
- Database connection status
- Server uptime information

## 🚀 Deployment

### Production Setup

1. Set environment variables for production
2. Use a production MongoDB instance
3. Set up proper SSL certificates
4. Configure reverse proxy (nginx)
5. Set up process management (PM2)

### Docker Support

```bash
# Build image
docker build -t storebuilder-backend .

# Run container
docker run -p 5000:5000 -e MONGODB_URI=mongodb://host.docker.internal:27017/storebuilder storebuilder-backend
```

## 🔒 Security Features

- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Controlled cross-origin requests
- **Helmet Security** - Security headers
- **MongoDB Injection Protection** - Mongoose sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 Your StoreBuilder backend is ready to power your multi-tenant platform!**

For support or questions, check the API documentation or create an issue in the repository.
