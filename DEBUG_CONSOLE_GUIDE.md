# 🔍 Console Debug Guide

## Ab Console Mein Ye Dikhega

---

## 📊 Step-by-Step Console Output

### **1. Payment Type Selection**
```
═══════════════════════════════════════
💳 Payment Type: advance
═══════════════════════════════════════
```

### **2. Detailed Calculation**
```
📊 DETAILED CALCULATION:
1. Base Price per person: 98000
2. Participants: 3
3. Base Total: 294000
4. Advance per person: 20000
5. Total Advance: 60000
6. Addons selected: 1
7. Addons Total: 15000
8. Full Package Total: 309000
9. Payment Total: 294000
10. Payment Amount (Razorpay): 60000
═══════════════════════════════════════
```

### **3. Backend Booking Data**
```
═══════════════════════════════════════
📦 BACKEND BOOKING DATA:
═══════════════════════════════════════
customer: 673c2f7b8a5e4d1a2b3c4d5e
package: 689193577495aa8f11134122
travelDate: 2025-11-15
participants: 3
amount (full package): 309000
advance (paying now): 60000
bookedBy: Self
addons: [{name: "Extra night", price: 5000, ...}]
═══════════════════════════════════════
```

### **4. Validation Check**
```
⚠️ VALIDATION CHECK:
advance (60000) <= amount (309000)
Result: ✅ PASS - Booking should work!
═══════════════════════════════════════
```

### **5. Backend Response**
```
═══════════════════════════════════════
📥 BACKEND RESPONSE:
═══════════════════════════════════════
Response: {success: true, data: {...}}
═══════════════════════════════════════
✅ Booking created successfully: {...}
```

---

## ❌ If Error Occurs

### **Console Will Show:**
```
❌ BACKEND ERROR: Booking validation failed: advance: Advance amount cannot be greater than total amount
Full error details: {success: false, message: "..."}
```

---

## 🔍 Debugging Checklist

### **Check These Values in Console:**

1. **Base Total**
   - Should be: `pricePerPerson × participants`
   - Example: 98000 × 3 = 294000 ✅

2. **Addons Total**
   - Should be: sum of all addons × participants
   - Example: 5000 × 3 = 15000 ✅

3. **Full Package Total**
   - Should be: `Base Total + Addons Total`
   - Example: 294000 + 15000 = 309000 ✅

4. **Total Advance**
   - Should be: `advancePerPerson × participants`
   - Example: 20000 × 3 = 60000 ✅

5. **Backend amount**
   - Should ALWAYS be: `Full Package Total`
   - Example: 309000 ✅

6. **Backend advance**
   - For advance payment: `Total Advance`
   - For full payment: `Payment Total`
   - Example (advance): 60000 ✅

7. **Validation**
   - Must be: `advance <= amount`
   - Example: 60000 <= 309000 = TRUE ✅

---

## 🐛 Common Issues & Solutions

### **Issue 1: Validation Fails**
```
❌ FAIL - This will cause error!
advance (309000) <= amount (294000)
```

**Problem:** `amount` doesn't include addons

**Solution:** Check line 563
```javascript
amount: fullPackageTotal  // Should be base + addons
```

---

### **Issue 2: Advance > Amount**
```
advance (60000) <= amount (50000)
Result: ❌ FAIL
```

**Problem:** Wrong advance calculation

**Check:**
- `advancePaymentAmount` from package
- `totalAdvance` = advance × participants

---

### **Issue 3: Amount is 0 or NaN**
```
amount (full package): NaN
```

**Problem:** Price calculation error

**Check:**
- `currentBookingPackage.offerPrice`
- `currentBookingPackage.originalPrice`
- Both should be numbers

---

## 📋 Console Commands to Run

### **Check Current Values:**
```javascript
// In browser console:
console.log('Package:', currentBookingPackage);
console.log('Selected Addons:', selectedAddons);
console.log('Payment Type:', selectedPaymentType);
```

### **Manual Calculation:**
```javascript
const baseTotal = 98000 * 3;           // 294000
const addonsTotal = 5000 * 3;          // 15000
const fullTotal = baseTotal + addonsTotal; // 309000
const advance = 20000 * 3;             // 60000

console.log('Manual Check:');
console.log('Full Total:', fullTotal);
console.log('Advance:', advance);
console.log('Valid?', advance <= fullTotal); // Should be true
```

---

## ✅ What to Share for Debugging

**Copy paste these from console:**

1. **DETAILED CALCULATION section** (all 10 lines)
2. **BACKEND BOOKING DATA section** (especially amount & advance)
3. **VALIDATION CHECK** (Pass or Fail?)
4. **BACKEND ERROR** (if any)

**Example:**
```
📊 DETAILED CALCULATION:
1. Base Price per person: 98000
2. Participants: 3
3. Base Total: 294000
...
8. Full Package Total: 309000
...

📦 BACKEND BOOKING DATA:
amount (full package): 309000
advance (paying now): 60000

⚠️ VALIDATION CHECK:
Result: ❌ FAIL - This will cause error!

❌ BACKEND ERROR: Booking validation failed...
```

---

## 🎯 Expected Output (Correct)

```
📊 DETAILED CALCULATION:
8. Full Package Total: 309000
10. Payment Amount (Razorpay): 60000

📦 BACKEND BOOKING DATA:
amount (full package): 309000
advance (paying now): 60000

⚠️ VALIDATION CHECK:
advance (60000) <= amount (309000)
Result: ✅ PASS - Booking should work!

📥 BACKEND RESPONSE:
Response: {success: true, ...}
✅ Booking created successfully
```

This means everything is working! ✅

---

## 🚀 Quick Fix Reference

| Console Shows | Problem | Fix |
|---------------|---------|-----|
| `amount: 60000` | Wrong total | Use `fullPackageTotal` |
| `advance: 309000` | Wrong advance | Use `totalAdvance` for advance |
| `NaN` values | Calculation error | Check package price |
| `❌ FAIL` | Validation error | `amount` should be >= `advance` |

---

**Console debug logs ab bohot clear hain!** 🎉

Share the console output and I'll help fix any issues!
