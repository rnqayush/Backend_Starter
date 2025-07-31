# Backend Starter API - Postman Collection Guide

This guide provides comprehensive API testing instructions for all business modules in the Backend Starter application.

## 🚀 Quick Setup

### 1. Environment Variables
Set up these variables in Postman:
- `base_url`: `http://localhost:3000/api`
- `auth_token`: (will be set automatically after login)
- `website_id`: (will be set automatically after website creation)
- `user_id`: (will be set automatically after login)

### 2. Authentication Flow
Always start with authentication to get your access token:

1. **Register User** → **Login User** → **Create Website**
2. The login request will automatically set your `auth_token`
3. The create website request will automatically set your `website_id`

## 📋 Complete API Endpoints

### 🔐 Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
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
Authorization: Bearer {{auth_token}}
```

#### Logout User
```http
POST /api/auth/logout
Authorization: Bearer {{auth_token}}
```

---

### 🌐 Website Management (`/api/websites`)

#### Create Website
```http
POST /api/websites
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "My Business Website",
  "slug": "my-business",
  "description": "A comprehensive business website",
  "businessType": "hotel",
  "settings": {
    "theme": "modern",
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d"
  }
}
```

#### Get All Websites
```http
GET /api/websites
Authorization: Bearer {{auth_token}}
```

#### Get Website by ID
```http
GET /api/websites/{{website_id}}
Authorization: Bearer {{auth_token}}
```

---

### 🏨 Hotel Management (`/api/hotels`)

#### Create Hotel
```http
POST /api/hotels
Authorization: Bearer {{auth_token}}
Content-Type: application/json

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
    },
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "contact": {
    "phone": "+1-555-0123",
    "email": "info@grandplaza.com",
    "website": "https://grandplaza.com"
  },
  "priceRange": {
    "min": 200,
    "max": 800,
    "currency": "USD"
  },
  "amenities": [
    {
      "name": "Free WiFi",
      "category": "general",
      "icon": "wifi"
    }
  ]
}
```

#### Get All Hotels
```http
GET /api/hotels?page=1&limit=10&status=active
```

#### Search Hotels
```http
GET /api/hotels/search?location=New York&checkIn=2024-03-01&checkOut=2024-03-05&guests=2&starRating=4
```

#### Get Nearby Hotels
```http
GET /api/hotels/nearby?latitude=40.7128&longitude=-74.0060&maxDistance=5000
```

#### Get Hotel Analytics
```http
GET /api/hotels/{{hotel_id}}/analytics
Authorization: Bearer {{auth_token}}
```

---

### 🛒 E-commerce (`/api/ecommerce`)

#### Products

##### Create Product
```http
POST /api/ecommerce/products
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Premium Laptop",
  "description": {
    "short": "High-performance laptop for professionals",
    "long": "A powerful laptop with latest processor and graphics card"
  },
  "sku": "LAPTOP-001",
  "category": "{{category_id}}",
  "pricing": {
    "price": 1299.99,
    "comparePrice": 1499.99,
    "currency": "USD"
  },
  "inventory": {
    "trackQuantity": true,
    "quantity": 50,
    "allowBackorder": false
  },
  "images": [
    {
      "url": "https://example.com/laptop1.jpg",
      "alt": "Premium Laptop Front View",
      "isPrimary": true
    }
  ]
}
```

##### Get All Products
```http
GET /api/ecommerce/products?page=1&limit=20&status=active
```

##### Search Products
```http
GET /api/ecommerce/products/search?q=laptop&category=electronics&minPrice=500&maxPrice=2000
```

##### Get Featured Products
```http
GET /api/ecommerce/products/featured?limit=10
```

#### Categories

##### Create Category
```http
POST /api/ecommerce/categories
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "parent": null,
  "isVisible": true,
  "sortOrder": 1
}
```

##### Get Category Tree
```http
GET /api/ecommerce/categories?tree=true
```

#### Orders

##### Create Order
```http
POST /api/ecommerce/orders
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "items": [
    {
      "product": "{{product_id}}",
      "quantity": 2,
      "price": 1299.99
    }
  ],
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  },
  "billingAddress": {
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "payment": {
    "method": "credit-card",
    "status": "pending"
  }
}
```

##### Get Order Statistics
```http
GET /api/ecommerce/orders/stats
Authorization: Bearer {{auth_token}}
```

---

### 💒 Wedding Management (`/api/wedding`)

#### Vendors

##### Create Wedding Vendor
```http
POST /api/wedding/vendors
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Elite Photography",
  "businessName": "Elite Photography Studio",
  "category": "photographer",
  "description": "Professional wedding photography services",
  "contact": {
    "email": "info@elitephoto.com",
    "phone": "+1-555-0456",
    "website": "https://elitephoto.com"
  },
  "location": {
    "address": {
      "street": "456 Photo Lane",
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "zipCode": "90210"
    },
    "serviceAreas": ["Los Angeles", "Beverly Hills", "Santa Monica"]
  },
  "pricing": {
    "startingPrice": 2500,
    "currency": "USD",
    "packages": [
      {
        "name": "Basic Package",
        "price": 2500,
        "description": "6 hours coverage, 200 edited photos"
      }
    ]
  }
}
```

##### Search Wedding Vendors
```http
GET /api/wedding/vendors/search?category=photographer&location=Los Angeles&minRating=4
```

##### Check Vendor Availability
```http
GET /api/wedding/vendors/{{vendor_id}}/availability?date=2024-06-15
```

#### Events

##### Create Wedding Event
```http
POST /api/wedding/events
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "title": "Sarah & Michael's Wedding",
  "couple": {
    "bride": {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "email": "sarah@example.com"
    },
    "groom": {
      "firstName": "Michael",
      "lastName": "Smith",
      "email": "michael@example.com"
    }
  },
  "eventDetails": {
    "weddingDate": "2024-06-15T16:00:00Z",
    "venue": "Grand Ballroom",
    "guestCount": 150,
    "style": "elegant"
  },
  "budget": {
    "total": 50000,
    "currency": "USD"
  }
}
```

##### Get Event Progress
```http
GET /api/wedding/events/{{event_id}}/progress
Authorization: Bearer {{auth_token}}
```

---

### 🚗 Automobile (`/api/automobile`)

#### Vehicles

##### Create Vehicle
```http
POST /api/automobile/vehicles
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "details": {
    "bodyType": "sedan",
    "transmission": "automatic",
    "fuelType": "gasoline",
    "drivetrain": "fwd",
    "engine": "2.5L 4-Cylinder",
    "color": {
      "exterior": "Pearl White",
      "interior": "Black Leather"
    },
    "mileage": 15000
  },
  "condition": "used",
  "pricing": {
    "listPrice": 28999,
    "currency": "USD"
  },
  "features": ["Backup Camera", "Bluetooth", "Cruise Control"]
}
```

##### Search Vehicles
```http
GET /api/automobile/vehicles/search?make=Toyota&yearMin=2020&priceMax=35000&bodyType=sedan
```

##### Record Vehicle Inquiry
```http
POST /api/automobile/vehicles/{{vehicle_id}}/inquire
Content-Type: application/json

{
  "customerInfo": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0789"
  },
  "message": "I'm interested in this vehicle. Can we schedule a test drive?"
}
```

##### Schedule Test Drive
```http
POST /api/automobile/vehicles/{{vehicle_id}}/test-drive
Content-Type: application/json

{
  "customerInfo": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+1-555-0789"
  },
  "preferredDate": "2024-03-15T14:00:00Z",
  "preferredTime": "2:00 PM"
}
```

---

### 🏢 Business Services (`/api/business`)

#### Services

##### Create Business Service
```http
POST /api/business/services
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "name": "Web Development",
  "description": {
    "short": "Custom web development services",
    "long": "Full-stack web development with modern technologies"
  },
  "category": "development",
  "details": {
    "deliveryMethod": "remote",
    "duration": {
      "estimated": 30,
      "unit": "days"
    }
  },
  "pricing": {
    "model": "project-based",
    "basePrice": 5000,
    "currency": "USD",
    "tiers": [
      {
        "name": "Basic Website",
        "price": 3000,
        "description": "Simple 5-page website"
      },
      {
        "name": "E-commerce Site",
        "price": 8000,
        "description": "Full e-commerce solution"
      }
    ]
  }
}
```

##### Calculate Service Price
```http
POST /api/business/services/{{service_id}}/calculate-price
Content-Type: application/json

{
  "tierName": "E-commerce Site",
  "addOns": ["SEO Optimization", "Mobile App"]
}
```

##### Check Service Availability
```http
GET /api/business/services/{{service_id}}/availability?date=2024-03-20
```

##### Add Service Review
```http
POST /api/business/services/{{service_id}}/reviews
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "clientName": "ABC Company",
  "rating": 5,
  "review": "Excellent service, delivered on time and exceeded expectations",
  "serviceDate": "2024-02-15T00:00:00Z",
  "clientTitle": "CTO",
  "clientCompany": "ABC Tech Solutions"
}
```

## 🧪 Testing Workflow

### 1. Authentication Setup
1. Register a new user
2. Login to get auth token
3. Create a website

### 2. Test Each Module
1. **Hotels**: Create → List → Search → Analytics
2. **E-commerce**: Create Category → Create Product → Create Order
3. **Wedding**: Create Vendor → Create Event → Add Vendors to Event
4. **Automobile**: Create Vehicle → Search → Record Inquiry
5. **Business**: Create Service → Calculate Price → Add Review

### 3. Advanced Testing
- Test pagination with different page sizes
- Test search with various filters
- Test analytics endpoints
- Test bulk operations
- Test error scenarios (invalid data, unauthorized access)

## 🔧 Common Headers

### For Authenticated Requests
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

### For Public Requests
```
Content-Type: application/json
```

## 📊 Response Format

All API responses follow this format:
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

## 📝 Notes

1. **Authentication**: Most endpoints require authentication. Always include the Bearer token.
2. **Website Context**: All business data is scoped to a website. Make sure to create a website first.
3. **Validation**: The API includes comprehensive validation. Check error messages for required fields.
4. **Pagination**: Most list endpoints support pagination with `page` and `limit` parameters.
5. **Search**: Search endpoints support various filters and sorting options.

## 🎯 Quick Test Scenarios

### Scenario 1: Hotel Booking System
1. Create hotel → Create rooms → Search available hotels → Get analytics

### Scenario 2: E-commerce Store
1. Create categories → Create products → Create order → Track order status

### Scenario 3: Wedding Planning
1. Create vendors → Create event → Add vendors to event → Track progress

### Scenario 4: Car Dealership
1. Create vehicles → Search inventory → Record inquiries → Track analytics

### Scenario 5: Service Business
1. Create services → Calculate pricing → Record bookings → Add reviews

This comprehensive guide covers all major endpoints and use cases for testing the Backend Starter API!
