const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Update location - drivers only
router.post('/location', 
  authorize('driver'), 
  validate(schemas.tracking), 
  trackingController.updateLocation
);

// Get delivery tracking - all authenticated users
router.get('/deliveries/:id', trackingController.getDeliveryTracking);

// Get recent tracking - admin only
router.get('/recent', authorize('admin'), trackingController.getRecentTracking);

module.exports = router;
