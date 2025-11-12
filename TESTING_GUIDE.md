# 🧪 Testing Guide - Payment Integration

## Quick Test Checklist

---

## 🚀 Before You Start

### ✅ Prerequisites
- [ ] Backend server is running
- [ ] Database is connected
- [ ] Razorpay keys are configured in `.env`
- [ ] Frontend is served (not just opening HTML files)
- [ ] User is logged in

---

## 📝 Step-by-Step Testing

### 1️⃣ **Test User Login**

1. Open `trip-single.html?slug=kedarnath-dham`
2. Click "Get Started" if not logged in
3. Enter phone number
4. Verify OTP
5. Check localStorage:
   ```javascript
   localStorage.getItem('authToken')
   localStorage.getItem('customerId')
   localStorage.getItem('userInfo')
   ```

**Expected Console Output:**
```
✅ Auth.js loaded successfully
✅ User Logged In: true
```

---

### 2️⃣ **Test Package Loading**

1. Trip details should load automatically
2. Check browser console

**Expected Console Output:**
```
✅ Trip loaded successfully: 689193577495aa8f11134122
Package: Kedarnath dham
```

**Expected UI:**
- Package name displayed
- Price shown: ₹30,000
- Duration, location visible
- Images gallery loaded

---

### 3️⃣ **Test Booking Modal**

1. Click "Book Now" button
2. Modal should open with package details

**Expected Console Output:**
```
Opening booking modal for trip: 689193577495aa8f11134122
```

**Expected UI:**
- Modal opens smoothly
- Package info displayed correctly
- Advance Amount: ₹12,000 (per person)
- Full Amount: ₹30,000 (per person)
- Both payment options visible

---

### 4️⃣ **Test Payment Type Selection**

**Test Advance Payment:**
1. Click on "Advance Payment" option
2. Check styling changes (should highlight)
3. Total amount should show ₹12,000

**Expected Console Output:**
```javascript
selectedPaymentType = 'advance'
Total amount: ₹12,000
```

**Test Full Payment:**
1. Click on "Full Payment" option
2. Check styling changes
3. Total amount should show ₹30,000

**Expected Console Output:**
```javascript
selectedPaymentType = 'full'
Total amount: ₹30,000
```

---

### 5️⃣ **Test Participants Increment**

1. Click + button to increase participants to 2
2. Check amount recalculation

**Expected Behavior:**
- Advance: ₹12,000 × 2 = ₹24,000
- Full: ₹30,000 × 2 = ₹60,000

---

### 6️⃣ **Test Add-ons (if available)**

1. Check if addons appear
2. Select an addon
3. Verify price updates

**Expected Console Output:**
```javascript
Addon selected: Extra night - ₹2,000
New total: ₹32,000
```

---

### 7️⃣ **Test Coupon (Optional)**

1. Enter coupon code: "TEST10"
2. Click Apply
3. Check discount calculation

**Expected UI:**
- Discount row appears
- Discount amount shown in green
- Total amount reduced

---

### 8️⃣ **Test Booking Creation**

1. Fill all required fields:
   - Batch date: Select any
   - Participants: 1
   - Payment type: Full
2. Click "Confirm & Pay"

**Expected Console Output:**
```
Creating booking with package ID: 689193577495aa8f11134122
📦 Booking data: {...}
---
✅ Booking created successfully
Booking ID: BOOK-1730287234567
```

**Backend Console Output:**
```
📦 Received booking request
🔍 Checking customer existence: 5f8d0d55b54764421b7156c3
🔍 Checking package existence: 689193577495aa8f11134122
🎫 Generated bookingId: BOOK-1730287234567
💾 Saving booking
✅ Booking created successfully: BOOK-1730287234567
```

---

### 9️⃣ **Test Razorpay Order Creation**

After booking creation, payment gateway should initiate.

**Expected Console Output:**
```
Initiating payment gateway...
Creating Razorpay order with amount: 30000
---
Razorpay order created: order_NXxxxxxxxxxxx
Opening Razorpay checkout...
```

**Backend Console Output:**
```
🔷 Payment Gateway: /create-order endpoint hit
📦 Request body: { amount: 30000, bookingId: "BOOK-1730287234567", ... }
💰 Amount received (rupees): 30000
💰 Amount in paise: 3000000
🔐 Creating Razorpay order with options: {...}
✅ Razorpay order created: order_NXxxxxxxxxxxx
```

---

### 🔟 **Test Razorpay Modal**

**Expected Behavior:**
- Razorpay payment modal opens
- Shows correct amount: ₹30,000
- Shows package name
- Prefilled customer details

**Test Payment Options:**
- UPI
- Cards
- Net Banking
- Wallets

---

### 1️⃣1️⃣ **Test Payment Success**

Use Razorpay test cards (if in test mode):
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Expected Console Output:**
```
✅ Payment successful, verifying...
razorpay_payment_id: pay_xxxxxxxxxxxx
razorpay_order_id: order_xxxxxxxxxxxx
razorpay_signature: xxxxxxxxxxxxx
---
Payment verification response: { success: true }
✅ Payment verified successfully
```

**Backend Console Output:**
```
🔐 Payment validation request received
✅ Payment signature valid
💾 Updating booking: BOOK-1730287234567
Status: Confirmed
Payment Status: Paid
✅ Booking updated successfully
📧 Generating invoice...
```

**Expected UI:**
- Success message displays
- "Payment Successful! 🎉"
- Auto redirects to My Bookings after 3 seconds

---

### 1️⃣2️⃣ **Test Payment Failure**

1. Click "Book Now" again
2. Open Razorpay modal
3. Close modal without paying OR use failure card

**Expected Console Output:**
```
⚠️ Payment modal closed by user
OR
❌ Payment failed: [error message]
```

**Expected Behavior:**
- Error alert shows
- Booking remains in "Pending" status
- User can try again

---

## 🐛 Common Issues & Debugging

### Issue: Modal doesn't open
**Check:**
```javascript
console.log(window.Razorpay); // Should return function
console.log(currentTrip); // Should have trip data
console.log(isLoggedIn()); // Should return true
```

### Issue: Amount mismatch
**Check Backend Logs:**
```
💰 Amount received (rupees): 30000
💰 Amount in paise: 3000000  // Should be 100x rupees
```

### Issue: Booking not created
**Check Network Tab:**
- Request URL: `http://localhost:5000/api/bookings`
- Method: POST
- Status: 201 (Created)
- Response: `{ success: true, data: {...} }`

### Issue: Payment verification fails
**Check:**
1. Razorpay webhook secret matches
2. Backend receives all 3 fields:
   - razorpay_order_id
   - razorpay_payment_id
   - razorpay_signature

---

## 📊 Success Metrics

When everything works correctly:

✅ User can select payment type (Advance/Full)  
✅ Amounts calculate correctly for multiple participants  
✅ Booking creates successfully in database  
✅ Razorpay modal opens with correct details  
✅ Payment processes successfully  
✅ Booking status updates to "Confirmed"  
✅ User redirects to My Bookings  
✅ Invoice generates (if configured)  

---

## 🎯 Test Scenarios

### Scenario 1: Single Person, Full Payment
- Participants: 1
- Payment: Full (₹30,000)
- Expected Result: ✅ Success

### Scenario 2: Multiple People, Advance Payment
- Participants: 3
- Payment: Advance (₹12,000 × 3 = ₹36,000)
- Expected Result: ✅ Success

### Scenario 3: With Addons
- Participants: 2
- Addon: Extra night (₹2,000 × 2 = ₹4,000)
- Total: ₹64,000
- Expected Result: ✅ Success

### Scenario 4: With Coupon
- Total: ₹30,000
- Coupon: 10% off
- Final: ₹27,000
- Expected Result: ✅ Success

---

## 🔍 Browser Console Logs Reference

### Complete Success Flow:
```
[Trip Page Load]
✅ Trip loaded successfully: 689193577495aa8f11134122

[Click Book Now]
Opening booking modal for trip: 689193577495aa8f11134122

[Select Options & Click Confirm]
Creating booking with package ID: 689193577495aa8f11134122
Selected addons: []
---
Booking creation response: { success: true, data: {...} }
✅ Booking created successfully: BOOK-1730287234567
---
Initiating payment gateway...
Creating Razorpay order with amount: 30000
---
Razorpay order created: order_NXxxxxxxxxxxx
Opening Razorpay checkout...

[After Payment]
✅ Payment successful, verifying...
Payment verification response: { success: true }
✅ Payment verified successfully
```

---

## 📞 Support

If tests fail, check:
1. Backend logs
2. Browser console
3. Network tab
4. Database entries

Common fixes:
- Restart backend server
- Clear browser cache
- Re-login user
- Check environment variables

---

## ✅ Final Checklist

- [ ] All tests pass
- [ ] Console has no errors
- [ ] Network requests succeed (200/201 status)
- [ ] Database entries created correctly
- [ ] Payment flow completes end-to-end
- [ ] UI updates properly
- [ ] Redirect works correctly

**🎉 If all checks pass, your integration is complete!**
