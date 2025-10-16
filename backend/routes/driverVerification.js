const express = require('express');
const router = express.Router();
const driverVerificationController = require('../controllers/driverVerificationController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(auth);
router.use(authorize('admin'));

// Get pending drivers
router.get('/pending', driverVerificationController.getPendingDrivers);

// Approve driver
router.put('/:id/approve', driverVerificationController.approveDriver);

// Reject driver
router.put('/:id/reject', driverVerificationController.rejectDriver);

module.exports = router;
