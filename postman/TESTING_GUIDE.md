# 🧪 Complete API Testing Guide

This guide provides comprehensive testing instructions for all endpoints in the Backend Starter API using both Postman and curl commands.

## 🚀 Quick Start

### Option 1: Using Postman (Recommended)
1. Import `Backend_Starter_Complete_Collection.json` into Postman
2. Follow the README.md instructions
3. Use the automated variable setting for seamless testing

### Option 2: Using curl Commands
Follow the curl examples below for manual testing

## 📋 Complete Testing Workflow

### Step 1: Authentication Setup

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

#### Login User (Save the token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:** Save the `token` from response for subsequent requests
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "_id": "user_id_here", ... }
  }
}
```

#### Create Website (Save the website_id)
```bash
curl -X POST http://localhost:3000/api/websites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Business Website",
    "slug": "my-business",
    "description": "A comprehensive business website",
    "businessType": "hotel"
  }'
```

### Step 2: Hotel Management Testing

#### Create Hotel
```bash
curl -X POST http://localhost:3000/api/hotels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
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
      "email": "info@grandplaza.com"
    },
    "priceRange": {
      "min": 200,
      "max": 800,
      "currency": "USD"
    }
  }'
```

#### Get All Hotels
```bash
curl -X GET "http://localhost:3000/api/hotels?page=1&limit=10"
```

#### Search Hotels
```bash
curl -X GET "http://localhost:3000/api/hotels/search?location=New%20York&checkIn=2024-03-01&checkOut=2024-03-05&guests=2&starRating=4"
```

#### Get Hotel Analytics
```bash
curl -X GET http://localhost:3000/api/hotels/HOTEL_ID_HERE/analytics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: E-commerce Testing

#### Create Category First
```bash
curl -X POST http://localhost:3000/api/ecommerce/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "isVisible": true,
    "sortOrder": 1
  }'
```

#### Create Product
```bash
curl -X POST http://localhost:3000/api/ecommerce/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Premium Laptop",
    "description": {
      "short": "High-performance laptop for professionals",
      "long": "A powerful laptop with latest processor and graphics card"
    },
    "sku": "LAPTOP-001",
    "category": "CATEGORY_ID_HERE",
    "pricing": {
      "price": 1299.99,
      "comparePrice": 1499.99,
      "currency": "USD"
    },
    "inventory": {
      "trackQuantity": true,
      "quantity": 50,
      "allowBackorder": false
    }
  }'
```

#### Search Products
```bash
curl -X GET "http://localhost:3000/api/ecommerce/products/search?q=laptop&minPrice=500&maxPrice=2000"
```

#### Create Order
```bash
curl -X POST http://localhost:3000/api/ecommerce/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "items": [
      {
        "product": "PRODUCT_ID_HERE",
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
  }'
```

### Step 4: Wedding Management Testing

#### Create Wedding Vendor
```bash
curl -X POST http://localhost:3000/api/wedding/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Elite Photography",
    "businessName": "Elite Photography Studio",
    "category": "photographer",
    "description": "Professional wedding photography services",
    "contact": {
      "email": "info@elitephoto.com",
      "phone": "+1-555-0456"
    },
    "location": {
      "address": {
        "street": "456 Photo Lane",
        "city": "Los Angeles",
        "state": "CA",
        "country": "USA",
        "zipCode": "90210"
      },
      "serviceAreas": ["Los Angeles", "Beverly Hills"]
    },
    "pricing": {
      "startingPrice": 2500,
      "currency": "USD"
    }
  }'
```

#### Create Wedding Event
```bash
curl -X POST http://localhost:3000/api/wedding/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Sarah & Michael Wedding",
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
      "guestCount": 150
    },
    "budget": {
      "total": 50000,
      "currency": "USD"
    }
  }'
```

#### Search Wedding Vendors
```bash
curl -X GET "http://localhost:3000/api/wedding/vendors/search?category=photographer&location=Los%20Angeles&minRating=4"
```

### Step 5: Automobile Testing

#### Create Vehicle
```bash
curl -X POST http://localhost:3000/api/automobile/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
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
  }'
```

#### Search Vehicles
```bash
curl -X GET "http://localhost:3000/api/automobile/vehicles/search?make=Toyota&yearMin=2020&priceMax=35000&bodyType=sedan"
```

#### Record Vehicle Inquiry
```bash
curl -X POST http://localhost:3000/api/automobile/vehicles/VEHICLE_ID_HERE/inquire \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1-555-0789"
    },
    "message": "I am interested in this vehicle. Can we schedule a test drive?"
  }'
```

### Step 6: Business Services Testing

#### Create Business Service
```bash
curl -X POST http://localhost:3000/api/business/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
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
        }
      ]
    }
  }'
```

#### Calculate Service Price
```bash
curl -X POST http://localhost:3000/api/business/services/SERVICE_ID_HERE/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "tierName": "Basic Website",
    "addOns": ["SEO Optimization"]
  }'
```

#### Add Service Review
```bash
curl -X POST http://localhost:3000/api/business/services/SERVICE_ID_HERE/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "clientName": "ABC Company",
    "rating": 5,
    "review": "Excellent service, delivered on time and exceeded expectations",
    "serviceDate": "2024-02-15T00:00:00Z",
    "clientTitle": "CTO",
    "clientCompany": "ABC Tech Solutions"
  }'
```

## 🔍 Advanced Testing Scenarios

### Scenario 1: Complete Hotel Booking Flow
```bash
# 1. Create hotel
# 2. Search available hotels
# 3. Get hotel details
# 4. Check analytics
# 5. Add amenities
```

### Scenario 2: E-commerce Order Flow
```bash
# 1. Create categories
# 2. Create products
# 3. Search products
# 4. Create order
# 5. Update order status
# 6. Get order statistics
```

### Scenario 3: Wedding Planning Flow
```bash
# 1. Create vendors
# 2. Create wedding event
# 3. Add vendors to event
# 4. Update vendor status
# 5. Track event progress
```

### Scenario 4: Vehicle Sales Flow
```bash
# 1. Create vehicles
# 2. Search inventory
# 3. Record customer inquiries
# 4. Schedule test drives
# 5. Update vehicle status
```

### Scenario 5: Service Business Flow
```bash
# 1. Create services
# 2. Calculate pricing
# 3. Check availability
# 4. Record bookings
# 5. Add client reviews
```

## 🧪 Testing Checklist

### ✅ Authentication
- [ ] User registration
- [ ] User login
- [ ] Token validation
- [ ] User logout

### ✅ Website Management
- [ ] Create website
- [ ] List websites
- [ ] Get website details
- [ ] Update website

### ✅ Hotel Management
- [ ] Create hotel
- [ ] List hotels
- [ ] Search hotels
- [ ] Get hotel details
- [ ] Update hotel
- [ ] Delete hotel
- [ ] Get analytics
- [ ] Manage amenities

### ✅ E-commerce
- [ ] Category CRUD operations
- [ ] Product CRUD operations
- [ ] Order management
- [ ] Search functionality
- [ ] Inventory tracking

### ✅ Wedding Management
- [ ] Vendor management
- [ ] Event planning
- [ ] Vendor booking
- [ ] Progress tracking
- [ ] Budget management

### ✅ Automobile
- [ ] Vehicle inventory
- [ ] Search vehicles
- [ ] Customer inquiries
- [ ] Test drive scheduling
- [ ] Analytics tracking

### ✅ Business Services
- [ ] Service management
- [ ] Price calculation
- [ ] Availability checking
- [ ] Review system
- [ ] Booking management

## 🚨 Error Testing

Test these error scenarios:
- Invalid authentication tokens
- Missing required fields
- Invalid data formats
- Unauthorized access attempts
- Non-existent resource requests
- Validation failures

## 📊 Performance Testing

Test with:
- Large datasets (pagination)
- Multiple concurrent requests
- Search with various filters
- Bulk operations
- Analytics queries

## 🔧 Environment Setup

### Development
```
BASE_URL=http://localhost:3000/api
```

### Staging
```
BASE_URL=https://staging-api.yourdomain.com/api
```

### Production
```
BASE_URL=https://api.yourdomain.com/api
```

This comprehensive testing guide ensures all endpoints are thoroughly tested across all business modules!
