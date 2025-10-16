# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "customer",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@logistics.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@logistics.com",
    "role": "admin"
  }
}
```

### Get Profile
```http
GET /auth/profile
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@logistics.com",
    "role": "admin",
    "phone": "1234567890"
  }
}
```

---

## 🚗 Vehicle Endpoints

### Get All Vehicles
```http
GET /vehicles
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "vehicles": [
    {
      "id": 1,
      "vehicle_number": "MH-01-AB-1234",
      "vehicle_type": "Truck",
      "capacity": 1000,
      "status": "available",
      "current_location_lat": null,
      "current_location_lng": null
    }
  ]
}
```

### Create Vehicle (Admin Only)
```http
POST /vehicles
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vehicle_number": "MH-01-AB-1234",
  "vehicle_type": "Truck",
  "capacity": 1000,
  "status": "available"
}
```

### Update Vehicle (Admin Only)
```http
PUT /vehicles/:id
```

**Request Body:**
```json
{
  "status": "in_use",
  "capacity": 1200
}
```

### Delete Vehicle (Admin Only)
```http
DELETE /vehicles/:id
```

### Get Available Vehicles
```http
GET /vehicles/available?start_time=2024-01-01T10:00:00&end_time=2024-01-01T18:00:00
```

### Get Vehicle Utilization (Admin Only)
```http
GET /vehicles/utilization
```

**Response:**
```json
{
  "utilization": [
    {
      "id": 1,
      "vehicle_number": "MH-01-AB-1234",
      "vehicle_type": "Truck",
      "total_deliveries": 25,
      "total_distance": 1250.5,
      "avg_duration": 45,
      "avg_speed": 35.2
    }
  ]
}
```

---

## 📦 Delivery Endpoints

### Get All Deliveries
```http
GET /deliveries?status=on_route&priority=high
```

**Query Parameters:**
- `status`: pending, assigned, on_route, picked_up, delivered, cancelled
- `customer_id`: Filter by customer
- `driver_id`: Filter by driver
- `priority`: low, medium, high

### Create Delivery
```http
POST /deliveries
```

**Request Body:**
```json
{
  "customer_id": 2,
  "driver_id": 3,
  "vehicle_id": 1,
  "pickup_location": "Mumbai Central",
  "pickup_lat": 19.0760,
  "pickup_lng": 72.8777,
  "drop_location": "Andheri Station",
  "drop_lat": 19.1136,
  "drop_lng": 72.8697,
  "scheduled_pickup_time": "2024-01-15T10:00:00",
  "scheduled_delivery_time": "2024-01-15T12:00:00",
  "package_details": "Electronics - Handle with care",
  "priority": "high"
}
```

**Response:**
```json
{
  "message": "Delivery created successfully",
  "delivery": {
    "id": 1,
    "customer_id": 2,
    "driver_id": 3,
    "status": "assigned",
    "pickup_location": "Mumbai Central",
    "drop_location": "Andheri Station"
  }
}
```

### Update Delivery Status
```http
PUT /deliveries/:id/status
```

**Request Body:**
```json
{
  "status": "on_route"
}
```

**Valid Status Transitions:**
- pending → assigned, cancelled
- assigned → on_route, cancelled
- on_route → picked_up, cancelled
- picked_up → delivered, cancelled

### Assign Driver to Delivery (Admin Only)
```http
PUT /deliveries/:id/assign
```

**Request Body:**
```json
{
  "driver_id": 3,
  "vehicle_id": 1
}
```

**Response (Conflict):**
```json
{
  "error": "Scheduling conflict detected",
  "message": "Driver or vehicle is already assigned to another delivery during this time slot",
  "conflicts": [
    {
      "id": 5,
      "pickup_location": "Location A",
      "scheduled_pickup_time": "2024-01-15T10:00:00"
    }
  ]
}
```

### Get My Deliveries
```http
GET /deliveries/my-deliveries
```
Returns deliveries based on user role:
- Customer: Their deliveries
- Driver: Assigned deliveries
- Admin: All deliveries

### Get Active Deliveries
```http
GET /deliveries/active
```

### Get Delivery Statistics
```http
GET /deliveries/stats?driver_id=3
```

**Response:**
```json
{
  "stats": {
    "total_deliveries": 50,
    "completed": 45,
    "cancelled": 2,
    "active": 3,
    "avg_delivery_time_minutes": 65.5
  }
}
```

---

## 🗺️ Tracking Endpoints

### Update Driver Location
```http
POST /tracking/location
```

**Request Body:**
```json
{
  "delivery_id": 1,
  "current_lat": 19.0850,
  "current_lng": 72.8800,
  "speed": 45.5,
  "heading": 180
}
```

**Response:**
```json
{
  "message": "Location updated successfully",
  "location": {
    "current_lat": 19.0850,
    "current_lng": 72.8800,
    "speed": 45.5,
    "heading": 180
  }
}
```

### Get Delivery Tracking
```http
GET /tracking/deliveries/:id
```

**Response:**
```json
{
  "delivery": {
    "id": 1,
    "status": "on_route",
    "pickup_location": "Mumbai Central",
    "drop_location": "Andheri Station",
    "driver_name": "John Driver",
    "vehicle_number": "MH-01-AB-1234"
  },
  "current_location": {
    "current_lat": 19.0850,
    "current_lng": 72.8800,
    "speed": 45.5,
    "timestamp": "2024-01-15T10:30:00"
  },
  "tracking_history": [
    {
      "current_lat": 19.0760,
      "current_lng": 72.8777,
      "speed": 0,
      "timestamp": "2024-01-15T10:00:00"
    }
  ]
}
```

### Get Recent Tracking (Admin Only)
```http
GET /tracking/recent?minutes=5
```

---

## 🛣️ Route Endpoints

### Get All Routes
```http
GET /routes
```

### Create Route (Admin Only)
```http
POST /routes
```

**Request Body:**
```json
{
  "name": "Mumbai to Pune Express",
  "start_location": "Mumbai",
  "end_location": "Pune",
  "start_lat": 19.0760,
  "start_lng": 72.8777,
  "end_lat": 18.5204,
  "end_lng": 73.8567,
  "distance": 150.5,
  "estimated_duration": 180
}
```

### Update Route (Admin Only)
```http
PUT /routes/:id
```

### Delete Route (Admin Only)
```http
DELETE /routes/:id
```

---

## 🌐 Socket.io Events

### Client Events (Emit)

**Join Delivery Room:**
```javascript
socket.emit('join-delivery', deliveryId);
```

**Leave Delivery Room:**
```javascript
socket.emit('leave-delivery', deliveryId);
```

**Send Location Update:**
```javascript
socket.emit('driver-location-update', {
  deliveryId: 1,
  lat: 19.0850,
  lng: 72.8800,
  speed: 45.5,
  heading: 180
});
```

### Server Events (Listen)

**Location Update:**
```javascript
socket.on('location-update', (data) => {
  console.log(data);
  // {
  //   deliveryId: 1,
  //   current_lat: 19.0850,
  //   current_lng: 72.8800,
  //   speed: 45.5,
  //   heading: 180,
  //   timestamp: "2024-01-15T10:30:00"
  // }
});
```

**Delivery Status Updated:**
```javascript
socket.on('delivery-status-updated', (data) => {
  console.log(data);
  // {
  //   deliveryId: 1,
  //   status: "on_route",
  //   delivery: { ... }
  // }
});
```

**Driver Assigned:**
```javascript
socket.on('driver-assigned', (data) => {
  console.log(data);
  // {
  //   deliveryId: 1,
  //   driverId: 3,
  //   delivery: { ... }
  // }
});
```

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "error": "Delivery not found"
}
```

### 409 Conflict
```json
{
  "error": "Scheduling conflict detected",
  "conflicts": [...]
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📝 Notes

1. All timestamps should be in ISO 8601 format
2. Coordinates should be in decimal degrees (latitude: -90 to 90, longitude: -180 to 180)
3. JWT tokens expire after 7 days
4. Real-time updates require Socket.io connection
5. Admin role required for vehicle and route management
6. Driver role required for location updates
7. Conflict detection runs automatically on delivery assignment

---

## 🧪 Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@logistics.com","password":"admin123"}'
```

**Get Vehicles:**
```bash
curl -X GET http://localhost:5000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Delivery:**
```bash
curl -X POST http://localhost:5000/api/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_id": 2,
    "pickup_location": "Mumbai",
    "pickup_lat": 19.0760,
    "pickup_lng": 72.8777,
    "drop_location": "Pune",
    "drop_lat": 18.5204,
    "drop_lng": 73.8567,
    "scheduled_pickup_time": "2024-01-15T10:00:00",
    "scheduled_delivery_time": "2024-01-15T14:00:00",
    "priority": "high"
  }'
```
