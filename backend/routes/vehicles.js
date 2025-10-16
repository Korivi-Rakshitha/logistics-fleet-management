const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Admin only routes
router.post('/', authorize('admin'), validate(schemas.vehicle), vehicleController.createVehicle);
router.put('/:id', authorize('admin'), vehicleController.updateVehicle);
router.delete('/:id', authorize('admin'), vehicleController.deleteVehicle);

// Accessible by admin and drivers
router.get('/', vehicleController.getAllVehicles);
router.get('/available', vehicleController.getAvailableVehicles);
router.get('/utilization', authorize('admin'), vehicleController.getVehicleUtilization);
router.get('/:id', vehicleController.getVehicleById);

module.exports = router;
