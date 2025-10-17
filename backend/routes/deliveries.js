const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Create delivery - admin and customers
router.post('/', 
  authorize('admin', 'customer'), 
  validate(schemas.delivery), 
  deliveryController.createDelivery
);

// Get all deliveries - admin only
router.get('/', deliveryController.getAllDeliveries);

// Get my deliveries - all roles
router.get('/my-deliveries', deliveryController.getMyDeliveries);

// Get active deliveries - admin and drivers
router.get('/active', authorize('admin', 'driver'), deliveryController.getActiveDeliveries);

// Get delivery statistics
router.get('/stats', authorize('admin'), deliveryController.getDeliveryStats);

// Get specific delivery
router.get('/:id', deliveryController.getDeliveryById);

// Update delivery status - admin and drivers
router.put('/:id/status', 
  authorize('admin', 'driver'), 
  validate(schemas.deliveryStatus), 
  deliveryController.updateDeliveryStatus
);

// Assign driver - admin only
router.put('/:id/assign', authorize('admin'), deliveryController.assignDriver);

// Delete delivery - admin only
router.delete('/:id', authorize('admin'), deliveryController.deleteDelivery);

// Cancel delivery - admin and customers
router.put('/:id/cancel', authorize('admin', 'customer'), deliveryController.cancelDelivery);

module.exports = router;
