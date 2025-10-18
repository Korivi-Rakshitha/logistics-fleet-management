import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { deliveryAPI, trackingAPI, ratingAPI } from '../services/api';
import socketService from '../services/socket';
import {
  Package, MapPin, CheckCircle, Clock, Navigation, LogOut, Play, Check,
  Truck, Zap, TrendingUp, Award, Star
} from 'lucide-react';
import MapTracker from './MapTracker';
import RatingComponent from './RatingComponent';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [driverRatings, setDriverRatings] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDeliveries();
    fetchDriverRatings();
  }, []);

  useEffect(() => {
    let watchId;
    
    if (trackingActive && selectedDelivery) {
      // Start watching position
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, speed, heading } = position.coords;
            const locationData = {
              deliveryId: selectedDelivery.id,
              lat: latitude,
              lng: longitude,
              speed: speed ? speed * 3.6 : 0, // Convert m/s to km/h
              heading: heading || 0,
            };
            
            setCurrentPosition(locationData);
            
            // Send location update via Socket.io
            socketService.sendLocationUpdate(locationData);
            
            // Also save to backend
            trackingAPI.updateLocation({
              delivery_id: selectedDelivery.id,
              current_lat: latitude,
              current_lng: longitude,
              speed: speed ? speed * 3.6 : 0,
              heading: heading || 0,
            }).catch(err => console.error('Error updating location:', err));
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [trackingActive, selectedDelivery]);

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

  const fetchDriverRatings = async () => {
    try {
      const response = await ratingAPI.getByDriver(user.id);
      setDriverRatings(response.data.data.ratings);
      setRatingStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching driver ratings:', error);
    }
  };

  const updateDeliveryStatus = async (deliveryId, status) => {
    try {
      await deliveryAPI.updateStatus(deliveryId, { status });
      await fetchDeliveries();
      
      // Update selected delivery if it's the one being updated
      if (selectedDelivery?.id === deliveryId) {
        const updated = deliveries.find(d => d.id === deliveryId);
        if (updated) {
          setSelectedDelivery({ ...updated, status });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update delivery status');
    }
  };

  const startDelivery = async (delivery) => {
    setSelectedDelivery(delivery);
    if (delivery.status === 'assigned') {
      await updateDeliveryStatus(delivery.id, 'on_route');
    }
    setTrackingActive(true);
  };

  const markPickedUp = async () => {
    if (selectedDelivery) {
      await updateDeliveryStatus(selectedDelivery.id, 'picked_up');
    }
  };

  const markDelivered = async () => {
    if (selectedDelivery) {
      await updateDeliveryStatus(selectedDelivery.id, 'delivered');
      setTrackingActive(false);
      setSelectedDelivery(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold shadow-lg';
      case 'picked_up': return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white font-semibold shadow-lg';
      case 'on_route': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg';
      case 'assigned': return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold shadow-lg';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <Truck className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-indigo-600 font-semibold">Loading your deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Driver Dashboard</h1>
                <p className="text-sm text-indigo-100">Welcome back, {user?.name} 👋</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {['overview', 'deliveries', 'tracking', 'ratings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Rating Stats */}
            {ratingStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-semibold">Average Rating</p>
                      <p className="text-4xl font-bold mt-2">{ratingStats.average_rating?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Star className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-semibold">Total Ratings</p>
                      <p className="text-4xl font-bold mt-2">{ratingStats.total_ratings || 0}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Award className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-semibold">5-Star Ratings</p>
                      <p className="text-4xl font-bold mt-2">{ratingStats.positive_ratings || 0}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-10 h-10" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Ratings */}
            {driverRatings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Recent Customer Feedback</h2>
                <div className="space-y-4">
                  {driverRatings.slice(0, 3).map((rating) => (
                    <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <RatingComponent rating={rating.rating} readonly={true} size="small" />
                          <span className="text-sm text-gray-500">from {rating.customer_name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rating.feedback && (
                        <p className="text-sm text-gray-700 italic">"{rating.feedback}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deliveries List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">My Deliveries</h2>
              </div>

              {deliveries.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No deliveries assigned</p>
                  <p className="text-sm text-gray-400 mt-1">Check back later for new assignments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className={`bg-white rounded-2xl shadow-lg p-5 cursor-pointer transition-all duration-300 border-2 ${
                        selectedDelivery?.id === delivery.id
                          ? 'border-indigo-500 shadow-2xl scale-105 bg-gradient-to-br from-indigo-50 to-purple-50'
                          : 'border-transparent hover:shadow-xl hover:scale-102'
                      }`}
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">Delivery #{delivery.id}</h3>
                          <p className="text-sm text-gray-500">{delivery.customer_name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="p-1 bg-green-500 rounded-full">
                            <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                          </div>
                          <div>
                            <p className="text-xs text-green-600 font-semibold">PICKUP</p>
                            <span className="text-gray-700 font-medium">{delivery.pickup_location}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                          <div className="p-1 bg-red-500 rounded-full">
                            <MapPin className="w-3 h-3 text-white flex-shrink-0" />
                          </div>
                          <div>
                            <p className="text-xs text-red-600 font-semibold">DROP</p>
                            <span className="text-gray-700 font-medium">{delivery.drop_location}</span>
                          </div>
                        </div>
                      </div>

                      {delivery.status === 'assigned' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startDelivery(delivery);
                          }}
                          className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                        >
                          <Play className="w-5 h-5" />
                          Start Delivery
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map and Controls */}
            <div className="lg:col-span-2 space-y-4">
              {selectedDelivery ? (
                <>
                  <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl p-6 border border-indigo-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Delivery #{selectedDelivery.id}</h2>
                          <p className="text-sm text-gray-500">Track and manage your delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {trackingActive && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-sm font-semibold shadow-lg animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            Live Tracking
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedDelivery.status === 'on_route' && (
                        <button
                          onClick={markPickedUp}
                          className="col-span-2 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-2xl font-bold text-lg"
                        >
                          <Package className="w-6 h-6" />
                          Mark as Picked Up
                        </button>
                      )}
                      {selectedDelivery.status === 'picked_up' && (
                        <button
                          onClick={markDelivered}
                          className="col-span-2 flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-2xl font-bold text-lg"
                        >
                          <CheckCircle className="w-6 h-6" />
                          Complete Delivery
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-indigo-100" style={{ height: '500px' }}>
                    <MapTracker delivery={selectedDelivery} />
                  </div>

                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-lg text-gray-800">Delivery Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">CUSTOMER</p>
                        <p className="font-bold text-gray-800">{selectedDelivery.customer_name}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-xs text-green-600 font-semibold mb-1">PHONE</p>
                        <p className="font-bold text-gray-800">{selectedDelivery.customer_phone || 'N/A'}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold mb-1">VEHICLE</p>
                        <p className="font-bold text-gray-800">{selectedDelivery.vehicle_number}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-xs text-orange-600 font-semibold mb-1">PRIORITY</p>
                        <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getPriorityColor(selectedDelivery.priority)}`}>
                          {selectedDelivery.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Navigation className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Delivery Selected</h3>
                  <p className="text-gray-500">Choose a delivery from the list to view details and start tracking</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Delivery Tracking</h2>
            </div>

            {selectedDelivery ? (
              <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
                <MapTracker delivery={selectedDelivery} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a delivery to view tracking information</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Ratings & Reviews</h2>
              <div className="text-sm text-gray-600">
                {driverRatings.length} total rating{driverRatings.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Stats */}
            {ratingStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-semibold">Average Rating</p>
                      <p className="text-4xl font-bold mt-2">{ratingStats.average_rating?.toFixed(1) || '0.0'}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Star className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-semibold">Total Ratings</p>
                      <p className="text-4xl font-bold mt-2">{ratingStats.total_ratings || 0}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Award className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-semibold">5-Star Ratings</p>
                      <p className="text-4xl font-bold mt-2">{ratingStats.positive_ratings || 0}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-10 h-10" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ratings List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">Delivery</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Rating</th>
                      <th className="text-left py-3 px-4">Feedback</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverRatings.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-gray-500">
                          No ratings yet
                        </td>
                      </tr>
                    ) : (
                      driverRatings.map((rating) => (
                        <tr key={rating.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">#{rating.delivery_id}</td>
                          <td className="py-3 px-4">{rating.customer_name}</td>
                          <td className="py-3 px-4">
                            <RatingComponent
                              rating={rating.rating}
                              readonly={true}
                              size="small"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <p className="text-sm text-gray-700 truncate" title={rating.feedback}>
                              {rating.feedback || 'No feedback provided'}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(rating.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
