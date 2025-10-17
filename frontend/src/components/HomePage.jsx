import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, Package, MapPin, Shield, Clock, TrendingUp, Mail, Phone, MapPinIcon } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const userTypes = [
    {
      type: 'admin',
      title: 'Admin',
      description: 'Manage fleet operations, drivers, and deliveries',
      icon: Shield,
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-700 hover:to-blue-800',
      features: ['Fleet Management', 'Driver Verification', 'Analytics Dashboard']
    },
    {
      type: 'driver',
      title: 'Driver',
      description: 'Access your delivery assignments and routes',
      icon: Truck,
      color: 'from-green-600 to-green-700',
      hoverColor: 'hover:from-green-700 hover:to-green-800',
      features: ['Delivery Tracking', 'Route Navigation', 'Earnings Overview']
    },
    {
      type: 'customer',
      title: 'Customer',
      description: 'Track orders and manage deliveries',
      icon: Package,
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800',
      features: ['Place Orders', 'Track Deliveries', 'Order History']
    }
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Real-Time Tracking',
      description: 'Track your deliveries in real-time with GPS precision'
    },
    {
      icon: Clock,
      title: 'On-Time Delivery',
      description: 'Optimized routes ensure timely deliveries every time'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your packages are safe with our verified drivers'
    },
    {
      icon: TrendingUp,
      title: 'Efficient Operations',
      description: 'Advanced analytics for better fleet management'
    }
  ];

  const handleUserTypeClick = (type) => {
    navigate('/login', { state: { userType: type } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FleetFlow</h1>
                <p className="text-sm text-gray-600">Logistics Management System</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FleetFlow</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your logistics operations with our comprehensive fleet management solution. 
            Choose your role to get started.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {userTypes.map((userType) => {
            const Icon = userType.icon;
            return (
              <div
                key={userType.type}
                onClick={() => handleUserTypeClick(userType.type)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 overflow-hidden group"
              >
                <div className={`bg-gradient-to-r ${userType.color} p-8 text-white`}>
                  <Icon className="h-16 w-16 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold mb-2">{userType.title}</h3>
                  <p className="text-blue-50">{userType.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {userType.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${userType.color} mr-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-6 w-full py-3 bg-gradient-to-r ${userType.color} ${userType.hoverColor} text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    Login as {userType.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose FleetFlow?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 text-blue-50">Join thousands of users managing their logistics efficiently</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FleetFlow</span>
              </div>
              <p className="text-sm text-gray-400">
                Your trusted partner in logistics and fleet management solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <span>support@fleetflow.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPinIcon className="h-4 w-4 text-blue-400 mt-1" />
                  <span>123 Logistics Ave, Suite 100<br />San Francisco, CA 94102</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} FleetFlow. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Truck className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
