const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// Admin only routes
router.post('/', authorize('admin'), validate(schemas.route), routeController.createRoute);
router.put('/:id', authorize('admin'), routeController.updateRoute);
router.delete('/:id', authorize('admin'), routeController.deleteRoute);

// Accessible by all authenticated users
router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);

module.exports = router;
