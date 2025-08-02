# 🚀 Complete Multi-Vendor Backend API - Postman Collection

## 📋 **Overview**

This is the **ULTIMATE** Postman collection for the Multi-Vendor Backend API, containing **ALL 46 endpoints** across 5 major modules with complete automation, testing, and environment management.

## 📁 **Collection Files**

### 🎯 **Main Collection**
- **`Complete-Multi-Vendor-API.postman_collection.json`** - Complete collection with all endpoints
- **`Multi-Vendor-Backend.postman_environment.json`** - Environment variables file

## 🔥 **Complete API Coverage**

### 🔐 **Authentication (3 endpoints)**
- ✅ `POST /api/auth/register` - Register new user
- ✅ `POST /api/auth/login` - User login  
- ✅ `POST /api/auth/logout` - User logout

### 🏪 **Vendors (9 endpoints)**
- ✅ `GET /api/vendors` - Get all vendors (pagination & filters)
- ✅ `GET /api/vendors/featured` - Get featured vendors
- ✅ `GET /api/vendors/search` - Search vendors
- ✅ `GET /api/vendors/category/:category` - Get vendors by category
- ✅ `GET /api/vendors/:id` - Get vendor by ID
- ✅ `POST /api/vendors` - Create vendor (auth required)
- ✅ `GET /api/vendors/dashboard/stats` - Vendor dashboard (vendor only)
- ✅ `PUT /api/vendors/:id` - Update vendor
- ✅ `PATCH /api/vendors/:id/status` - Update vendor status (admin only)

### 🛍️ **Products (11 endpoints)**
- ✅ `GET /api/products` - Get all products
- ✅ `GET /api/products/featured` - Get featured products
- ✅ `GET /api/products/sale` - Get products on sale
- ✅ `GET /api/products/search` - Search products
- ✅ `GET /api/products/category/:category` - Get products by category
- ✅ `GET /api/products/vendor/:vendorId` - Get products by vendor
- ✅ `GET /api/products/:id` - Get product by ID
- ✅ `POST /api/products` - Create product (vendor only)
- ✅ `PUT /api/products/:id` - Update product
- ✅ `DELETE /api/products/:id` - Delete product
- ✅ `PATCH /api/products/:id/stock` - Update stock

### 🏨 **Hotels (11 endpoints)**
- ✅ `GET /api/hotels` - Get all hotels
- ✅ `GET /api/hotels/featured` - Get featured hotels
- ✅ `GET /api/hotels/search` - Search hotels
- ✅ `GET /api/hotels/city/:city` - Get hotels by city
- ✅ `GET /api/hotels/:id` - Get hotel by ID
- ✅ `POST /api/hotels` - Create hotel (vendor only)
- ✅ `PUT /api/hotels/:id` - Update hotel
- ✅ `DELETE /api/hotels/:id` - Delete hotel
- ✅ `POST /api/hotels/:id/rooms` - Add room
- ✅ `PUT /api/hotels/:id/rooms/:roomId` - Update room
- ✅ `DELETE /api/hotels/:id/rooms/:roomId` - Delete room

### 📅 **Bookings (11 endpoints)**
- ✅ `POST /api/bookings` - Create booking
- ✅ `GET /api/bookings` - Get all bookings
- ✅ `GET /api/bookings/my-bookings` - Get user bookings
- ✅ `GET /api/bookings/vendor-bookings` - Get vendor bookings
- ✅ `GET /api/bookings/:id` - Get booking by ID
- ✅ `PUT /api/bookings/:id` - Update booking
- ✅ `PATCH /api/bookings/:id/cancel` - Cancel booking
- ✅ `PATCH /api/bookings/:id/confirm` - Confirm booking
- ✅ `PATCH /api/bookings/:id/checkin` - Check-in booking
- ✅ `PATCH /api/bookings/:id/checkout` - Check-out booking
- ✅ `POST /api/bookings/:id/review` - Add review

### ℹ️ **API Info (2 endpoints)**
- ✅ `GET /api/health` - API health check
- ✅ `GET /api/` - API information

## 🎯 **Key Features**

### 🔄 **Automatic Token Management**
- JWT tokens automatically extracted and stored on login/register
- No manual token copying required
- Seamless authentication flow across all endpoints
- Automatic token clearing on logout

### 🎲 **Dynamic Test Data**
- Uses Postman's built-in random data generators
- Realistic business names, emails, addresses
- No hardcoded test data - fresh data every time
- Proper data formats matching schema requirements

### 🧪 **Comprehensive Test Scripts**
- Status code validation for all endpoints
- Response structure validation
- Automatic environment variable extraction
- Error handling validation
- Console logging for debugging

### 🌍 **Smart Environment Variables**
- `baseUrl` - API server URL (configurable)
- `authToken` - JWT token (auto-set on login)
- `userId` - Current user ID (auto-set)
- `userRole` - Current user role (auto-set)
- `vendorId` - Vendor ID (auto-extracted)
- `productId` - Product ID (auto-extracted)
- `hotelId` - Hotel ID (auto-extracted)
- `bookingId` - Booking ID (auto-extracted)
- `roomId` - Room ID (auto-extracted)

### 📊 **Role-Based Testing**
- **Customer endpoints** - Public access and user-specific
- **Vendor endpoints** - Vendor-only operations
- **Admin endpoints** - Administrative functions
- **Public endpoints** - No authentication required

## 🚀 **Quick Start Guide**

### 1. **Import Collection**
```bash
1. Open Postman
2. Click "Import" button
3. Select "Complete-Multi-Vendor-API.postman_collection.json"
4. Click "Import"
```

### 2. **Import Environment**
```bash
1. Click "Import" button
2. Select "Multi-Vendor-Backend.postman_environment.json"
3. Click "Import"
4. Select the environment from the dropdown
```

### 3. **Configure Base URL**
Update the `baseUrl` variable in your environment:
- **Local Development:** `http://localhost:5000`
- **Production:** `https://your-api-domain.com`

### 4. **Start Testing**
```bash
1. Start with "Register User" or "Login User"
2. Token is automatically saved to environment
3. All other endpoints work automatically
4. Follow the logical flow: Auth → Vendors → Products/Hotels → Bookings
```

## 📋 **Complete Testing Workflow**

### 🔐 **Phase 1: Authentication**
```
1. Register User → Creates account + saves token
2. Login User → Authenticates + saves token
3. Logout User → Clears token
```

### 🏪 **Phase 2: Vendor Setup**
```
1. Create Vendor → Saves vendor ID
2. Get All Vendors → Lists all vendors
3. Get Vendor by ID → Shows vendor details
4. Update Vendor → Modifies vendor info
```

### 🛍️ **Phase 3: Product Management**
```
1. Create Product → Saves product ID
2. Get All Products → Lists products
3. Search Products → Finds specific products
4. Update Stock → Manages inventory
```

### 🏨 **Phase 4: Hotel Management**
```
1. Create Hotel → Saves hotel ID
2. Add Room → Saves room ID
3. Search Hotels → Finds available hotels
4. Update Room → Modifies room details
```

### 📅 **Phase 5: Booking Lifecycle**
```
1. Create Booking → Saves booking ID
2. Confirm Booking → Vendor confirms
3. Check-in Booking → Guest arrives
4. Check-out Booking → Guest leaves
5. Add Review → Customer feedback
```

## 🔧 **Advanced Features**

### 🎯 **Pre-request Scripts**
- Global logging of request URLs
- Automatic environment setup
- Request validation

### 🧪 **Test Scripts**
- Response validation
- Data extraction
- Environment variable management
- Error handling

### 📊 **Console Logging**
- Request tracking
- Response status logging
- ID extraction confirmation
- Error debugging

## 🌍 **Environment Configuration**

### 🏠 **Local Development**
```json
{
  "baseUrl": "http://localhost:5000",
  "authToken": "",
  "userId": "",
  "userRole": "",
  "vendorId": "",
  "productId": "",
  "hotelId": "",
  "bookingId": "",
  "roomId": ""
}
```

### 🌐 **Production**
```json
{
  "baseUrl": "https://your-api-domain.com",
  "authToken": "",
  "userId": "",
  "userRole": "",
  "vendorId": "",
  "productId": "",
  "hotelId": "",
  "bookingId": "",
  "roomId": ""
}
```

## 🎨 **Sample Data Examples**

### 👤 **User Registration**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "customer"
}
```

### 🏪 **Vendor Creation**
```json
{
  "name": "Grand Palace Hotel",
  "category": "hotel",
  "description": "Premium hotel services",
  "email": "info@grandpalace.com",
  "phone": "+91-9876543210",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "businessHours": {
    "monday": "9:00 AM - 6:00 PM",
    "tuesday": "9:00 AM - 6:00 PM",
    "wednesday": "9:00 AM - 6:00 PM",
    "thursday": "9:00 AM - 6:00 PM",
    "friday": "9:00 AM - 6:00 PM",
    "saturday": "10:00 AM - 4:00 PM",
    "sunday": "Closed"
  }
}
```

### 🛍️ **Product Creation**
```json
{
  "name": "Premium Wireless Headphones",
  "description": "High-quality wireless headphones",
  "price": 299.99,
  "category": "electronics",
  "stock": 50
}
```

### 🏨 **Hotel Creation**
```json
{
  "name": "Grand Palace Hotel",
  "description": "Luxury 5-star hotel",
  "starRating": 5,
  "amenities": ["WiFi", "Pool", "Gym", "Spa"],
  "checkInTime": "15:00",
  "checkOutTime": "11:00"
}
```

### 📅 **Booking Creation**
```json
{
  "hotelId": "{{hotelId}}",
  "roomId": "{{roomId}}",
  "checkInDate": "2024-08-15",
  "checkOutDate": "2024-08-20",
  "guests": 2,
  "guestDetails": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## 🐛 **Troubleshooting**

### ❌ **Common Issues**

#### 1. **401 Unauthorized**
- **Cause:** Token expired or missing
- **Solution:** Re-run login request to refresh token

#### 2. **403 Forbidden**
- **Cause:** Insufficient permissions for role
- **Solution:** Check user role and endpoint requirements

#### 3. **404 Not Found**
- **Cause:** Resource doesn't exist or wrong ID
- **Solution:** Verify IDs are correctly saved in environment

#### 4. **500 Server Error**
- **Cause:** Server issue or invalid data
- **Solution:** Check request body format and server logs

### 🔍 **Debug Tips**
- Check Postman Console for detailed logs
- Verify environment variables are set correctly
- Ensure server is running on correct port
- Validate request body matches schema requirements

## 📊 **Collection Statistics**

- **Total Endpoints:** 46
- **Authentication Endpoints:** 3
- **Vendor Endpoints:** 9
- **Product Endpoints:** 11
- **Hotel Endpoints:** 11
- **Booking Endpoints:** 11
- **API Info Endpoints:** 2
- **Test Scripts:** 46
- **Environment Variables:** 9
- **Dynamic Data Fields:** 20+

## 🎉 **Benefits**

### ✅ **Complete Coverage**
- All 46 API endpoints included
- No missing functionality
- Full CRUD operations

### ✅ **Zero Configuration**
- Automatic token management
- Auto-extracted IDs
- Smart environment handling

### ✅ **Production Ready**
- Comprehensive test scripts
- Error handling
- Realistic data

### ✅ **Developer Friendly**
- Clear documentation
- Logical organization
- Easy to understand

### ✅ **Time Saving**
- No manual setup required
- Automated workflows
- Instant testing

## 🔗 **Related Files**

- `Complete-Multi-Vendor-API.postman_collection.json` - Main collection
- `Multi-Vendor-Backend.postman_environment.json` - Environment variables
- `README.md` - General documentation
- `COMPLETE-API-README.md` - This comprehensive guide

## 🚀 **Ready to Test!**

This collection provides everything you need to test your entire Multi-Vendor Backend API with just a few clicks. Import both files, set your base URL, and start testing immediately!

**Happy Testing!** 🎯✨
