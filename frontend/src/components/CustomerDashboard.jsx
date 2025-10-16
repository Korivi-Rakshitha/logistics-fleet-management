import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { deliveryAPI } from '../services/api';
import { Package, MapPin, Clock, CheckCircle, Navigation, LogOut, Eye, ShoppingBag, TrendingUp, Award, Zap, Plus, Truck, Send } from 'lucide-react';
import MapTracker from './MapTracker';
import { format } from 'date-fns';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    pickup_location: '',
    pickup_lat: '',
    pickup_lng: '',
    drop_location: '',
    drop_lat: '',
    drop_lng: '',
    requested_vehicle_type: 'Truck',
    package_details: '',
    priority: 'medium',
    scheduled_pickup_time: '',
    scheduled_delivery_time: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getMyDeliveries();
      setDeliveries(response.data.deliveries);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Convert coordinates to numbers and prepare data
      const orderData = {
        ...orderForm,
        customer_id: user.id,
        pickup_lat: parseFloat(orderForm.pickup_lat),
        pickup_lng: parseFloat(orderForm.pickup_lng),
        drop_lat: parseFloat(orderForm.drop_lat),
        drop_lng: parseFloat(orderForm.drop_lng),
        // Convert datetime-local to ISO format if provided
        scheduled_pickup_time: orderForm.scheduled_pickup_time ? new Date(orderForm.scheduled_pickup_time).toISOString() : null,
        scheduled_delivery_time: orderForm.scheduled_delivery_time ? new Date(orderForm.scheduled_delivery_time).toISOString() : null
      };

      await deliveryAPI.create(orderData);
      alert('Order placed successfully! Admin will review and assign a driver.');
      setShowOrderForm(false);
      setOrderForm({
        pickup_location: '',
        pickup_lat: '',
        pickup_lng: '',
        drop_location: '',
        drop_lat: '',
        drop_lng: '',
        requested_vehicle_type: 'Truck',
        package_details: '',
        priority: 'medium',
        scheduled_pickup_time: '',
        scheduled_delivery_time: ''
      });
      fetchDeliveries();
    } catch (error) {
      console.error('Error placing order:', error);
      const errorMsg = error.response?.data?.error || 'Failed to place order. Please try again.';
      const details = error.response?.data?.details;
      if (details) {
        alert(`${errorMsg}\n\nDetails:\n${details.map(d => `- ${d.field}: ${d.message}`).join('\n')}`);
      } else {
        alert(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold shadow-lg';
      case 'picked_up': return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-semibold shadow-lg';
      case 'on_route': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg';
      case 'assigned': return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold shadow-lg';
      case 'pending': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold shadow-lg';
      case 'cancelled': return 'bg-gradient-to-r from-red-400 to-pink-500 text-white font-semibold shadow-lg';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white';
      case 'low': return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'on_route': return <Navigation className="w-5 h-5 text-yellow-600" />;
      case 'picked_up': return <Package className="w-5 h-5 text-blue-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return ['assigned', 'on_route', 'picked_up'].includes(delivery.status);
    if (activeFilter === 'completed') return delivery.status === 'delivered';
    return true;
  });

  const stats = {
    total: deliveries.length,
    active: deliveries.filter(d => ['assigned', 'on_route', 'picked_up'].includes(d.status)).length,
    completed: deliveries.filter(d => d.status === 'delivered').length,
    pending: deliveries.filter(d => d.status === 'pending').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <ShoppingBag className="w-8 h-8 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-purple-600 font-semibold">Loading your deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Deliveries</h1>
                <p className="text-sm text-pink-100">Welcome back, {user?.name} 👋</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Place Order Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Place New Order
          </button>
        </div>

        {/* Order Form */}
        {showOrderForm && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Place New Delivery Order</h2>
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1 text-green-600" />
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.pickup_location}
                    onChange={(e) => setOrderForm({...orderForm, pickup_location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter pickup address"
                  />
                </div>

                {/* Drop Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1 text-red-600" />
                    Drop Location
                  </label>
                  <input
                    type="text"
                    required
                    value={orderForm.drop_location}
                    onChange={(e) => setOrderForm({...orderForm, drop_location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter drop address"
                  />
                </div>

                {/* Pickup Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={orderForm.pickup_lat}
                    onChange={(e) => setOrderForm({...orderForm, pickup_lat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 19.0760"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={orderForm.pickup_lng}
                    onChange={(e) => setOrderForm({...orderForm, pickup_lng: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 72.8777"
                  />
                </div>

                {/* Drop Coordinates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drop Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={orderForm.drop_lat}
                    onChange={(e) => setOrderForm({...orderForm, drop_lat: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 18.5204"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Drop Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={orderForm.drop_lng}
                    onChange={(e) => setOrderForm({...orderForm, drop_lng: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., 73.8567"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4 inline mr-1 text-blue-600" />
                    Vehicle Type
                  </label>
                  <select
                    value={orderForm.requested_vehicle_type}
                    onChange={(e) => setOrderForm({...orderForm, requested_vehicle_type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={orderForm.priority}
                    onChange={(e) => setOrderForm({...orderForm, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Scheduled Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Time</label>
                  <input
                    type="datetime-local"
                    value={orderForm.scheduled_pickup_time}
                    onChange={(e) => setOrderForm({...orderForm, scheduled_pickup_time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time</label>
                  <input
                    type="datetime-local"
                    value={orderForm.scheduled_delivery_time}
                    onChange={(e) => setOrderForm({...orderForm, scheduled_delivery_time: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Package Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Package Details</label>
                <textarea
                  value={orderForm.package_details}
                  onChange={(e) => setOrderForm({...orderForm, package_details: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your package..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">Total Deliveries</p>
                <p className="text-4xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-10 h-10" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-semibold">Active</p>
                <p className="text-4xl font-bold mt-2">{stats.active}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="w-10 h-10" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Completed</p>
                <p className="text-4xl font-bold mt-2">{stats.completed}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="w-10 h-10" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold">Pending</p>
                <p className="text-4xl font-bold mt-2">{stats.pending}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deliveries List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    activeFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('active')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    activeFilter === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter('completed')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    activeFilter === 'completed' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Completed
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredDeliveries.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No deliveries found</p>
                  </div>
                ) : (
                  filteredDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedDelivery?.id === delivery.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(delivery.status)}
                          <div>
                            <h3 className="font-semibold">Delivery #{delivery.id}</h3>
                            <p className="text-xs text-gray-500">
                              {delivery.created_at && format(new Date(delivery.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{delivery.pickup_location}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{delivery.drop_location}</span>
                        </div>
                      </div>

                      {delivery.driver_name && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <p className="text-gray-500">Driver: <span className="font-medium text-gray-700">{delivery.driver_name}</span></p>
                        </div>
                      )}

                      {['on_route', 'picked_up'].includes(delivery.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDelivery(delivery);
                          }}
                          className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Track Live
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tracking Map */}
          <div className="lg:col-span-2">
            {selectedDelivery ? (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-4">Delivery #{selectedDelivery.id}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedDelivery.status)}`}>
                        {selectedDelivery.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${
                        selectedDelivery.priority === 'high' ? 'bg-red-100 text-red-800' :
                        selectedDelivery.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedDelivery.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Pickup Location</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{selectedDelivery.pickup_location}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Drop Location</p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="font-medium">{selectedDelivery.drop_location}</p>
                      </div>
                    </div>
                    {selectedDelivery.driver_name && (
                      <div>
                        <p className="text-gray-500 mb-1">Driver</p>
                        <p className="font-medium">{selectedDelivery.driver_name}</p>
                        {selectedDelivery.driver_phone && (
                          <p className="text-gray-600">{selectedDelivery.driver_phone}</p>
                        )}
                      </div>
                    )}
                    {selectedDelivery.vehicle_number && (
                      <div>
                        <p className="text-gray-500 mb-1">Vehicle</p>
                        <p className="font-medium">{selectedDelivery.vehicle_number} - {selectedDelivery.vehicle_type}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '500px' }}>
                  <MapTracker delivery={selectedDelivery} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center h-full flex flex-col items-center justify-center">
                <Navigation className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Track Your Delivery</h3>
                <p className="text-gray-500">Select a delivery from the list to view tracking details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
