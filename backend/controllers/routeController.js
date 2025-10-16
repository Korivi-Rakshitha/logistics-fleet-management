const Route = require('../models/Route');

const createRoute = async (req, res) => {
  try {
    const {
      name, start_location, end_location,
      start_lat, start_lng, end_lat, end_lng,
      distance, estimated_duration
    } = req.body;

    const routeId = await Route.create({
      name, start_location, end_location,
      start_lat, start_lng, end_lat, end_lng,
      distance, estimated_duration
    });

    const route = await Route.findById(routeId);
    res.status(201).json({
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    console.error('Create route error:', error);
    res.status(500).json({ error: 'Failed to create route' });
  }
};

const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.getAll();
    res.json({ routes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
};

const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({ route });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
};

const updateRoute = async (req, res) => {
  try {
    const updates = req.body;
    const success = await Route.update(req.params.id, updates);
    
    if (!success) {
      return res.status(404).json({ error: 'Route not found' });
    }

    const route = await Route.findById(req.params.id);
    res.json({
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ error: 'Failed to update route' });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const success = await Route.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ error: 'Failed to delete route' });
  }
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
};
