# Logistics & Fleet Management System

A comprehensive full-stack web application for managing logistics operations, fleet tracking, and real-time delivery monitoring with GPS tracking capabilities.

## 🚀 Features

### Admin Features
- **Dashboard Overview**: View statistics on deliveries, vehicles, and operations
- **Vehicle Management**: Add, update, and manage fleet vehicles
- **Delivery Management**: Create and assign deliveries to drivers
- **Route Planning**: Create and manage delivery routes
- **Real-time Tracking**: Monitor all active deliveries on a live map
- **Analytics**: View vehicle utilization and delivery performance metrics
- **Conflict Detection**: Automatic detection of driver/vehicle scheduling conflicts

### Driver Features
- **Delivery Dashboard**: View assigned deliveries
- **GPS Tracking**: Automatic real-time location tracking during deliveries
- **Status Updates**: Mark deliveries as picked up or delivered
- **Route Navigation**: View pickup and drop locations on map
- **Live Location Sharing**: Share location with customers in real-time

### Customer Features
- **Delivery Tracking**: Track deliveries in real-time on interactive map
- **Delivery History**: View all past and current deliveries
- **Status Notifications**: Real-time updates on delivery status
- **Driver Information**: View assigned driver and vehicle details
- **Delivery Filtering**: Filter deliveries by status (active, completed, pending)

## 📁 Project Structure

```
logistics-fleet-management/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── deliveryController.js
│   │   ├── routeController.js
│   │   ├── trackingController.js
│   │   └── vehicleController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── Delivery.js
│   │   ├── Route.js
│   │   ├── Tracking.js
│   │   ├── User.js
│   │   └── Vehicle.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── deliveries.js
│   │   ├── routes.js
│   │   ├── tracking.js
│   │   └── vehicles.js
│   ├── utils/
│   │   ├── db.js
│   │   └── initDb.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── DriverDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MapTracker.jsx
│   │   │   └── Signup.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── index.js
│   ├── .env.example
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Relational database
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Leaflet** - Interactive maps
- **Socket.io Client** - Real-time updates
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd logistics-fleet-management
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
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

Initialize the database:
```bash
npm run init-db
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔑 Default Credentials

After database initialization, you can login with:
- **Email**: admin@logistics.com
- **Password**: admin123
- **Role**: Admin

## 📊 Database Schema

### Users Table
- id, name, email, password, role (admin/driver/customer), phone, address

### Vehicles Table
- id, vehicle_number, vehicle_type, capacity, status, current_location_lat, current_location_lng

### Deliveries Table
- id, customer_id, driver_id, vehicle_id, route_id
- pickup_location, pickup_lat, pickup_lng
- drop_location, drop_lat, drop_lng
- status, scheduled_pickup_time, scheduled_delivery_time
- actual_pickup_time, actual_delivery_time
- package_details, priority

### Tracking Table
- id, delivery_id, driver_id, vehicle_id
- current_lat, current_lng, speed, heading, timestamp

### Routes Table
- id, name, start_location, end_location
- start_lat, start_lng, end_lat, end_lng
- distance, estimated_duration

### Delivery History Table
- id, delivery_id, driver_id, vehicle_id
- total_distance, total_duration, average_speed

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle (Admin)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `PUT /api/vehicles/:id` - Update vehicle (Admin)
- `DELETE /api/vehicles/:id` - Delete vehicle (Admin)
- `GET /api/vehicles/available` - Get available vehicles
- `GET /api/vehicles/utilization` - Get utilization stats (Admin)

### Deliveries
- `GET /api/deliveries` - Get all deliveries
- `POST /api/deliveries` - Create delivery
- `GET /api/deliveries/:id` - Get delivery by ID
- `PUT /api/deliveries/:id/status` - Update delivery status
- `PUT /api/deliveries/:id/assign` - Assign driver (Admin)
- `GET /api/deliveries/my-deliveries` - Get user's deliveries
- `GET /api/deliveries/active` - Get active deliveries
- `GET /api/deliveries/stats` - Get delivery statistics

### Tracking
- `POST /api/tracking/location` - Update driver location
- `GET /api/tracking/deliveries/:id` - Get delivery tracking data
- `GET /api/tracking/recent` - Get recent tracking data

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create route (Admin)
- `GET /api/routes/:id` - Get route by ID
- `PUT /api/routes/:id` - Update route (Admin)
- `DELETE /api/routes/:id` - Delete route (Admin)

## 🌐 Real-time Features

### Socket.io Events

**Client → Server:**
- `join-delivery` - Join delivery tracking room
- `leave-delivery` - Leave delivery tracking room
- `driver-location-update` - Send location update

**Server → Client:**
- `location-update` - Receive location updates
- `delivery-status-updated` - Receive status updates
- `driver-assigned` - Receive driver assignment notifications

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation with Joi
- SQL injection prevention
- CORS configuration

## 🚦 Key Functionalities

### Scheduling Conflict Detection
The system automatically detects and prevents:
- Double-booking of drivers
- Double-booking of vehicles
- Overlapping delivery time slots

### Real-time GPS Tracking
- Automatic location updates using browser Geolocation API
- Live tracking via Socket.io
- Historical tracking data storage
- Speed and heading calculation

### Analytics & Reports
- Average delivery time per driver
- Vehicle utilization statistics
- Delivery completion rates
- Active vs completed deliveries

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Modern UI with Tailwind CSS
- Interactive maps with Leaflet
- Real-time updates without page refresh
- Loading states and error handling
- Toast notifications

## 🧪 Testing

To test the application:

1. **Create Users**: Register as driver and customer
2. **Add Vehicles**: Login as admin and add vehicles
3. **Create Deliveries**: Assign deliveries to drivers
4. **Track Deliveries**: Login as driver and start tracking
5. **Monitor**: Login as customer to view real-time tracking

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

**Note**: Geolocation features require HTTPS in production or localhost in development.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists (run `npm run init-db`)

### Socket.io Connection Issues
- Check CORS settings in backend
- Verify Socket.io URL in frontend `.env`
- Check firewall settings

### Geolocation Not Working
- Enable location permissions in browser
- Use HTTPS in production
- Check browser compatibility

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributors

Developed for logistics and fleet management operations.

## 🔮 Future Enhancements

- Push notifications
- SMS alerts
- Route optimization algorithms
- Driver performance ratings
- Delivery proof of delivery (POD)
- Multi-language support
- Mobile app (React Native)
- Advanced analytics dashboard
- Integration with third-party mapping services
