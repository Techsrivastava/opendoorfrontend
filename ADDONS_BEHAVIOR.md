# 🎯 Addons Behavior - Complete Guide

## ✅ User Additional Services Select Kar Sakta Hai!

---

## 🔄 Kaise Kaam Karta Hai

### **Advance Payment Selected**

```
User selects: Advance Payment
    ↓
Addons Section: ENABLED ✅
    ↓
User can select:
☑ Extra night - ₹2,000
☑ Camping gear - ₹1,500
    ↓
Payment Amount Calculation:
━━━━━━━━━━━━━━━━━━━━━━━
Base advance: ₹12,000
Participants: 2
Total Advance: ₹24,000  ← Sirf ye pay hoga!
━━━━━━━━━━━━━━━━━━━━━━━

Addons kaha jayenge?
→ Booking mein save honge
→ Remaining balance mein add honge
→ Trip se pehle pay karna hoga
```

### **Full Payment Selected**

```
User selects: Full Payment
    ↓
Addons Section: ENABLED ✅
    ↓
User can select:
☑ Extra night - ₹2,000
☑ Camping gear - ₹1,500
    ↓
Payment Amount Calculation:
━━━━━━━━━━━━━━━━━━━━━━━
Base price: ₹30,000 × 2 = ₹60,000
Extra night: ₹2,000 × 2 = ₹4,000
Camping gear: ₹1,500 × 2 = ₹3,000
Subtotal: ₹67,000
Discount (10%): -₹6,700
━━━━━━━━━━━━━━━━━━━━━━━
Total: ₹60,300  ← Sab kuch included!
```

---

## 📊 Example Scenarios

### **Scenario 1: Advance Payment with Addons**

**User Action:**
- Package: Kedarnath (₹30,000)
- Participants: 2
- Payment type: **Advance** (₹12,000 per person)
- Addons selected: Extra night (₹2,000)

**Result:**
```javascript
Advance Payment: ₹24,000  // ✅ Sirf advance

Booking Details:
{
  amount: 60000,           // Full package cost
  advance: 24000,          // Advance paid
  remaining: 36000,        // To pay later
  addons: [
    {
      name: 'Extra night',
      price: 2000,
      quantity: 2,
      total: 4000           // ✅ Added to remaining
    }
  ]
}

Final Remaining Balance: ₹36,000 + ₹4,000 = ₹40,000
```

### **Scenario 2: Full Payment with Addons**

**User Action:**
- Package: Kedarnath (₹30,000)
- Participants: 2
- Payment type: **Full**
- Addons selected: Extra night (₹2,000)

**Result:**
```javascript
Full Payment: ₹64,000  // ✅ Sab included

Booking Details:
{
  amount: 64000,          // Package + addons
  advance: 64000,         // Full paid
  remaining: 0,           // Nothing to pay
  addons: [
    {
      name: 'Extra night',
      price: 2000,
      quantity: 2,
      total: 4000          // ✅ Already paid
    }
  ]
}

Final Remaining Balance: ₹0
```

---

## 🎨 UI State

### **Advance Payment UI:**

```
┌─────────────────────────────────────────────┐
│  Payment Type                               │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Advance ✓    │  │ Full Payment │        │
│  │ ₹24,000      │  │ ₹60,000      │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘

Add-ons (Optional) ✅ ENABLED
☑ Extra night - ₹2,000 × 2 = ₹4,000
☐ Camping gear - ₹1,500 × 2 = ₹3,000

Note: Pay advance now. Addons will be added 
      to remaining balance.

Coupon Code 🔒 DISABLED
[____________] Apply

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Amount: ₹24,000  ← Sirf advance!
```

### **Full Payment UI:**

```
┌─────────────────────────────────────────────┐
│  Payment Type                               │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Advance      │  │ Full ✓       │        │
│  │ ₹24,000      │  │ ₹64,000      │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘

Add-ons (Optional) ✅ ENABLED
☑ Extra night - ₹2,000 × 2 = ₹4,000
☐ Camping gear - ₹1,500 × 2 = ₹3,000

Coupon Code ✅ ENABLED
[SUMMER10____] Apply  → 10% off

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: ₹64,000
Discount: -₹6,400
Total Amount: ₹57,600  ← Addons included!
```

---

## 💡 Important Points

### ✅ **Hamesha Kar Sakte Hain:**
- Addons select karna
- Participants change karna
- Batch date select karna

### ❌ **Sirf Full Payment Mein:**
- Coupon apply karna
- Discounts milenge

### 📝 **Advance Payment Mein:**
- Sirf base advance amount pay karo
- Addons booking mein save honge
- Remaining balance mein add honge
- Trip se pehle pay karna hoga

---

## 🔢 Calculations

### **Advance Payment Formula:**
```javascript
advancePayment = baseAdvanceAmount × participants

// Addons NOT included
// Coupons NOT applied
// Clean amount only
```

### **Full Payment Formula:**
```javascript
baseAmount = packagePrice × participants
addonsTotal = sum of (addonPrice × participants)
subtotal = baseAmount + addonsTotal
discount = coupon applied to subtotal
finalAmount = subtotal - discount
```

---

## ✅ Summary

| Feature | Advance | Full |
|---------|---------|------|
| **Can select addons?** | ✅ Yes | ✅ Yes |
| **Addons in payment?** | ❌ No | ✅ Yes |
| **Addons saved to booking?** | ✅ Yes | ✅ Yes |
| **Where addon cost goes?** | Remaining balance | Immediate payment |
| **Can use coupons?** | ❌ No | ✅ Yes |

---

## 🎯 Takeaway

**Advance Payment:**
- User addon select kar sakta hai ✅
- But advance payment sirf base amount hoga
- Addons remaining balance mein add honge
- Trip se pehle addon ka payment karna hoga

**Full Payment:**
- Sab kuch ek saath pay ho jayega
- Addons + Discounts = Final amount
- Koi remaining balance nahi

**Perfect flexibility for users!** 🎉
