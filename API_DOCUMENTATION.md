# 🚀 StoreBuilder Backend API Documentation

## Overview

The StoreBuilder Backend is a comprehensive, production-ready API that powers a multi-tenant platform supporting 5 different business types:

- 🏨 **Hotels** - Room management, bookings, amenities
- 🛍️ **E-commerce** - Products, categories, orders, inventory
- 🚗 **Automobiles** - Vehicle listings, specifications, inquiries
- 💒 **Wedding Services** - Vendor portfolios, service bookings
- 🏢 **Business Services** - Professional services, appointments

## 🔧 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
npm run setup

# 3. Seed database
npm run seed

# 4. Start server
npm run dev

# 5. Test API
npm run test:integration
```

## 🌐 Base URL

- **Development**: `http://localhost:5000`
- **Production**: Configure as needed

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Get Token

```javascript
// Login to get token
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 📋 API Endpoints

### 🏥 Health & Status

```
GET /health                    # Server health check
```

### 👤 Authentication

```
POST /api/auth/register        # User registration
POST /api/auth/login           # User login
GET  /api/auth/me              # Get current user
GET  /api/auth/verify          # Verify JWT token
PUT  /api/auth/profile         # Update user profile
```

### 🏢 Business Management

```
GET  /api/business/:slug                # Get business by slug
POST /api/business                      # Create business (Auth)
PUT  /api/business/:id                  # Update business (Auth)
DELETE /api/business/:id                # Delete business (Auth)
GET  /api/business/my/businesses        # Get user's businesses (Auth)
GET  /api/business/:id/analytics        # Get business analytics (Auth)
```

### 🏨 Hotels

```
GET  /api/hotels/business/:businessId           # Get hotels for business
GET  /api/hotels/:id                            # Get hotel details
POST /api/hotels                                # Create hotel (Auth)
PUT  /api/hotels/:id                            # Update hotel (Auth)
DELETE /api/hotels/:id                          # Delete hotel (Auth)
POST /api/hotels/:id/rooms                      # Add room to hotel (Auth)
PUT  /api/hotels/:hotelId/rooms/:roomId         # Update room (Auth)
GET  /api/hotels/search                         # Search hotels
```

### 🛍️ E-commerce

```
GET  /api/ecommerce/business/:businessId/products       # Get products
GET  /api/ecommerce/business/:businessId/categories     # Get categories
GET  /api/ecommerce/products/:id                        # Get product details
POST /api/ecommerce/products                            # Create product (Auth)
PUT  /api/ecommerce/products/:id                        # Update product (Auth)
DELETE /api/ecommerce/products/:id                      # Delete product (Auth)
POST /api/ecommerce/products/:id/reviews                # Add product review (Auth)
POST /api/ecommerce/categories                          # Create category (Auth)
PUT  /api/ecommerce/categories/:id                      # Update category (Auth)
GET  /api/ecommerce/business/:businessId/analytics      # Get analytics (Auth)
GET  /api/ecommerce/search                              # Search products
```

### 🚗 Automobiles

```
GET  /api/automobiles/business/:businessId              # Get vehicles for business
GET  /api/automobiles/:id                               # Get vehicle details
POST /api/automobiles                                   # Create vehicle (Auth)
PUT  /api/automobiles/:id                               # Update vehicle (Auth)
DELETE /api/automobiles/:id                             # Delete vehicle (Auth)
GET  /api/automobiles/search                            # Search vehicles
POST /api/automobiles/:id/inquiry                      # Submit vehicle inquiry
GET  /api/automobiles/business/:businessId/analytics    # Get analytics (Auth)
```

### 💒 Wedding Services

```
GET  /api/weddings/business/:businessId                 # Get wedding services
GET  /api/weddings/:id                                  # Get service details
POST /api/weddings                                      # Create service (Auth)
PUT  /api/weddings/:id                                  # Update service (Auth)
DELETE /api/weddings/:id                                # Delete service (Auth)
GET  /api/weddings/search                               # Search services
POST /api/weddings/:id/booking                         # Book service (Auth)
```

### 📝 Blogs

```
GET  /api/blogs                                         # Get all blogs
GET  /api/blogs/:id                                     # Get blog details
POST /api/blogs                                         # Create blog (Auth)
PUT  /api/blogs/:id                                     # Update blog (Auth)
DELETE /api/blogs/:id                                   # Delete blog (Auth)
GET  /api/blogs/search                                  # Search blogs
```

### 📁 File Upload

```
POST /api/upload/single                                 # Upload single file (Auth)
POST /api/upload/multiple                               # Upload multiple files (Auth)
DELETE /api/upload/:filename                            # Delete file (Auth)
```

### 👥 Users

```
GET  /api/users                                         # Get all users (Admin)
GET  /api/users/:id                                     # Get user details (Admin)
PUT  /api/users/:id                                     # Update user (Admin)
DELETE /api/users/:id                                   # Delete user (Admin)
```

### ⚙️ Admin

```
GET  /api/admin/stats                                   # Get platform statistics (Admin)
GET  /api/admin/users                                   # Get all users (Admin)
GET  /api/admin/businesses                              # Get all businesses (Admin)
POST /api/admin/users/:id/suspend                      # Suspend user (Admin)
POST /api/admin/businesses/:id/suspend                 # Suspend business (Admin)
```

## 📊 Query Parameters

### Pagination

```
?page=1&limit=10                # Default pagination
```

### Search & Filters

```
# Hotels
?search=luxury&city=Mumbai&minPrice=5000&maxPrice=15000&amenities=wifi,pool

# Products
?search=phone&category=electronics&minPrice=10000&maxPrice=50000&inStock=true

# Vehicles
?search=BMW&brand=BMW&category=car&fuelType=petrol&minYear=2020
```

### Sorting

```
?sortBy=createdAt&sortOrder=desc    # Sort by creation date (newest first)
?sortBy=price&sortOrder=asc         # Sort by price (lowest first)
?sortBy=rating&sortOrder=desc       # Sort by rating (highest first)
```

## 📝 Request Examples

### Create Business

```javascript
POST /api/business
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Grand Palace Hotel",
  "type": "hotel",
  "businessInfo": {
    "description": "Luxury hotel in the heart of the city",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001"
    },
    "contact": {
      "phone": "+91-22-12345678",
      "email": "info@grandpalace.com"
    }
  },
  "branding": {
    "logo": "https://example.com/logo.png",
    "colors": {
      "primary": "#FF6B35",
      "secondary": "#004E89"
    }
  }
}
```

### Create Hotel

```javascript
POST /api/hotels
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Grand Palace Hotel",
  "business": "business_id_here",
  "description": "A luxurious 5-star hotel",
  "address": {
    "street": "123 Hotel Avenue",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  },
  "pricing": {
    "basePrice": 5000,
    "currency": "INR"
  },
  "amenities": ["wifi", "parking", "pool", "spa", "gym"],
  "images": {
    "main": "https://example.com/hotel-main.jpg",
    "gallery": [
      "https://example.com/hotel-1.jpg",
      "https://example.com/hotel-2.jpg"
    ]
  }
}
```

### Search Hotels

```javascript
GET /api/hotels/search?city=Mumbai&checkIn=2024-01-15&checkOut=2024-01-17&guests=2&minPrice=3000&maxPrice=10000
```

### Create Product

```javascript
POST /api/ecommerce/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Premium Smartphone",
  "business": "business_id_here",
  "category": "category_id_here",
  "description": "High-end smartphone with advanced features",
  "sku": "PHONE-001",
  "pricing": {
    "price": 45000,
    "originalPrice": 50000,
    "onSale": true
  },
  "inventory": {
    "quantity": 50,
    "trackQuantity": true
  },
  "images": {
    "main": "https://example.com/phone-main.jpg",
    "gallery": [
      "https://example.com/phone-1.jpg",
      "https://example.com/phone-2.jpg"
    ]
  }
}
```

## 📨 Response Format

All API responses follow this consistent format:

### Success Response

```javascript
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully" // Optional
}
```

### Error Response

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information", // Optional
  "errors": [                           // Validation errors
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response

```javascript
{
  "success": true,
  "data": {
    "items": [...],              // Array of items
    "pagination": {
      "current": 1,              // Current page
      "pages": 10,               // Total pages
      "total": 100,              // Total items
      "limit": 10                // Items per page
    }
  }
}
```

## 🔒 Authentication & Authorization

### User Roles

- **user** - Can view public content, make bookings/orders
- **vendor** - Can manage their businesses and content
- **admin** - Full access to all resources

### JWT Token Structure

```javascript
{
  "userId": "user_id_here",
  "role": "vendor",
  "iat": 1640995200,
  "exp": 1641600000
}
```

## 📈 Analytics Endpoints

### Business Analytics

```javascript
GET /api/business/:id/analytics
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "totalViews": 1250,
    "totalBookings": 45,
    "totalRevenue": 225000,
    "conversionRate": 3.6,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## 🧪 Testing

### Run Integration Tests

```bash
npm run test:integration
```

### Manual Testing with cURL

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

# Get business data
curl http://localhost:5000/api/business/grand-palace-hotel
```

## 🐳 Docker Support

### Development

```bash
docker-compose up backend-dev
```

### Production

```bash
docker-compose up -d
```

## 📊 Database Schema

### Key Models

- **User** - Authentication and user profiles
- **Business** - Multi-tenant business entities
- **Hotel** - Hotel-specific data and rooms
- **Product** - E-commerce products and inventory
- **Vehicle** - Automobile listings and specifications
- **Service** - Wedding and business services
- **Booking** - Bookings and reservations
- **Order** - E-commerce orders

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://user:pass@host:port/database
JWT_SECRET=your-secure-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

### Performance Tips

1. Use MongoDB Atlas for production database
2. Implement Redis for caching
3. Use Cloudinary for image storage
4. Set up proper SSL certificates
5. Configure reverse proxy (nginx)
6. Use PM2 for process management

## 🤝 Support

For issues or questions:

1. Check the [README.md](./README.md) for setup instructions
2. Run the integration tests: `npm run test:integration`
3. Review the error logs in the `logs/` directory
4. Create an issue in the repository

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy coding! 🎉**
