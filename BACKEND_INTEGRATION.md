# Wildex Backend Integration Guide

## Backend Setup

### Backend Location
```
d:\Flutter Projects\Projects\clone Website\Fine -one\html.awaikenthemes.com\Open_Backen
```

### Start Backend Server
```bash
cd "d:\Flutter Projects\Projects\clone Website\Fine -one\html.awaikenthemes.com\Open_Backen"
npm install
npm start
```

**Server runs on:** `http://localhost:5000`

---

## API Endpoints

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 1. Authentication Flow

### 1.1 Customer Registration

#### Step 1: Send OTP for Registration
```javascript
// POST /api/customers/send-otp
const sendRegistrationOTP = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/customers/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone })
  });
  
  const data = await response.json();
  // Returns: { success: true, message: "OTP sent successfully", customerId: "..." }
  return data;
};
```

#### Step 2: Verify OTP and Complete Registration
```javascript
// POST /api/customers/verify-otp
const verifyRegistrationOTP = async (customerId, otp) => {
  const response = await fetch(`${API_BASE_URL}/customers/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId, otp })
  });
  
  const data = await response.json();
  // Returns: { success: true, message: "Registration successful", data: { ...customerData, token } }
  
  // Save token for future requests
  if (data.success) {
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('customerId', data.data._id);
  }
  
  return data;
};
```

### 1.2 Customer Login

#### Step 1: Send Login OTP
```javascript
// POST /api/customers/login/send-otp
const sendLoginOTP = async (phone) => {
  const response = await fetch(`${API_BASE_URL}/customers/login/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone })
  });
  
  const data = await response.json();
  // Returns: { success: true, message: "OTP sent successfully", customerId: "..." }
  return data;
};
```

#### Step 2: Verify Login OTP
```javascript
// POST /api/customers/login/verify-otp
const verifyLoginOTP = async (customerId, otp) => {
  const response = await fetch(`${API_BASE_URL}/customers/login/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId, otp })
  });
  
  const data = await response.json();
  // Returns: { success: true, message: "Login successful", data: { ...customerData, token } }
  
  // Save token and customer data
  if (data.success) {
    localStorage.setItem('authToken', data.data.token);
    localStorage.setItem('customerId', data.data._id);
    localStorage.setItem('customerName', data.data.name);
    localStorage.setItem('customerPhone', data.data.phone);
  }
  
  return data;
};
```

### 1.3 Update Customer Profile
```javascript
// PUT /api/customers/profile/:id
const updateCustomerProfile = async (customerId, profileData) => {
  const formData = new FormData();
  formData.append('name', profileData.name);
  formData.append('email', profileData.email);
  formData.append('location', profileData.location);
  
  // If avatar file is selected
  if (profileData.avatar) {
    formData.append('avatar', profileData.avatar);
  }
  
  const response = await fetch(`${API_BASE_URL}/customers/profile/${customerId}`, {
    method: 'PUT',
    body: formData
  });
  
  const data = await response.json();
  return data;
};
```

### 1.4 Get Customer Profile
```javascript
// GET /api/customers/profile/:id
const getCustomerProfile = async (customerId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/customers/profile/${customerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
};
```

---

## 2. Booking Flow

### 2.1 Create New Booking
```javascript
// POST /api/bookings/create
const createBooking = async (bookingData) => {
  const token = localStorage.getItem('authToken');
  const customerId = localStorage.getItem('customerId');
  
  const response = await fetch(`${API_BASE_URL}/bookings/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customer: customerId,
      package: bookingData.packageId,
      travelDate: bookingData.travelDate,
      amount: bookingData.amount,
      participants: bookingData.participants,
      bookedBy: "Self",
      advance: bookingData.advancePayment || 0,
      addons: bookingData.addons || []
    })
  });
  
  const data = await response.json();
  // Returns: { success: true, message: "Booking created successfully", data: { bookingId, ... } }
  return data;
};
```

### 2.2 Get Customer's Bookings
```javascript
// GET /api/bookings/customer/:customerId
const getCustomerBookings = async (customerId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
};
```

### 2.3 Get Single Booking Details
```javascript
// GET /api/bookings/:id
const getBookingById = async (bookingId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
};
```

### 2.4 Update Booking
```javascript
// PUT /api/bookings/:id
const updateBooking = async (bookingId, updateData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  return data;
};
```

### 2.5 Cancel Booking
```javascript
// PATCH /api/bookings/:id/status
const cancelBooking = async (bookingId) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: "Cancelled" })
  });
  
  const data = await response.json();
  return data;
};
```

---

## 3. Package Endpoints

### 3.1 Get All Packages
```javascript
// GET /api/packages
const getAllPackages = async () => {
  const response = await fetch(`${API_BASE_URL}/packages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
};
```

### 3.2 Get Package by ID
```javascript
// GET /api/packages/:id
const getPackageById = async (packageId) => {
  const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  const data = await response.json();
  return data;
};
```

---

## 4. Payment Integration

### 4.1 Collect Payment
```javascript
// POST /api/bookings/:id/collect-payment
const collectPayment = async (bookingId, paymentData) => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/collect-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: paymentData.amount,
      method: paymentData.method, // "Card", "UPI", "NetBanking", etc.
      collectedBy: "Self",
      notes: paymentData.notes || ""
    })
  });
  
  const data = await response.json();
  return data;
};
```

---

## 5. HTML Form Examples

### Registration Form
```html
<!-- Registration Modal -->
<div id="registrationModal" class="modal">
  <div class="modal-content">
    <h2>Register</h2>
    
    <!-- Step 1: Phone Number -->
    <div id="phoneStep">
      <input type="tel" id="regPhone" placeholder="Enter Phone Number" required>
      <button onclick="sendRegOTP()">Send OTP</button>
    </div>
    
    <!-- Step 2: OTP Verification -->
    <div id="otpStep" style="display: none;">
      <input type="text" id="regOTP" placeholder="Enter OTP" maxlength="6" required>
      <button onclick="verifyRegOTP()">Verify & Register</button>
    </div>
  </div>
</div>

<script>
let tempCustomerId = null;

async function sendRegOTP() {
  const phone = document.getElementById('regPhone').value;
  
  if (!phone || phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }
  
  try {
    const result = await sendRegistrationOTP(phone);
    
    if (result.success) {
      tempCustomerId = result.customerId;
      document.getElementById('phoneStep').style.display = 'none';
      document.getElementById('otpStep').style.display = 'block';
      alert('OTP sent successfully!');
    } else {
      alert(result.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
}

async function verifyRegOTP() {
  const otp = document.getElementById('regOTP').value;
  
  if (!otp || otp.length !== 6) {
    alert('Please enter a valid 6-digit OTP');
    return;
  }
  
  try {
    const result = await verifyRegistrationOTP(tempCustomerId, otp);
    
    if (result.success) {
      alert('Registration successful!');
      // Close modal and redirect
      document.getElementById('registrationModal').style.display = 'none';
      window.location.href = '/profile.html';
    } else {
      alert(result.message || 'Invalid OTP');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Verification failed. Please try again.');
  }
}
</script>
```

### Login Form
```html
<!-- Login Modal -->
<div id="loginModal" class="modal">
  <div class="modal-content">
    <h2>Login</h2>
    
    <!-- Step 1: Phone Number -->
    <div id="loginPhoneStep">
      <input type="tel" id="loginPhone" placeholder="Enter Phone Number" required>
      <button onclick="sendLoginOTPHandler()">Send OTP</button>
    </div>
    
    <!-- Step 2: OTP Verification -->
    <div id="loginOtpStep" style="display: none;">
      <input type="text" id="loginOTP" placeholder="Enter OTP" maxlength="6" required>
      <button onclick="verifyLoginOTPHandler()">Login</button>
    </div>
  </div>
</div>

<script>
let loginCustomerId = null;

async function sendLoginOTPHandler() {
  const phone = document.getElementById('loginPhone').value;
  
  if (!phone || phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }
  
  try {
    const result = await sendLoginOTP(phone);
    
    if (result.success) {
      loginCustomerId = result.customerId;
      document.getElementById('loginPhoneStep').style.display = 'none';
      document.getElementById('loginOtpStep').style.display = 'block';
      alert('OTP sent successfully!');
    } else {
      alert(result.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
}

async function verifyLoginOTPHandler() {
  const otp = document.getElementById('loginOTP').value;
  
  if (!otp || otp.length !== 6) {
    alert('Please enter a valid 6-digit OTP');
    return;
  }
  
  try {
    const result = await verifyLoginOTP(loginCustomerId, otp);
    
    if (result.success) {
      alert('Login successful!');
      // Close modal and redirect
      document.getElementById('loginModal').style.display = 'none';
      window.location.href = '/dashboard.html';
    } else {
      alert(result.message || 'Invalid OTP');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Login failed. Please try again.');
  }
}
</script>
```

### Booking Form
```html
<!-- Booking Form -->
<form id="bookingForm" onsubmit="handleBookingSubmit(event)">
  <input type="hidden" id="packageId" value="">
  
  <div class="form-group">
    <label>Travel Date</label>
    <input type="date" id="travelDate" required>
  </div>
  
  <div class="form-group">
    <label>Number of Participants</label>
    <input type="number" id="participants" min="1" required>
  </div>
  
  <div class="form-group">
    <label>Total Amount</label>
    <input type="number" id="amount" readonly>
  </div>
  
  <div class="form-group">
    <label>Advance Payment</label>
    <input type="number" id="advancePayment" required>
  </div>
  
  <button type="submit">Book Now</button>
</form>

<script>
async function handleBookingSubmit(event) {
  event.preventDefault();
  
  const bookingData = {
    packageId: document.getElementById('packageId').value,
    travelDate: document.getElementById('travelDate').value,
    participants: parseInt(document.getElementById('participants').value),
    amount: parseFloat(document.getElementById('amount').value),
    advancePayment: parseFloat(document.getElementById('advancePayment').value)
  };
  
  try {
    const result = await createBooking(bookingData);
    
    if (result.success) {
      alert(`Booking successful! Your booking ID is: ${result.data.bookingId}`);
      window.location.href = '/bookings.html';
    } else {
      alert(result.message || 'Booking failed');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }
}
</script>
```

---

## 6. Complete API Helper File

Create a file: `wildex/js/api.js`

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Authentication APIs
const auth = {
  // Registration
  sendRegistrationOTP: async (phone) => {
    const response = await fetch(`${API_BASE_URL}/customers/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await response.json();
  },
  
  verifyRegistrationOTP: async (customerId, otp) => {
    const response = await fetch(`${API_BASE_URL}/customers/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, otp })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('customerId', data.data._id);
    }
    return data;
  },
  
  // Login
  sendLoginOTP: async (phone) => {
    const response = await fetch(`${API_BASE_URL}/customers/login/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    return await response.json();
  },
  
  verifyLoginOTP: async (customerId, otp) => {
    const response = await fetch(`${API_BASE_URL}/customers/login/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, otp })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('customerId', data.data._id);
    }
    return data;
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerPhone');
    window.location.href = '/index.html';
  }
};

// Customer APIs
const customer = {
  getProfile: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/customers/profile/${customerId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },
  
  updateProfile: async (customerId, profileData) => {
    const formData = new FormData();
    Object.keys(profileData).forEach(key => {
      if (profileData[key]) formData.append(key, profileData[key]);
    });
    
    const response = await fetch(`${API_BASE_URL}/customers/profile/${customerId}`, {
      method: 'PUT',
      body: formData
    });
    return await response.json();
  }
};

// Booking APIs
const booking = {
  create: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    return await response.json();
  },
  
  getCustomerBookings: async (customerId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/customer/${customerId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },
  
  getById: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },
  
  cancel: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: "Cancelled" })
    });
    return await response.json();
  }
};

// Package APIs
const packages = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/packages`);
    return await response.json();
  },
  
  getById: async (packageId) => {
    const response = await fetch(`${API_BASE_URL}/packages/${packageId}`);
    return await response.json();
  }
};

// Export for use in other files
export { auth, customer, booking, packages };
```

---

## 7. Quick Integration Steps

1. **Start Backend Server**
   ```bash
   cd "d:\Flutter Projects\Projects\clone Website\Fine -one\html.awaikenthemes.com\Open_Backen"
   npm start
   ```

2. **Include API Helper in HTML**
   ```html
   <script src="js/api.js"></script>
   ```

3. **Use in Your Pages**
   ```javascript
   // Example: Login page
   auth.sendLoginOTP(phone)
     .then(data => console.log(data))
     .catch(error => console.error(error));
   ```

---

## 8. Error Handling

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## 9. Testing Endpoints

You can test these endpoints using:
- **Postman**: Import the collection from `API_Documentation.md`
- **Browser Console**: Use the fetch examples above
- **cURL**: Command-line testing

Example cURL:
```bash
curl -X POST http://localhost:5000/api/customers/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"7999817080"}'
```

---

## 10. Important Notes

1. **OTP expires in 10 minutes**
2. **JWT token expires in 30 days**
3. **Phone numbers must be unique**
4. **All amounts are stored in Rupees (₹)**
5. **File uploads use multipart/form-data**
6. **Avatar images uploaded to AWS S3**

---

## Support

For backend issues, check:
- `Open_Backen/server.js` - Main server file
- MongoDB connection in `.env`
- API documentation in `API_Documentation.md`
