# Multivendor Backend API - Postman Collections

This directory contains comprehensive Postman collections for testing all endpoints in the multivendor backend platform.

## 📁 Collection Files

### Individual Module Collections
1. **`01_auth_collection.json`** - Authentication & Authorization
2. **`02_users_collection.json`** - User Management & Profiles
3. **`03_files_collection.json`** - File Upload & Management
4. **`04_business_collection.json`** - Business/Website Content Management
5. **`05_automobile_collection.json`** - Vehicle Management & Enquiries
6. **`06_ecommerce_collection.json`** - Products, Cart & Orders
7. **`07_hotels_collection.json`** - Hotel Management & Bookings
8. **`08_weddings_collection.json`** - Wedding Vendor Management

### Complete Collection
- **`COMPLETE_MULTIVENDOR_COLLECTION.json`** - All modules merged into one comprehensive collection

## 🚀 Quick Start

### Option 1: Import Complete Collection (Recommended)
1. Open Postman
2. Click **Import** button
3. Select `COMPLETE_MULTIVENDOR_COLLECTION.json`
4. The collection will be imported with all endpoints organized by modules

### Option 2: Import Individual Collections
1. Import each module collection separately for focused testing
2. Each collection is self-contained with its own variables and tests

## ⚙️ Configuration

### Environment Variables
Set these variables in your Postman environment or collection variables:

```json
{
  "baseUrl": "http://localhost:5000",
  "authToken": "",
  "userId": "",
  "fileId": "",
  "websiteId": "",
  "vehicleId": "",
  "productId": "",
  "orderId": "",
  "hotelId": "",
  "roomId": "",
  "bookingId": "",
  "vendorId": ""
}
```

### Authentication Setup
1. **Register/Login**: Use the authentication endpoints to get a JWT token
2. **Auto Token Storage**: The login requests automatically save the token to `{{authToken}}`
3. **Protected Routes**: All protected endpoints use `Bearer {{authToken}}` authentication

## 📋 Collection Structure

### 🔐 Authentication Module
- User Registration (Customer/Vendor/Admin)
- Login/Logout
- Password Management
- Current User Info

### 👥 Users Management
- User CRUD operations (Admin)
- Profile management
- User settings and preferences

### 📁 Files Management
- Single/Multiple file uploads
- File metadata management
- File search and categorization
- Bulk operations

### 🌐 Business/Websites Module
- **Public Routes**: Website viewing by domain
- **Website Management**: CRUD operations for websites
- **Content Management**: Hero, About, Contact sections
- **Services Management**: Add/Edit/Delete services
- **Team Management**: Team member profiles
- **Gallery & Portfolio**: Image and project management

### 🚗 Automobile Module
- **Vehicle Management**: CRUD operations for vehicles
- **Inventory Management**: Stock tracking and management
- **Enquiries**: Customer enquiry handling
- **Search & Filtering**: Advanced vehicle search

### 🛒 Ecommerce Module
- **Products**: Product catalog management
- **Categories**: Product categorization
- **Cart**: Shopping cart operations
- **Orders**: Order processing and management

### 🏨 Hotels Module
- **Hotels**: Hotel profile management
- **Rooms**: Room inventory and details
- **Bookings**: Reservation management
- **Search**: Hotel and room availability

### 💒 Weddings Module
- **Wedding Vendors**: Vendor profile management
- **Packages**: Service package management
- **Bookings**: Wedding booking inquiries
- **Reviews**: Vendor reviews and ratings

### 🔧 Health & Utilities
- Health check endpoints
- API status monitoring

## 🧪 Testing Features

### Automated Tests
Each request includes automated tests for:
- Response time validation (< 5000ms)
- Status code verification
- Response header validation
- JSON structure validation

### Pre-request Scripts
- Automatic token management
- Request logging
- Dynamic variable setting

### Response Handling
- Automatic token extraction from login responses
- Error response parsing
- Success response validation

## 📊 Usage Examples

### 1. Authentication Flow
```
1. POST /api/auth/register - Register new user
2. POST /api/auth/login - Login (token auto-saved)
3. GET /api/auth/me - Get current user info
4. Use {{authToken}} in subsequent requests
```

### 2. Vendor Workflow
```
1. Register as vendor
2. Login to get token
3. Create business profile
4. Add products/services/vehicles
5. Manage enquiries/bookings
```

### 3. Customer Workflow
```
1. Register as customer
2. Browse products/services (public routes)
3. Add items to cart
4. Create orders/bookings
5. Manage profile
```

## 🔍 API Endpoint Coverage

### Total Endpoints: 100+
- **Authentication**: 9 endpoints
- **Users**: 15 endpoints
- **Files**: 10 endpoints
- **Business**: 25 endpoints
- **Automobile**: 28 endpoints
- **Ecommerce**: 20 endpoints
- **Hotels**: 15 endpoints
- **Weddings**: 18 endpoints

### HTTP Methods Covered
- ✅ GET (Read operations)
- ✅ POST (Create operations)
- ✅ PUT (Update operations)
- ✅ DELETE (Delete operations)
- ✅ PATCH (Partial updates)

### Authentication Types
- ✅ Public routes (no auth required)
- ✅ Protected routes (JWT required)
- ✅ Role-based access (Admin, Vendor, Customer)

## 🛠️ Development Tips

### 1. Environment Setup
- Create separate environments for development, staging, and production
- Use different `baseUrl` values for each environment

### 2. Token Management
- The collections automatically handle JWT token storage
- Tokens are saved after successful login
- No manual token copying required

### 3. Testing Workflow
- Start with authentication endpoints
- Test public routes first
- Then test protected routes with authentication
- Use the health check endpoint to verify server status

### 4. Error Handling
- Check response status codes
- Review error messages in response body
- Verify authentication tokens are valid

## 📝 Notes

### Database Dependencies
- Some endpoints require MongoDB connection
- Ensure database is running before testing
- Sample data may be needed for certain tests

### File Upload Testing
- Use actual files for upload endpoints
- Supported formats: images, documents, videos
- Check file size limits in server configuration

### Rate Limiting
- Some endpoints may have rate limiting
- Adjust request frequency if needed
- Check server logs for rate limit errors

## 🤝 Contributing

When adding new endpoints:
1. Add to appropriate module collection
2. Update the complete collection
3. Include proper authentication headers
4. Add automated tests
5. Update this README

## 📞 Support

For issues or questions:
- Check server logs for errors
- Verify environment variables
- Ensure database connectivity
- Review authentication token validity

---

**Happy Testing! 🚀**

*This collection covers all controllers and endpoints in the multivendor backend platform, providing a comprehensive testing suite for developers and QA teams.*
