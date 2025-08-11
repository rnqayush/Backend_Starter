# Hotel Management Backend API

Complete hotel management backend system with user authentication, hotel management, room booking, and review system.

## 🚀 Features

- **User Authentication**: Registration, login with JWT tokens
- **Hotel Management**: Complete CRUD operations for hotels
- **Room Management**: Room creation, updates, and availability
- **Booking System**: Hotel room booking with status tracking
- **Review System**: Guest reviews and ratings for hotels
- **No Required Validations**: Flexible data entry as requested

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (Protected)

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID or slug
- `POST /api/hotels` - Create hotel (Protected)
- `PUT /api/hotels/:id` - Update hotel (Protected)
- `DELETE /api/hotels/:id` - Delete hotel (Protected)

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (Protected)
- `PUT /api/rooms/:id` - Update room (Protected)
- `DELETE /api/rooms/:id` - Delete room (Protected)

### Bookings
- `GET /api/bookings` - Get all bookings (Protected)
- `GET /api/bookings/:id` - Get booking by ID (Protected)
- `POST /api/bookings` - Create booking (Protected)
- `PUT /api/bookings/:id` - Update booking (Protected)
- `DELETE /api/bookings/:id` - Cancel booking (Protected)

### Reviews
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/hotel/:hotelId` - Get hotel reviews
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

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

