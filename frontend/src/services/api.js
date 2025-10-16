import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Vehicle APIs
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
  getAvailable: (params) => api.get('/vehicles/available', { params }),
  getUtilization: () => api.get('/vehicles/utilization'),
};

// Delivery APIs
export const deliveryAPI = {
  getAll: (params) => api.get('/deliveries', { params }),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  updateStatus: (id, data) => api.put(`/deliveries/${id}/status`, data),
  assignDriver: (id, data) => api.put(`/deliveries/${id}/assign`, data),
  delete: (id) => api.delete(`/deliveries/${id}`),
  getMyDeliveries: () => api.get('/deliveries/my-deliveries'),
  getActive: () => api.get('/deliveries/active'),
  getStats: (params) => api.get('/deliveries/stats', { params }),
};

// Tracking APIs
export const trackingAPI = {
  updateLocation: (data) => api.post('/tracking/location', data),
  getDeliveryTracking: (id) => api.get(`/tracking/deliveries/${id}`),
  getRecent: (params) => api.get('/tracking/recent', { params }),
};

// Route APIs
export const routeAPI = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.put(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getDrivers: () => api.get('/users?role=driver'),
  getCustomers: () => api.get('/users?role=customer'),
};

// Driver Verification APIs
export const driverVerificationAPI = {
  getPending: () => api.get('/driver-verification/pending'),
  approve: (id) => api.put(`/driver-verification/${id}/approve`),
  reject: (id, data) => api.put(`/driver-verification/${id}/reject`, data),
};

export default api;
