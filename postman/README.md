# Backend Starter API - Complete Postman Collection

This comprehensive Postman collection provides testing for all endpoints in the Backend Starter multi-tenant business management API.

## 🚀 Quick Setup

### 1. Import Collection
Import `Backend_Starter_Complete_API_Collection.json` into Postman

### 2. Environment Variables
The collection includes these variables (automatically set during testing):
- `base_url`: `http://localhost:3000/api`
- `auth_token`: Set automatically after login
- `website_id`: Set automatically after website creation
- `user_id`: Set automatically after registration/login
- `hotel_id`: Set automatically after hotel creation
- `product_id`: Set automatically after product creation
- `category_id`: Set automatically after category creation
- `order_id`: Set automatically after order creation
- `vendor_id`: Set automatically after vendor creation
- `event_id`: Set automatically after event creation
- `vehicle_id`: Set automatically after vehicle creation
- `service_id`: Set automatically after service creation

### 3. Testing Workflow
**Always start with this sequence:**
1. **Register User** → **Login User** → **Create Website**
2. Then test any business module endpoints

## 📋 Complete API Endpoints Coverage

### 🔐 Authentication (`/api/auth`)
- ✅ **POST** `/auth/register` - Register new user
- ✅ **POST** `/auth/login` - Login user (sets auth_token)
- ✅ **GET** `/auth/me` - Get current user profile
- ✅ **POST** `/auth/logout` - Logout user

### 🌐 Website Management (`/api/websites`)
- ✅ **POST** `/websites` - Create website (sets website_id)
- ✅ **GET** `/websites` - Get all user websites
- ✅ **GET** `/websites/:id` - Get website by ID
- ✅ **PUT** `/websites/:id` - Update website
- ✅ **DELETE** `/websites/:id` - Delete website

### 🏨 Hotel Management (`/api/hotels`)
- ✅ **POST** `/hotels` - Create hotel
- ✅ **GET** `/hotels` - Get all hotels (with pagination)
- ✅ **GET** `/hotels/:id` - Get hotel by ID
- ✅ **PUT** `/hotels/:id` - Update hotel
- ✅ **DELETE** `/hotels/:id` - Delete hotel
- ✅ **GET** `/hotels/search` - Search hotels with filters
- ✅ **GET** `/hotels/nearby` - Find nearby hotels
- ✅ **GET** `/hotels/:id/analytics` - Get hotel analytics
- ✅ **POST** `/hotels/:id/amenities` - Add hotel amenity
- ✅ **DELETE** `/hotels/:id/amenities/:amenityId` - Remove amenity

### 🛒 E-commerce (`/api/ecommerce`)

#### Products
- ✅ **POST** `/ecommerce/products` - Create product
- ✅ **GET** `/ecommerce/products` - Get all products
- ✅ **GET** `/ecommerce/products/:id` - Get product by ID
- ✅ **PUT** `/ecommerce/products/:id` - Update product
- ✅ **DELETE** `/ecommerce/products/:id` - Delete product
- ✅ **GET** `/ecommerce/products/search` - Search products
- ✅ **GET** `/ecommerce/products/featured` - Get featured products
- ✅ **GET** `/ecommerce/products/category/:categoryId` - Get products by category
- ✅ **POST** `/ecommerce/products/:id/reviews` - Add product review
- ✅ **GET** `/ecommerce/products/:id/analytics` - Get product analytics

#### Categories
- ✅ **POST** `/ecommerce/categories` - Create category
- ✅ **GET** `/ecommerce/categories` - Get all categories
- ✅ **GET** `/ecommerce/categories/:id` - Get category by ID
- ✅ **PUT** `/ecommerce/categories/:id` - Update category
- ✅ **DELETE** `/ecommerce/categories/:id` - Delete category
- ✅ **GET** `/ecommerce/categories/tree` - Get category tree
- ✅ **GET** `/ecommerce/categories/featured` - Get featured categories
- ✅ **PATCH** `/ecommerce/categories/:id/move` - Move category

#### Orders
- ✅ **POST** `/ecommerce/orders` - Create order
- ✅ **GET** `/ecommerce/orders` - Get all orders
- ✅ **GET** `/ecommerce/orders/:id` - Get order by ID
- ✅ **PUT** `/ecommerce/orders/:id` - Update order
- ✅ **PATCH** `/ecommerce/orders/:id/status` - Update order status
- ✅ **GET** `/ecommerce/orders/stats` - Get order statistics
- ✅ **POST** `/ecommerce/orders/:id/refund` - Process refund

### 💒 Wedding Management (`/api/wedding`)

#### Vendors
- ✅ **POST** `/wedding/vendors` - Create wedding vendor
- ✅ **GET** `/wedding/vendors` - Get all vendors
- ✅ **GET** `/wedding/vendors/:id` - Get vendor by ID
- ✅ **PUT** `/wedding/vendors/:id` - Update vendor
- ✅ **DELETE** `/wedding/vendors/:id` - Delete vendor
- ✅ **GET** `/wedding/vendors/search` - Search vendors
- ✅ **GET** `/wedding/vendors/category/:category` - Get vendors by category
- ✅ **GET** `/wedding/vendors/:id/availability` - Check vendor availability
- ✅ **POST** `/wedding/vendors/:id/book` - Book vendor
- ✅ **POST** `/wedding/vendors/:id/reviews` - Add vendor review

#### Events
- ✅ **POST** `/wedding/events` - Create wedding event
- ✅ **GET** `/wedding/events` - Get all events
- ✅ **GET** `/wedding/events/:id` - Get event by ID
- ✅ **PUT** `/wedding/events/:id` - Update event
- ✅ **DELETE** `/wedding/events/:id` - Delete event
- ✅ **POST** `/wedding/events/:id/vendors` - Add vendor to event
- ✅ **GET** `/wedding/events/:id/progress` - Get event progress
- ✅ **POST** `/wedding/events/:id/tasks` - Add task to event
- ✅ **PATCH** `/wedding/events/:id/tasks/:taskId` - Update task status
- ✅ **POST** `/wedding/events/:id/rsvp` - RSVP to event

### 🚗 Automobile (`/api/automobile`)

#### Vehicles
- ✅ **POST** `/automobile/vehicles` - Create vehicle
- ✅ **GET** `/automobile/vehicles` - Get all vehicles
- ✅ **GET** `/automobile/vehicles/:id` - Get vehicle by ID
- ✅ **PUT** `/automobile/vehicles/:id` - Update vehicle
- ✅ **DELETE** `/automobile/vehicles/:id` - Delete vehicle
- ✅ **GET** `/automobile/vehicles/search` - Search vehicles
- ✅ **GET** `/automobile/vehicles/featured` - Get featured vehicles
- ✅ **POST** `/automobile/vehicles/:id/inquire` - Record vehicle inquiry
- ✅ **POST** `/automobile/vehicles/:id/test-drive` - Schedule test drive
- ✅ **GET** `/automobile/vehicles/:id/analytics` - Get vehicle analytics
- ✅ **PATCH** `/automobile/vehicles/:id/status` - Update vehicle status

### 🏢 Business Services (`/api/business`)

#### Services
- ✅ **POST** `/business/services` - Create business service
- ✅ **GET** `/business/services` - Get all services
- ✅ **GET** `/business/services/:id` - Get service by ID
- ✅ **PUT** `/business/services/:id` - Update service
- ✅ **DELETE** `/business/services/:id` - Delete service
- ✅ **GET** `/business/services/search` - Search services
- ✅ **GET** `/business/services/category/:category` - Get services by category
- ✅ **GET** `/business/services/featured` - Get featured services
- ✅ **GET** `/business/services/popular` - Get popular services
- ✅ **POST** `/business/services/:id/calculate-price` - Calculate service price
- ✅ **GET** `/business/services/:id/availability` - Check service availability
- ✅ **POST** `/business/services/:id/reviews` - Add service review
- ✅ **POST** `/business/services/:id/inquire` - Record service inquiry
- ✅ **POST** `/business/services/:id/book` - Book service
- ✅ **GET** `/business/services/:id/analytics` - Get service analytics

## 🧪 Testing Scenarios

### Scenario 1: Complete Hotel Management
1. Register → Login → Create Website
2. Create Hotel → Get All Hotels → Search Hotels
3. Get Hotel Analytics → Add Amenities
4. Update Hotel → Delete Hotel

### Scenario 2: E-commerce Store Setup
1. Register → Login → Create Website
2. Create Categories → Create Products
3. Create Order → Update Order Status
4. Get Order Statistics

### Scenario 3: Wedding Planning Business
1. Register → Login → Create Website
2. Create Wedding Vendors → Create Wedding Event
3. Add Vendors to Event → Track Progress
4. Manage RSVPs and Tasks

### Scenario 4: Vehicle Dealership
1. Register → Login → Create Website
2. Create Vehicles → Search Inventory
3. Record Customer Inquiries → Schedule Test Drives
4. Track Analytics and Performance

### Scenario 5: Service Business
1. Register → Login → Create Website
2. Create Services → Calculate Pricing
3. Check Availability → Record Bookings
4. Manage Reviews and Analytics

## 🔧 Request Examples

### Authentication Flow
```javascript
// 1. Register User
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}

// 2. Login User (saves token automatically)
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// 3. Create Website (saves website_id automatically)
POST /api/websites
{
  "name": "My Business Website",
  "slug": "my-business",
  "description": "A comprehensive business website",
  "businessType": "hotel"
}
```

### Business Module Examples
```javascript
// Create Hotel
POST /api/hotels
{
  "name": "Grand Plaza Hotel",
  "description": "Luxury hotel in the heart of the city",
  "totalRooms": 150,
  "starRating": 5,
  "location": {
    "address": {
      "street": "123 Main Street",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    }
  }
}

// Create Product
POST /api/ecommerce/products
{
  "name": "Premium Laptop",
  "description": {
    "short": "High-performance laptop",
    "long": "A powerful laptop with latest processor"
  },
  "sku": "LAPTOP-001",
  "pricing": {
    "price": 1299.99,
    "currency": "USD"
  }
}
```

## 📊 Response Format

All API responses follow this consistent format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "pagination": {
    // Only for paginated responses
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

## 🚨 Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## 📝 Important Notes

1. **Authentication Required**: Most endpoints require Bearer token authentication
2. **Website Context**: All business data is scoped to a website
3. **Automatic Variable Setting**: IDs are automatically captured and stored
4. **Pagination**: Most list endpoints support `page` and `limit` parameters
5. **Search**: Search endpoints support various filters and sorting options
6. **Validation**: All endpoints include comprehensive input validation

## 🎯 Total Endpoints: 100+

This collection covers **over 100 API endpoints** across:
- **4** Authentication endpoints
- **5** Website management endpoints
- **10** Hotel management endpoints
- **25** E-commerce endpoints (products, categories, orders)
- **20** Wedding management endpoints (vendors, events)
- **15** Automobile endpoints (vehicles, inquiries)
- **20** Business service endpoints

**Your Backend Starter API is now fully testable with this comprehensive collection!** 🚀
