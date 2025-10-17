import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Mail, Lock, AlertCircle, Key, Shield, Package, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const userType = location.state?.userType;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  
  // Admin passkey - Change this to your desired passkey
  const ADMIN_PASSKEY = '1234';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Check if user is admin
      if (result.user && result.user.role === 'admin') {
        // Show passkey modal for admin
        setPendingUser(result.user);
        setShowPasskeyModal(true);
        setLoading(false);
      } else {
        // Non-admin users can proceed directly
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };
  
  const handlePasskeySubmit = (e) => {
    e.preventDefault();
    
    if (passkey === ADMIN_PASSKEY) {
      // Correct passkey - allow access
      setShowPasskeyModal(false);
      navigate('/dashboard');
    } else {
      // Wrong passkey - logout and show error
      setError('Invalid admin passkey. Access denied.');
      setShowPasskeyModal(false);
      setPasskey('');
      setPendingUser(null);
      // Logout the user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };
  
  const handleCancelPasskey = () => {
    setShowPasskeyModal(false);
    setPasskey('');
    setPendingUser(null);
    setError('Admin access cancelled');
    // Logout the user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <>
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Animated Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {/* Truck Icon Pattern */}
          <div className="absolute top-10 left-10 opacity-10">
            <Truck className="w-32 h-32 text-white animate-pulse" />
          </div>
          <div className="absolute bottom-20 right-20 opacity-10">
            <Truck className="w-40 h-40 text-white animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute top-1/2 left-1/4 opacity-10">
            <Package className="w-24 h-24 text-white animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          {/* Floating Circles */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
      </div>

      {/* Login Form Card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20">
        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">Home</span>
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            {userType ? `Sign in as ${userType.charAt(0).toUpperCase() + userType.slice(1)}` : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Demo credentials: admin@logistics.com / admin123
          </p>
        </div>
      </div>
    </div>
    
    {/* Admin Passkey Modal */}
    {showPasskeyModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Access Required</h2>
            <p className="text-gray-600 mt-2">Enter the admin passkey to continue</p>
          </div>
          
          <form onSubmit={handlePasskeySubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Passkey
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  required
                  autoFocus
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-center text-2xl font-bold tracking-widest"
                  placeholder="••••"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                Only authorized administrators have access to this passkey
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancelPasskey}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition font-semibold shadow-lg"
              >
                Verify
              </button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Security Notice:</strong> Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Login;
