const User = require('../models/User');

// Get all pending driver verifications
const getPendingDrivers = async (req, res) => {
  try {
    const pendingDrivers = await User.getPendingDrivers();
    res.json({ drivers: pendingDrivers });
  } catch (error) {
    console.error('Get pending drivers error:', error);
    res.status(500).json({ error: 'Failed to fetch pending drivers' });
  }
};

// Approve driver
const approveDriver = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await User.verifyDriver(id, 'approved');
    
    if (!success) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json({ message: 'Driver approved successfully' });
  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({ error: 'Failed to approve driver' });
  }
};

// Reject driver
const rejectDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    
    if (!rejection_reason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const success = await User.verifyDriver(id, 'rejected', rejection_reason);
    
    if (!success) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json({ message: 'Driver rejected successfully' });
  } catch (error) {
    console.error('Reject driver error:', error);
    res.status(500).json({ error: 'Failed to reject driver' });
  }
};

module.exports = {
  getPendingDrivers,
  approveDriver,
  rejectDriver
};
