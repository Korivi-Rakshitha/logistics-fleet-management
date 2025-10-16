# 🔧 Fix Database Connection Error

## ❌ Current Error:
```
❌ Database connection failed: Access denied for user 'root'@'localhost' (using password: YES)
```

## 🎯 Problem:
The MySQL password in `backend/.env` is incorrect or MySQL authentication is failing.

---

## ✅ SOLUTION - Follow These Steps:

### **Option 1: Fix MySQL Password (Recommended)**

#### Step 1: Test MySQL Connection

Open **Command Prompt** (not PowerShell) and run:

```cmd
mysql -u root -p
```

When prompted, enter your MySQL password: `Rakshitha@11`

**If it connects:** Password is correct, go to Step 2
**If it fails:** Your MySQL password is different, go to Option 2

#### Step 2: Update backend/.env

Edit `backend/.env` and make sure password has NO quotes:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Rakshitha@11
DB_NAME=logistics_fleet
JWT_SECRET=my_super_secret_jwt_key_12345_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANT:** 
- NO spaces around `=`
- NO quotes around password
- Password is case-sensitive

#### Step 3: Create Database

In MySQL command prompt:

```sql
CREATE DATABASE IF NOT EXISTS logistics_fleet;
SHOW DATABASES;
```

You should see `logistics_fleet` in the list.

#### Step 4: Restart Backend

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
🚀 Server running on port 5000
```

---

### **Option 2: Reset MySQL Password**

If you forgot your MySQL password:

#### Windows - Reset MySQL Root Password:

1. **Stop MySQL Service:**
   - Press `Win + R`
   - Type: `services.msc`
   - Find "MySQL" service
   - Right-click → Stop

2. **Start MySQL in Safe Mode:**

Open Command Prompt as Administrator:

```cmd
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysqld --console --skip-grant-tables
```

3. **Open New Command Prompt** and run:

```cmd
mysql -u root
```

4. **Reset Password:**

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Rakshitha@11';
FLUSH PRIVILEGES;
EXIT;
```

5. **Restart MySQL Service Normally:**
   - Go back to `services.msc`
   - Start MySQL service

6. **Test Connection:**

```cmd
mysql -u root -pRakshitha@11
```

---

### **Option 3: Use Empty Password (Quick Test)**

If you want to test quickly without password:

#### Step 1: Edit backend/.env

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=logistics_fleet
JWT_SECRET=my_super_secret_jwt_key_12345_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Leave `DB_PASSWORD=` empty (no value after `=`)

#### Step 2: Update MySQL User (if needed)

```sql
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

---

## 🔍 Verify Setup:

### Check 1: MySQL is Running

```cmd
# Command Prompt
mysql -u root -p
# Enter your password
```

Should connect without errors.

### Check 2: Database Exists

```sql
SHOW DATABASES;
```

Should see `logistics_fleet` in the list.

### Check 3: Backend Connects

```bash
cd backend
npm run dev
```

Should show:
```
✅ Database connected successfully
🚀 Server running on port 5000
```

---

## 📋 Complete Setup Checklist:

- [x] Unwanted root `.env` deleted
- [ ] MySQL service is running
- [ ] MySQL password is correct
- [ ] `backend/.env` has correct password (no quotes, no spaces)
- [ ] Database `logistics_fleet` exists
- [ ] Backend shows "✅ Database connected successfully"
- [ ] Frontend running on http://localhost:3000
- [ ] Registration works!

---

## 🐛 Still Having Issues?

### Error: "Access denied"
- Double-check password in `backend/.env`
- Try connecting manually: `mysql -u root -p`
- Password is case-sensitive: `Rakshitha@11`

### Error: "Unknown database 'logistics_fleet'"
```sql
CREATE DATABASE logistics_fleet;
```

### Error: "Can't connect to MySQL server"
- MySQL service is not running
- Start it from `services.msc`

---

## 🎉 After Database Connects:

1. **Initialize Database:**
   ```bash
   cd backend
   npm run init-db
   ```

2. **Restart Backend:**
   ```bash
   npm run dev
   ```

3. **Test Registration:**
   - Go to: http://localhost:3000/signup
   - Fill form and submit
   - Should work! ✅

---

## 📝 Current File Structure:

```
logistics-fleet-management/
├── backend/
│   └── .env              ← Has password: Rakshitha@11
├── frontend/
│   └── .env              ← Correct API URL ✅
└── .env                  ← DELETED (was unwanted) ✅
```

---

## 🆘 Quick Commands:

### Test MySQL Connection:
```cmd
mysql -u root -pRakshitha@11
```

### Create Database:
```sql
CREATE DATABASE logistics_fleet;
```

### Check Backend .env:
```powershell
cd backend
Get-Content .env
```

### Restart Backend:
```bash
cd backend
npm run dev
```

---

**Start with Option 1 - Test your MySQL password first!** 🚀
