# 🐛 Customer Data Debugging Guide

## 🔍 Issue: "Guest User" Instead of Customer Name

**Problem:** Customer is logged in as "Adarsh Srivastava" but Razorpay shows "Guest User"

---

## ✅ What Was Fixed

### **1. Multiple Fallback Sources**

**Now checks 3 sources for customer data:**
```javascript
// Priority order:
1. userInfo.name (from login)
2. localStorage.getItem('customerName') (backup)
3. 'Guest User' (last resort)

const customerName = userInfo.name 
    || localStorage.getItem('customerName') 
    || 'Guest User';
```

### **2. Debug Logging Added**

**Console logs to help identify the issue:**
```javascript
// On page load:
🔍 Booking Helper Loaded - Customer Data:
  - Logged In: true/false
  - Customer ID: 5f8d0d55...
  - Customer Name: Adarsh Srivastava
  - userInfo: {name: 'Adarsh Srivastava', ...}

// During booking:
📊 Customer Data Check: {...}
👤 Using customer data: {customerName: 'Adarsh Srivastava', ...}
```

---

## 🧪 Testing Steps

### **Step 1: Open Browser Console**
Press `F12` → Go to Console tab

### **Step 2: Check Page Load**
When page loads, you should see:
```javascript
🔍 Booking Helper Loaded - Customer Data:
  - Logged In: true
  - Customer ID: 673....
  - Customer Name: Adarsh Srivastava  // ✅ Should show your name
  - userInfo: {name: 'Adarsh Srivastava', phone: '...', ...}
```

### **Step 3: If Name is Missing**

**Check localStorage manually:**
```javascript
// In console, run:
localStorage.getItem('customerName')
// Should return: "Adarsh Srivastava"

localStorage.getItem('userInfo')
// Should return: '{"name":"Adarsh Srivastava","phone":"...",...}'
```

### **Step 4: During Booking**

When you click "Confirm & Pay", check console:
```javascript
📊 Customer Data Check: {
  userInfo: {name: 'Adarsh Srivastava', ...},  // ✅ Should have data
  customerId: '673...',
  customerName: 'Adarsh Srivastava',          // ✅ Should match
  customerPhone: '...'
}

👤 Using customer data: {
  customerName: 'Adarsh Srivastava',           // ✅ Correct name
  customerEmail: 'adarsh@...',
  customerPhone: '...'
}
```

---

## 🔧 If Still Showing "Guest User"

### **Possible Causes:**

1. **userInfo not saved during login**
2. **localStorage cleared**
3. **Different domain/subdomain**

### **Solution: Check Auth Flow**

**File: `js/api-helper.js` - `saveCustomerData()` function**

Ensure this runs after successful login:
```javascript
function saveCustomerData(customerData, token) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('customerId', customerData._id);
  localStorage.setItem('customerName', customerData.name || '');
  localStorage.setItem('customerPhone', customerData.phone || '');
  localStorage.setItem('customerEmail', customerData.email || '');
  
  // ✅ This should save userInfo
  const userInfo = {
    _id: customerData._id,
    name: customerData.name || '',
    phone: customerData.phone || '',
    email: customerData.email || ''
  };
  localStorage.setItem('userInfo', JSON.stringify(userInfo));
}
```

### **Manual Fix:**

If needed, manually set in console:
```javascript
localStorage.setItem('userInfo', JSON.stringify({
    name: 'Adarsh Srivastava',
    phone: '9876543210',
    email: 'adarsh@example.com'
}));

localStorage.setItem('customerName', 'Adarsh Srivastava');
```

Then refresh page and try booking again.

---

## 📊 Expected Flow

```
User Logs In
    ↓
saveCustomerData() called
    ↓
localStorage.setItem('userInfo', {...})
localStorage.setItem('customerName', 'Adarsh Srivastava')
    ↓
Page Load
    ↓
🔍 Debug log shows customer data ✅
    ↓
User Books
    ↓
📊 Customer Data Check (shows Adarsh Srivastava) ✅
    ↓
Razorpay Modal
    ↓
Name pre-filled: "Adarsh Srivastava" ✅
```

---

## 🎯 Console Commands for Testing

```javascript
// Check if logged in
isLoggedIn()
// Should return: true

// Check customer ID
getCurrentCustomerId()
// Should return: "673..."

// Check userInfo
JSON.parse(localStorage.getItem('userInfo'))
// Should return: {name: "Adarsh Srivastava", ...}

// Check all localStorage
Object.keys(localStorage).forEach(key => {
    console.log(key, ':', localStorage.getItem(key));
});
```

---

## ✅ Success Indicators

When everything works correctly:

1. **Page Load:**
   ```
   ✅ Logged In: true
   ✅ Customer Name: Adarsh Srivastava
   ✅ userInfo has name property
   ```

2. **During Booking:**
   ```
   ✅ Customer Data Check shows real name
   ✅ Using customer data shows real name
   ```

3. **Razorpay Modal:**
   ```
   ✅ Name field pre-filled: Adarsh Srivastava
   ✅ Phone field pre-filled: 9876543210
   ✅ Email field pre-filled: adarsh@example.com
   ```

---

## 🆘 Still Having Issues?

**Share these console logs:**
1. Page load debug logs
2. Customer Data Check output
3. localStorage dump
4. Any error messages

This will help identify exactly where the data is missing!

---

## 🔍 Quick Diagnostic

**Run this in console:**
```javascript
console.log('=== CUSTOMER DATA DIAGNOSTIC ===');
console.log('Logged In:', isLoggedIn());
console.log('Customer ID:', getCurrentCustomerId());
console.log('Customer Name (direct):', localStorage.getItem('customerName'));
console.log('userInfo:', localStorage.getItem('userInfo'));
console.log('Parsed userInfo:', JSON.parse(localStorage.getItem('userInfo') || '{}'));
console.log('==============================');
```

**Expected Output:**
```
=== CUSTOMER DATA DIAGNOSTIC ===
Logged In: true
Customer ID: 673c2f7b8a5e4d1a2b3c4d5e
Customer Name (direct): Adarsh Srivastava
userInfo: {"name":"Adarsh Srivastava","phone":"9876543210",...}
Parsed userInfo: {name: 'Adarsh Srivastava', phone: '9876543210', ...}
==============================
```

If any of these is `null`, `undefined`, or `{}`, that's where the issue is!
