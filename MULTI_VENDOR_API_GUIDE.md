# Multi-Vendor Backend API Guide

A comprehensive backend system supporting multiple business categories including hotels, ecommerce, wedding services, automobiles, and business services.

## 🏗️ Architecture Overview

### Business Categories Supported
- **Hotels**: Room management, bookings, amenities
- **Ecommerce**: Products, inventory, orders
- **Wedding Services**: Vendor portfolios, event planning
- **Automobiles**: Vehicle listings, dealer management
- **Business Services**: Service profiles, appointments

### Key Features
- Multi-tenant vendor system
- Role-based access control
- Universal booking system
- Payment integration ready
- Review and rating system
- Analytics dashboard
- SEO optimization
- File upload support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd multi-vendor-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/multi-vendor-db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret
COOKIE_EXPIRE=7

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication
```http
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
POST /api/auth/logout      # Logout user
```

### Vendors
```http
GET    /api/vendors                    # Get all vendors
POST   /api/vendors                    # Create vendor profile
GET    /api/vendors/:id                # Get vendor by ID/slug
PUT    /api/vendors/:id                # Update vendor
DELETE /api/vendors/:id                # Delete vendor
GET    /api/vendors/featured           # Get featured vendors
GET    /api/vendors/search             # Search vendors
GET    /api/vendors/category/:category # Get vendors by category
GET    /api/vendors/dashboard/stats    # Get vendor dashboard
```

### Hotels
```http
GET    /api/hotels                # Get all hotels
POST   /api/hotels                # Create hotel
GET    /api/hotels/:id            # Get hotel by ID/slug
PUT    /api/hotels/:id            # Update hotel
DELETE /api/hotels/:id            # Delete hotel
GET    /api/hotels/featured       # Get featured hotels
GET    /api/hotels/search         # Search hotels
GET    /api/hotels/city/:city     # Get hotels by city
POST   /api/hotels/:id/rooms      # Add room to hotel
PUT    /api/hotels/:id/rooms/:roomId    # Update room
DELETE /api/hotels/:id/rooms/:roomId    # Delete room
```

### Products
```http
GET    /api/products                    # Get all products
POST   /api/products                    # Create product
GET    /api/products/:id                # Get product by ID/slug
PUT    /api/products/:id                # Update product
DELETE /api/products/:id                # Delete product
GET    /api/products/featured           # Get featured products
GET    /api/products/sale               # Get products on sale
GET    /api/products/search             # Search products
GET    /api/products/category/:category # Get products by category
GET    /api/products/vendor/:vendorId   # Get products by vendor
PATCH  /api/products/:id/stock          # Update product stock
```

### Bookings
```http
GET    /api/bookings                # Get all bookings
POST   /api/bookings                # Create booking
GET    /api/bookings/:id            # Get booking by ID
PUT    /api/bookings/:id            # Update booking
GET    /api/bookings/my-bookings    # Get user's bookings
GET    /api/bookings/vendor-bookings # Get vendor's bookings
PATCH  /api/bookings/:id/cancel     # Cancel booking
PATCH  /api/bookings/:id/confirm    # Confirm booking
PATCH  /api/bookings/:id/checkin    # Check-in booking
PATCH  /api/bookings/:id/checkout   # Check-out booking
POST   /api/bookings/:id/review     # Add review to booking
```

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Can browse, book services, leave reviews
- **Vendor**: Can manage their business profile and bookings
- **Admin**: Can manage all vendors and bookings
- **Super Admin**: Full system access

### JWT Token Structure
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "vendor",
  "vendorId": "vendor_id",
  "permissions": ["manage_inventory"],
  "isVerified": true
}
```

### Protected Routes
Most routes require authentication. Use the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

Or cookies (automatically handled by browsers):
```http
Cookie: token=<jwt_token>
```

## 📊 Data Models

### Vendor Model
```javascript
{
  name: "Business Name",
  slug: "business-name-city",
  category: "hotel|ecommerce|wedding|automobile|business",
  owner: ObjectId,
  description: "Business description",
  email: "business@example.com",
  phone: "+1234567890",
  address: {
    street: "123 Main St",
    city: "City",
    state: "State",
    zipCode: "12345",
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  businessHours: {
    monday: "9:00 AM - 6:00 PM",
    // ... other days
  },
  rating: 4.5,
  reviewCount: 150,
  status: "active|pending|suspended",
  isVerified: true,
  isFeatured: false
}
```

### Hotel Model
```javascript
{
  name: "Hotel Name",
  slug: "hotel-name-city",
  vendor: ObjectId,
  location: "City, State",
  starRating: 5,
  startingPrice: 12000,
  totalRooms: 50,
  availableRooms: 35,
  rooms: [{
    id: 1,
    name: "Deluxe Room",
    type: "Deluxe",
    price: 15000,
    maxGuests: 2,
    amenities: ["WiFi", "AC", "TV"],
    available: true
  }],
  sections: {
    hero: { title: "Hotel Title", subtitle: "Subtitle" },
    // ... other sections
  }
}
```

### Product Model
```javascript
{
  name: "Product Name",
  slug: "product-name-brand",
  vendor: ObjectId,
  category: "electronics",
  pricing: {
    price: 299.99,
    originalPrice: 399.99,
    onSale: true,
    currency: "USD"
  },
  media: {
    mainImage: "image_url",
    images: ["image1", "image2"]
  },
  specifications: {
    brand: "Brand Name",
    model: "Model",
    features: ["Feature 1", "Feature 2"]
  },
  availability: {
    status: "in_stock",
    quantity: 50
  }
}
```

### Booking Model
```javascript
{
  bookingId: "BK123456",
  user: ObjectId,
  vendor: ObjectId,
  category: "hotel",
  
  // Hotel-specific
  hotel: ObjectId,
  roomId: 1,
  checkIn: "2024-03-15",
  checkOut: "2024-03-18",
  guests: 2,
  
  // Guest information
  guestInfo: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  
  // Pricing
  basePrice: 45000,
  taxes: 5400,
  totalPrice: 50400,
  
  // Payment
  payment: {
    method: "card",
    status: "completed",
    transactionId: "txn_123"
  },
  
  status: "confirmed"
}
```

## 🔍 Query Parameters

### Pagination
```http
GET /api/vendors?page=1&limit=10
```

### Filtering
```http
GET /api/hotels?city=Mumbai&starRating=5&minPrice=5000&maxPrice=15000
GET /api/products?category=electronics&brand=Apple&inStock=true
```

### Sorting
```http
GET /api/vendors?sortBy=rating&sortOrder=desc
GET /api/products?sortBy=price&sortOrder=asc
```

### Search
```http
GET /api/vendors/search?q=luxury+hotel&city=Mumbai
GET /api/products/search?q=smartphone&category=electronics
```

## 📱 Response Format

### Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    "vendors": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### Error Response
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      }
    ]
  }
}
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔧 Development

### Project Structure
```
multi-vendor-backend/
├── config/
│   ├── db.js
│   └── constants.js
├── controllers/
│   ├── auth.controller.js
│   ├── vendor.controller.js
│   ├── hotel.controller.js
│   ├── product.controller.js
│   └── booking.controller.js
├── middleware/
│   ├── auth.middleware.js
│   └── error.middleware.js
├── models/
│   ├── User.js
│   ├── Vendor.js
│   ├── Hotel.js
│   ├── Product.js
│   └── Booking.js
├── routes/
│   ├── auth.routes.js
│   ├── vendor.routes.js
│   ├── hotel.routes.js
│   ├── product.routes.js
│   ├── booking.routes.js
│   └── index.js
├── utils/
│   ├── generateSlug.js
│   └── token.js
└── app.js
```

### Adding New Business Categories

1. **Update Constants**
```javascript
// config/constants.js
export const BUSINESS_CATEGORIES = {
  // ... existing categories
  NEW_CATEGORY: 'new_category'
};
```

2. **Create Controller**
```javascript
// controllers/newCategory.controller.js
export const createNewCategoryItem = catchAsync(async (req, res, next) => {
  // Implementation
});
```

3. **Create Routes**
```javascript
// routes/newCategory.routes.js
router.post('/', requireVendor, createNewCategoryItem);
```

4. **Update Main Routes**
```javascript
// routes/index.js
router.use('/new-category', newCategoryRoutes);
```

## 🧪 Testing

### Manual Testing
Use the provided Postman collection or test with curl:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Create a vendor profile
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"My Hotel","category":"hotel","description":"Luxury hotel"}'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Secure cookie handling
- SQL injection prevention
- XSS protection

## 📈 Performance Optimizations

- Database indexing
- Query optimization
- Pagination
- Caching strategies
- Image optimization
- Compression middleware
- Connection pooling

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure CORS for production domains
5. Set up SSL certificates
6. Configure reverse proxy (nginx)

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review the code comments
3. Test with the provided examples
4. Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with full multi-vendor support
  - Hotel management system
  - Ecommerce platform
  - Booking system
  - Authentication & authorization
  - Analytics dashboard

---

**Happy Coding! 🎉**
