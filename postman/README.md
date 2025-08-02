# 📮 Multi-Vendor Backend - Postman Collections

This directory contains comprehensive Postman collections for testing all endpoints of the Multi-Vendor Backend API.

## 📁 Collections Overview

### 🔐 Authentication Collection
**File:** `Multi-Vendor-Backend.postman_collection.json`

Complete authentication system testing including:
- ✅ User Registration
- ✅ User Login (with automatic token extraction)
- ✅ Get User Profile
- ✅ Update User Profile
- ✅ User Logout

**Features:**
- Automatic JWT token extraction and storage
- Pre-configured test scripts
- Environment variable management

### 🏪 Vendor Management Collection
**File:** `Vendor-Management.postman_collection.json`

Vendor management system endpoints:
- ✅ Create Vendor Profile
- ✅ Get All Vendors (with filters)
- ✅ Get Vendor by ID
- ✅ Update Vendor Information
- ✅ Delete Vendor
- ✅ Get Vendor Statistics

**Features:**
- Automatic vendor ID extraction
- Comprehensive filtering options
- Business type categorization

### 🏨 Hotel Booking Collection
**File:** `Hotel-Booking.postman_collection.json`

Complete hotel booking system:
- ✅ Create Hotel
- ✅ Search Hotels (with filters)
- ✅ Get Hotel Details
- ✅ Create Booking
- ✅ Get My Bookings
- ✅ Get Booking Details
- ✅ Update Booking
- ✅ Cancel Booking
- ✅ Check-in Booking
- ✅ Check-out Booking

**Features:**
- Advanced search filters
- Booking lifecycle management
- Automatic ID extraction

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
