# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend** - Create `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=logistics_fleet
JWT_SECRET=my_super_secret_jwt_key_12345
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** - Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 3: Initialize Database

Make sure MySQL is running, then:
```bash
cd backend
npm run init-db
```

This will create all tables and a default admin user.

### Step 4: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Step 5: Login

Open http://localhost:3000 and login with:
- **Email:** admin@logistics.com
- **Password:** admin123

## 📝 Next Steps

### Create Test Data

1. **Add Vehicles** (Admin Dashboard):
   - Click "Vehicles" tab
   - Add vehicles with details like:
     - Vehicle Number: MH-01-AB-1234
     - Type: Truck
     - Capacity: 1000 kg

2. **Register Users**:
   - Logout and click "Sign up"
   - Create driver and customer accounts

3. **Create Deliveries** (Admin Dashboard):
   - Go to "Deliveries" tab
   - Create a new delivery with:
     - Customer ID
     - Pickup location with coordinates
     - Drop location with coordinates
     - Scheduled times
     - Assign driver and vehicle

4. **Test Driver Features**:
   - Login as driver
   - View assigned deliveries
   - Start delivery to enable GPS tracking
   - Mark as picked up/delivered

5. **Test Customer Features**:
   - Login as customer
   - View deliveries
   - Track active deliveries in real-time

## 🗺️ Sample Coordinates for Testing

Use these coordinates for testing deliveries:

**Mumbai:**
- Pickup: 19.0760, 72.8777
- Drop: 19.1136, 72.8697

**Delhi:**
- Pickup: 28.7041, 77.1025
- Drop: 28.5355, 77.3910

**Bangalore:**
- Pickup: 12.9716, 77.5946
- Drop: 12.9352, 77.6245

## 🔧 Troubleshooting

**Database Connection Failed:**
```bash
# Check if MySQL is running
mysql -u root -p

# Create database manually if needed
CREATE DATABASE logistics_fleet;
```

**Port Already in Use:**
```bash
# Change PORT in backend/.env to 5001 or another available port
# Update REACT_APP_API_URL and REACT_APP_SOCKET_URL in frontend/.env accordingly
```

**GPS Not Working:**
- Allow location permissions in browser
- Use Chrome or Firefox for best results
- Ensure you're on localhost or HTTPS

## 📱 Testing Real-time Tracking

1. Open two browser windows
2. Window 1: Login as driver, start a delivery
3. Window 2: Login as customer, view the same delivery
4. Watch real-time location updates appear on both screens

## 🎯 Key Features to Test

- ✅ User authentication (login/signup)
- ✅ Role-based dashboards (admin/driver/customer)
- ✅ Vehicle management
- ✅ Delivery creation and assignment
- ✅ Conflict detection (try double-booking)
- ✅ Real-time GPS tracking
- ✅ Status updates (pending → on_route → delivered)
- ✅ Interactive maps with Leaflet
- ✅ Socket.io real-time communication
- ✅ Analytics and statistics

Enjoy your Logistics & Fleet Management System! 🚚📦
