# Admin Passkey Security Feature

## 🔐 Overview

An additional security layer has been added to protect admin dashboard access. Even with valid admin credentials, users must enter a **passkey** to access the admin dashboard.

---

## 🎯 How It Works

### **Login Flow:**

```
1. User enters email & password
   ↓
2. System validates credentials
   ↓
3. Check user role:
   - Customer/Driver → Direct access ✅
   - Admin → Show passkey modal 🔑
   ↓
4. Admin enters passkey
   ↓
5. Passkey validation:
   - Correct → Access granted ✅
   - Wrong → Logged out ❌
```

---

## 🔑 Default Passkey

**Current Passkey:** `1234`

**⚠️ IMPORTANT:** Change this in production!

### **How to Change the Passkey:**

1. Open: `frontend/src/components/Login.jsx`
2. Find line 20:
   ```javascript
   const ADMIN_PASSKEY = '1234';
   ```
3. Change to your desired passkey:
   ```javascript
   const ADMIN_PASSKEY = 'YourSecurePasskey123';
   ```
4. Save and restart frontend

---

## 🎨 User Experience

### **For Customers & Drivers:**
- Login normally
- No passkey required
- Direct access to their dashboards

### **For Admins:**
1. Enter email: `admin@logistics.com`
2. Enter password: `admin123`
3. Click "Sign In"
4. **Passkey Modal Appears** 🛡️
5. Enter passkey: `1234`
6. Click "Verify"
7. Access granted to Admin Dashboard ✅

---

## 🛡️ Security Features

### **1. Modal Popup**
- Beautiful, centered modal
- Shield icon for security emphasis
- Red/orange gradient for attention

### **2. Passkey Input**
- Password field (hidden characters)
- Large, centered text
- Auto-focus for quick entry
- Max 6 characters

### **3. Security Notice**
- Warning about unauthorized access
- Mentions logging and monitoring
- Deters malicious attempts

### **4. Cancel Option**
- User can cancel and logout
- Prevents accidental admin access
- Clears session completely

### **5. Wrong Passkey Handling**
- Immediate logout
- Error message displayed
- Session cleared
- Must login again

---

## 🧪 Testing Guide

### **Test 1: Admin Login with Correct Passkey**

1. **Login:**
   - Email: `admin@logistics.com`
   - Password: `admin123`

2. **Passkey Modal Appears**

3. **Enter Passkey:** `1234`

4. **Result:** ✅ Access granted to Admin Dashboard

---

### **Test 2: Admin Login with Wrong Passkey**

1. **Login:**
   - Email: `admin@logistics.com`
   - Password: `admin123`

2. **Passkey Modal Appears**

3. **Enter Wrong Passkey:** `9999`

4. **Result:** 
   - ❌ "Invalid admin passkey. Access denied."
   - Logged out automatically
   - Must login again

---

### **Test 3: Customer/Driver Login (No Passkey)**

1. **Login as Customer:**
   - Email: `customer@example.com`
   - Password: `password123`

2. **Result:** ✅ Direct access to Customer Dashboard (no passkey modal)

---

### **Test 4: Cancel Passkey**

1. **Login as Admin**

2. **Passkey Modal Appears**

3. **Click "Cancel"**

4. **Result:**
   - Modal closes
   - Logged out
   - Error: "Admin access cancelled"

---

## 🔒 Security Best Practices

### **1. Change Default Passkey**
```javascript
// DON'T use default in production
const ADMIN_PASSKEY = '1234'; ❌

// DO use a strong passkey
const ADMIN_PASSKEY = 'Adm!n@2024#Secure'; ✅
```

### **2. Use Strong Passkey**
- Mix of letters, numbers, symbols
- At least 8 characters
- Not easily guessable
- Different from password

### **3. Share Passkey Securely**
- Don't write it down publicly
- Share only with authorized admins
- Use secure communication channels
- Change periodically

### **4. Monitor Access**
- Check who's accessing admin dashboard
- Review login attempts
- Investigate failed passkey attempts

---

## 💡 Advanced Options

### **Option 1: Store Passkey in Environment Variable**

```javascript
// .env file
REACT_APP_ADMIN_PASSKEY=YourSecurePasskey

// Login.jsx
const ADMIN_PASSKEY = process.env.REACT_APP_ADMIN_PASSKEY || '1234';
```

### **Option 2: Backend Validation**

For even stronger security, validate passkey on backend:

```javascript
// Backend endpoint
router.post('/verify-admin-passkey', (req, res) => {
  const { passkey } = req.body;
  const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY;
  
  if (passkey === ADMIN_PASSKEY) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid passkey' });
  }
});
```

### **Option 3: Time-Based OTP**

Implement TOTP (like Google Authenticator) for rotating passkeys.

---

## 🎯 Benefits

✅ **Extra Security Layer** - Even if credentials are compromised  
✅ **Prevents Unauthorized Access** - Customers/drivers can't access admin  
✅ **Simple to Use** - Just one additional step  
✅ **Customizable** - Easy to change passkey  
✅ **User-Friendly** - Clear UI and error messages  
✅ **Automatic Logout** - Wrong passkey = immediate logout  

---

## 📋 Quick Reference

| Item | Value |
|------|-------|
| **Default Passkey** | `1234` |
| **Admin Email** | `admin@logistics.com` |
| **Admin Password** | `admin123` |
| **Location to Change** | `frontend/src/components/Login.jsx` line 20 |
| **Max Length** | 6 characters (configurable) |

---

## 🆘 Troubleshooting

### **Issue: Passkey modal doesn't appear**

**Solution:**
- Check if user role is 'admin'
- Verify login is successful
- Check browser console for errors

### **Issue: Can't remember passkey**

**Solution:**
- Check `Login.jsx` line 20
- Default is `1234`
- Change if needed

### **Issue: Passkey always fails**

**Solution:**
- Verify exact passkey match (case-sensitive)
- Check for extra spaces
- Review `ADMIN_PASSKEY` constant

---

## 📝 Summary

**What Changed:**
- ✅ Admin login now requires passkey
- ✅ Customers/drivers login normally
- ✅ Beautiful modal UI
- ✅ Automatic logout on wrong passkey
- ✅ Security notice displayed

**Default Passkey:** `1234`

**⚠️ Remember to change the passkey in production!**

---

**Status: ✅ IMPLEMENTED**

Admin dashboard is now protected with an additional passkey layer!
