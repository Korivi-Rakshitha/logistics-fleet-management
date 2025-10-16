const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://logistics-fleet-management.vercel.app',
    'https://logistics-fleet-management-*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Make io accessible in routes
app.set('io', io);

// Import routes
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const deliveryRoutes = require('./routes/deliveries');
const trackingRoutes = require('./routes/tracking');
const routeRoutes = require('./routes/routes');
const userRoutes = require('./routes/users');
const driverVerificationRoutes = require('./routes/driverVerification');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/driver-verification', driverVerificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Join delivery tracking room
  socket.on('join-delivery', (deliveryId) => {
    socket.join(`delivery-${deliveryId}`);
    console.log(`Client ${socket.id} joined delivery room: ${deliveryId}`);
  });

  // Leave delivery tracking room
  socket.on('leave-delivery', (deliveryId) => {
    socket.leave(`delivery-${deliveryId}`);
    console.log(`Client ${socket.id} left delivery room: ${deliveryId}`);
  });

  // Driver location update (real-time)
  socket.on('driver-location-update', (data) => {
    const { deliveryId, lat, lng, speed, heading } = data;
    
    // Broadcast to all clients tracking this delivery
    io.to(`delivery-${deliveryId}`).emit('location-update', {
      deliveryId,
      current_lat: lat,
      current_lng: lng,
      speed,
      heading,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time tracking`);
});
