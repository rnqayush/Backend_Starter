# 🧪 Complete API Testing Guide

This guide provides step-by-step instructions for testing all endpoints in your Backend Starter API using the provided Postman collection.

## 🚀 Quick Start

### 1. Prerequisites
- ✅ Backend server running on `http://localhost:3000`
- ✅ MongoDB database connected
- ✅ Postman installed

### 2. Import Collection
1. Open Postman
2. Click **Import** → **Upload Files**
3. Select `Backend_Starter_Complete_API_Collection.json`
4. Collection will appear in your workspace

### 3. Set Base URL
- Collection variable `base_url` is set to `http://localhost:3000/api`
- Modify if your server runs on different port

## 📋 Complete Testing Workflow

### Phase 1: Authentication & Setup
**🔐 Always start with these steps:**

1. **Register User**
   ```
   POST /auth/register
   ```
   - Creates new user account
   - Automatically saves `user_id`

2. **Login User**
   ```
   POST /auth/login
   ```
   - Authenticates user
   - Automatically saves `auth_token` for all subsequent requests

3. **Create Website**
   ```
   POST /websites
   ```
   - Creates multi-tenant website
   - Automatically saves `website_id`
   - **Required for all business module operations**

### Phase 2: Business Module Testing

#### 🏨 Hotel Management Testing
```
1. Create Hotel → saves hotel_id
2. Get All Hotels → verify pagination
3. Search Hotels → test filters
4. Get Hotel by ID → verify details
5. Add Hotel Amenity → test amenity management
6. Get Hotel Analytics → verify metrics
7. Update Hotel → test modifications
8. Delete Hotel → cleanup
```

#### 🛒 E-commerce Testing
```
Categories:
1. Create Category → saves category_id
2. Get Category Tree → verify hierarchy
3. Get Featured Categories → test filtering

Products:
1. Create Product → saves product_id
2. Get Products by Category → test relationships
3. Search Products → test search functionality
4. Add Product Review → test review system
5. Get Product Analytics → verify metrics

Orders:
1. Create Order → saves order_id
2. Update Order Status → test workflow
3. Get Order Statistics → verify reporting
4. Process Refund → test refund system
```

#### 💒 Wedding Management Testing
```
Vendors:
1. Create Wedding Vendor → saves vendor_id
2. Search Vendors by Category → test filtering
3. Check Vendor Availability → test booking system
4. Book Vendor → test reservation
5. Add Vendor Review → test feedback system

Events:
1. Create Wedding Event → saves event_id
2. Add Vendors to Event → test relationships
3. Add Tasks to Event → test planning features
4. Update Task Status → test progress tracking
5. RSVP to Event → test guest management
6. Get Event Progress → verify completion tracking
```

#### 🚗 Automobile Testing
```
Vehicles:
1. Create Vehicle → saves vehicle_id
2. Search Vehicles → test inventory filtering
3. Get Featured Vehicles → test promotions
4. Record Vehicle Inquiry → test lead management
5. Schedule Test Drive → test appointment system
6. Get Vehicle Analytics → verify performance metrics
7. Update Vehicle Status → test inventory management
```

#### 🏢 Business Services Testing
```
Services:
1. Create Business Service → saves service_id
2. Search Services by Category → test organization
3. Calculate Service Price → test pricing engine
4. Check Service Availability → test scheduling
5. Record Service Inquiry → test lead capture
6. Book Service → test reservation system
7. Add Service Review → test feedback
8. Get Service Analytics → verify business metrics
```

## 🎯 Advanced Testing Scenarios

### Scenario A: Complete Hotel Business
```
1. Setup: Register → Login → Create Website
2. Create Hotel with full details
3. Add multiple amenities
4. Search hotels with various filters
5. Get analytics and verify metrics
6. Update hotel information
7. Test nearby hotels functionality
```

### Scenario B: E-commerce Store
```
1. Setup: Register → Login → Create Website
2. Create category hierarchy (parent/child categories)
3. Create products in different categories
4. Test product search and filtering
5. Create orders with multiple products
6. Process order status changes
7. Generate order statistics
8. Test refund processing
```

### Scenario C: Wedding Planning Platform
```
1. Setup: Register → Login → Create Website
2. Create vendors in different categories
3. Create wedding event
4. Add vendors to event
5. Create planning tasks
6. Track progress completion
7. Manage guest RSVPs
8. Test vendor booking system
```

### Scenario D: Vehicle Dealership
```
1. Setup: Register → Login → Create Website
2. Create vehicle inventory
3. Test search with multiple filters
4. Record customer inquiries
5. Schedule test drives
6. Track analytics and performance
7. Update vehicle availability
```

### Scenario E: Service Business
```
1. Setup: Register → Login → Create Website
2. Create service offerings
3. Test pricing calculator
4. Check availability scheduling
5. Record customer inquiries
6. Process service bookings
7. Manage customer reviews
8. Track business analytics
```

## 🔧 Testing Tips

### Variable Management
- **Automatic**: IDs are captured automatically via test scripts
- **Manual**: You can manually set variables in Postman environment
- **Verification**: Check Variables tab to see captured values

### Authentication
- **Bearer Token**: Automatically set after login
- **Expiration**: Re-login if you get 401 errors
- **Scope**: Token works across all endpoints

### Error Testing
- **Invalid Data**: Test with missing required fields
- **Unauthorized**: Test without auth token
- **Not Found**: Test with invalid IDs
- **Validation**: Test with invalid data formats

### Performance Testing
- **Pagination**: Test with different page sizes
- **Search**: Test with various search terms
- **Bulk Operations**: Test with multiple items
- **Analytics**: Verify response times

## 📊 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

### Error Response
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

## 🚨 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Re-run Login User to refresh auth token

### Issue: 404 Website Not Found
**Solution**: Ensure you've created a website first

### Issue: Validation Errors
**Solution**: Check request body format against API documentation

### Issue: Server Connection
**Solution**: Verify server is running on correct port

### Issue: Database Errors
**Solution**: Ensure MongoDB is connected and running

## 📈 Testing Checklist

### ✅ Authentication Flow
- [ ] User registration works
- [ ] User login returns valid token
- [ ] Protected endpoints require authentication
- [ ] Logout invalidates token

### ✅ Website Management
- [ ] Website creation works
- [ ] Website data is properly scoped
- [ ] Website updates work
- [ ] Website deletion works

### ✅ Business Modules
- [ ] All CRUD operations work
- [ ] Search and filtering work
- [ ] Analytics endpoints return data
- [ ] Relationships between entities work
- [ ] Validation prevents invalid data

### ✅ Error Handling
- [ ] Invalid requests return proper errors
- [ ] Missing authentication is handled
- [ ] Not found resources return 404
- [ ] Validation errors are descriptive

### ✅ Performance
- [ ] Pagination works correctly
- [ ] Search is responsive
- [ ] Analytics load quickly
- [ ] Bulk operations handle multiple items

## 🎉 Success Criteria

Your API testing is complete when:
- ✅ All authentication flows work
- ✅ All business modules are functional
- ✅ Search and filtering work across modules
- ✅ Analytics provide meaningful data
- ✅ Error handling is robust
- ✅ Performance is acceptable

**Congratulations! Your Backend Starter API is fully tested and ready for production!** 🚀
