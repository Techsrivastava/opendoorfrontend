# 💳 Payment API Integration - Complete Usage Guide

## All 3 Payment Endpoints - Fully Integrated! ✅

Your payment routes are now **completely implemented** in the frontend with helper functions and UI components.

---

## 📌 Available Payment APIs

### 1. **POST `/payments/create-order`** ✅
Creates a Razorpay order for payment processing

### 2. **POST `/payments/verify`** ✅
Verifies payment signature after successful payment

### 3. **GET `/payments/booking/:bookingId`** ✅
Fetches payment details for a specific booking

---

## 🔧 Implementation Files

### **1. Core API Functions** (`js/api-helper.js`)
```javascript
// All payment API calls wrapped in PaymentAPI object

PaymentAPI.createOrder(orderData)      // Creates Razorpay order
PaymentAPI.verifyPayment(verifyData)   // Verifies payment
PaymentAPI.getPaymentDetails(bookingId) // Gets payment status
```

### **2. Payment Integration** (`js/booking-helper.js`)
```javascript
// Complete booking + payment flow
initiateRazorpayPayment()  // Uses createOrder + verify
```

### **3. Payment Status UI** (`js/payment-status-helper.js`)
```javascript
// UI helper functions
displayPaymentDetails()     // Shows payment info
getPaymentStatusBadge()     // Status badges
showPaymentReceipt()        // Receipt modal
isPaymentCompleted()        // Check payment status
```

---

## 📖 Usage Examples

### **Example 1: Create Payment Order** (Booking Flow)

```javascript
// This is already implemented in booking-helper.js
async function createPaymentOrder() {
    try {
        const orderData = {
            amount: 30000,              // Amount in rupees
            bookingId: 'BOOK-123456',
            packageId: '689193577495aa8f11134122',
            customerId: getCurrentCustomerId(),
            notes: {
                customerName: 'John Doe',
                packageName: 'Kedarnath Dham',
                paymentType: 'full'
            }
        };

        const response = await PaymentAPI.createOrder(orderData);
        
        if (response.success) {
            console.log('Order created:', response.data);
            // response.data contains:
            // {
            //   id: 'order_xxxxx',
            //   amount: 3000000,  // in paise
            //   currency: 'INR',
            //   status: 'created'
            // }
            
            // Now open Razorpay checkout
            openRazorpayCheckout(response.data);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

### **Example 2: Verify Payment** (After Razorpay Success)

```javascript
// This is already implemented in booking-helper.js
async function verifyPaymentAfterSuccess(razorpayResponse) {
    try {
        const verificationData = {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            bookingId: 'BOOK-123456'
        };

        const response = await PaymentAPI.verifyPayment(verificationData);
        
        if (response.success) {
            console.log('✅ Payment verified!');
            console.log('Booking updated:', response.data.booking);
            // Booking is now confirmed with status 'Confirmed'
            // and paymentStatus 'Paid'
        }
    } catch (error) {
        console.error('Verification failed:', error.message);
    }
}
```

---

### **Example 3: Display Payment Details** (My Bookings Page)

```html
<!-- Add this to your my-bookings.html -->
<script src="js/api-helper.js"></script>
<script src="js/payment-status-helper.js"></script>

<div id="paymentDetailsContainer"></div>

<script>
// Display payment details for a booking
async function loadPaymentInfo(bookingId) {
    await displayPaymentDetails(bookingId, 'paymentDetailsContainer');
}

// Or manually fetch and use data
async function getPaymentInfo(bookingId) {
    try {
        const response = await PaymentAPI.getPaymentDetails(bookingId);
        
        if (response.success) {
            const payment = response.data;
            console.log('Payment Status:', payment.paymentStatus);
            console.log('Booking Status:', payment.status);
            console.log('Payment ID:', payment.paymentId);
            
            // Use the data in your UI
            document.getElementById('paymentStatus').textContent = payment.paymentStatus;
            document.getElementById('bookingStatus').textContent = payment.status;
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Check if payment is complete
async function checkIfPaid(bookingId) {
    const isPaid = await isPaymentCompleted(bookingId);
    if (isPaid) {
        console.log('✅ Payment completed');
    } else {
        console.log('⚠️ Payment pending');
    }
}
</script>
```

---

### **Example 4: My Bookings Page - Full Integration**

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Bookings</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="bookings-container">
        <!-- Booking cards will be inserted here -->
    </div>

    <!-- Scripts -->
    <script src="js/api-helper.js"></script>
    <script src="js/payment-status-helper.js"></script>
    
    <script>
        async function loadMyBookings() {
            try {
                const customerId = getCurrentCustomerId();
                const response = await BookingAPI.getByCustomer(customerId);
                
                if (response.success && response.data) {
                    displayBookings(response.data);
                }
            } catch (error) {
                console.error('Error loading bookings:', error);
            }
        }

        async function displayBookings(bookings) {
            const container = document.querySelector('.bookings-container');
            
            for (const booking of bookings) {
                const card = await createBookingCard(booking);
                container.appendChild(card);
            }
        }

        async function createBookingCard(booking) {
            const card = document.createElement('div');
            card.className = 'booking-card';
            
            // Fetch payment details
            let paymentInfo = '';
            try {
                const paymentResponse = await PaymentAPI.getPaymentDetails(booking.bookingId);
                if (paymentResponse.success) {
                    const payment = paymentResponse.data;
                    paymentInfo = `
                        <div class="payment-info">
                            ${getPaymentStatusBadge(payment.paymentStatus)}
                            ${getBookingStatusBadge(payment.status)}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('Error fetching payment:', error);
            }
            
            card.innerHTML = `
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h3>${booking.package?.name || 'Package'}</h3>
                    <p>Booking ID: ${booking.bookingId}</p>
                    <p>Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}</p>
                    <p>Amount: ${formatPaymentAmount(booking.amount)}</p>
                    ${paymentInfo}
                    
                    <button onclick="showBookingDetails('${booking.bookingId}')" 
                            style="background: #F5AD4C; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 10px;">
                        View Details
                    </button>
                </div>
            `;
            
            return card;
        }

        async function showBookingDetails(bookingId) {
            // Create modal with payment details
            const modalDiv = document.createElement('div');
            modalDiv.id = 'bookingDetailsModal';
            modalDiv.innerHTML = `
                <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; justify-content: center; align-items: center;">
                    <div style="background: white; border-radius: 16px; max-width: 600px; width: 90%; padding: 30px; max-height: 90vh; overflow-y: auto;">
                        <h2>Booking Details</h2>
                        <div id="paymentDetailsSection"></div>
                        <button onclick="closeBookingDetailsModal()" style="margin-top: 20px; background: #F5AD4C; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modalDiv);
            
            // Load payment details
            await displayPaymentDetails(bookingId, 'paymentDetailsSection');
        }

        function closeBookingDetailsModal() {
            const modal = document.getElementById('bookingDetailsModal');
            if (modal) modal.remove();
        }

        // Load bookings on page load
        window.addEventListener('DOMContentLoaded', loadMyBookings);
    </script>
</body>
</html>
```

---

## 🎯 Quick Integration Checklist

### For Trip/Package Page (Booking Flow):
- [x] ✅ `PaymentAPI.createOrder()` - Create order
- [x] ✅ `PaymentAPI.verifyPayment()` - Verify payment
- [x] ✅ Razorpay checkout integration
- [x] ✅ Success/failure handling

### For My Bookings Page:
- [x] ✅ `PaymentAPI.getPaymentDetails()` - Fetch payment status
- [x] ✅ `displayPaymentDetails()` - Show payment UI
- [x] ✅ Status badges (Paid/Pending/Failed)
- [x] ✅ Payment receipt modal

### For Admin Dashboard:
- [x] ✅ View all payments
- [x] ✅ Check payment status
- [x] ✅ Payment analytics

---

## 🔄 Complete Payment Flow

```
┌─────────────────────────────┐
│  User clicks "Book Now"     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Fill booking details       │
│  Select payment type        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Click "Confirm & Pay"      │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  PaymentAPI.createOrder()            │
│  POST /payments/create-order         │
│  ✅ Returns: { order_id, amount }    │
└──────────┬───────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Open Razorpay Modal        │
│  User completes payment     │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  PaymentAPI.verifyPayment()          │
│  POST /payments/verify               │
│  ✅ Validates signature              │
│  ✅ Updates booking status           │
└──────────┬───────────────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Success! Redirect          │
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  My Bookings Page                    │
│  PaymentAPI.getPaymentDetails()      │
│  GET /payments/booking/:bookingId    │
│  ✅ Shows payment status             │
└──────────────────────────────────────┘
```

---

## 📊 API Response Examples

### 1. Create Order Response
```json
{
  "success": true,
  "data": {
    "id": "order_NXxxxxxxxxxxx",
    "orderId": "order_NXxxxxxxxxxxx",
    "amount": 3000000,
    "currency": "INR",
    "receipt": "receipt_1730287234567",
    "status": "created"
  }
}
```

### 2. Verify Payment Response
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "order_NXxxxxxxxxxxx",
    "paymentId": "pay_xxxxxxxxxxxx",
    "booking": {
      "_id": "...",
      "bookingId": "BOOK-1730287234567",
      "status": "Confirmed",
      "paymentStatus": "Paid",
      "paymentId": "pay_xxxxxxxxxxxx"
    }
  }
}
```

### 3. Get Payment Details Response
```json
{
  "success": true,
  "data": {
    "paymentStatus": "Paid",
    "paymentId": "pay_xxxxxxxxxxxx",
    "status": "Confirmed",
    "paymentDetails": {
      "orderId": "order_NXxxxxxxxxxxx",
      "paymentDate": "2025-10-30T10:15:30.000Z",
      "paymentMethod": "Online"
    }
  }
}
```

---

## 🎨 UI Components Available

### Status Badges
```javascript
getPaymentStatusBadge('Paid')      // Green badge
getPaymentStatusBadge('Pending')   // Yellow badge
getPaymentStatusBadge('Failed')    // Red badge
getPaymentStatusBadge('Refunded')  // Blue badge
```

### Booking Status
```javascript
getBookingStatusBadge('Confirmed')  // Green
getBookingStatusBadge('Pending')    // Yellow
getBookingStatusBadge('Cancelled')  // Red
getBookingStatusBadge('Completed')  // Purple
```

### Payment Details Display
```javascript
// Automatically creates a beautiful UI card
displayPaymentDetails('BOOK-123456', 'containerId');
```

### Payment Receipt Modal
```javascript
showPaymentReceipt({
    paymentId: 'pay_xxxxx',
    orderId: 'order_xxxxx',
    paymentDate: new Date(),
    status: 'Paid'
});
```

---

## 🔍 Helper Functions

```javascript
// Check if paid
const isPaid = await isPaymentCompleted('BOOK-123456');

// Format amount
const formatted = formatPaymentAmount(30000); // ₹30,000

// Get icon
const icon = getPaymentStatusIcon('Paid'); // fa-check-circle
```

---

## 📁 Required Files in HTML

```html
<!-- In your HTML pages -->
<script src="js/api-helper.js"></script>           <!-- Core API functions -->
<script src="js/booking-helper.js"></script>       <!-- Booking flow -->
<script src="js/payment-status-helper.js"></script> <!-- Payment UI helpers -->
```

---

## ✅ Integration Complete!

All 3 payment endpoints are now fully integrated with:
- ✅ Clean API wrapper functions
- ✅ Error handling
- ✅ UI components
- ✅ Helper utilities
- ✅ Complete documentation

**You can now use these APIs anywhere in your application!** 🎉

---

## 💡 Pro Tips

1. **Always check payment status** before allowing trip actions
2. **Use displayPaymentDetails()** for quick UI implementation
3. **Cache payment data** to reduce API calls
4. **Handle errors gracefully** with try-catch blocks
5. **Log important events** for debugging

---

## 📞 Quick Reference

| Task | Function | File |
|------|----------|------|
| Create Order | `PaymentAPI.createOrder()` | api-helper.js |
| Verify Payment | `PaymentAPI.verifyPayment()` | api-helper.js |
| Get Payment Info | `PaymentAPI.getPaymentDetails()` | api-helper.js |
| Show Payment UI | `displayPaymentDetails()` | payment-status-helper.js |
| Check if Paid | `isPaymentCompleted()` | payment-status-helper.js |
| Status Badge | `getPaymentStatusBadge()` | payment-status-helper.js |

---

**All Done! 🚀 Your payment integration is complete and production-ready!**
