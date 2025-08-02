# 📮 Multi-Vendor Backend - Postman Collections

This directory contains comprehensive Postman collections for testing all endpoints of the Multi-Vendor Backend API.

## 📁 Collections Overview

### 🚀 **NEW** Complete API Collection
**File:** `Multi-Vendor-Complete-API.postman_collection.json`
**Environment:** `Multi-Vendor-Backend.postman_environment.json`

**🎯 RECOMMENDED - Complete collection with ALL endpoints:**

#### 🔐 Authentication
- ✅ User Registration (with auto token extraction)
- ✅ User Login (with auto token extraction)
- ✅ User Logout

#### 🏪 Vendors
- ✅ Get All Vendors (with pagination & filters)
- ✅ Get Featured Vendors
- ✅ Search Vendors
- ✅ Get Vendors by Category
- ✅ Get Vendor by ID
- ✅ Create Vendor (auth required)
- ✅ Get Vendor Dashboard (vendor only)
- ✅ Update Vendor
- ✅ Update Vendor Status (admin only)

#### 🛍️ Products
- ✅ Get All Products
- ✅ Get Featured Products
- ✅ Get Products on Sale
- ✅ Search Products
- ✅ Get Products by Category
- ✅ Get Products by Vendor
- ✅ Get Product by ID
- ✅ Create Product (vendor only)
- ✅ Update Product
- ✅ Delete Product
- ✅ Update Stock

#### 🏨 Hotels
- ✅ Get All Hotels
- ✅ Get Featured Hotels
- ✅ Search Hotels
- ✅ Get Hotels by City
- ✅ Get Hotel by ID
- ✅ Create Hotel (vendor only)
- ✅ Update Hotel
- ✅ Delete Hotel
- ✅ Add Room
- ✅ Update Room
- ✅ Delete Room

#### 📅 Bookings
- ✅ Create Booking
- ✅ Get All Bookings
- ✅ Get User Bookings
- ✅ Get Vendor Bookings
- ✅ Get Booking by ID
- ✅ Update Booking
- ✅ Cancel Booking
- ✅ Confirm Booking
- ✅ Check-in Booking
- ✅ Check-out Booking
- ✅ Add Review

**Features:**
- 🔄 Automatic JWT token management
- 🎲 Dynamic test data generation
- 🧪 Comprehensive test scripts
- 🌍 Environment variable management
- 📊 Role-based access testing

---

### 📚 Legacy Collections

### 🔐 Simple Auth Collection
**File:** `Simple Auth Backend API.postman_collection.json`

Basic authentication endpoints only:
- ✅ User Registration
- ✅ User Login
- ✅ User Logout

## 🚀 Quick Setup

### 1. Import Collections
1. Open Postman
2. Click **Import**
3. Select all `.json` files from this directory
4. Click **Import**

### 2. Set Environment Variables
The collections use these variables:
```
base_url: http://localhost:3001/api
auth_token: (automatically set after login)
user_id: (automatically set after registration/login)
vendor_id: (automatically set after vendor creation)
hotel_id: (automatically set after hotel creation)
booking_id: (automatically set after booking creation)
```

### 3. Start Testing
1. **First:** Run "Register User" or "Login User" from Authentication collection
2. **Then:** Use any other endpoints (token will be automatically included)

## 🔧 Environment Configuration

### Local Development
```json
{
  "base_url": "http://localhost:3001/api",
  "auth_token": "",
  "user_id": "",
  "vendor_id": "",
  "hotel_id": "",
  "booking_id": ""
}
```

### Production
```json
{
  "base_url": "https://your-production-domain.com/api",
  "auth_token": "",
  "user_id": "",
  "vendor_id": "",
  "hotel_id": "",
  "booking_id": ""
}
```

## 📋 Testing Workflow

### Complete User Journey
1. **Authentication**
   ```
   Register User → Login User → Get Profile
   ```

2. **Vendor Setup**
   ```
   Create Vendor → Get Vendor Details → Update Vendor
   ```

3. **Hotel Management**
   ```
   Create Hotel → Search Hotels → Get Hotel Details
   ```

4. **Booking Process**
   ```
   Create Booking → Get Booking Details → Check-in → Check-out
   ```

## 🧪 Test Scripts

Each collection includes automated test scripts that:
- ✅ Validate response status codes
- ✅ Extract and store important IDs
- ✅ Set environment variables automatically
- ✅ Verify response structure

### Example Test Script
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.collectionVariables.set('auth_token', response.data.token);
        pm.collectionVariables.set('user_id', response.data.user.id);
    }
    pm.test('Registration successful', function () {
        pm.expect(response.status).to.eql('success');
    });
}
```

## 🔍 API Endpoints Coverage

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Vendor Endpoints
- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor
- `GET /api/vendors/:id/stats` - Get vendor statistics

### Hotel Endpoints
- `POST /api/hotels` - Create hotel
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel details

### Booking Endpoints
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `PATCH /api/bookings/:id/checkin` - Check-in booking
- `PATCH /api/bookings/:id/checkout` - Check-out booking

## 🛠️ Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Make sure you're logged in
   - Check if `auth_token` variable is set
   - Token might be expired - login again

2. **404 Not Found**
   - Verify the server is running on port 3001
   - Check the `base_url` variable
   - Ensure the endpoint exists

3. **500 Internal Server Error**
   - Check server logs
   - Verify MongoDB connection
   - Check request payload format

### Debug Tips
- Use Postman Console to view request/response details
- Check environment variables are set correctly
- Verify request headers include Authorization token
- Ensure request body is valid JSON

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## 🔐 Security Notes

- JWT tokens are automatically managed
- All authenticated endpoints require Bearer token
- Tokens expire after 7 days (configurable)
- Use HTTPS in production
- Store sensitive data in environment variables

## 📞 Support

If you encounter any issues:
1. Check the server logs
2. Verify environment variables
3. Ensure all dependencies are installed
4. Check MongoDB connection

---

**Happy Testing!** 🚀

*These collections provide comprehensive coverage of the Multi-Vendor Backend API, making it easy to test all functionality during development and integration.*
