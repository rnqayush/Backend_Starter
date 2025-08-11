# 🚀 StoreBuilder Backend - Postman Collection

This folder contains a comprehensive Postman collection to test all the APIs available in the StoreBuilder backend.

## 📁 Files

- **`StoreBuilder-Backend-API.postman_collection.json`** - Main API collection with all endpoints
- **`StoreBuilder-Environment.postman_environment.json`** - Environment variables for testing
- **`README.md`** - This file with usage instructions

## 🔧 Setup Instructions

### 1. Import Collection and Environment

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button
   - Drag & drop `StoreBuilder-Backend-API.postman_collection.json`
   - Or click "Upload Files" and select the collection file

3. **Import Environment:**
   - Click "Import" button
   - Drag & drop `StoreBuilder-Environment.postman_environment.json`
   - Or click "Upload Files" and select the environment file

4. **Select Environment:**
   - In the top-right corner, select "StoreBuilder Environment" from the dropdown

### 2. Start Your Backend Server

Make sure your backend server is running:

```bash
cd backend
npm run dev
```

The server should be running on `http://localhost:5000`

### 3. Update Environment Variables (Optional)

If your server runs on a different port or URL:

1. Click on "StoreBuilder Environment" in the top-right
2. Update the `baseUrl` variable
3. Save the environment

## 🎯 Testing Workflow

### Recommended Testing Order:

1. **🏥 Health Check** - Verify server is running
2. **🔐 Authentication** - Register/Login to get auth token
3. **🏢 Business Management** - Create a business
4. **🏨 Hotels** - Add hotel data
5. **🛍️ E-commerce** - Add products and categories
6. **🚗 Automobiles** - Add vehicle listings
7. **📝 Blogs** - Create blog content

### Automatic Token Management

The collection includes automatic token management:

- When you login/register successfully, the auth token is automatically saved
- All subsequent authenticated requests will use this token
- IDs are automatically captured and reused (businessId, hotelId, etc.)

## 📊 Collection Structure

### 🔐 Authentication (5 requests)

- Register User
- Login User
- Get Current User
- Verify Token
- Update Profile

### 🏢 Business Management (5 requests)

- Create Business
- Get Business by Slug
- Get My Businesses
- Update Business
- Get Business Analytics

### 🏨 Hotels (6 requests)

- Create Hotel
- Get Hotels by Business
- Get Hotel Details
- Search Hotels
- Add Room to Hotel
- Update Hotel

### 🛍️ E-commerce (8 requests)

- Create Category
- Create Product
- Get Products by Business
- Get Categories by Business
- Get Product Details
- Search Products
- Add Product Review
- Get E-commerce Analytics

### 🚗 Automobiles (6 requests)

- Create Vehicle
- Get Vehicles by Business
- Get Vehicle Details
- Search Vehicles
- Submit Vehicle Inquiry
- Get Vehicle Analytics

### 💍 Wedding Services (2 requests)

- Get Wedding Services by Business
- Search Wedding Services

### 📝 Blogs (4 requests)

- Create Blog
- Get All Blogs
- Get Blog Details
- Search Blogs

### 📁 File Upload (2 requests)

- Upload Single File
- Upload Multiple Files

### 👥 Users (Admin) (2 requests)

- Get All Users
- Get User Details

### ⚙️ Admin (3 requests)

- Get Platform Stats
- Get All Users (Admin)
- Get All Businesses (Admin)

### 🏥 Health & System (2 requests)

- Health Check
- Platform Info

## 🔑 Environment Variables

The environment includes these variables:

| Variable       | Description              | Auto-Set |
| -------------- | ------------------------ | -------- |
| `baseUrl`      | API base URL             | Manual   |
| `authToken`    | JWT authentication token | ✅ Auto  |
| `userId`       | Current user ID          | ✅ Auto  |
| `businessId`   | Created business ID      | ✅ Auto  |
| `businessSlug` | Business slug            | ✅ Auto  |
| `hotelId`      | Created hotel ID         | ✅ Auto  |
| `productId`    | Created product ID       | ✅ Auto  |
| `categoryId`   | Created category ID      | ✅ Auto  |
| `vehicleId`    | Created vehicle ID       | ✅ Auto  |
| `blogId`       | Created blog ID          | ✅ Auto  |

## 🧪 Quick Test Scenarios

### Scenario 1: Complete Hotel Business Setup

1. Run "Register User" or "Login User"
2. Run "Create Business" (with type: "hotel")
3. Run "Create Hotel"
4. Run "Add Room to Hotel"
5. Run "Get Hotels by Business"

### Scenario 2: E-commerce Store Setup

1. Run "Register User" or "Login User"
2. Run "Create Business" (with type: "ecommerce")
3. Run "Create Category"
4. Run "Create Product"
5. Run "Get Products by Business"

### Scenario 3: Search and Discovery

1. Run "Search Hotels" with different filters
2. Run "Search Products" with various criteria
3. Run "Search Vehicles" by brand/category

## 🔍 Testing Tips

### 1. Check Response Status

- ✅ 200/201 = Success
- ❌ 400 = Bad Request (check request body)
- ❌ 401 = Unauthorized (check auth token)
- ❌ 404 = Not Found
- ❌ 500 = Server Error

### 2. Authentication Required

Endpoints marked with 🔒 require authentication:

- Make sure you've logged in first
- Check that `authToken` is set in environment variables

### 3. Data Dependencies

Some requests depend on data from previous requests:

- Create business before creating hotels/products
- Create categories before creating products
- Login before accessing protected endpoints

### 4. Sample Data

The collection includes realistic sample data:

- Hotel with rooms and amenities
- Products with categories and pricing
- Vehicles with specifications
- Blogs with content

## 🐛 Troubleshooting

### Server Connection Issues

```
Error: connect ECONNREFUSED 127.0.0.1:5000
```

**Solution:** Make sure your backend server is running on port 5000

### Authentication Errors

```
401 Unauthorized
```

**Solution:**

1. Run "Login User" request first
2. Check that `authToken` is set in environment variables

### Validation Errors

```
400 Bad Request - Validation failed
```

**Solution:** Check the request body format and required fields

### MongoDB Connection

```
500 Internal Server Error
```

**Solution:** Ensure MongoDB is running and accessible

## 📚 Additional Resources

- **Backend README:** `../README.md`
- **API Documentation:** `../API_DOCUMENTATION.md`
- **Project Summary:** `../PROJECT_SUMMARY.md`

## 🎉 Happy Testing!

This collection covers **all 50+ API endpoints** in your StoreBuilder backend. Use it to:

- Test your API functionality
- Debug issues
- Demonstrate features to stakeholders
- Validate frontend integration

For questions or issues, refer to the backend documentation or create an issue in the repository.
