import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a delivery tracking room
  joinDelivery(deliveryId) {
    if (this.socket) {
      this.socket.emit('join-delivery', deliveryId);
    }
  }

  // Leave a delivery tracking room
  leaveDelivery(deliveryId) {
    if (this.socket) {
      this.socket.emit('leave-delivery', deliveryId);
    }
  }

  // Send driver location update
  sendLocationUpdate(data) {
    if (this.socket) {
      this.socket.emit('driver-location-update', data);
    }
  }

  // Listen for location updates
  onLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  }

  // Listen for delivery status updates
  onDeliveryStatusUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivery-status-updated', callback);
    }
  }

  // Listen for driver assignments
  onDriverAssigned(callback) {
    if (this.socket) {
      this.socket.on('driver-assigned', callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
