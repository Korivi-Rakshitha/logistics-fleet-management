import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, deliveryAPI, routeAPI, userAPI, driverVerificationAPI } from '../services/api';
import { 
  Truck, Package, Users, BarChart3, Plus, LogOut, 
  Edit, Trash2, CheckCircle, XCircle, Clock, Navigation, Shield, TrendingUp, Zap, FileText, UserCheck, Mail, Phone, MapPin
} from 'lucide-react';
import MapTracker from './MapTracker';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: '',
    vehicle_type: '',
    capacity: '',
    status: 'available'
  });
  const [assignForm, setAssignForm] = useState({
    driver_id: '',
    vehicle_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, deliveriesRes, routesRes, statsRes, driversRes, customersRes, pendingDriversRes] = await Promise.all([
        vehicleAPI.getAll(),
        deliveryAPI.getAll(),
        routeAPI.getAll(),
        deliveryAPI.getStats(),
        userAPI.getDrivers(),
        userAPI.getCustomers(),
        driverVerificationAPI.getPending(),
      ]);
      setVehicles(vehiclesRes.data.vehicles);
      setDeliveries(deliveriesRes.data.deliveries);
      setRoutes(routesRes.data.routes);
      setStats(statsRes.data.stats);
      setDrivers(driversRes.data.users || []);
      setCustomers(customersRes.data.users || []);
      setPendingDrivers(pendingDriversRes.data.drivers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to approve this driver?')) return;
    try {
      await driverVerificationAPI.approve(driverId);
      alert('Driver approved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error approving driver:', error);
      alert('Failed to approve driver');
    }
  };

  const handleRejectDriver = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    try {
      await driverVerificationAPI.reject(selectedDriver.id, { rejection_reason: rejectionReason });
      alert('Driver rejected successfully');
      setShowRejectModal(false);
      setSelectedDriver(null);
      setRejectionReason('');
      fetchData();
    } catch (error) {
      console.error('Error rejecting driver:', error);
      alert('Failed to reject driver');
    }
  };

  const openRejectModal = (driver) => {
    setSelectedDriver(driver);
    setShowRejectModal(true);
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleAPI.create(vehicleForm);
      setShowVehicleModal(false);
      setVehicleForm({
        vehicle_number: '',
        vehicle_type: '',
        capacity: '',
        status: 'available'
      });
      fetchData(); // Refresh data
      alert('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert(error.response?.data?.error || 'Failed to add vehicle');
    }
  };

  const handleRejectOrder = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to reject this order?')) return;
    try {
      await deliveryAPI.updateStatus(deliveryId, { status: 'cancelled' });
      fetchData();
      alert('Order rejected successfully!');
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order');
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    try {
      await deliveryAPI.assignDriver(selectedDelivery.id, assignForm);
      setShowAssignModal(false);
      setAssignForm({ driver_id: '', vehicle_id: '' });
      setSelectedDelivery(null);
      fetchData(); // Refresh data
      alert('Driver assigned successfully!');
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert(error.response?.data?.error || 'Failed to assign driver');
    }
  };

  const StatCard = ({ icon: Icon, title, value, gradient }) => (
    <div className={`${gradient} rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-semibold">{title}</p>
          <p className="text-4xl font-bold mt-2">{value}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <Icon className="w-10 h-10" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto"></div>
            <Shield className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-teal-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-teal-100">Welcome back, {user?.name} 👋</p>
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
            {['overview', 'vehicles', 'deliveries', 'routes', 'tracking'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Package}
                title="Total Deliveries"
                value={stats?.total_deliveries || 0}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              />
              <StatCard
                icon={CheckCircle}
                title="Completed"
                value={stats?.completed || 0}
                gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              />
              <StatCard
                icon={Zap}
                title="Active"
                value={stats?.active || 0}
                gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
              />
              <StatCard
                icon={Truck}
                title="Vehicles"
                value={vehicles.length}
                gradient="bg-gradient-to-br from-purple-500 to-pink-600"
              />
            </div>

            {/* Pending Driver Verifications */}
            {pendingDrivers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <UserCheck className="w-6 h-6 text-orange-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-800">Pending Driver Verifications</h2>
                  </div>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                    {pendingDrivers.length} Pending
                  </span>
                </div>
                
                <div className="space-y-4">
                  {pendingDrivers.map((driver) => (
                    <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{driver.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Mail className="w-4 h-4 mr-1" />
                            {driver.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1" />
                            {driver.phone}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {driver.address}
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-500 mb-2">DOCUMENTS</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">PAN:</span> 
                              <span className="ml-2 font-mono text-gray-700">{driver.pan_card}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Aadhaar:</span> 
                              <span className="ml-2 font-mono text-gray-700">{driver.aadhaar_card}</span>
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">DL:</span> 
                              <span className="ml-2 font-mono text-gray-700">{driver.driving_license}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleApproveDriver(driver.id)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Driver
                        </button>
                        <button
                          onClick={() => openRejectModal(driver)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Deliveries</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Driver</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.slice(0, 5).map((delivery) => (
                      <tr key={delivery.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{delivery.id}</td>
                        <td className="py-3 px-4">{delivery.customer_name}</td>
                        <td className="py-3 px-4">{delivery.driver_name || 'Unassigned'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'on_route' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            delivery.priority === 'high' ? 'bg-red-100 text-red-800' :
                            delivery.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {delivery.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Vehicles</h2>
              <button
                onClick={() => setShowVehicleModal(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{vehicle.vehicle_number}</h3>
                      <p className="text-sm text-gray-500">{vehicle.vehicle_type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Capacity:</span> {vehicle.capacity} kg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="space-y-6">
            {/* Pending Orders Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6 border-2 border-yellow-200">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Pending Customer Orders</h2>
              {deliveries.filter(d => d.status === 'pending').length === 0 ? (
                <p className="text-gray-600">No pending orders</p>
              ) : (
                <div className="space-y-4">
                  {deliveries.filter(d => d.status === 'pending').map((delivery) => (
                    <div key={delivery.id} className="bg-white rounded-lg p-4 shadow">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Order #{delivery.id}</p>
                          <p className="font-semibold text-lg">{delivery.customer_name}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">From:</span> {delivery.pickup_location}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">To:</span> {delivery.drop_location}
                          </p>
                          {delivery.requested_vehicle_type && (
                            <p className="text-sm text-gray-600 mt-2">
                              <span className="font-medium">Requested Vehicle:</span> {delivery.requested_vehicle_type}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Priority:</span> <span className={`px-2 py-1 rounded text-xs ${
                              delivery.priority === 'high' ? 'bg-red-100 text-red-800' :
                              delivery.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>{delivery.priority}</span>
                          </p>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowAssignModal(true);
                            }}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept & Assign
                          </button>
                          <button
                            onClick={() => handleRejectOrder(delivery.id)}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-pink-700 transition shadow"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Order
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Deliveries Section */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">All Deliveries</h2>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Driver</th>
                      <th className="text-left py-3 px-4">Vehicle</th>
                      <th className="text-left py-3 px-4">From → To</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{delivery.id}</td>
                        <td className="py-3 px-4">{delivery.customer_name}</td>
                        <td className="py-3 px-4">{delivery.driver_name || 'Unassigned'}</td>
                        <td className="py-3 px-4">{delivery.vehicle_number || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          {delivery.pickup_location} → {delivery.drop_location}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'on_route' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {delivery.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedDelivery(delivery)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Live Tracking</h2>
            {selectedDelivery ? (
              <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
                <MapTracker delivery={selectedDelivery} />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a delivery to track</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add New Vehicle</h2>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  required
                  value={vehicleForm.vehicle_number}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., TN-01-AB-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  required
                  value={vehicleForm.vehicle_type}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bike">Bike</option>
                  <option value="Car">Car</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity (kg)
                </label>
                <input
                  type="number"
                  required
                  value={vehicleForm.capacity}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={vehicleForm.status}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Assign Driver Modal */}
      {showAssignModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Assign Driver</h2>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedDelivery(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Delivery #{selectedDelivery.id}</p>
              <p className="font-semibold">{selectedDelivery.pickup_location} → {selectedDelivery.drop_location}</p>
            </div>

            <form onSubmit={handleAssignDriver} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Driver
                </label>
                <select
                  required
                  value={assignForm.driver_id}
                  onChange={(e) => setAssignForm({ ...assignForm, driver_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vehicle
                </label>
                <select
                  required
                  value={assignForm.vehicle_id}
                  onChange={(e) => setAssignForm({ ...assignForm, vehicle_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a vehicle</option>
                  {vehicles.filter(v => v.status === 'available').map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.vehicle_type} ({vehicle.capacity}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedDelivery(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                >
                  Assign Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Driver Modal */}
      {showRejectModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Reject Driver</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedDriver(null);
                  setRejectionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Driver:</strong> {selectedDriver.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {selectedDriver.email}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Please provide a reason for rejection..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedDriver(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectDriver}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Reject Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
