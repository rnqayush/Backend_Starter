# E-commerce Module

A comprehensive e-commerce module for the Backend_Starter platform, providing complete product management, shopping cart, order processing, and seller dashboard functionality.

## Features

### 🛍️ Product Management
- **CRUD Operations**: Create, read, update, delete products
- **Product Variants**: Support for product variations (size, color, etc.)
- **Inventory Management**: Real-time stock tracking with low stock alerts
- **Categories**: Hierarchical product categorization
- **Search & Filtering**: Advanced product search with multiple filters
- **SEO Optimization**: Meta tags and SEO-friendly URLs

### 🛒 Shopping Cart
- **Guest Cart Support**: Shopping cart for non-authenticated users
- **Cart Persistence**: Session-based cart storage
- **Cart Merging**: Merge guest cart with user cart on login
- **Real-time Updates**: Dynamic cart updates with inventory validation

### 📦 Order Management
- **Order Processing**: Complete order lifecycle management
- **Status Tracking**: Real-time order status updates with timeline
- **Payment Integration**: Support for multiple payment methods
- **Shipping Calculation**: Dynamic shipping cost calculation
- **Order Analytics**: Sales reporting and analytics

### 👨‍💼 Seller Dashboard
- **Dashboard Stats**: Comprehensive seller analytics
- **Product Management**: Seller-specific product operations
- **Order Management**: View and manage seller orders
- **Inventory Alerts**: Low stock and out-of-stock notifications
- **Sales Reports**: Detailed sales analytics and reporting

## API Endpoints

### Products
```
GET    /api/ecommerce/products              # Get all products with filtering
GET    /api/ecommerce/products/search       # Search products
GET    /api/ecommerce/products/:id          # Get single product
POST   /api/ecommerce/products              # Create product (Auth required)
PUT    /api/ecommerce/products/:id          # Update product (Auth required)
DELETE /api/ecommerce/products/:id          # Delete product (Auth required)
GET    /api/ecommerce/products/seller/my-products  # Get seller products (Auth required)
PATCH  /api/ecommerce/products/:id/inventory       # Update inventory (Auth required)
```

### Shopping Cart
```
GET    /api/ecommerce/cart                  # Get user cart
GET    /api/ecommerce/cart/summary          # Get cart summary
POST   /api/ecommerce/cart/add              # Add item to cart
PUT    /api/ecommerce/cart/items/:itemId    # Update cart item
DELETE /api/ecommerce/cart/items/:itemId    # Remove cart item
DELETE /api/ecommerce/cart/clear            # Clear cart
POST   /api/ecommerce/cart/merge            # Merge guest cart (Auth required)
```

### Orders
```
POST   /api/ecommerce/orders                # Create order (Auth required)
GET    /api/ecommerce/orders/my-orders      # Get user orders (Auth required)
GET    /api/ecommerce/orders/:id            # Get single order (Auth required)
PATCH  /api/ecommerce/orders/:id/cancel     # Cancel order (Auth required)
GET    /api/ecommerce/orders/seller/orders  # Get seller orders (Auth required)
GET    /api/ecommerce/orders/seller/analytics  # Get sales analytics (Auth required)
PATCH  /api/ecommerce/orders/:id/status     # Update order status (Auth required)
```

### Categories
```
GET    /api/ecommerce/categories            # Get all categories
GET    /api/ecommerce/categories/:id        # Get single category
POST   /api/ecommerce/categories            # Create category (Admin only)
PUT    /api/ecommerce/categories/:id        # Update category (Admin only)
DELETE /api/ecommerce/categories/:id        # Delete category (Admin only)
```

### Seller Dashboard
```
GET    /api/ecommerce/seller/dashboard      # Get dashboard stats (Auth required)
GET    /api/ecommerce/seller/profile        # Get seller profile (Auth required)
PUT    /api/ecommerce/seller/profile        # Update seller profile (Auth required)
GET    /api/ecommerce/seller/sales-report   # Get sales report (Auth required)
GET    /api/ecommerce/seller/inventory-alerts  # Get inventory alerts (Auth required)
```

## Data Models

### Product Model
```javascript
{
  name: String,
  slug: String,
  description: String,
  category: ObjectId,
  brand: String,
  sku: String,
  price: {
    regular: Number,
    sale: Number,
    currency: String
  },
  inventory: {
    quantity: Number,
    lowStockThreshold: Number,
    trackQuantity: Boolean,
    allowBackorder: Boolean
  },
  images: [{ url: String, alt: String, isPrimary: Boolean }],
  variants: [{ name: String, options: [{ value: String, price: Number }] }],
  seller: ObjectId,
  status: String,
  rating: { average: Number, count: Number }
}
```

### Order Model
```javascript
{
  orderNumber: String,
  customer: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    seller: ObjectId
  }],
  subtotal: Number,
  tax: { amount: Number, rate: Number },
  shipping: { cost: Number, method: String },
  total: Number,
  shippingAddress: Object,
  billingAddress: Object,
  status: String,
  paymentStatus: String,
  timeline: [{ status: String, timestamp: Date, note: String }]
}
```

### Cart Model
```javascript
{
  user: ObjectId,
  items: [{
    product: ObjectId,
    quantity: Number,
    selectedVariants: [{ name: String, value: String, price: Number }],
    priceAtTime: Number
  }],
  sessionId: String,
  status: String,
  expiresAt: Date
}
```

## Query Parameters

### Product Filtering
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Filter by category ID
- `minPrice`: Minimum price filter
- `maxPrice`: Maximum price filter
- `brand`: Filter by brand
- `rating`: Minimum rating filter
- `search`: Text search query
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: Sort order 'asc' or 'desc' (default: 'desc')
- `status`: Product status filter
- `featured`: Filter featured products

### Order Filtering
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Order status filter
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: Sort order 'asc' or 'desc' (default: 'desc')

## Authentication & Authorization

### User Roles
- **Customer**: Can browse products, manage cart, place orders
- **Seller**: Can manage own products, view orders, access seller dashboard
- **Admin**: Full access to all features including category management

### Protected Routes
Most routes require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All endpoints return consistent error responses:
```javascript
{
  success: false,
  message: "Error description",
  error: "Detailed error message"
}
```

## Success Responses

All successful responses follow this format:
```javascript
{
  success: true,
  message: "Success message", // Optional
  data: { /* Response data */ }
}
```

## Usage Examples

### Create a Product
```javascript
POST /api/ecommerce/products
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "category": "60f1b2b3c4d5e6f7g8h9i0j1",
  "brand": "TechBrand",
  "price": {
    "regular": 199.99,
    "sale": 149.99
  },
  "inventory": {
    "quantity": 50,
    "lowStockThreshold": 10
  },
  "images": [
    {
      "url": "https://example.com/headphones.jpg",
      "alt": "Wireless Headphones",
      "isPrimary": true
    }
  ]
}
```

### Add Item to Cart
```javascript
POST /api/ecommerce/cart/add
{
  "productId": "60f1b2b3c4d5e6f7g8h9i0j1",
  "quantity": 2,
  "selectedVariants": [
    {
      "name": "Color",
      "value": "Black",
      "price": 0
    }
  ]
}
```

### Create Order
```javascript
POST /api/ecommerce/orders
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "billingAddress": { /* Same as shipping */ },
  "paymentMethod": "credit_card",
  "shippingMethod": "standard"
}
```

## Integration Notes

This module integrates with:
- **Authentication Module**: For user management and JWT tokens
- **Media Service**: For product image uploads (to be implemented)
- **Notification Service**: For order updates (to be implemented)
- **Payment Gateway**: For payment processing (to be implemented)

## Future Enhancements

- [ ] Product reviews and ratings system
- [ ] Wishlist functionality
- [ ] Coupon and discount system
- [ ] Advanced inventory management
- [ ] Multi-vendor marketplace features
- [ ] Product recommendations
- [ ] Advanced analytics and reporting
- [ ] Integration with external payment gateways
- [ ] Real-time notifications
- [ ] Product import/export functionality

