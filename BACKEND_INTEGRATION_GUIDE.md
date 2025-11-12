# 🚀 Backend Integration Guide

## Complete Frontend-Backend Integration for Payment & Booking

---

## 📋 Required Backend Changes

### 1️⃣ **Fix Booking Routes Order** (CRITICAL)

**File:** `routes/bookingRoutes.js`

```javascript
import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingStatus,
  getBookingsByCustomerId,
  addExpenseToBooking,
  getBookingExpensesAndProfit,
  getOverallExpenseSummary,
  deleteExpenseFromBooking,
  updateExpenseInBooking,
  collectPayment,
} from "../controllers/bookingController.js";

const router = express.Router();

// ⚠️ IMPORTANT: Order matters! Specific routes BEFORE parameterized routes

// Summary route (must be before /:id)
router.get("/summary/overall", getOverallExpenseSummary);

// Customer bookings route (must be before /:id)
router.get("/customer/:customerId", getBookingsByCustomerId);

// Booking CRUD
router.post("/", createBooking); // Changed from /create to /
router.get("/", getAllBookings); // ?bookedBy=Self or ?bookedBy=Admin
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
router.patch("/:id/status", updateBookingStatus);

// Expenses
router.post("/:id/expenses", addExpenseToBooking);
router.get("/:id/expenses", getBookingExpensesAndProfit);
router.delete("/:bookingId/expenses/:expenseId", deleteExpenseFromBooking);
router.put("/:bookingId/expenses/:expenseId", updateExpenseInBooking);

// Payment collection
router.post("/:id/collect-payment", collectPayment);

export default router;
```

---

### 2️⃣ **Update Payment Controller**

**File:** `controllers/paymentController.js`

**Key Changes:**
- Convert rupees to paise for Razorpay
- Better error handling
- Proper logging

```javascript
export const createOrder = async (req, res) => {
  console.log('🔷 Payment Gateway: /create-order endpoint hit');
  console.log('📦 Request body:', req.body);
  
  try {
    const { amount, currency = "INR", receipt, notes, bookingId, packageId, customerId } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Convert amount from rupees to paise
    // Frontend sends rupees, Razorpay needs paise (multiply by 100)
    let amountInPaise;
    if (amount > 100000) {
      // Already in paise (safeguard)
      amountInPaise = Math.round(amount);
    } else {
      // Convert rupees to paise
      amountInPaise = Math.round(amount * 100);
    }

    console.log('💰 Amount received (rupees):', amount);
    console.log('💰 Amount in paise:', amountInPaise);

    // Validate amount is valid integer
    if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount for payment processing' 
      });
    }

    // Prepare Razorpay order options
    const options = {
      amount: amountInPaise, // Amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        bookingId: bookingId || '',
        packageId: packageId || '',
        customerId: customerId || '',
        ...notes
      }
    };

    console.log('🔐 Creating Razorpay order with options:', options);
    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);

    res.status(200).json({
      success: true,
      data: {
        id: order.id, // ⚠️ CRITICAL: Frontend needs 'id' for order_id
        orderId: order.id,
        amount: order.amount, // Amount in paise
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
        status: order.status
      }
    });

  } catch (err) {
    console.error('❌ Error creating Razorpay order:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Error creating payment order' 
    });
  }
};
```

---

### 3️⃣ **Update Booking Controller**

**File:** `controllers/bookingController.js`

**Key Changes in `createBooking` function:**

```javascript
export const createBooking = async (req, res) => {
  try {
    console.log("📦 Received booking request:", req.body);

    let { 
      customer, 
      package: packageId, 
      travelDate, 
      amount, 
      participants, 
      bookedBy, 
      advance, 
      customPackage, 
      addons 
    } = req.body;

    // Normalize bookedBy
    if (bookedBy) {
      bookedBy = bookedBy.charAt(0).toUpperCase() + bookedBy.slice(1).toLowerCase();
      if (bookedBy === "Sandeep sir") {
        bookedBy = "Sandeep Sir";
      }
    }

    // Validate bookedBy
    const validBookedByValues = ["Self", "Admin", "Sandeep Sir"];
    if (!validBookedByValues.includes(bookedBy)) {
      console.log("❌ Invalid booking type:", bookedBy);
      return res.status(400).json({
        success: false,
        message: `Invalid booking type. Must be one of: ${validBookedByValues.join(", ")}`,
      });
    }

    // Validate customer
    console.log("🔍 Checking customer existence:", customer);
    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      console.log("❌ Customer not found:", customer);
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    // Validate package
    let packageExists = null;
    if (!customPackage) {
      console.log("🔍 Checking package existence:", packageId);
      packageExists = await Package.findById(packageId);
      if (!packageExists) {
        console.log("❌ Package not found:", packageId);
        return res.status(404).json({ success: false, message: "Package not found" });
      }

      // Validate addons
      if (addons && addons.length > 0) {
        const validAddonNames = (packageExists.additionalServices || []).map(a => a.name);
        for (const addon of addons) {
          if (typeof addon !== 'object' || !addon.name || addon.price == null) {
            return res.status(400).json({ 
              success: false, 
              message: 'Invalid addon format' 
            });
          }
          if (!validAddonNames.includes(addon.name)) {
            return res.status(400).json({ 
              success: false, 
              message: `Invalid addon: ${addon.name}` 
            });
          }
        }
      }
    }

    // Generate unique bookingId
    const bookingId = `BOOK-${Date.now()}`;
    console.log("🎫 Generated bookingId:", bookingId);

    // Amount normalization: always store in rupees
    if (amount > 100000) {
      amount = Number((amount / 100).toFixed(2));
    } else {
      amount = Number(Number(amount).toFixed(2));
    }
    
    if (advance > 100000) {
      advance = Number((advance / 100).toFixed(2));
    } else {
      advance = Number(Number(advance || 0).toFixed(2));
    }

    // Create booking
    const newBooking = new Booking({
      bookingId,
      customer,
      package: packageId,
      travelDate,
      amount,
      participants,
      bookedBy,
      advance,
      customPackage: customPackage || undefined,
      addons: addons || []
    });

    console.log("💾 Saving booking:", newBooking);
    await newBooking.save();

    // Update customer stats
    customerExists.bookings.push(newBooking._id);
    customerExists.totalBookings = (customerExists.totalBookings || 0) + 1;
    customerExists.totalSpent = (customerExists.totalSpent || 0) + amount;
    customerExists.lastBooking = newBooking._id;
    await customerExists.save();

    // Send notifications
    const notification = await Notification.create({
      message: `Your booking (${newBooking.bookingId}) has been created!`,
      type: "booking",
      bookingId: newBooking._id,
      userId: newBooking.customer,
      sentBy: "System"
    });
    
    const io = getSocketIo();
    io.to(String(newBooking.customer)).emit("notification", notification);

    console.log("✅ Booking created successfully:", newBooking.bookingId);
    
    res.status(201).json({ 
      success: true, 
      message: "Booking created successfully", 
      data: newBooking 
    });
    
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🎯 Frontend Integration Summary

### ✅ Already Fixed in Your Frontend:

1. **Payment Type Selection** - Advance vs Full payment with visual toggle
2. **Razorpay Script** - Added to `trip-single.html`
3. **API Error Handling** - Checks for JSON responses
4. **Amount Parsing** - Handles "12,000" format from API
5. **Booking Data Structure** - Matches backend expectations:
   - `customer` (not customerId)
   - `package` (not packageId)
   - `advance` (not advancePayment)
   - `bookedBy: 'Self'`
6. **Payment Flow** - Proper order: Create Booking → Create Order → Pay → Verify
7. **Console Logging** - Detailed logs with emojis for debugging

---

## 🧪 Testing Checklist

### Step 1: Test Booking Creation
```javascript
// Check browser console for:
✅ Booking created successfully: BOOK-1234567890
✅ Booking ID: <bookingId>
```

### Step 2: Test Razorpay Order
```javascript
// Check console for:
✅ Creating Razorpay order with amount: 30000
✅ Razorpay order created: order_xxxxxxxxxxxxx
✅ Opening Razorpay checkout...
```

### Step 3: Test Payment
```javascript
// After payment:
✅ Payment successful, verifying...
✅ Payment verified successfully
✅ Redirecting to My Bookings...
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Customer not found"
**Fix:** User must be logged in. Check `localStorage.getItem('customerId')`

### Issue 2: "Package not found"
**Fix:** Ensure `currentBookingPackage._id` is valid MongoDB ObjectId

### Issue 3: Razorpay popup doesn't open
**Fix:** 
- Check Razorpay script is loaded: `window.Razorpay`
- Check order.id is returned from backend
- Check browser console for errors

### Issue 4: Payment verification fails
**Fix:**
- Ensure backend receives correct `bookingId`
- Check Razorpay webhook signature validation

### Issue 5: Amount mismatch
**Fix:**
- Frontend sends rupees (e.g., 30000)
- Backend converts to paise (e.g., 3000000)
- Razorpay receives paise

---

## 📱 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/customer/:customerId` | Get user bookings |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |

---

## 🎨 UI Flow

```
User clicks "Book Now"
    ↓
Booking Modal Opens
    ↓
User selects:
  - Batch Date
  - Participants
  - Payment Type (Advance/Full)
  - Optional: Coupons & Addons
    ↓
Click "Confirm & Pay"
    ↓
Create Booking on Backend
    ↓
Create Razorpay Order
    ↓
Open Razorpay Checkout Modal
    ↓
User completes payment
    ↓
Verify Payment on Backend
    ↓
Update Booking Status to "Confirmed"
    ↓
Redirect to "My Bookings"
```

---

## 🔐 Environment Variables Required

```env
RAZORPAY_KEY_ID=rzp_live_2hEJnlSEJ8fC9L
RAZORPAY_KEY_SECRET=your_secret_key
```

---

## 📝 Notes

1. **Always test with small amounts first** (like ₹10 = 1000 paise)
2. **Check browser console** for detailed logs
3. **Backend must run on HTTPS** for production Razorpay
4. **Keep booking ID** for payment tracking
5. **Invoice generation** happens after payment verification

---

## ✨ Success Indicators

When everything works correctly, you'll see:

```
Frontend Console:
✅ Trip loaded successfully
✅ Booking created successfully: BOOK-1234567890
✅ Creating Razorpay order with amount: 30000
✅ Razorpay order created: order_xxxxx
✅ Opening Razorpay checkout...
✅ Payment successful, verifying...
✅ Payment verified successfully

Backend Console:
📦 Received booking request
🎫 Generated bookingId: BOOK-1234567890
💾 Saving booking
✅ Booking created successfully
🔷 Payment Gateway: /create-order endpoint hit
💰 Amount received (rupees): 30000
💰 Amount in paise: 3000000
✅ Razorpay order created
🔐 Payment validation request received
✅ Payment verified and booking updated
```

---

## 🚀 Ready to Deploy!

Your frontend is now properly integrated with your backend. Test thoroughly before production deployment!
