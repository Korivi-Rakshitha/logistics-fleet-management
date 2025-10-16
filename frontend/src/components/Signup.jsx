import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, User, Mail, Lock, Phone, MapPin, AlertCircle, Shield, Key, FileText, Upload, Package } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
    pan_card: '',
    aadhaar_card: '',
    driving_license: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [passkey, setPasskey] = useState('');
  
  // Admin passkey - Same as login passkey
  const ADMIN_PASSKEY = '1234';

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation: only allow digits and max 10
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) {
        setFormData({
          ...formData,
          [name]: digitsOnly,
        });
      }
      return;
    }
    
    // Document number validation
    if (name === 'pan_card') {
      // PAN format: ABCDE1234F (10 characters)
      const panValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (panValue.length <= 10) {
        setFormData({ ...formData, [name]: panValue });
      }
      return;
    }
    
    if (name === 'aadhaar_card') {
      // Aadhaar: 12 digits
      const aadhaarValue = value.replace(/\D/g, '');
      if (aadhaarValue.length <= 12) {
        setFormData({ ...formData, [name]: aadhaarValue });
      }
      return;
    }
    
    if (name === 'driving_license') {
      // DL format: varies by state, allow alphanumeric
      const dlValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (dlValue.length <= 16) {
        setFormData({ ...formData, [name]: dlValue });
      }
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    // Validate on blur
    const errors = {};
    
    if (name === 'name' && !value.trim()) {
      errors.name = 'Name is required';
    }
    
    if (name === 'email' && !value.trim()) {
      errors.email = 'Email is required';
    } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.email = 'Invalid email format';
    }
    
    if (name === 'password' && !value) {
      errors.password = 'Password is required';
    } else if (name === 'password' && value.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (name === 'phone' && value && value.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // Driver document validation
    if (formData.role === 'driver') {
      if (name === 'pan_card' && value && value.length !== 10) {
        errors.pan_card = 'PAN card must be 10 characters';
      }
      
      if (name === 'aadhaar_card' && value && value.length !== 12) {
        errors.aadhaar_card = 'Aadhaar card must be 12 digits';
      }
      
      if (name === 'driving_license' && value && value.length < 8) {
        errors.driving_license = 'Invalid driving license number';
      }
    }
    
    setFieldErrors({ ...fieldErrors, ...errors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate phone number
    if (formData.phone && formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }
    
    // Validate driver documents
    if (formData.role === 'driver') {
      if (!formData.pan_card || formData.pan_card.length !== 10) {
        setError('Valid PAN card number is required for driver registration');
        setLoading(false);
        return;
      }
      if (!formData.aadhaar_card || formData.aadhaar_card.length !== 12) {
        setError('Valid Aadhaar card number is required for driver registration');
        setLoading(false);
        return;
      }
      if (!formData.driving_license || formData.driving_license.length < 8) {
        setError('Valid driving license number is required for driver registration');
        setLoading(false);
        return;
      }
    }
    
    // If admin role selected, show passkey modal
    if (formData.role === 'admin') {
      setShowPasskeyModal(true);
      setLoading(false);
      return;
    }

    // For non-admin roles, proceed with registration
    const result = await register(formData);

    if (result.success) {
      // Show different message for drivers
      if (formData.role === 'driver') {
        alert('Registration submitted successfully! Your account is under review. You will be notified once admin approves your documents.');
      }
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };
  
  const handlePasskeySubmit = async (e) => {
    e.preventDefault();
    
    if (passkey === ADMIN_PASSKEY) {
      // Correct passkey - proceed with admin registration
      setShowPasskeyModal(false);
      setLoading(true);
      
      const result = await register(formData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
      setLoading(false);
    } else {
      // Wrong passkey
      setError('Invalid admin passkey. Only authorized personnel can create admin accounts.');
      setShowPasskeyModal(false);
      setPasskey('');
      // Reset role to customer
      setFormData({ ...formData, role: 'customer' });
    }
  };
  
  const handleCancelPasskey = () => {
    setShowPasskeyModal(false);
    setPasskey('');
    setError('Admin registration cancelled');
    // Reset role to customer
    setFormData({ ...formData, role: 'customer' });
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

      {/* Signup Form Card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join our logistics platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                  touched.name && fieldErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {touched.name && fieldErrors.name && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>
          </div>

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
                onBlur={handleBlur}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                  touched.email && fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {touched.email && fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
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
                onBlur={handleBlur}
                required
                minLength={6}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                  touched.password && fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {touched.password && fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin (Requires Passkey)</option>
            </select>
            {formData.role === 'admin' && (
              <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                ⚠️ Admin registration requires a passkey. Only authorized personnel should proceed.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={10}
                pattern="[0-9]{10}"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                  touched.phone && fieldErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="1234567890"
              />
              {touched.phone && fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter exactly 10 digits</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition resize-none"
                placeholder="Your address"
              />
            </div>
          </div>

          {/* Driver Document Fields */}
          {formData.role === 'driver' && (
            <>
              <div className="col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Document Verification Required</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Please provide your PAN card, Aadhaar card, and driving license details. Your account will be reviewed by admin before activation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Card Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="pan_card"
                    value={formData.pan_card}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={10}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition uppercase ${
                      touched.pan_card && fieldErrors.pan_card ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="ABCDE1234F"
                  />
                  {touched.pan_card && fieldErrors.pan_card && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.pan_card}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Format: ABCDE1234F (10 characters)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Card Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="aadhaar_card"
                    value={formData.aadhaar_card}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={12}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition ${
                      touched.aadhaar_card && fieldErrors.aadhaar_card ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="123456789012"
                  />
                  {touched.aadhaar_card && fieldErrors.aadhaar_card && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.aadhaar_card}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">12 digit Aadhaar number</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driving License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="driving_license"
                    value={formData.driving_license}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    maxLength={16}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition uppercase ${
                      touched.driving_license && fieldErrors.driving_license ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="DL1234567890123"
                  />
                  {touched.driving_license && fieldErrors.driving_license && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.driving_license}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Your driving license number</p>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in
            </Link>
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
            <h2 className="text-2xl font-bold text-gray-900">Admin Passkey Required</h2>
            <p className="text-gray-600 mt-2">Enter the admin passkey to create an admin account</p>
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
                Verify & Register
              </button>
            </div>
          </form>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Security Notice:</strong> Unauthorized admin account creation attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Signup;
