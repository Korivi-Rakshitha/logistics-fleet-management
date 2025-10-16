const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

const checkDriverVerification = (req, res, next) => {
  if (req.user.role === 'driver' && req.user.verification_status !== 'approved') {
    return res.status(403).json({ 
      error: 'Account pending verification',
      verification_status: req.user.verification_status,
      message: req.user.verification_status === 'pending' 
        ? 'Your account is under review. Please wait for admin approval.'
        : 'Your account was rejected. Please contact admin.'
    });
  }
  next();
};

module.exports = { auth, authorize, checkDriverVerification };
