# Modular Backend API

A scalable, modular backend system with multiple business domains including hotels, e-commerce, automobiles, business services, and weddings. Built with a clean modular architecture for easy extension and maintenance.

## 🚀 Features

### Core Features
- **Modular Architecture**: Clean separation of business domains
- **Dynamic Module Loading**: Automatic discovery and registration of modules
- **User Authentication**: JWT-based authentication system
- **Scalable Structure**: Easy to add new modules and features

### Available Modules
- **🏨 Hotels**: Complete hotel management with rooms, bookings, and reviews
- **🛒 E-commerce**: Product management and order processing (placeholder)
- **🚗 Automobiles**: Vehicle management and rental system (placeholder)
- **💼 Business**: Company services and appointment management (placeholder)
- **💒 Weddings**: Venue and vendor management for events (placeholder)

### Technical Features
- **Health Monitoring**: Built-in health check endpoints
- **Security**: Helmet, CORS, and rate limiting
- **Flexible Validation**: No strict validation requirements for rapid development

## 🏗️ Architecture

### Directory Structure
```
src/
├── modules/                 # Business domain modules
│   ├── auth/               # Authentication module
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Module-specific middleware
│   │   └── index.js        # Module registration
│   ├── hotels/             # Hotel management module
│   ├── ecommerce/          # E-commerce module (placeholder)
│   ├── automobiles/        # Automobile module (placeholder)
│   ├── business/           # Business services module (placeholder)
│   └── weddings/           # Wedding services module (placeholder)
└── shared/                 # Shared utilities and config
    ├── config/             # Database and app configuration
    ├── middleware/         # Global middleware
    ├── utils/              # Utility functions
    └── types/              # TypeScript definitions (future)
```

### Module System
Each module is self-contained with:
- **Controllers**: Handle HTTP requests and responses
- **Models**: Database schema definitions
- **Routes**: API endpoint definitions
- **Services**: Business logic and data processing
- **Middleware**: Module-specific middleware
- **Index.js**: Module registration and route mounting

### Adding New Modules
1. Create module directory in `src/modules/`
2. Add controllers, models, routes, and services
3. Create `index.js` with module configuration
4. Module will be automatically discovered and loaded

## 📋 API Endpoints

### System
- `GET /` - API information and loaded modules
- `GET /api/health` - Health check with module status

### Authentication Module
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)

### Hotels Module
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID or slug
- `POST /api/hotels` - Create hotel (Protected)
- `PUT /api/hotels/:id` - Update hotel (Protected)
- `DELETE /api/hotels/:id` - Delete hotel (Protected)

#### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (Protected)
- `PUT /api/rooms/:id` - Update room (Protected)
- `DELETE /api/rooms/:id` - Delete room (Protected)

#### Bookings
- `GET /api/bookings` - Get all bookings (Protected)
- `GET /api/bookings/:id` - Get booking by ID (Protected)
- `POST /api/bookings` - Create booking (Protected)
- `PUT /api/bookings/:id` - Update booking (Protected)
- `DELETE /api/bookings/:id` - Cancel booking (Protected)

#### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/hotel/:hotelId` - Get hotel reviews
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

### Other Modules
*E-commerce, Automobiles, Business, and Weddings modules are placeholders and will be implemented as needed.*

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hotel-management-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel_management
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## 📊 Database Models

### User
- name, email, password, role, phone, avatar
- Roles: user, admin, hotel_owner

### Hotel
- Complete hotel information based on hotels.json structure
- Sections: hero, about, features, gallery, amenities, contact, footer, testimonials
- Section visibility and ordering

### Room
- Room details linked to hotels
- price, maxGuests, bedType, area, amenities, images

### Booking
- User bookings with hotel and room references
- Status tracking: pending, confirmed, cancelled, completed
- Payment status tracking

### Review
- Guest reviews and ratings for hotels
- Verified reviews for actual bookings

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Response Format

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 Features

- **No Required Validations**: All fields are optional as requested
- **Soft Deletes**: Records are marked as inactive instead of being deleted
- **Pagination**: All list endpoints support pagination
- **Search & Filtering**: Hotels and rooms can be searched and filtered
- **Role-based Access**: Different access levels for users, hotel owners, and admins
- **Security**: Rate limiting, CORS, helmet security headers

## 🏗️ Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── hotelController.js   # Hotel management
│   ├── roomController.js    # Room management
│   ├── bookingController.js # Booking system
│   └── reviewController.js  # Review system
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Hotel.js             # Hotel model
│   ├── Room.js              # Room model
│   ├── Booking.js           # Booking model
│   └── Review.js            # Review model
├── routes/
│   ├── auth.js              # Auth routes
│   ├── hotels.js            # Hotel routes
│   ├── rooms.js             # Room routes
│   ├── bookings.js          # Booking routes
│   ├── reviews.js           # Review routes
│   └── index.js             # Route aggregation
├── app.js                   # Main application file
├── package.json             # Dependencies
└── README.md                # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
