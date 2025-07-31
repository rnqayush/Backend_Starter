# 🔧 Complete API Testing with cURL Commands

This file provides comprehensive cURL commands for testing all endpoints in your Backend Starter API.

## 🚀 Setup Variables

First, set these environment variables in your terminal:

```bash
export BASE_URL="http://localhost:3000/api"
export AUTH_TOKEN=""
export WEBSITE_ID=""
export USER_ID=""
export HOTEL_ID=""
export PRODUCT_ID=""
export CATEGORY_ID=""
export ORDER_ID=""
export VENDOR_ID=""
export EVENT_ID=""
export VEHICLE_ID=""
export SERVICE_ID=""
```

## 🔐 Authentication Flow

### 1. Register User
```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### 2. Login User (Save the token)
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Copy the token from response and set it:
export AUTH_TOKEN="your_jwt_token_here"
```

### 3. Get Current User
```bash
curl -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 4. Logout User
```bash
curl -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 🌐 Website Management

### Create Website (Save the website_id)
```bash
curl -X POST "$BASE_URL/websites" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "My Business Website",
    "slug": "my-business",
    "description": "A comprehensive business website",
    "businessType": "hotel",
    "settings": {
      "theme": "modern",
      "primaryColor": "#007bff",
      "secondaryColor": "#6c757d"
    }
  }'

# Copy the website_id from response and set it:
export WEBSITE_ID="your_website_id_here"
```

### Get All Websites
```bash
curl -X GET "$BASE_URL/websites" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Get Website by ID
```bash
curl -X GET "$BASE_URL/websites/$WEBSITE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Update Website
```bash
curl -X PUT "$BASE_URL/websites/$WEBSITE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Updated Business Website",
    "description": "Updated comprehensive business website"
  }'
```

### Delete Website
```bash
curl -X DELETE "$BASE_URL/websites/$WEBSITE_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 🏨 Hotel Management

### Create Hotel (Save the hotel_id)
```bash
curl -X POST "$BASE_URL/hotels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
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
      },
      {
        "name": "Swimming Pool",
        "category": "recreation",
        "icon": "pool"
      }
    ]
  }'

# Copy the hotel_id from response and set it:
export HOTEL_ID="your_hotel_id_here"
```

### Get All Hotels
```bash
curl -X GET "$BASE_URL/hotels?page=1&limit=10"
```

### Get Hotel by ID
```bash
curl -X GET "$BASE_URL/hotels/$HOTEL_ID"
```

### Search Hotels
```bash
curl -X GET "$BASE_URL/hotels/search?location=New%20York&checkIn=2024-03-01&checkOut=2024-03-05&guests=2&starRating=4"
```

### Get Nearby Hotels
```bash
curl -X GET "$BASE_URL/hotels/nearby?latitude=40.7128&longitude=-74.0060&maxDistance=5000"
```

### Get Hotel Analytics
```bash
curl -X GET "$BASE_URL/hotels/$HOTEL_ID/analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Add Hotel Amenity
```bash
curl -X POST "$BASE_URL/hotels/$HOTEL_ID/amenities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Fitness Center",
    "description": "24/7 fitness center with modern equipment",
    "category": "wellness",
    "icon": "dumbbell"
  }'
```

### Update Hotel
```bash
curl -X PUT "$BASE_URL/hotels/$HOTEL_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Grand Plaza Hotel & Spa",
    "description": "Luxury hotel and spa in the heart of the city",
    "starRating": 5
  }'
```

### Delete Hotel
```bash
curl -X DELETE "$BASE_URL/hotels/$HOTEL_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 🛒 E-commerce Management

### Categories

#### Create Category (Save the category_id)
```bash
curl -X POST "$BASE_URL/ecommerce/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "slug": "electronics",
    "isFeatured": true,
    "sortOrder": 1
  }'

# Copy the category_id from response and set it:
export CATEGORY_ID="your_category_id_here"
```

#### Get All Categories
```bash
curl -X GET "$BASE_URL/ecommerce/categories" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Get Category Tree
```bash
curl -X GET "$BASE_URL/ecommerce/categories?tree=true" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Get Featured Categories
```bash
curl -X GET "$BASE_URL/ecommerce/categories/featured" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Products

#### Create Product (Save the product_id)
```bash
curl -X POST "$BASE_URL/ecommerce/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Premium Laptop",
    "description": {
      "short": "High-performance laptop for professionals",
      "long": "A powerful laptop with the latest processor, ample RAM, and fast SSD storage perfect for professional work."
    },
    "sku": "LAPTOP-001",
    "category": "'$CATEGORY_ID'",
    "pricing": {
      "price": 1299.99,
      "compareAtPrice": 1499.99,
      "currency": "USD"
    },
    "inventory": {
      "quantity": 50,
      "trackQuantity": true,
      "allowBackorder": false
    },
    "specifications": [
      {
        "name": "Processor",
        "value": "Intel Core i7"
      },
      {
        "name": "RAM",
        "value": "16GB"
      },
      {
        "name": "Storage",
        "value": "512GB SSD"
      }
    ],
    "isFeatured": true,
    "status": "active"
  }'

# Copy the product_id from response and set it:
export PRODUCT_ID="your_product_id_here"
```

#### Get All Products
```bash
curl -X GET "$BASE_URL/ecommerce/products?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Search Products
```bash
curl -X GET "$BASE_URL/ecommerce/products/search?q=laptop&category=$CATEGORY_ID&minPrice=1000&maxPrice=2000" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Get Featured Products
```bash
curl -X GET "$BASE_URL/ecommerce/products/featured" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Add Product Review
```bash
curl -X POST "$BASE_URL/ecommerce/products/$PRODUCT_ID/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "customerName": "Jane Smith",
    "rating": 5,
    "title": "Excellent laptop!",
    "comment": "Great performance and build quality. Highly recommended!"
  }'
```

### Orders

#### Create Order (Save the order_id)
```bash
curl -X POST "$BASE_URL/ecommerce/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "customer": {
      "name": "John Customer",
      "email": "customer@example.com",
      "phone": "+1-555-0199"
    },
    "items": [
      {
        "product": "'$PRODUCT_ID'",
        "quantity": 1,
        "price": 1299.99
      }
    ],
    "shipping": {
      "address": {
        "street": "456 Customer St",
        "city": "Boston",
        "state": "MA",
        "country": "USA",
        "zipCode": "02101"
      },
      "method": "standard",
      "cost": 15.99
    },
    "payment": {
      "method": "credit_card",
      "status": "paid"
    }
  }'

# Copy the order_id from response and set it:
export ORDER_ID="your_order_id_here"
```

#### Get All Orders
```bash
curl -X GET "$BASE_URL/ecommerce/orders?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Update Order Status
```bash
curl -X PATCH "$BASE_URL/ecommerce/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "shipped",
    "trackingNumber": "1Z999AA1234567890"
  }'
```

#### Get Order Statistics
```bash
curl -X GET "$BASE_URL/ecommerce/orders/stats" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 💒 Wedding Management

### Vendors

#### Create Wedding Vendor (Save the vendor_id)
```bash
curl -X POST "$BASE_URL/wedding/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Elegant Flowers",
    "category": "florist",
    "description": "Beautiful wedding flower arrangements",
    "contact": {
      "name": "Sarah Johnson",
      "phone": "+1-555-0177",
      "email": "sarah@elegantflowers.com"
    },
    "location": {
      "address": {
        "street": "789 Flower Ave",
        "city": "Portland",
        "state": "OR",
        "country": "USA",
        "zipCode": "97201"
      }
    },
    "pricing": {
      "startingPrice": 500,
      "currency": "USD",
      "packages": [
        {
          "name": "Basic Package",
          "price": 500,
          "description": "Bridal bouquet and boutonnieres"
        },
        {
          "name": "Premium Package",
          "price": 1200,
          "description": "Full ceremony and reception flowers"
        }
      ]
    },
    "availability": {
      "daysOfWeek": [5, 6, 0],
      "timeSlots": ["morning", "afternoon", "evening"]
    }
  }'

# Copy the vendor_id from response and set it:
export VENDOR_ID="your_vendor_id_here"
```

#### Search Vendors by Category
```bash
curl -X GET "$BASE_URL/wedding/vendors/category/florist" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

#### Check Vendor Availability
```bash
curl -X GET "$BASE_URL/wedding/vendors/$VENDOR_ID/availability?date=2024-06-15&timeSlot=afternoon" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Events

#### Create Wedding Event (Save the event_id)
```bash
curl -X POST "$BASE_URL/wedding/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Sarah & Mike Wedding",
    "date": "2024-06-15T16:00:00.000Z",
    "venue": {
      "name": "Grand Ballroom",
      "address": {
        "street": "123 Wedding Ave",
        "city": "Seattle",
        "state": "WA",
        "country": "USA",
        "zipCode": "98101"
      }
    },
    "couple": {
      "partner1": {
        "name": "Sarah Smith",
        "email": "sarah@example.com",
        "phone": "+1-555-0188"
      },
      "partner2": {
        "name": "Mike Johnson",
        "email": "mike@example.com",
        "phone": "+1-555-0189"
      }
    },
    "guestCount": 150,
    "budget": {
      "total": 25000,
      "currency": "USD"
    }
  }'

# Copy the event_id from response and set it:
export EVENT_ID="your_event_id_here"
```

#### Add Vendor to Event
```bash
curl -X POST "$BASE_URL/wedding/events/$EVENT_ID/vendors" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "vendor": "'$VENDOR_ID'",
    "package": "Premium Package",
    "cost": 1200,
    "status": "booked"
  }'
```

#### Add Task to Event
```bash
curl -X POST "$BASE_URL/wedding/events/$EVENT_ID/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Book photographer",
    "description": "Find and book wedding photographer",
    "category": "vendor",
    "priority": "high",
    "dueDate": "2024-04-15T00:00:00.000Z"
  }'
```

## 🚗 Automobile Management

### Create Vehicle (Save the vehicle_id)
```bash
curl -X POST "$BASE_URL/automobile/vehicles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "vin": "1HGBH41JXMN109186",
    "condition": "new",
    "mileage": 0,
    "pricing": {
      "price": 28500,
      "currency": "USD"
    },
    "specifications": {
      "engine": "2.5L 4-Cylinder",
      "transmission": "Automatic",
      "fuelType": "gasoline",
      "drivetrain": "FWD",
      "exteriorColor": "Silver",
      "interiorColor": "Black"
    },
    "features": [
      "Backup Camera",
      "Bluetooth",
      "Cruise Control",
      "Power Windows"
    ],
    "status": "available"
  }'

# Copy the vehicle_id from response and set it:
export VEHICLE_ID="your_vehicle_id_here"
```

### Search Vehicles
```bash
curl -X GET "$BASE_URL/automobile/vehicles/search?make=Toyota&year=2024&maxPrice=30000&condition=new" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Record Vehicle Inquiry
```bash
curl -X POST "$BASE_URL/automobile/vehicles/$VEHICLE_ID/inquire" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "customer": {
      "name": "Alex Customer",
      "email": "alex@example.com",
      "phone": "+1-555-0166"
    },
    "message": "Interested in this vehicle. Can I schedule a test drive?",
    "inquiryType": "test_drive"
  }'
```

### Schedule Test Drive
```bash
curl -X POST "$BASE_URL/automobile/vehicles/$VEHICLE_ID/test-drive" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "customer": {
      "name": "Alex Customer",
      "email": "alex@example.com",
      "phone": "+1-555-0166",
      "driversLicense": "D123456789"
    },
    "preferredDate": "2024-03-15T14:00:00.000Z",
    "duration": 30,
    "notes": "First time buyer, needs guidance"
  }'
```

## 🏢 Business Services

### Create Business Service (Save the service_id)
```bash
curl -X POST "$BASE_URL/business/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Web Development",
    "category": "technology",
    "description": {
      "short": "Professional web development services",
      "long": "Custom web development solutions for businesses of all sizes. From simple websites to complex web applications."
    },
    "pricing": {
      "basePrice": 2500,
      "currency": "USD",
      "tiers": [
        {
          "name": "Basic",
          "price": 2500,
          "description": "Simple business website"
        },
        {
          "name": "Premium",
          "price": 5000,
          "description": "Advanced website with custom features"
        }
      ],
      "addOns": [
        {
          "name": "SEO Optimization",
          "price": 500,
          "description": "Search engine optimization"
        }
      ]
    },
    "details": {
      "duration": "2-4 weeks",
      "deliveryMethod": "digital",
      "location": "remote"
    },
    "isFeatured": true,
    "status": "active"
  }'

# Copy the service_id from response and set it:
export SERVICE_ID="your_service_id_here"
```

### Calculate Service Price
```bash
curl -X POST "$BASE_URL/business/services/$SERVICE_ID/calculate-price" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "tierName": "Premium",
    "addOns": ["SEO Optimization"]
  }'
```

### Check Service Availability
```bash
curl -X GET "$BASE_URL/business/services/$SERVICE_ID/availability?date=2024-04-01" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Record Service Inquiry
```bash
curl -X POST "$BASE_URL/business/services/$SERVICE_ID/inquire" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "message": "Interested in web development services for my startup",
    "contactInfo": {
      "name": "Startup Owner",
      "email": "owner@startup.com",
      "phone": "+1-555-0155"
    }
  }'
```

### Book Service
```bash
curl -X POST "$BASE_URL/business/services/$SERVICE_ID/book" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "revenue": 5500
  }'
```

### Add Service Review
```bash
curl -X POST "$BASE_URL/business/services/$SERVICE_ID/reviews" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "clientName": "Happy Client",
    "rating": 5,
    "review": "Excellent service! Professional team and great results.",
    "serviceDate": "2024-02-15T00:00:00.000Z",
    "clientTitle": "CEO",
    "clientCompany": "Tech Startup Inc"
  }'
```

## 📊 Analytics Endpoints

### Hotel Analytics
```bash
curl -X GET "$BASE_URL/hotels/$HOTEL_ID/analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Product Analytics
```bash
curl -X GET "$BASE_URL/ecommerce/products/$PRODUCT_ID/analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Vehicle Analytics
```bash
curl -X GET "$BASE_URL/automobile/vehicles/$VEHICLE_ID/analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### Service Analytics
```bash
curl -X GET "$BASE_URL/business/services/$SERVICE_ID/analytics" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 🎯 Complete Testing Script

Save this as `test_api.sh` and run it:

```bash
#!/bin/bash

# Set base URL
export BASE_URL="http://localhost:3000/api"

echo "🚀 Starting API Testing..."

# 1. Register and Login
echo "1. Registering user..."
curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"admin"}' | jq

echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

export AUTH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Auth token: $AUTH_TOKEN"

# 2. Create Website
echo "3. Creating website..."
WEBSITE_RESPONSE=$(curl -s -X POST "$BASE_URL/websites" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"name":"Test Website","slug":"test-site","description":"Test website","businessType":"hotel"}')

export WEBSITE_ID=$(echo $WEBSITE_RESPONSE | jq -r '.data.website._id')
echo "Website ID: $WEBSITE_ID"

# 3. Test Hotel Module
echo "4. Creating hotel..."
HOTEL_RESPONSE=$(curl -s -X POST "$BASE_URL/hotels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"name":"Test Hotel","description":"Test hotel","totalRooms":100,"starRating":4}')

export HOTEL_ID=$(echo $HOTEL_RESPONSE | jq -r '.data.hotel._id')
echo "Hotel ID: $HOTEL_ID"

echo "5. Getting all hotels..."
curl -s -X GET "$BASE_URL/hotels" | jq

echo "✅ API Testing Complete!"
```

Make it executable and run:
```bash
chmod +x test_api.sh
./test_api.sh
```

## 📝 Notes

1. **Replace Variables**: Update the export commands with actual IDs from responses
2. **Error Handling**: Check response status codes and error messages
3. **Authentication**: Re-login if you get 401 errors (token expired)
4. **Website Context**: Always create a website before testing business modules
5. **JSON Formatting**: Use `| jq` to format JSON responses for better readability

**Your Backend Starter API is now fully testable with these cURL commands!** 🚀
