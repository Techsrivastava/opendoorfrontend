# 🔧 API Configuration - Complete Setup

## ✅ Base URL Configured Properly!

Your frontend now **automatically detects** the environment and uses the correct base URL.

---

## 🌐 Base URL Configuration

### **Auto-Detection**
```javascript
// In js/api-helper.js

const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

const API_CONFIG = {
  baseURL: isLocalhost 
    ? 'http://localhost:5000/api'                          // 🔧 Development
    : 'https://openbacken-production.up.railway.app/api'  // 🚀 Production
};
```

### **What This Means:**
- ✅ When testing locally → Uses `http://localhost:5000/api`
- ✅ When deployed online → Uses `https://openbacken-production.up.railway.app/api`
- ✅ **No manual changes needed!**

---

## 📍 Backend Routes (From Your server.js)

```javascript
app.use("/api/bookings", bookingRoutes);   // ✅ Booking endpoints
app.use("/api/payments", paymentRoutes);   // ✅ Payment endpoints
app.use("/api/customers", customerRoutes); // ✅ Customer endpoints
app.use("/api/packages", packageRoutes);   // ✅ Package endpoints
```

---

## 🎯 Complete Endpoint Mapping

### **Booking Endpoints**

| Frontend Function | Method | Endpoint | Full URL |
|-------------------|--------|----------|----------|
| `BookingAPI.createBooking()` | POST | `/bookings` | `${baseURL}/bookings` |
| `BookingAPI.getCustomerBookings()` | GET | `/bookings/customer/:customerId` | `${baseURL}/bookings/customer/123` |
| `BookingAPI.getBookingById()` | GET | `/bookings/:id` | `${baseURL}/bookings/456` |
| `BookingAPI.updateBooking()` | PUT | `/bookings/:id` | `${baseURL}/bookings/456` |

### **Payment Endpoints**

| Frontend Function | Method | Endpoint | Full URL |
|-------------------|--------|----------|----------|
| `PaymentAPI.createOrder()` | POST | `/payments/create-order` | `${baseURL}/payments/create-order` |
| `PaymentAPI.verifyPayment()` | POST | `/payments/verify` | `${baseURL}/payments/verify` |
| `PaymentAPI.getPaymentDetails()` | GET | `/payments/booking/:bookingId` | `${baseURL}/payments/booking/BOOK-123` |

---

## 🛠️ Helper Function: buildApiUrl()

**New Feature!** Clean URL building with parameter replacement:

```javascript
// Simple usage
buildApiUrl('bookings')  
// → 'http://localhost:5000/api/bookings'

// With parameters
buildApiUrl('bookingById', { id: '123' })  
// → 'http://localhost:5000/api/bookings/123'

// Complex example
buildApiUrl('bookingsByCustomer', { customerId: '5f8d0d55' })  
// → 'http://localhost:5000/api/bookings/customer/5f8d0d55'
```

---

## 📊 API Configuration Object

```javascript
const API_CONFIG = {
  baseURL: 'auto-detected',
  timeout: 10000,
  
  endpoints: {
    // Booking endpoints
    bookings: '/bookings',
    bookingById: '/bookings/:id',
    bookingsByCustomer: '/bookings/customer/:customerId',
    
    // Payment endpoints
    createOrder: '/payments/create-order',
    verifyPayment: '/payments/verify',
    paymentDetails: '/payments/booking/:bookingId',
    
    // Customer endpoints
    customers: '/customers',
    customerLogin: '/customers/send-login-otp',
    customerRegister: '/customers/send-registration-otp',
    
    // Package endpoints
    packages: '/packages',
    packageById: '/packages/:id',
    packageBySlug: '/packages/slug/:slug'
  }
};
```

---

## 🔄 How It Works

### **1. Environment Detection**
```javascript
// Browser automatically checks hostname
if (window.location.hostname === 'localhost') {
  // Use local backend: http://localhost:5000/api
} else {
  // Use production backend: https://openbacken-production.up.railway.app/api
}
```

### **2. Clean API Calls**
```javascript
// Old way (manual)
fetch(`${API_CONFIG.baseURL}/payments/create-order`, {...})

// New way (clean)
fetch(buildApiUrl('createOrder'), {...})
```

### **3. Parameter Replacement**
```javascript
// Endpoint: '/bookings/:id'
buildApiUrl('bookingById', { id: '123' })
// Result: 'http://localhost:5000/api/bookings/123'
```

---

## ✅ Testing the Configuration

### **Check Console on Page Load**
When you open any page, you'll see:

```javascript
🔧 API Configuration: {
  environment: "Development",  // or "Production"
  baseURL: "http://localhost:5000/api"
}
```

### **Test API Calls**

```javascript
// Test in browser console
console.log(API_CONFIG.baseURL);
// Development: http://localhost:5000/api
// Production: https://openbacken-production.up.railway.app/api

// Test buildApiUrl
console.log(buildApiUrl('createOrder'));
// → http://localhost:5000/api/payments/create-order

console.log(buildApiUrl('bookingById', { id: '123' }));
// → http://localhost:5000/api/bookings/123
```

---

## 🎯 Complete Integration Example

### **Booking Flow**
```javascript
// 1. Create Booking
const booking = await BookingAPI.createBooking({...});
// → POST http://localhost:5000/api/bookings

// 2. Create Payment Order
const order = await PaymentAPI.createOrder({...});
// → POST http://localhost:5000/api/payments/create-order

// 3. Verify Payment
const verified = await PaymentAPI.verifyPayment({...});
// → POST http://localhost:5000/api/payments/verify

// 4. Get Payment Status
const status = await PaymentAPI.getPaymentDetails('BOOK-123');
// → GET http://localhost:5000/api/payments/booking/BOOK-123
```

---

## 🚀 Production vs Development

| Environment | Hostname | Base URL |
|-------------|----------|----------|
| **Local Development** | `localhost` or `127.0.0.1` | `http://localhost:5000/api` |
| **Production** | Your domain | `https://openbacken-production.up.railway.app/api` |

---

## 📝 Backend Server Configuration

### **Your server.js (Confirmed)**
```javascript
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Routes
app.use("/api/bookings", bookingRoutes);   // ✅
app.use("/api/payments", paymentRoutes);   // ✅
```

### **CORS Configuration (From your server.js)**
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "https://trippyindia.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});
```

**Note:** Make sure your frontend domain is added to CORS origins!

---

## 🔐 Authentication Headers

All API calls automatically include:

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'  // If user is logged in
}
```

**Handled by:** `getAuthHeaders()` function

---

## 📊 API Response Format

### **Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### **Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}
```

---

## 🐛 Troubleshooting

### **Issue: CORS Error**
**Solution:** Add your frontend URL to backend CORS config:
```javascript
origin: [
  "http://localhost:3000",
  "https://your-frontend-domain.com"
]
```

### **Issue: 404 Not Found**
**Solution:** Check endpoint spelling matches backend routes exactly:
- ✅ `/api/bookings` (correct)
- ❌ `/api/bookings/create` (wrong - unless your backend has this route)

### **Issue: Network Error**
**Solution:** 
1. Verify backend is running: `http://localhost:5000`
2. Check console for base URL: Should match your backend
3. Test backend directly: `curl http://localhost:5000/api/packages`

---

## ✅ Configuration Complete!

**Your API integration is now:**
- ✅ Auto-detecting environment
- ✅ Using correct base URLs
- ✅ Clean endpoint management
- ✅ Proper error handling
- ✅ Authentication headers
- ✅ Production ready!

---

## 📚 Files Modified

1. ✅ `js/api-helper.js` - Complete API configuration
2. ✅ `js/booking-helper.js` - Uses PaymentAPI
3. ✅ `js/payment-status-helper.js` - Payment UI

---

## 🎉 Summary

**Base URL Configuration:**
```
LOCAL:      http://localhost:5000/api
PRODUCTION: https://openbacken-production.up.railway.app/api
```

**Booking Endpoints:**
```
POST   /api/bookings
GET    /api/bookings/customer/:customerId
GET    /api/bookings/:id
PUT    /api/bookings/:id
```

**Payment Endpoints:**
```
POST   /api/payments/create-order
POST   /api/payments/verify
GET    /api/payments/booking/:bookingId
```

**Everything is properly configured and ready to use!** 🚀
