# Troubleshooting Guide

## 🔧 Common Issues and Solutions

### ❌ Signup/Registration Not Working

**Error:** "Registration failed"

#### Possible Causes & Solutions:

#### 1. Backend Server Not Running
**Check:**
```bash
# Open browser console (F12) and check for network errors
# Look for: "ERR_NETWORK" or "Cannot connect to server"
```

**Solution:**
```bash
# Start the backend server
cd backend
npm run dev

# You should see:
# ✅ Database connected successfully
# Server running on port 5000
```

#### 2. Database Not Initialized
**Check:**
```bash
# Try to connect to MySQL
mysql -u root -p

# Check if database exists
SHOW DATABASES;
# Look for 'logistics_fleet'
```

**Solution:**
```bash
cd backend
npm run init-db
```

#### 3. Environment Variables Not Set
**Check:**
```bash
# Verify backend/.env exists
cd backend
cat .env  # or type .env on Windows
```

**Solution:**
Create `backend/.env` with:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=logistics_fleet
JWT_SECRET=your_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### 4. MySQL Not Running
**Check:**
```bash
# Windows
services.msc
# Look for MySQL service

# Linux/Mac
sudo systemctl status mysql
```

**Solution:**
```bash
# Windows - Start MySQL service from services.msc

# Linux/Mac
sudo systemctl start mysql
```

#### 5. CORS Issues
**Check browser console for:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Verify `backend/server.js` has CORS enabled:
```javascript
app.use(cors());
```

#### 6. Port Already in Use
**Check:**
```bash
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

**Solution:**
```bash
# Kill the process or change port in backend/.env
PORT=5001
```

---

### ❌ Login Not Working

**Error:** "Invalid credentials" or "Login failed"

#### Solutions:

1. **Use Default Admin Credentials:**
   - Email: `admin@logistics.com`
   - Password: `admin123`

2. **Reset Database:**
   ```bash
   cd backend
   npm run init-db
   ```

3. **Check User Exists:**
   ```sql
   mysql -u root -p logistics_fleet
   SELECT * FROM users WHERE email = 'your@email.com';
   ```

---

### ❌ Frontend Not Loading

**Error:** Blank page or "Cannot GET /"

#### Solutions:

1. **Start Frontend Server:**
   ```bash
   cd frontend
   npm start
   ```

2. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cache and reload

3. **Check Node Modules:**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   npm start
   ```

---

### ❌ Map Not Displaying

**Error:** Gray box instead of map

#### Solutions:

1. **Check Leaflet CSS:**
   Verify `frontend/src/index.css` has:
   ```css
   @import 'leaflet/dist/leaflet.css';
   ```

2. **Check Internet Connection:**
   - Maps require internet to load tiles from OpenStreetMap

3. **Check Browser Console:**
   - Look for Leaflet errors
   - Verify coordinates are valid

---

### ❌ Real-time Tracking Not Working

**Error:** Location not updating

#### Solutions:

1. **Enable Location Permissions:**
   - Browser will prompt for location access
   - Click "Allow"

2. **Use HTTPS or Localhost:**
   - Geolocation API requires secure context
   - Works on localhost or HTTPS

3. **Check Socket.io Connection:**
   ```javascript
   // Open browser console
   // Look for Socket.io connection messages
   ```

4. **Verify Backend Socket.io:**
   ```bash
   # Check backend logs for:
   # "New client connected: [socket-id]"
   ```

---

### ❌ Database Connection Failed

**Error:** "❌ Database connection failed"

#### Solutions:

1. **Check MySQL Credentials:**
   ```bash
   mysql -u root -p
   # If this fails, reset MySQL password
   ```

2. **Verify Database Name:**
   ```sql
   SHOW DATABASES;
   # Ensure 'logistics_fleet' exists
   ```

3. **Check MySQL Port:**
   ```bash
   # Default is 3306
   # If different, update backend/.env:
   DB_HOST=localhost:3307
   ```

4. **Grant Permissions:**
   ```sql
   GRANT ALL PRIVILEGES ON logistics_fleet.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

### ❌ npm install Fails

**Error:** Various npm errors

#### Solutions:

1. **Clear npm Cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

2. **Delete node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

4. **Use Different Registry:**
   ```bash
   npm install --registry=https://registry.npmjs.org/
   ```

---

## 🔍 Debugging Steps

### 1. Check Backend is Running
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"Server is running"}
```

### 2. Check Frontend Environment
```bash
# Verify frontend/.env exists
cat frontend/.env

# Should contain:
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Check Browser Console
- Press `F12` to open Developer Tools
- Go to Console tab
- Look for errors (red text)
- Check Network tab for failed requests

### 4. Check Backend Logs
```bash
# Backend terminal should show:
# - Database connected
# - Server running on port 5000
# - Any errors will appear here
```

### 5. Test API Directly
```bash
# Test registration endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

---

## 📋 Pre-flight Checklist

Before starting the application:

- [ ] MySQL is installed and running
- [ ] Node.js is installed (v14+)
- [ ] Backend `.env` file is configured
- [ ] Frontend `.env` file is configured
- [ ] Database is initialized (`npm run init-db`)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] No other process using port 5000 or 3000

---

## 🆘 Still Having Issues?

### Get Detailed Error Information:

1. **Check Backend Terminal:**
   - Look for error messages
   - Note the exact error text

2. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Copy any error messages

3. **Check Network Tab:**
   - Press F12
   - Go to Network tab
   - Try the action again
   - Check failed requests (red)
   - Click on failed request to see details

4. **Enable Verbose Logging:**
   ```javascript
   // Add to frontend/src/services/api.js
   axios.interceptors.request.use(request => {
     console.log('Starting Request', request);
     return request;
   });

   axios.interceptors.response.use(
     response => {
       console.log('Response:', response);
       return response;
     },
     error => {
       console.log('Error Response:', error.response);
       return Promise.reject(error);
     }
   );
   ```

---

## 🔄 Complete Reset

If nothing works, try a complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Backend reset
cd backend
rm -rf node_modules package-lock.json
npm install
# Update .env with correct credentials
npm run init-db
npm run dev

# 3. Frontend reset (in new terminal)
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start

# 4. Clear browser cache and reload
```

---

## 📞 Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Registration fails | Check backend is running on port 5000 |
| Database error | Run `npm run init-db` |
| CORS error | Restart backend server |
| Map not loading | Check internet connection |
| Location not tracking | Allow browser location permissions |
| Port in use | Change PORT in .env or kill process |
| npm install fails | Clear cache: `npm cache clean --force` |

---

**Most Common Issue:** Backend server not running!

**Quick Check:**
```bash
curl http://localhost:5000/api/health
```

If this fails, start the backend:
```bash
cd backend
npm run dev
```
