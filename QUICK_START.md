# 🚀 Wildex Backend Integration - Quick Start Guide

## ✅ Backend Status: FULLY IMPLEMENTED

Your backend at `Open_Backen` folder has **complete implementations** for:
- ✅ Customer Registration (OTP-based)
- ✅ Customer Login (OTP-based)
- ✅ Customer Profile Management
- ✅ Booking Creation & Management
- ✅ Payment Processing
- ✅ Package Management
- ✅ Invoice Generation
- ✅ Email Notifications

---

## 📋 Quick Setup (3 Steps)

### Step 1: Start Backend Server

Open terminal and run:

```bash
cd "d:\Flutter Projects\Projects\clone Website\Fine -one\html.awaikenthemes.com\Open_Backen"
npm start
```

✅ Server runs on: **http://localhost:5000**

### Step 2: Include API Helper in Your HTML

Add this before closing `</body>` tag in your HTML files:

```html
<script src="js/api-helper.js"></script>
```

### Step 3: Start Using the API

```javascript
// Example: Login
AuthAPI.sendLoginOTP('7999817080')
  .then(response => {
    if (response.success) {
      console.log('OTP sent!', response.customerId);
    }
  });
```

---

## 🔑 Key API Functions

### Authentication

```javascript
// Registration
AuthAPI.sendRegistrationOTP(phone)
AuthAPI.verifyRegistrationOTP(customerId, otp)

// Login
AuthAPI.sendLoginOTP(phone)
AuthAPI.verifyLoginOTP(customerId, otp)

// Logout
AuthAPI.logout()
```

### Customer Profile

```javascript
// Get profile
CustomerAPI.getProfile(customerId)

// Update profile
CustomerAPI.updateProfile(customerId, {
  name: "John Doe",
  email: "john@example.com",
  location: "Mumbai",
  avatar: fileObject // File object from input[type="file"]
})
```

### Booking

```javascript
// Create booking
BookingAPI.createBooking({
  packageId: "package_id_here",
  travelDate: "2024-12-25",
  participants: 2,
  amount: 5000,
  advancePayment: 1000
})

// Get customer bookings
BookingAPI.getCustomerBookings(customerId)

// Cancel booking
BookingAPI.cancelBooking(bookingId)
```

### Packages

```javascript
// Get all packages
PackageAPI.getAll()

// Get single package
PackageAPI.getById(packageId)
```

---

## 📝 HTML Integration Examples

### Login Modal

```html
<div id="loginModal" class="modal">
  <h2>Login</h2>
  <div id="phoneStep">
    <input type="tel" id="loginPhone" placeholder="Phone Number">
    <button onclick="sendOTP()">Send OTP</button>
  </div>
  <div id="otpStep" style="display:none;">
    <input type="text" id="loginOTP" placeholder="Enter OTP">
    <button onclick="verifyOTP()">Login</button>
  </div>
</div>

<script>
let tempCustomerId;

async function sendOTP() {
  const phone = document.getElementById('loginPhone').value;
  const result = await AuthAPI.sendLoginOTP(phone);
  
  if (result.success) {
    tempCustomerId = result.customerId;
    document.getElementById('phoneStep').style.display = 'none';
    document.getElementById('otpStep').style.display = 'block';
    alert('OTP sent successfully!');
  }
}

async function verifyOTP() {
  const otp = document.getElementById('loginOTP').value;
  const result = await AuthAPI.verifyLoginOTP(tempCustomerId, otp);
  
  if (result.success) {
    alert('Login successful!');
    window.location.href = '/dashboard.html';
  }
}
</script>
```

### Booking Form

```html
<form id="bookingForm">
  <input type="date" id="travelDate" required>
  <input type="number" id="participants" placeholder="Participants" required>
  <input type="number" id="amount" placeholder="Total Amount" required>
  <input type="number" id="advance" placeholder="Advance Payment" required>
  <button type="submit">Book Now</button>
</form>

<script>
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const bookingData = {
    packageId: 'your_package_id',
    travelDate: document.getElementById('travelDate').value,
    participants: document.getElementById('participants').value,
    amount: document.getElementById('amount').value,
    advancePayment: document.getElementById('advance').value
  };
  
  const result = await BookingAPI.createBooking(bookingData);
  
  if (result.success) {
    alert(`Booking successful! ID: ${result.data.bookingId}`);
    window.location.href = '/bookings.html';
  } else {
    alert('Booking failed: ' + result.message);
  }
});
</script>
```

---

## 🎯 Common Use Cases

### 1. Check if User is Logged In

```javascript
if (isLoggedIn()) {
  console.log('User is logged in');
  console.log('Customer ID:', getCurrentCustomerId());
} else {
  console.log('User is not logged in');
}
```

### 2. Protect Pages (Require Login)

```javascript
// Add at the top of protected pages
if (!UIHelpers.requireAuth()) {
  // User will be redirected to login
}
```

### 3. Display User Info

```javascript
const customerId = getCurrentCustomerId();
const result = await CustomerAPI.getProfile(customerId);

if (result.success) {
  document.getElementById('userName').textContent = result.data.name;
  document.getElementById('userPhone').textContent = result.data.phone;
  document.getElementById('userAvatar').src = result.data.avatar;
}
```

### 4. Show User's Bookings

```javascript
const customerId = getCurrentCustomerId();
const result = await BookingAPI.getCustomerBookings(customerId);

if (result.success) {
  const bookingsList = document.getElementById('bookingsList');
  result.data.forEach(booking => {
    bookingsList.innerHTML += `
      <div class="booking-card">
        <h3>Booking ID: ${booking.bookingId}</h3>
        <p>Status: ${booking.status}</p>
        <p>Amount: ₹${booking.amount}</p>
        <p>Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}</p>
      </div>
    `;
  });
}
```

### 5. Load and Display Packages

```javascript
const result = await PackageAPI.getAll();

if (result.success) {
  const packagesGrid = document.getElementById('packagesGrid');
  result.data.forEach(pkg => {
    packagesGrid.innerHTML += `
      <div class="package-card">
        <img src="${pkg.images?.cardImage}" alt="${pkg.name}">
        <h3>${pkg.name}</h3>
        <p>${pkg.location}</p>
        <p>Duration: ${pkg.duration}</p>
        <p class="price">₹${pkg.offerPrice || pkg.originalPrice}</p>
        <button onclick="bookPackage('${pkg._id}')">Book Now</button>
      </div>
    `;
  });
}
```

---

## 🔐 Authentication Flow Diagram

```
Registration:
1. User enters phone → sendRegistrationOTP(phone)
2. OTP sent to phone
3. User enters OTP → verifyRegistrationOTP(customerId, otp)
4. Account created + Token saved
5. Redirect to profile completion page

Login:
1. User enters phone → sendLoginOTP(phone)
2. OTP sent to phone
3. User enters OTP → verifyLoginOTP(customerId, otp)
4. Token saved
5. Redirect to dashboard
```

---

## 📊 Backend API Endpoints Summary

| Feature | Method | Endpoint | Auth Required |
|---------|--------|----------|---------------|
| **Registration** |
| Send OTP | POST | `/api/customers/send-otp` | No |
| Verify OTP | POST | `/api/customers/verify-otp` | No |
| **Login** |
| Send OTP | POST | `/api/customers/login/send-otp` | No |
| Verify OTP | POST | `/api/customers/login/verify-otp` | No |
| **Profile** |
| Get Profile | GET | `/api/customers/profile/:id` | Yes |
| Update Profile | PUT | `/api/customers/profile/:id` | Yes |
| **Bookings** |
| Create Booking | POST | `/api/bookings/create` | Yes |
| Get Customer Bookings | GET | `/api/bookings/customer/:id` | Yes |
| Get Booking Details | GET | `/api/bookings/:id` | Yes |
| Cancel Booking | PATCH | `/api/bookings/:id/status` | Yes |
| **Packages** |
| Get All Packages | GET | `/api/packages` | No |
| Get Package by ID | GET | `/api/packages/:id` | No |

---

## 🛠️ Troubleshooting

### Backend Not Starting?

```bash
# Check if MongoDB is connected
# Check .env file for MONGO_URI

# Reinstall dependencies
npm install

# Start with error logging
npm start
```

### CORS Error?

The backend already has CORS enabled. Make sure backend is running on port 5000.

### OTP Not Sending?

Check `Open_Backen/.env` file for Message Central credentials:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

### Token Expired?

```javascript
// JWT tokens expire in 30 days
// If expired, user needs to login again
AuthAPI.logout(); // This will clear tokens
```

---

## 📚 Documentation Files

- **BACKEND_INTEGRATION.md** - Complete API documentation
- **api-helper.js** - JavaScript helper functions
- **Open_Backen/API_Documentation.md** - Detailed backend API docs
- **Open_Backen/Authentication_Documentation.md** - Auth flow details

---

## 💡 Tips

1. **Always check `result.success`** before using data
2. **Handle errors gracefully** with user-friendly messages
3. **Store minimal data** in localStorage (no sensitive info)
4. **Validate forms** before API calls
5. **Show loading states** during API calls

---

## 🎉 You're Ready!

Your backend is fully functional and ready to use. Just:

1. ✅ Start backend: `npm start` in Open_Backen folder
2. ✅ Include `api-helper.js` in your HTML
3. ✅ Call the API functions
4. ✅ Build your frontend UI

Need help? Check the documentation files or backend controllers in `Open_Backen/controllers/`.

---

**Happy Coding! 🚀**
