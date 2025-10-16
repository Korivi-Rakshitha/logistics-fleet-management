# How to Get Admin Dashboard Access

## 🎯 Quick Answer

Since admin signup was removed from the public registration page for security, here are your options:

---

## ✅ Method 1: Use Default Admin Account (Easiest)

The system should have a default admin account. Try logging in with:

**Login at:** `http://localhost:3000/login`

**Credentials:**
- **Email:** `admin@logistics.com`
- **Password:** `admin123`

If this works, you're all set! 🎉

---

## ✅ Method 2: Create Admin via Script (Recommended)

If the default admin doesn't exist, run the admin creation script:

### **Steps:**

1. **Open terminal in backend folder:**
   ```bash
   cd backend
   ```

2. **Run the admin creation script:**
   ```bash
   node create-admin.js
   ```

3. **You'll see:**
   ```
   ✅ Admin user created successfully!
   
   📧 Login Credentials:
      Email: admin@logistics.com
      Password: admin123
   
   🚀 You can now login at: http://localhost:3000/login
   ```

4. **Login with the provided credentials**

---

## ✅ Method 3: Create Admin Manually in Database

If you prefer, you can insert an admin user directly into the database:

### **For SQLite:**

1. **Open SQLite:**
   ```bash
   cd backend
   sqlite3 logistics_fleet.db
   ```

2. **Insert admin user:**
   ```sql
   INSERT INTO users (name, email, password, role, phone, address, created_at)
   VALUES (
     'Admin User',
     'admin@logistics.com',
     '$2a$10$YourHashedPasswordHere',  -- You'll need to hash this
     'admin',
     '9999999999',
     'Admin Office',
     datetime('now')
   );
   ```

   **Note:** You'll need to hash the password first using bcrypt.

3. **Exit SQLite:**
   ```sql
   .exit
   ```

---

## ✅ Method 4: Temporarily Enable Admin Signup

If you need to create multiple admin accounts quickly:

### **Steps:**

1. **Edit Signup.jsx:**
   ```bash
   frontend/src/components/Signup.jsx
   ```

2. **Add admin option back temporarily:**
   ```jsx
   <select name="role" ...>
     <option value="customer">Customer</option>
     <option value="driver">Driver</option>
     <option value="admin">Admin</option>  {/* Add this line */}
   </select>
   ```

3. **Create your admin accounts**

4. **Remove the admin option again** (for security)

---

## 🔒 Why Admin Signup Was Removed

**Security Reasons:**
- Prevents unauthorized users from creating admin accounts
- Ensures proper admin onboarding process
- Maintains system integrity

**Best Practice:**
- Admins should be created by existing admins
- Or through secure backend scripts
- Not through public signup forms

---

## 📋 Admin Account Details

**Default Admin:**
- **Name:** Admin User
- **Email:** admin@logistics.com
- **Password:** admin123
- **Role:** admin
- **Phone:** 9999999999

**⚠️ Important:** Change the default password after first login!

---

## 🎯 What You Can Do as Admin

Once logged in as admin, you'll have access to:

✅ **Dashboard Overview**
- Total deliveries, vehicles, drivers stats
- Analytics and charts

✅ **Vehicle Management**
- Add/edit/delete vehicles
- View vehicle utilization

✅ **Pending Customer Orders**
- Review customer order requests
- Accept or reject orders
- Assign drivers and vehicles

✅ **Delivery Management**
- View all deliveries
- Assign drivers to deliveries
- Track delivery status

✅ **User Management**
- View all users (customers, drivers)
- Manage user accounts

---

## 🧪 Test Admin Access

1. **Run the create-admin script:**
   ```bash
   cd backend
   node create-admin.js
   ```

2. **Login:**
   - Go to `http://localhost:3000/login`
   - Email: `admin@logistics.com`
   - Password: `admin123`

3. **Verify:**
   - You should see the Admin Dashboard
   - Check if you can access all admin features

---

## 🆘 Troubleshooting

### **Issue: "Invalid credentials" when logging in**

**Solution:**
- Run `node create-admin.js` again
- Check if the user exists in the database
- Verify you're using the correct email/password

### **Issue: "create-admin.js not found"**

**Solution:**
- Make sure you're in the `backend` folder
- The script was just created in the backend directory

### **Issue: "Permission denied"**

**Solution:**
- Make sure the backend server is not running
- Or run the script while server is running (it should work)

---

## 📝 Summary

**Recommended Approach:**
1. Try default credentials first: `admin@logistics.com` / `admin123`
2. If that doesn't work, run: `node create-admin.js`
3. Login and change the password
4. You're ready to manage the system! 🎉

---

**Need Help?** Check the console output for any error messages.
