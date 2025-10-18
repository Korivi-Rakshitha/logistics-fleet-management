const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create a new rating
router.post('/', ratingController.createRating);

// Get rating by ID
router.get('/:id', ratingController.getRating);

// Get rating for a specific delivery
router.get('/delivery/:deliveryId', ratingController.getDeliveryRating);

// Get all ratings for a driver
router.get('/driver/:driverId', ratingController.getDriverRatings);

// Get all ratings by current customer
router.get('/customer/me', ratingController.getCustomerRatings);

// Get all ratings by specific customer (admin only)
router.get('/customer/:customerId', authorize('admin'), ratingController.getCustomerRatings);

// Get all ratings (admin only)
router.get('/', authorize('admin'), ratingController.getAllRatings);

// Update rating
router.put('/:id', ratingController.updateRating);

// Delete rating (admin only)
router.delete('/:id', authorize('admin'), ratingController.deleteRating);

module.exports = router;
