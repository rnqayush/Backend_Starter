# MultiVendor Platform - Complete Full-Stack Solution

A comprehensive multivendor platform built with Express.js, MongoDB, and React with Redux Toolkit. This platform supports multiple business categories including Hotels, E-commerce, Automobiles, and Wedding services.

## 🚀 Features

### Backend Features
- **Clean MVC Architecture** with organized folder structure
- **JWT Authentication** with role-based access control
- **Multi-business Support** (Hotel, E-commerce, Automobile, Wedding)
- **Vendor Management** with approval workflow
- **Admin Dashboard** for platform management
- **RESTful APIs** with comprehensive CRUD operations
- **MongoDB Integration** with Mongoose ODM
- **Security Features** including rate limiting, CORS, and input validation
- **Centralized Error Handling** and logging
- **Pagination & Filtering** for all listing endpoints
- **Soft Delete Support** with isDeleted flag

### Frontend Features
- **React 18** with Vite for fast development
- **Redux Toolkit** with RTK Query for state management
- **Tailwind CSS** for responsive design
- **TypeScript Support** for better development experience
- **Protected Routes** for different user roles
- **Backend-Driven Content** for dynamic homepage
- **Responsive Design** with mobile-first approach
- **Toast Notifications** for user feedback
- **Loading States** and error handling
- **Search Functionality** across all categories

## 📁 Project Structure

```
Backend_Starter/
├── backend/
│   ├── controllers/          # Route controllers
│   │   ├── authController.js
│   │   ├── vendorController.js
│   │   ├── adminController.js
│   │   ├── hotelController.js
│   │   ├── ecommerceController.js
│   │   ├── automobileController.js
│   │   ├── weddingController.js
│   │   └── homepageController.js
│   ├── models/              # MongoDB models
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Hotel.js
│   │   ├── Ecommerce.js
│   │   ├── Automobile.js
│   │   └── Wedding.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── ecommerceRoutes.js
│   │   ├── automobileRoutes.js
│   │   ├── weddingRoutes.js
│   │   └── homepageRoutes.js
│   ├── middlewares/         # Custom middlewares
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── errorHandler.js
│   ├── config/              # Configuration files
│   │   └── database.js
│   ├── utils/               # Utility functions
│   │   ├── asyncHandler.js
│   │   ├── responseFormatter.js
│   │   └── logger.js
│   ├── .env.example         # Environment variables template
│   ├── package.json
│   └── server.js            # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/
│   │   │   ├── business/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── search/
│   │   │   ├── booking/
│   │   │   ├── cart/
│   │   │   └── admin/
│   │   ├── pages/           # Page components
│   │   │   ├── owner/
│   │   │   └── admin/
│   │   ├── store/           # Redux store
│   │   │   ├── api/         # RTK Query APIs
│   │   │   └── slices/      # Redux slices
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/rnqayush/Backend_Starter.git
   cd Backend_Starter
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/multivendor
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Vendor Management
- `POST /api/vendor/register` - Vendor registration
- `POST /api/vendor/login` - Vendor login
- `GET /api/vendor/profile` - Get vendor profile
- `PUT /api/vendor/profile` - Update vendor profile
- `GET /api/vendor/dashboard` - Vendor dashboard data

### Admin Management
- `POST /api/admin/login` - Admin login
- `GET /api/admin/vendors` - List all vendors
- `PUT /api/admin/vendors/:id/approve` - Approve vendor
- `DELETE /api/admin/vendors/:id` - Delete vendor

### Business Categories
Each category (hotel, ecommerce, automobile, wedding) has similar endpoints:
- `GET /api/{category}` - List items with pagination
- `GET /api/{category}/:id` - Get item by ID
- `POST /api/{category}` - Create new item (vendor only)
- `PUT /api/{category}/:id` - Update item (vendor only)
- `DELETE /api/{category}/:id` - Delete item (vendor only)

### Homepage
- `GET /api/homepage` - Get homepage content
- `GET /api/homepage/stats` - Get platform statistics
- `GET /api/homepage/search` - Global search

## 🎨 Frontend Architecture

### Redux Store Structure
```javascript
store/
├── api/
│   ├── baseApi.js          # Base RTK Query configuration
│   ├── authApi.js          # Authentication APIs
│   ├── homepageApi.js      # Homepage content APIs
│   ├── hotelApi.js         # Hotel business APIs
│   ├── ecommerceApi.js     # E-commerce APIs
│   ├── automobileApi.js    # Automobile APIs
│   └── weddingApi.js       # Wedding service APIs
└── slices/
    ├── authSlice.js        # Authentication state
    ├── businessSlice.js    # Business data state
    ├── homepageSlice.js    # Homepage content state
    └── uiSlice.js          # UI state management
```

### Component Architecture
- **Layout Components**: Header, Footer, Sidebar
- **Common Components**: LoadingSpinner, ErrorMessage, Modal
- **Business Components**: Category-specific components
- **Form Components**: Reusable form elements
- **Admin Components**: Admin dashboard components

## 🔐 User Roles & Permissions

### Customer
- Browse all business categories
- Search and filter businesses
- View business profiles
- Make bookings/purchases
- Leave reviews

### Vendor
- Register and manage business profile
- Add/edit/delete business listings
- View bookings and orders
- Respond to customer inquiries
- Access analytics dashboard

### Admin
- Approve/reject vendor applications
- Manage all users and businesses
- View platform analytics
- Moderate content and reviews
- System configuration

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application: `npm run build`
3. Start with PM2: `pm2 start server.js`

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure environment variables for API endpoints

### Database Setup
1. Create MongoDB database
2. Set up indexes for better performance
3. Configure backup strategies

## 🧪 Testing

### Backend Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

The API includes a test route for verification:
- `GET /api/test/ping` - Returns "API working" message

For detailed API documentation, import the Postman collection or use tools like Swagger.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

## 🔄 Version History

- **v1.0.0** - Initial release with complete multivendor platform
  - Full backend API with all business categories
  - React frontend with Redux Toolkit
  - Authentication and authorization
  - Admin and vendor dashboards
  - Responsive design with Tailwind CSS

---

**Built with ❤️ using Express.js, MongoDB, React, and Redux Toolkit**

