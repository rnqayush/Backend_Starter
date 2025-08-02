# Vendor Creation Test Requests

## ✅ CORRECT REQUEST FORMAT

This is the correct format that should work without any validation errors:

```json
{
  "name": "Grand Palace Hotel",
  "category": "hotel",
  "description": "Premium hotel services with excellent amenities and world-class hospitality",
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

## ❌ COMMON ERROR FORMATS

### Error 1: Missing Required Fields
```json
{
  "category": "hotel",
  "description": "Premium hotel services"
}
```
**Error:** `name: Business name is required, email: Business email is required, phone: Phone number is required`

### Error 2: Wrong Field Names (Old Format)
```json
{
  "businessName": "Grand Palace Hotel",
  "category": "hotel",
  "description": "Premium hotel services",
  "contactInfo": {
    "email": "info@grandpalace.com",
    "phone": "+91-9876543210"
  }
}
```
**Error:** `name: Business name is required, email: Business email is required, phone: Phone number is required`

### Error 3: businessHours as String
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
  "businessHours": "9AM - 6AM"
}
```
**Error:** `businessHours: Cast to Embedded failed for value "9AM - 6AM" (type string) at path "businessHours" because of "ObjectExpectedError"`

### Error 4: Invalid Email Format
```json
{
  "name": "Grand Palace Hotel",
  "category": "hotel",
  "description": "Premium hotel services",
  "email": "invalid-email",
  "phone": "+91-9876543210",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```
**Error:** `email: Please provide a valid email address`

### Error 5: Invalid Phone Format
```json
{
  "name": "Grand Palace Hotel",
  "category": "hotel",
  "description": "Premium hotel services",
  "email": "info@grandpalace.com",
  "phone": "invalid-phone",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```
**Error:** `phone: Please provide a valid phone number`

## 📋 REQUIRED FIELDS CHECKLIST

Before sending a vendor creation request, ensure you have:

- ✅ `name` (String) - Business name
- ✅ `category` (String) - One of: hotel, ecommerce, wedding, automobile, business
- ✅ `description` (String) - Business description (10-1000 characters)
- ✅ `email` (String) - Valid email format
- ✅ `phone` (String) - Valid phone number format
- ✅ `address` (Object) - Complete address object with:
  - ✅ `street` (String)
  - ✅ `city` (String)
  - ✅ `state` (String)
  - ✅ `zipCode` (String)
  - ✅ `country` (String, optional, defaults to "India")

## 🔧 OPTIONAL FIELDS

- `businessHours` (Object) - Must be object with day properties, not string
- `tagline` (String) - Max 200 characters
- `establishedYear` (Number) - Between 1900 and current year
- `licenseNumber` (String)
- `taxId` (String)
- `gstNumber` (String) - Must match GST format if provided
- `socialMedia` (Object)
- `theme` (Object)

## 🚨 VALIDATION IMPROVEMENTS

With the new validation middleware, you'll get detailed error messages that help identify exactly what's wrong with your request. The error response will include:

- Field name that failed validation
- Specific error message
- Expected format or type
- Received value

This makes debugging much easier!

